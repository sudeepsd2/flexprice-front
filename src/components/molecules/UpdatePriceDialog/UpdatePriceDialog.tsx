import { FC, useState, useEffect, useMemo } from 'react';
import { Dialog } from '@/components/atoms';
import { Input, Button, Select, SelectOption, DatePicker } from '@/components/atoms';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Price, BILLING_MODEL, TIER_MODE, CreatePriceTier, TransformQuantity, PRICE_TYPE } from '@/models/Price';
import { formatAmount, removeFormatting } from '@/components/atoms/Input/Input';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import VolumeTieredPricingForm from '@/components/organisms/PlanForm/VolumeTieredPricingForm';
import { useQuery, useMutation } from '@tanstack/react-query';
import SubscriptionApi from '@/api/SubscriptionApi';
import { PlanApi } from '@/api/PlanApi';
import toast from 'react-hot-toast';
import { PriceApi } from '@/api/PriceApi';
import { UpdatePriceRequest } from '@/types/dto';
import { cn } from '@/lib/utils';
import { SyncOption } from '../TerminatePriceModal';
import { formatDateTimeWithSecondsAndTimezone } from '@/utils/common/format_date';

interface UpdatePriceDialogProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	price: Price;
	planId: string;
	onSuccess?: () => void;
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

const billingModelOptions: SelectOption[] = [
	{ label: 'Flat Fee', value: BILLING_MODEL.FLAT_FEE },
	{ label: 'Package', value: BILLING_MODEL.PACKAGE },
	{ label: 'Volume Tiered', value: BILLING_MODEL.TIERED },
	{ label: 'Slab Tiered', value: 'SLAB_TIERED' },
];

