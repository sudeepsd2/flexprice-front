import { FC, useState, useCallback } from 'react';
import { Button } from '@/components/atoms';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import Input from '@/components/atoms/Input/Input';

interface ForceRunDrawerProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (startTime?: string, endTime?: string) => void;
	isLoading?: boolean;
}

enum RunType {
	CURRENT = 'current',
	CUSTOM = 'custom',
}

type RunTypeValue = RunType;

interface DateTimeFields {
	date: string;
	time: string;
}

interface ValidationErrors {
	startDate?: string;
	startTime?: string;
	endDate?: string;
	endTime?: string;
}

interface DateTimeInputProps {
	type: 'date' | 'time';
	value: string;
	onChange: (value: string) => void;
	onClearError: () => void;
	error?: string;
	min?: string;
}

const DateTimeInput: FC<DateTimeInputProps> = ({ type, value, onChange, onClearError, error, min }) => {
	const Icon = type === 'date' ? CalendarIcon : ClockIcon;

	const handleInputClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
		if (e.currentTarget.showPicker && typeof e.currentTarget.showPicker === 'function') {
			e.currentTarget.showPicker();
		}
	}, []);

	const handleChange = useCallback(
		(value: string) => {
			onChange(value);
			onClearError();
		},
		[onChange, onClearError],
	);

	return (
		<div className='space-y-1'>
			<Input
				type={type}
				value={value}
				onChange={handleChange}
				onClick={handleInputClick}
				error={error}
				min={min}
				inputPrefix={<Icon className='w-4 h-4 text-gray-400' />}
				className='w-full'
			/>
		</div>
	);
};

interface DateTimeRangeInputProps {
	label: string;
	dateValue: string;
	timeValue: string;
	onDateChange: (value: string) => void;
	onTimeChange: (value: string) => void;
	onClearDateError: () => void;
	onClearTimeError: () => void;
	dateError?: string;
	timeError?: string;
	minDate?: string;
	minTime?: string;
}

const DateTimeRangeInput: FC<DateTimeRangeInputProps> = ({
	label,
	dateValue,
	timeValue,
	onDateChange,
	onTimeChange,
	onClearDateError,
	onClearTimeError,
	dateError,
	timeError,
	minDate,
	minTime,
}) => {
	return (
		<div className='space-y-2'>
			<Label className='text-sm font-medium text-gray-900'>{label}</Label>
			<div className='grid grid-cols-2 gap-3'>
				<DateTimeInput
					type='date'
					value={dateValue}
					onChange={onDateChange}
					onClearError={onClearDateError}
					error={dateError}
					min={minDate}
				/>
				<DateTimeInput
					type='time'
					value={timeValue}
					onChange={onTimeChange}
					onClearError={onClearTimeError}
					error={timeError}
					min={minTime}
				/>
			</div>
			{(dateError || timeError) && <p className='text-sm text-destructive'>{dateError || timeError}</p>}
		</div>
	);
};

