import { FC, useState, useEffect } from 'react';
import { Button, DatePicker, Dialog } from '@/components/atoms';

interface TerminateLineItemModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onCancel: () => void;
	onConfirm: (endDate: string | undefined) => void;
	isLoading?: boolean;
}

const TerminateLineItemModal: FC<TerminateLineItemModalProps> = ({ isOpen, onOpenChange, onCancel, onConfirm, isLoading = false }) => {
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);

	useEffect(() => {
		if (!isOpen) {
			setEndDate(undefined);
		}
	}, [isOpen]);

	const handleConfirm = () => {
		const endDateISO = endDate?.toISOString();
		onConfirm(endDateISO);
	};

	const handleCancel = () => {
		setEndDate(undefined);
		onCancel();
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setEndDate(undefined);
			onCancel();
		}
		onOpenChange(open);
	};

	return (
		<Dialog isOpen={isOpen} onOpenChange={handleOpenChange} title='Terminate Line Item' className='sm:max-w-[600px]' showCloseButton={true}>
			<div className='space-y-6'>
				<div className='space-y-2'>
					<DatePicker
						label='Effective From (Optional)'
						placeholder='Select effective date'
						date={endDate}
						popoverTriggerClassName='w-full'
						setDate={setEndDate}
						minDate={new Date()}
						className='w-full'
					/>
					<p className='text-xs text-gray-500'>Leave empty to terminate immediately. Select a future date to schedule termination.</p>
				</div>

				<div className='flex justify-end space-x-3 pt-4'>
					<Button variant='outline' onClick={handleCancel} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleConfirm} isLoading={isLoading}>
						Terminate
					</Button>
				</div>
			</div>
		</Dialog>
	);
};

export default TerminateLineItemModal;