const UpdatePriceDialog: FC<UpdatePriceDialogProps> = ({ isOpen, onOpenChange, price, planId, onSuccess }) => {
	const [overrideAmount, setOverrideAmount] = useState('');
	const [overrideQuantity, setOverrideQuantity] = useState<number | undefined>(undefined);
	const [overrideBillingModel, setOverrideBillingModel] = useState<BILLING_MODEL | 'SLAB_TIERED'>(price.billing_model);
	const [overrideTierMode, setOverrideTierMode] = useState<TIER_MODE>(price.tier_mode || TIER_MODE.VOLUME);
	const [overrideTiers, setOverrideTiers] = useState<CreatePriceTier[]>([]);
	const [overrideTransformQuantity, setOverrideTransformQuantity] = useState<TransformQuantity>({
		divide_by: 1,
	});
	const [effectiveFrom, setEffectiveFrom] = useState<Date | undefined>(undefined);
	const [selectedSyncOption, setSelectedSyncOption] = useState<SyncOption>(SyncOption.NEW_ONLY);

	// Hide sync option if price type is FIXED
	const isFixedPrice = price.type === PRICE_TYPE.FIXED;

	// Check for existing subscriptions (only if not FIXED price)
	const { data: existingSubscriptions } = useQuery({
		queryKey: ['subscriptions', planId],
		queryFn: () => SubscriptionApi.listSubscriptions({ plan_id: planId, limit: 1 }),
		enabled: !!planId && isOpen && !isFixedPrice,
	});

	const shouldShowSyncOption = useMemo(
		() => !isFixedPrice && (existingSubscriptions?.items?.length ?? 0) > 0,
		[isFixedPrice, existingSubscriptions],
	);

	// Initialize state when price or dialog opens
	useEffect(() => {
		if (isOpen) {
			setOverrideAmount(price.amount);
			setOverrideQuantity(1);
			setOverrideBillingModel(price.billing_model);
			setOverrideTierMode(price.tier_mode || TIER_MODE.VOLUME);

			if (price.tiers && price.tiers.length > 0) {
				setOverrideTiers(
					price.tiers.map((tier) => ({
						unit_amount: tier.unit_amount,
						flat_amount: tier.flat_amount || '0',
						up_to: tier.up_to,
					})),
				);
			} else {
				setOverrideTiers([
					{
						unit_amount: price.amount,
						flat_amount: '0',
						up_to: null,
					},
				]);
			}

			setOverrideTransformQuantity(price.transform_quantity || { divide_by: 1, round: 'up' });
			setEffectiveFrom(undefined);
			setSelectedSyncOption(SyncOption.NEW_ONLY);
		}
	}, [isOpen, price]);

	const { mutateAsync: updatePrice, isPending: isUpdatingPrice } = useMutation({
		mutationFn: async ({ priceId, data }: { priceId: string; data: UpdatePriceRequest }) => {
			return await PriceApi.UpdatePrice(priceId, data);
		},
		onError: (error: ServerError) => {
			toast.error(error?.error?.message || 'Failed to update price');
		},
	});

	const { mutateAsync: syncPlanCharges, isPending: isSyncing } = useMutation({
		mutationFn: () => PlanApi.synchronizePlanPricesWithSubscription(planId),
		onSuccess: () => {
			toast.success('Sync has been started and will take up to 1 hour to complete.');
		},
		onError: (error: ServerError) => {
			toast.error(error?.error?.message || 'Error synchronizing charges with subscriptions');
		},
	});

	const isLoading = isUpdatingPrice || isSyncing;

	const handleUpdate = async () => {
		const updateData: UpdatePriceRequest = {};

		// Only include amount if billing model is not tiered
		if (overrideBillingModel !== BILLING_MODEL.TIERED && overrideBillingModel !== 'SLAB_TIERED') {
			if (overrideAmount && removeFormatting(overrideAmount) !== price.amount) {
				updateData.amount = removeFormatting(overrideAmount);
			}
		}

		// Billing model override
		if (overrideBillingModel !== price.billing_model) {
			if (overrideBillingModel === 'SLAB_TIERED') {
				updateData.billing_model = BILLING_MODEL.TIERED;
			} else {
				updateData.billing_model = overrideBillingModel as BILLING_MODEL;
			}
		}

		// Tier mode override
		if (overrideTierMode !== (price.tier_mode || TIER_MODE.VOLUME)) {
			updateData.tier_mode = overrideTierMode;
		}

		// Only include tiers if billing model is tiered
		if ((overrideBillingModel === BILLING_MODEL.TIERED || overrideBillingModel === 'SLAB_TIERED') && overrideTiers.length > 0) {
			updateData.tiers = overrideTiers;
		}

		// Only include transform_quantity if billing model is package
		if (overrideBillingModel === BILLING_MODEL.PACKAGE) {
			updateData.transform_quantity = {
				...overrideTransformQuantity,
				divide_by: overrideQuantity || overrideTransformQuantity.divide_by,
			};
		}

		// Include effective_from if provided
		if (effectiveFrom) {
			updateData.effective_from = effectiveFrom.toISOString();
		}

		try {
			// Update the price
			await updatePrice({ priceId: price.id, data: updateData });

			const priceName = price.meter?.name || 'Price';
			const message = effectiveFrom
				? `${priceName} will be effective from ${formatDateTimeWithSecondsAndTimezone(effectiveFrom)}.`
				: `${priceName} has been updated successfully.`;
			toast.success(message);

			// If user selected to sync with existing subscriptions
			if (shouldShowSyncOption && selectedSyncOption === SyncOption.EXISTING_ALSO) {
				await syncPlanCharges();
			}

			onSuccess?.();
			onOpenChange(false);
		} catch (error) {
			console.error('Error updating price:', error);
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	const hasChanges = () => {
		const originalBillingModel = price.billing_model;
		const originalTierMode = price.tier_mode || TIER_MODE.VOLUME;

		let billingModelChanged = false;
		if (overrideBillingModel === 'SLAB_TIERED' && originalBillingModel === BILLING_MODEL.TIERED && originalTierMode === TIER_MODE.SLAB) {
			billingModelChanged = false;
		} else if (
			overrideBillingModel === BILLING_MODEL.TIERED &&
			originalBillingModel === BILLING_MODEL.TIERED &&
			originalTierMode === TIER_MODE.VOLUME
		) {
			billingModelChanged = false;
		} else {
			billingModelChanged = overrideBillingModel !== originalBillingModel;
		}

		return (
			(overrideAmount && removeFormatting(overrideAmount) !== price.amount) ||
			overrideQuantity !== undefined ||
			billingModelChanged ||
			overrideTiers.length > 0 ||
			overrideTransformQuantity !== undefined ||
			effectiveFrom !== undefined
		);
	};

	const originalFormatted = formatAmount(price.amount);
	const currencySymbol = getCurrencySymbol(price.currency);

	return (
		<Dialog
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title='Update Price Configuration'
			description={`Update the pricing configuration for ${price.meter?.name || price.description || 'this charge'}`}
			className='w-auto min-w-[32rem] max-w-[90vw]'>
			<div className='space-y-6 max-h-[80vh] overflow-y-auto'>
				<div className='space-y-4'>
					{/* Original Price Display */}
					<div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
						<div className='text-sm text-gray-600'>Original Price</div>
						<div className='font-medium'>
							{currencySymbol}
							{originalFormatted}
						</div>
					</div>

					{/* Billing Model Override - Only show for USAGE price types */}
					{price.type === PRICE_TYPE.USAGE && (
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Billing Model</label>
							<Select
								value={overrideBillingModel}
								onChange={(value) => setOverrideBillingModel(value as BILLING_MODEL)}
								options={billingModelOptions}
								placeholder='Select billing model'
							/>
						</div>
					)}

					{/* Amount Override - only show if billing model is not TIERED or SLAB_TIERED */}
					{overrideBillingModel !== BILLING_MODEL.TIERED && overrideBillingModel !== 'SLAB_TIERED' && (
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Override Amount ({price.currency})</label>
							<Input
								type='formatted-number'
								value={overrideAmount}
								onChange={setOverrideAmount}
								placeholder='Enter new amount (optional)'
								suffix={currencySymbol}
								className='w-full'
							/>
						</div>
					)}

					{/* Tiers Override - only show if billing model is TIERED or SLAB_TIERED */}
					{(overrideBillingModel === BILLING_MODEL.TIERED || overrideBillingModel === 'SLAB_TIERED') && (
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Tiers</label>
							<VolumeTieredPricingForm
								tieredPrices={
									overrideTiers.length > 0
										? overrideTiers.map((tier, index) => {
												let from = 0;
												let up_to = null;

												if (index === 0) {
													from = 0;
													up_to = overrideTiers[0]?.up_to || null;
												} else {
													from = overrideTiers[index - 1]?.up_to || 0;
													up_to = overrideTiers[index]?.up_to || null;
												}

												return {
													from,
													up_to,
													unit_amount: tier.unit_amount || '',
													flat_amount: tier.flat_amount || '0',
												};
											})
										: [{ from: 0, up_to: null, unit_amount: '', flat_amount: '0' }]
								}
								setTieredPrices={(setter) => {
									const newTiers =
										typeof setter === 'function'
											? setter(
													overrideTiers.length > 0
														? overrideTiers.map((tier, index) => ({
																from: index === 0 ? 0 : overrideTiers[index - 1]?.up_to || 0,
																up_to: tier.up_to || null,
																unit_amount: tier.unit_amount || '',
																flat_amount: tier.flat_amount || '0',
															}))
														: [{ from: 0, up_to: null, unit_amount: '', flat_amount: '0' }],
												)
											: setter;

									const convertedTiers = newTiers.map((tier) => ({
										unit_amount: tier.unit_amount || '',
										flat_amount: tier.flat_amount || '0',
										up_to: tier.up_to,
									}));
									setOverrideTiers(convertedTiers);
								}}
								currency={price.currency}
								tierMode={overrideBillingModel === BILLING_MODEL.TIERED ? TIER_MODE.VOLUME : TIER_MODE.SLAB}
							/>
						</div>
					)}

					{/* Transform Quantity Override - only show if billing model is PACKAGE */}
					{overrideBillingModel === BILLING_MODEL.PACKAGE && (
						<div className='space-y-4'>
							<label className='text-sm font-medium text-gray-700'>Package Configuration</label>
							<div className='space-y-2'>
								<label className='text-sm text-gray-600'>Units per package</label>
								<Input
									type='number'
									value={overrideTransformQuantity?.divide_by || ''}
									onChange={(value) =>
										setOverrideTransformQuantity({
											...overrideTransformQuantity,
											divide_by: Number(value) || 1,
										})
									}
									placeholder='Enter units per package'
									className='w-full'
								/>
								{price.transform_quantity && (
									<div className='text-xs text-gray-500'>Original: {price.transform_quantity.divide_by} units per package</div>
								)}
							</div>
						</div>
					)}

					{/* Effective From Date */}
					<div className='space-y-2'>
						<DatePicker
							label='Effective From (Optional)'
							placeholder='Select date for scheduled update'
							date={effectiveFrom}
							setDate={setEffectiveFrom}
							minDate={new Date()}
							className='w-full'
							labelClassName=''
							popoverTriggerClassName='w-full'
						/>
						<p className='text-xs text-gray-500'>Schedule this price change to take effect on a future date</p>
					</div>

					{/* Sync Option Radio - Only show if there are active subscriptions */}
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
									description='Price update will only apply to new subscriptions going forward.'
								/>
								<RadioOption
									value={SyncOption.EXISTING_ALSO}
									selected={selectedSyncOption}
									title='Existing Subscriptions Also'
									description='Price update will apply to both new and existing subscriptions. A sync will be initiated.'
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

				<div className='flex gap-3 pt-4'>
					<Button variant='outline' onClick={handleCancel} disabled={isLoading} className='flex-1'>
						Cancel
					</Button>
					<Button onClick={handleUpdate} className='flex-1' disabled={!hasChanges() || isLoading} isLoading={isLoading}>
						Update Price
					</Button>
				</div>
			</div>
		</Dialog>
	);
};

export default UpdatePriceDialog;