const ForceRunDrawer: FC<ForceRunDrawerProps> = ({ isOpen, onOpenChange, onConfirm, isLoading }) => {
	const [runType, setRunType] = useState<RunTypeValue>(RunType.CURRENT);
	const [startDateTime, setStartDateTime] = useState<DateTimeFields>({ date: '', time: '' });
	const [endDateTime, setEndDateTime] = useState<DateTimeFields>({ date: '', time: '' });
	const [errors, setErrors] = useState<ValidationErrors>({});

	const validateDateTimeRange = useCallback((): ValidationErrors => {
		const newErrors: ValidationErrors = {};

		if (!startDateTime.date) {
			newErrors.startDate = 'Start date is required';
		}
		if (!startDateTime.time) {
			newErrors.startTime = 'Start time is required';
		}
		if (!endDateTime.date) {
			newErrors.endDate = 'End date is required';
		}
		if (!endDateTime.time) {
			newErrors.endTime = 'End time is required';
		}

		if (startDateTime.date && startDateTime.time && endDateTime.date && endDateTime.time) {
			const start = new Date(`${startDateTime.date}T${startDateTime.time}`);
			const end = new Date(`${endDateTime.date}T${endDateTime.time}`);

			if (start >= end) {
				newErrors.endTime = 'End time must be after start time';
			}
		}

		return newErrors;
	}, [startDateTime, endDateTime]);

	const convertToISO = useCallback((dateTime: DateTimeFields): string => {
		return new Date(`${dateTime.date}T${dateTime.time}`).toISOString();
	}, []);

	const handleClose = useCallback(() => {
		setRunType(RunType.CURRENT);
		setStartDateTime({ date: '', time: '' });
		setEndDateTime({ date: '', time: '' });
		setErrors({});
		onOpenChange(false);
	}, [onOpenChange]);

	const handleConfirm = useCallback(() => {
		if (runType === RunType.CURRENT) {
			onConfirm();
			handleClose();
			return;
		}

		const validationErrors = validateDateTimeRange();
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length === 0) {
			const startISO = convertToISO(startDateTime);
			const endISO = convertToISO(endDateTime);
			onConfirm(startISO, endISO);
			handleClose();
		}
	}, [runType, startDateTime, endDateTime, validateDateTimeRange, convertToISO, onConfirm, handleClose]);

	const handleStartDateChange = useCallback(
		(value: string) => {
			setStartDateTime((prev) => ({ ...prev, date: value }));
			if (errors.startDate) {
				setErrors((prev) => ({ ...prev, startDate: undefined }));
			}
		},
		[errors.startDate],
	);

	const handleStartTimeChange = useCallback(
		(value: string) => {
			setStartDateTime((prev) => ({ ...prev, time: value }));
			if (errors.startTime) {
				setErrors((prev) => ({ ...prev, startTime: undefined }));
			}
		},
		[errors.startTime],
	);

	const handleEndDateChange = useCallback(
		(value: string) => {
			setEndDateTime((prev) => ({ ...prev, date: value }));
			if (errors.endDate) {
				setErrors((prev) => ({ ...prev, endDate: undefined }));
			}
		},
		[errors.endDate],
	);

	const handleEndTimeChange = useCallback(
		(value: string) => {
			setEndDateTime((prev) => ({ ...prev, time: value }));
			if (errors.endTime) {
				setErrors((prev) => ({ ...prev, endTime: undefined }));
			}
		},
		[errors.endTime],
	);

	const clearDateError = useCallback((field: keyof ValidationErrors) => {
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}, []);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='w-full max-w-md bg-white'>
				<DialogHeader>
					<DialogTitle>Manual Export</DialogTitle>
					<DialogDescription>Choose to run the export for the current interval or specify a custom time range.</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<RadioGroup value={runType} onValueChange={(value) => setRunType(value as RunTypeValue)}>
						<div className='flex items-center space-x-2'>
							<RadioGroupItem value={RunType.CURRENT} id='current' />
							<Label htmlFor='current' className='font-normal cursor-pointer'>
								Run current interval
							</Label>
						</div>
						<div className='flex items-center space-x-2'>
							<RadioGroupItem value={RunType.CUSTOM} id='custom' />
							<Label htmlFor='custom' className='font-normal cursor-pointer'>
								Select custom date range
							</Label>
						</div>
					</RadioGroup>

					{runType === RunType.CUSTOM && (
						<div className='space-y-5 pt-3 pl-6 border-l-2 border-gray-200'>
							<DateTimeRangeInput
								label='Start Time'
								dateValue={startDateTime.date}
								timeValue={startDateTime.time}
								onDateChange={handleStartDateChange}
								onTimeChange={handleStartTimeChange}
								onClearDateError={() => clearDateError('startDate')}
								onClearTimeError={() => clearDateError('startTime')}
								dateError={errors.startDate}
								timeError={errors.startTime}
							/>

							<DateTimeRangeInput
								label='End Time'
								dateValue={endDateTime.date}
								timeValue={endDateTime.time}
								onDateChange={handleEndDateChange}
								onTimeChange={handleEndTimeChange}
								onClearDateError={() => clearDateError('endDate')}
								onClearTimeError={() => clearDateError('endTime')}
								dateError={errors.endDate}
								timeError={errors.endTime}
								minDate={startDateTime.date}
								minTime={startDateTime.date === endDateTime.date ? startDateTime.time : undefined}
							/>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleClose} disabled={isLoading} className='flex-1'>
						Cancel
					</Button>
					<Button onClick={handleConfirm} isLoading={isLoading} className='flex-1'>
						Run Export
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ForceRunDrawer;
