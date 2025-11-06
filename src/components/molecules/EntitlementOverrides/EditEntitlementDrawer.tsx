import { FC, useEffect, useState } from 'react';
import { Sheet, Label, Input, Button, Checkbox } from '@/components/atoms';
import { Switch } from '@/components/ui/switch';
import { FEATURE_TYPE } from '@/models';
import { EntitlementOverrideRequest } from '@/types/dto/Subscription';

interface EditEntitlementDrawerProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	entitlement: any | null;
	onSave: (override: EntitlementOverrideRequest) => void;
	onReset?: (entitlementId: string) => void;
}

const EditEntitlementDrawer: FC<EditEntitlementDrawerProps> = ({ isOpen, onOpenChange, entitlement, onSave, onReset }) => {
	const [usageLimit, setUsageLimit] = useState<string>('');
	const [isInfinite, setIsInfinite] = useState<boolean>(false);
	const [staticValue, setStaticValue] = useState<string>('');
	const [isEnabled, setIsEnabled] = useState<boolean>(true);

	useEffect(() => {
		if (entitlement) {
			// Set values from display fields (which include overrides) if available, otherwise use original values
			// Use 'displayUsageLimit' in entitlement to check if the property exists (including null for unlimited)
			const currentLimit = 'displayUsageLimit' in entitlement ? entitlement.displayUsageLimit : entitlement.usage_limit;
			const isCurrentlyInfinite = currentLimit === null;

			setIsInfinite(isCurrentlyInfinite);
			setUsageLimit(isCurrentlyInfinite ? '' : currentLimit?.toString() || '');
			setStaticValue(entitlement.displayStaticValue || entitlement.static_value || '');
			setIsEnabled(entitlement.displayIsEnabled ?? entitlement.is_enabled ?? true);
		}
	}, [entitlement]);

	const handleSave = () => {
		if (!entitlement) return;

		const override: EntitlementOverrideRequest = {
			entitlement_id: entitlement.id,
		};

		// Only include fields that are relevant to the feature type
		if (entitlement.feature_type === FEATURE_TYPE.METERED) {
			if (isInfinite) {
				// Set to null for infinite/unlimited
				override.usage_limit = null;
			} else {
				const parsedLimit = parseInt(usageLimit, 10);
				if (!isNaN(parsedLimit)) {
					override.usage_limit = parsedLimit;
				}
			}
		} else if (entitlement.feature_type === FEATURE_TYPE.STATIC) {
			override.static_value = staticValue;
		} else if (entitlement.feature_type === FEATURE_TYPE.BOOLEAN) {
			override.is_enabled = isEnabled;
		}

		onSave(override);
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	const handleReset = () => {
		if (!entitlement || !onReset) return;

		// Reset to original values
		const originalLimit = entitlement.usage_limit;
		const isOriginallyInfinite = originalLimit === null;

		setIsInfinite(isOriginallyInfinite);
		setUsageLimit(isOriginallyInfinite ? '' : originalLimit?.toString() || '');
		setStaticValue(entitlement.static_value || '');
		setIsEnabled(entitlement.is_enabled ?? true);

		// Remove the override
		onReset(entitlement.id);
		onOpenChange(false);
	};

	const handleOpenChange = (open: boolean) => {
		onOpenChange(open);
		if (!open) {
			// Reset form when closing - use display values if available
			// Use 'displayUsageLimit' in entitlement to check if the property exists (including null for unlimited)
			const currentLimit = entitlement && 'displayUsageLimit' in entitlement ? entitlement.displayUsageLimit : entitlement?.usage_limit;
			const isCurrentlyInfinite = currentLimit === null;

			setIsInfinite(isCurrentlyInfinite);
			setUsageLimit(isCurrentlyInfinite ? '' : currentLimit?.toString() || '');
			setStaticValue(entitlement?.displayStaticValue || entitlement?.static_value || '');
			setIsEnabled(entitlement?.displayIsEnabled ?? entitlement?.is_enabled ?? true);
		}
	};

	if (!entitlement) return null;

	return (
		<Sheet
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			title={`Edit Entitlement: ${entitlement.feature?.name || 'Unknown'}`}
			description='Override entitlement values for this subscription'
			size='md'>
			<div className='space-y-6 p-6'>
				<div className='space-y-2'>
					<Label label='Feature Type' />
					<div className='text-sm text-gray-600 capitalize'>{entitlement.feature_type?.toLowerCase()}</div>
				</div>

				{entitlement.feature_type === FEATURE_TYPE.METERED && (
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label label='Usage Limit' />
							<Input
								type='number'
								value={isInfinite ? 'Unlimited' : usageLimit}
								onChange={(value) => setUsageLimit(value)}
								placeholder='Enter usage limit'
								disabled={isInfinite}
							/>
							<div className='text-xs text-gray-500'>
								Original: {entitlement.usage_limit === null ? 'Unlimited' : entitlement.usage_limit}
								{entitlement.usage_reset_period && ` (resets ${entitlement.usage_reset_period.toLowerCase()})`}
							</div>
						</div>

						<Checkbox
							id='set-infinite'
							label='Set to infinite'
							checked={isInfinite}
							onCheckedChange={(checked) => {
								setIsInfinite(checked);
								if (checked) {
									setUsageLimit('');
								}
							}}
						/>
					</div>
				)}

				{entitlement.feature_type === FEATURE_TYPE.STATIC && (
					<div className='space-y-2'>
						<Label label='Static Value' />
						<Input value={staticValue} onChange={(value) => setStaticValue(value)} placeholder='Enter static value' />
						<div className='text-xs text-gray-500'>Original: {entitlement.static_value || 'Not set'}</div>
					</div>
				)}

				{entitlement.feature_type === FEATURE_TYPE.BOOLEAN && (
					<div className='space-y-2'>
						<Label label='Enabled' />
						<div className='flex items-center gap-2'>
							<Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
							<span className='text-sm'>{isEnabled ? 'Enabled' : 'Disabled'}</span>
						</div>
						<div className='text-xs text-gray-500'>Original: {entitlement.is_enabled ? 'Enabled' : 'Disabled'}</div>
					</div>
				)}

				<div className='flex justify-end gap-3 pt-4'>
					<Button variant='outline' onClick={handleCancel}>
						Cancel
					</Button>
					{entitlement.hasOverride && onReset && (
						<Button variant='outline' onClick={handleReset}>
							Reset to Default
						</Button>
					)}
					<Button onClick={handleSave}>Save Override</Button>
				</div>
			</div>
		</Sheet>
	);
};

export default EditEntitlementDrawer;
