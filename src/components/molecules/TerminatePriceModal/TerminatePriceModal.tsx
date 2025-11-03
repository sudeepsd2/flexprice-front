import { FC, useState, useEffect, useMemo } from 'react';
import { Button, DatePicker } from '@/components/atoms';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery } from '@tanstack/react-query';
import SubscriptionApi from '@/api/SubscriptionApi';
import { cn } from '@/lib/utils';
import { Price, PRICE_TYPE } from '@/models';
import { formatDateTimeWithSecondsAndTimezone } from '@/utils/common/format_date';

export enum SyncOption {
	NEW_ONLY = 'NEW_ONLY',
	EXISTING_ALSO = 'EXISTING_ALSO',
}

interface TerminatePriceModalProps {
	planId: string;
	price?: Price;
	onCancel: () => void;
	onConfirm: (endDate: string | undefined, syncOption?: SyncOption) => void;
	isLoading?: boolean;
	showSyncOption?: boolean;
}

interface RadioOptionProps {
	value: SyncOption;
	selected: SyncOption;
	title: string;
	description: string;
}

const RadioOption: FC<RadioOptionProps> = ({ value, selected, title, description }) => (
	<div
		className={cn(
			'flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors',
			selected === value ? 'border-[#0F172A] bg-gray-50' : 'border-[#E2E8F0] hover:border-gray-300',
		)}>
		<RadioGroupItem value={value} id={value} className='mt-1' />
		<label htmlFor={value} className='flex-1 cursor-pointer'>
			<p className='font-medium text-[#18181B]'>{title}</p>
			<p className='text-sm text-[#64748B] mt-1'>{description}</p>
		</label>
	</div>
);

const TerminatePriceModal: FC<TerminatePriceModalProps> = ({
	planId,
	price,
	onCancel,
	onConfirm,
	isLoading = false,
	showSyncOption = true,
}) => {
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [selectedSyncOption, setSelectedSyncOption] = useState<SyncOption>(SyncOption.NEW_ONLY);

	// Hide sync option if price type is FIXED
	const isFixedPrice = price?.type === PRICE_TYPE.FIXED;
	const effectiveShowSyncOption = showSyncOption && !isFixedPrice;

	const { data: existingSubscriptions } = useQuery({
		queryKey: ['subscriptions', planId],
		queryFn: () => SubscriptionApi.listSubscriptions({ plan_id: planId, limit: 1 }),
		enabled: !!planId && effectiveShowSyncOption,
	});

	const shouldShowSyncOption = useMemo(
		() => effectiveShowSyncOption && (existingSubscriptions?.items?.length ?? 0) > 0,
		[effectiveShowSyncOption, existingSubscriptions],
	);

	// Get termination message based on selected date
	const terminationMessage = useMemo(() => {
		if (!price) return '';

		const priceName = price.meter?.name || price.description || 'Price';
		if (endDate) {
			return `${priceName} will be terminated on ${formatDateTimeWithSecondsAndTimezone(endDate)}.`;
		}
		return `${priceName} will be terminated immediately.`;
	}, [price, endDate]);

	useEffect(() => {
		setEndDate(undefined);
		if (shouldShowSyncOption) {
			setSelectedSyncOption(SyncOption.NEW_ONLY);
		}
	}, [planId, price?.id, shouldShowSyncOption]);

	const handleConfirm = () => {
		const endDateISO = endDate?.toISOString();
		const syncOption = shouldShowSyncOption ? selectedSyncOption : undefined;
		onConfirm(endDateISO, syncOption);
	};

	const handleCancel = () => {
		setEndDate(undefined);
		setSelectedSyncOption(SyncOption.NEW_ONLY);
		onCancel();
	};

	return (
		<DialogContent className='bg-white sm:max-w-[600px]'>
			<DialogHeader>
				<DialogTitle>Terminate Price</DialogTitle>
			</DialogHeader>

			<div className='space-y-6 py-4'>
				<div className='space-y-2'>
					<DatePicker
						label='Effective Termination Date (Optional)'
						placeholder='Select termination date'
						date={endDate}
						setDate={setEndDate}
						minDate={new Date()}
						className='w-full'
					/>
					<p className='text-xs text-gray-500'>Leave empty to terminate immediately. Select a future date to schedule termination.</p>
					{terminationMessage && (
						<div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
							<p className='text-sm text-blue-800'>{terminationMessage}</p>
						</div>
					)}
				</div>

				{shouldShowSyncOption && (
					<div className='space-y-4'>
						<p className='text-sm font-medium text-gray-700'>Apply to Subscriptions</p>
						<RadioGroup
							value={selectedSyncOption}
							onValueChange={(value) => setSelectedSyncOption(value as SyncOption)}
							className='space-y-1'>
							<RadioOption
								value={SyncOption.NEW_ONLY}
								selected={selectedSyncOption}
								title='New Subscriptions Only'
								description='Price termination will only apply to new subscriptions going forward.'
							/>
							<RadioOption
								value={SyncOption.EXISTING_ALSO}
								selected={selectedSyncOption}
								title='Existing Subscriptions Also'
								description='Price termination will apply to both new and existing subscriptions. A sync will be initiated.'
							/>
						</RadioGroup>

						{selectedSyncOption === SyncOption.EXISTING_ALSO && (
							<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
								<p className='text-sm text-blue-800'>
									<strong>Note:</strong> Syncing plan prices with existing subscriptions will take up to 1 hour to complete.
								</p>
							</div>
						)}
					</div>
				)}
			</div>

			<div className='flex justify-end space-x-3 pt-4'>
				<Button variant='outline' onClick={handleCancel} disabled={isLoading}>
					Cancel
				</Button>
				<Button onClick={handleConfirm} isLoading={isLoading}>
					Terminate Price
				</Button>
			</div>
		</DialogContent>
	);
};

export default TerminatePriceModal;
