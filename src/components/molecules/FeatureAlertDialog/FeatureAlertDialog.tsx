import React, { useState, useEffect } from 'react';
import { Dialog, Button, Input, Toggle, Select } from '@/components/atoms';
import { toast } from 'react-hot-toast';
import { AlertSettings, AlertThreshold, AlertLevel } from '@/models/Feature';

interface FeatureAlertDialogProps {
	open: boolean;
	alertSettings?: AlertSettings; // Made optional
	onSave: (alertSettings: AlertSettings) => void;
	onClose: () => void;
}

// Moved outside component to avoid reallocation
const validateThreshold = (threshold: AlertThreshold | undefined, name: string): boolean => {
	if (threshold) {
		if (!threshold.threshold || parseFloat(threshold.threshold) < 0) {
			toast.error(`Please enter a valid ${name} threshold value`);
			return false;
		}
	}
	return true;
};

const FeatureAlertDialog: React.FC<FeatureAlertDialogProps> = ({ open, alertSettings, onSave, onClose }) => {
	const [localAlertSettings, setLocalAlertSettings] = useState<AlertSettings>({
		alert_enabled: false,
		critical: undefined,
		warning: undefined,
		info: undefined,
	});

	// Sync local state with props - removed 'open' dependency to prevent re-sync on dialog toggle
	useEffect(() => {
		if (alertSettings) {
			setLocalAlertSettings({
				alert_enabled: alertSettings.alert_enabled || false,
				critical: alertSettings.critical,
				warning: alertSettings.warning,
				info: alertSettings.info,
			});
		} else {
			setLocalAlertSettings({
				alert_enabled: false,
				critical: undefined,
				warning: undefined,
				info: undefined,
			});
		}
	}, [alertSettings]);

	const handleSave = () => {
		// Validation
		if (localAlertSettings.alert_enabled) {
			// At least one threshold should be set
			if (!localAlertSettings.critical && !localAlertSettings.warning && !localAlertSettings.info) {
				toast.error('Please configure at least one threshold level');
				return;
			}

			// Validate threshold values using AlertLevel enum
			if (!validateThreshold(localAlertSettings.critical, AlertLevel.CRITICAL)) return;
			if (!validateThreshold(localAlertSettings.warning, AlertLevel.WARNING)) return;
			if (!validateThreshold(localAlertSettings.info, AlertLevel.INFO)) return;

			// Validate threshold ordering for "below" condition
			if (localAlertSettings.critical?.condition === 'below') {
				const criticalVal = localAlertSettings.critical ? parseFloat(localAlertSettings.critical.threshold) : null;
				const warningVal = localAlertSettings.warning ? parseFloat(localAlertSettings.warning.threshold) : null;
				const infoVal = localAlertSettings.info ? parseFloat(localAlertSettings.info.threshold) : null;

				if (criticalVal !== null && warningVal !== null && criticalVal >= warningVal) {
					toast.error('For "below" condition: warning threshold must be greater than critical threshold');
					return;
				}
				if (warningVal !== null && infoVal !== null && warningVal >= infoVal) {
					toast.error('For "below" condition: info threshold must be greater than warning threshold');
					return;
				}
				if (criticalVal !== null && infoVal !== null && criticalVal >= infoVal) {
					toast.error('For "below" condition: info threshold must be greater than critical threshold');
					return;
				}
			}

			// Validate threshold ordering for "above" condition
			if (localAlertSettings.critical?.condition === 'above') {
				const criticalVal = localAlertSettings.critical ? parseFloat(localAlertSettings.critical.threshold) : null;
				const warningVal = localAlertSettings.warning ? parseFloat(localAlertSettings.warning.threshold) : null;
				const infoVal = localAlertSettings.info ? parseFloat(localAlertSettings.info.threshold) : null;

				if (criticalVal !== null && warningVal !== null && criticalVal <= warningVal) {
					toast.error('For "above" condition: critical threshold must be greater than warning threshold');
					return;
				}
				if (warningVal !== null && infoVal !== null && warningVal <= infoVal) {
					toast.error('For "above" condition: warning threshold must be greater than info threshold');
					return;
				}
				if (criticalVal !== null && infoVal !== null && criticalVal <= infoVal) {
					toast.error('For "above" condition: critical threshold must be greater than info threshold');
					return;
				}
			}
		}

		onSave(localAlertSettings);
	};

	const handleClose = () => {
		// Reset to original values
		if (alertSettings) {
			setLocalAlertSettings({
				alert_enabled: alertSettings.alert_enabled || false,
				critical: alertSettings.critical,
				warning: alertSettings.warning,
				info: alertSettings.info,
			});
		}
		onClose();
	};

	const handleThresholdChange = (level: AlertLevel, field: 'threshold' | 'condition', value: string) => {
		// Move state construction logic outside
		const currentThreshold = localAlertSettings[level] || { threshold: '0', condition: 'below' as const };

		// If condition is being changed, sync all other thresholds to use the same condition
		if (field === 'condition') {
			const newCondition = value as 'above' | 'below';
			const newState: AlertSettings = {
				...localAlertSettings,
				critical: localAlertSettings.critical ? { ...localAlertSettings.critical, condition: newCondition } : undefined,
				warning: localAlertSettings.warning ? { ...localAlertSettings.warning, condition: newCondition } : undefined,
				info: localAlertSettings.info ? { ...localAlertSettings.info, condition: newCondition } : undefined,
			};
			setLocalAlertSettings(newState);
		} else {
			const newState: AlertSettings = {
				...localAlertSettings,
				[level]: {
					...currentThreshold,
					[field]: value,
				},
			};
			setLocalAlertSettings(newState);
		}
	};

	const handleRemoveThreshold = (level: AlertLevel) => {
		const newState: AlertSettings = {
			...localAlertSettings,
			[level]: undefined,
		};
		setLocalAlertSettings(newState);
	};

	const handleAddThreshold = (level: AlertLevel) => {
		const defaultCondition =
			localAlertSettings.critical?.condition || localAlertSettings.warning?.condition || localAlertSettings.info?.condition || 'below';
		const newState: AlertSettings = {
			...localAlertSettings,
			[level]: {
				threshold: '0',
				condition: defaultCondition,
			},
		};
		setLocalAlertSettings(newState);
	};

	const renderThresholdInput = (level: AlertLevel, label: string, description: string) => {
		const threshold = localAlertSettings[level];

		return (
			<div className='space-y-3 p-4 border rounded-lg bg-gray-50'>
				<div className='flex items-center justify-between'>
					<div>
						<label className='text-sm font-medium text-gray-900'>{label}</label>
						<p className='text-xs text-gray-500 mt-0.5'>{description}</p>
					</div>
					{threshold ? (
						<Button variant='ghost' size='sm' onClick={() => handleRemoveThreshold(level)}>
							Remove
						</Button>
					) : (
						<Button variant='outline' size='sm' onClick={() => handleAddThreshold(level)}>
							Add
						</Button>
					)}
				</div>

				{threshold && (
					<div className='grid grid-cols-2 gap-3'>
						<div className='space-y-1'>
							<label className='text-xs font-medium text-gray-700'>Threshold Value</label>
							<Input
								placeholder='0.00'
								value={threshold.threshold}
								onChange={(value) => handleThresholdChange(level, 'threshold', value)}
								type='number'
								step='0.01'
								min='0'
							/>
						</div>
						<div className='space-y-1'>
							<label className='text-xs font-medium text-gray-700'>Condition</label>
							<Select
								options={[
									{ label: 'Below', value: 'below' },
									{ label: 'Above', value: 'above' },
								]}
								value={threshold.condition}
								onChange={(value) => handleThresholdChange(level, 'condition', value)}
							/>
						</div>
					</div>
				)}
			</div>
		);
	};

	const handleToggleChange = (enabled: boolean) => {
		const newState: AlertSettings = { ...localAlertSettings, alert_enabled: enabled };
		setLocalAlertSettings(newState);
	};

	return (
		<Dialog
			className='min-w-max'
			isOpen={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) handleClose();
			}}
			title='Feature Alert Settings'
			showCloseButton>
			<div className='flex flex-col gap-6 min-w-[600px]'>
				{/* Alert Toggle */}
				<Toggle
					title='Enable Alerts'
					label='Monitor feature usage against configured thresholds'
					description='Get notified when usage crosses configured thresholds for this feature'
					checked={localAlertSettings.alert_enabled || false}
					onChange={handleToggleChange}
				/>

				{/* Alert Configuration */}
				{localAlertSettings.alert_enabled && (
					<div className='space-y-4'>
						<div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
							<p className='text-xs text-blue-800'>
								Configure thresholds to monitor usage. Alerts trigger when usage crosses these thresholds. All thresholds must use the same
								condition (above or below).
							</p>
						</div>

						{renderThresholdInput(AlertLevel.CRITICAL, 'Critical Threshold', 'Alert when usage reaches critical level')}
						{renderThresholdInput(AlertLevel.WARNING, 'Warning Threshold', 'Alert when usage reaches warning level')}
						{renderThresholdInput(AlertLevel.INFO, 'Info Threshold', 'Alert when usage reaches info level')}
					</div>
				)}

				{/* Action Buttons */}
				<div className='flex justify-end gap-2 mt-6'>
					<Button variant='outline' onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save Changes</Button>
				</div>
			</div>
		</Dialog>
	);
};

export default FeatureAlertDialog;
