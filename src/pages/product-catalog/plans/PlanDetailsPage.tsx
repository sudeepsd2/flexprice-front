// React imports
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Third-party libraries
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EyeOff, Plus, Pencil, Trash2 } from 'lucide-react';
import { uniqueId } from 'lodash';
import toast from 'react-hot-toast';

// Internal components
import { ActionButton, Button, Card, CardHeader, Chip, Loader, NoDataCard, Page, Spacer } from '@/components/atoms';
import { formatAmount } from '@/components/atoms/Input/Input';
import {
	AddEntitlementDrawer,
	ApiDocsContent,
	ColumnData,
	CreditGrantModal,
	DetailsCard,
	FlexpriceTable,
	MetadataModal,
	PlanDrawer,
	RedirectCell,
	PriceOverrideDialog,
} from '@/components/molecules';
import { PlanPriceTable } from '@/components/organisms';
import { getFeatureTypeChips } from '@/components/molecules/CustomerUsageTable/CustomerUsageTable';

// API imports
import { CreditGrantApi, EntitlementApi, PlanApi, PriceApi } from '@/api';

// Core services and routes
import { RouteNames } from '@/core/routes/Routes';

// Models and types
import {
	Plan,
	Entitlement,
	ENTITY_STATUS,
	FEATURE_TYPE,
	ENTITLEMENT_ENTITY_TYPE,
	CREDIT_GRANT_PERIOD_UNIT,
	CREDIT_GRANT_EXPIRATION_TYPE,
	CreditGrant,
	CREDIT_SCOPE,
	CREDIT_GRANT_CADENCE,
	CREDIT_GRANT_PERIOD,
	INVOICE_CADENCE,
	Price,
} from '@/models';
import { EntitlementResponse } from '@/types';

// Constants and utilities
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import formatDate from '@/utils/common/format_date';
import formatChips from '@/utils/common/format_chips';
import { formatExpirationPeriod } from '@/utils/common/credit_grant_helpers';
import { ExtendedPriceOverride } from '@/utils/common/price_override_helpers';
import { UpdatePriceRequest } from '@/types/dto/Price';

const creditGrantColumns: ColumnData<CreditGrant>[] = [
	{
		title: 'Name',
		render: (row) => {
			return <span>{row.name}</span>;
		},
	},
	{
		title: 'Credits',
		render: (row) => {
			return <span>{formatAmount(row.credits.toString())}</span>;
		},
	},
	{
		title: 'Priority',
		render: (row) => {
			return <span>{row.priority ?? '--'}</span>;
		},
	},
	{
		title: 'Expiration Config',
		render: (row) => {
			return <span>{formatExpirationPeriod(row)}</span>;
		},
	},
];

export const formatInvoiceCadence = (cadence: string): string => {
	switch (cadence.toUpperCase()) {
		case INVOICE_CADENCE.ADVANCE:
			return 'Advance';
		case INVOICE_CADENCE.ARREAR:
			return 'Arrear';
		default:
			return '--';
	}
};

type Params = {
	planId: string;
};
const getFeatureValue = (entitlement: Entitlement) => {
	const value = entitlement.usage_limit?.toFixed() || '';

	switch (entitlement.feature_type) {
		case FEATURE_TYPE.STATIC:
			return entitlement.static_value;
		case FEATURE_TYPE.METERED:
			return (
				<span className='flex items-end gap-1'>
					{formatAmount(value || 'Unlimited')}
					<span className='text-[#64748B] text-sm font-normal font-sans'>
						{value
							? Number(value) > 0
								? entitlement.feature.unit_plural || 'units'
								: entitlement.feature.unit_singular || 'unit'
							: entitlement.feature.unit_plural || 'units'}
					</span>
				</span>
			);
		case FEATURE_TYPE.BOOLEAN:
			return entitlement.is_enabled ? 'Yes' : 'No';
		default:
			return '--';
	}
};

const PlanDetailsPage = () => {
	const navigate = useNavigate();
	const { planId } = useParams<Params>();
	const [drawerOpen, setdrawerOpen] = useState(false);
	const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
	const [creditGrantModalOpen, setCreditGrantModalOpen] = useState(false);
	const [metadataModalOpen, setMetadataModalOpen] = useState(false);
	const [metadata, setMetadata] = useState<Record<string, string>>({});
	const [newCreditGrants, setNewCreditGrants] = useState<CreditGrant[]>([]);
	const queryClient = useQueryClient();

	// Price override dialog state
	const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
	const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
	const [overriddenPrices, setOverriddenPrices] = useState<Record<string, ExtendedPriceOverride>>({});

	const {
		data: planData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchPlan', planId],
		queryFn: async () => {
			return await PlanApi.getPlanById(planId!);
		},
		enabled: !!planId,
	});

	const { mutate: archivePlan } = useMutation({
		mutationFn: async () => {
			return await PlanApi.deletePlan(planId!);
		},
		onSuccess: () => {
			toast.success('Plan archived successfully');
			navigate(RouteNames.plan);
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to archive plan');
		},
	});

	const { mutate: updatePlanWithCreditGrant, isPending: isCreatingCreditGrant } = useMutation({
		mutationFn: async (data: CreditGrant) => {
			// Add the new credit grant to local state first
			const newGrant = {
				...data,
				id: uniqueId(),
				plan_id: planId!,
			};

			setNewCreditGrants((prev) => [...prev, newGrant]);
			return await CreditGrantApi.createCreditGrant(newGrant);
		},
		onSuccess: () => {
			toast.success('Credit grant added successfully');
			setCreditGrantModalOpen(false);
			setNewCreditGrants([]);
			queryClient.invalidateQueries({ queryKey: ['fetchPlan', planId] });
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to add credit grant');
			setNewCreditGrants((prev) => prev.slice(0, -1));
		},
	});

	const { mutate: updatePlanMetadata } = useMutation({
		mutationFn: async (data: Record<string, string>) => {
			return await PlanApi.updatePlan(planId!, { metadata: data });
		},
		onSuccess: () => {
			toast.success('Metadata updated successfully');
			setMetadataModalOpen(false);
			queryClient.invalidateQueries({ queryKey: ['fetchPlan', planId] });
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to update metadata');
		},
	});

	const { mutate: updatePrice } = useMutation({
		mutationFn: async ({ priceId, data }: { priceId: string; data: UpdatePriceRequest }) => {
			return await PriceApi.UpdatePrice(priceId, data);
		},
		onSuccess: () => {
			toast.success('Price updated successfully');
			setIsPriceDialogOpen(false);
			setSelectedPrice(null);
			queryClient.invalidateQueries({ queryKey: ['fetchPlan', planId] });
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to update price');
		},
	});

	const { updateBreadcrumb } = useBreadcrumbsStore();

	useEffect(() => {
		if (planData?.name) {
			updateBreadcrumb(2, planData.name);
		}
	}, [planData, updateBreadcrumb]);

	useEffect(() => {
		if (planData?.metadata) {
			setMetadata(planData.metadata);
		} else {
			setMetadata({});
		}
	}, [planData?.metadata]);

	const columnData: ColumnData<EntitlementResponse>[] = [
		{
			title: 'Feature Name',

			render(row) {
				return <RedirectCell redirectUrl={`${RouteNames.featureDetails}/${row?.feature?.id}`}>{row?.feature?.name}</RedirectCell>;
			},
		},
		{
			title: 'Type',
			render(row) {
				return getFeatureTypeChips({ type: row?.feature_type || '', showIcon: true, showLabel: true });
			},
		},
		{
			title: 'Value',

			render(row) {
				return getFeatureValue(row);
			},
		},
		{
			fieldVariant: 'interactive',
			width: '30px',
			hideOnEmpty: true,
			render(row) {
				return (
					<ActionButton
						deleteMutationFn={async () => {
							return await EntitlementApi.deleteEntitlementById(row?.id);
						}}
						archiveIcon={<Trash2 />}
						archiveText='Delete'
						id={row?.id}
						isEditDisabled={true}
						isArchiveDisabled={row?.status === ENTITY_STATUS.ARCHIVED}
						refetchQueryKey={'fetchPlan'}
						entityName={row?.feature?.name}
					/>
				);
			},
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error loading plan data');
		return null;
	}

	if (!planData) {
		toast.error('No plan data available');
		return null;
	}

	const planDetails = [
		{ label: 'Name', value: planData?.name },
		{ label: 'Lookup Key', value: planData?.lookup_key || '--' },
		{ label: 'Description', value: planData?.description || '--' },
		{ label: 'Created Date', value: formatDate(planData?.created_at ?? '') },
		{
			label: 'Status',
			value: <Chip label={formatChips(planData?.status)} variant={planData?.status === 'published' ? 'success' : 'default'} />,
		},
	];

	const getEmptyCreditGrant = (): Partial<CreditGrant> => {
		return {
			id: uniqueId(),
			credits: 0,
			period: CREDIT_GRANT_PERIOD.MONTHLY,
			name: 'Free Credits',
			scope: CREDIT_SCOPE.PLAN,
			cadence: CREDIT_GRANT_CADENCE.ONETIME,
			period_count: 1,
			plan_id: planData?.id || '',
			expiration_type: CREDIT_GRANT_EXPIRATION_TYPE.NEVER,
			expiration_duration_unit: CREDIT_GRANT_PERIOD_UNIT.DAYS,
			priority: 0,
		};
	};

	const getEmptyCreditGrantForModal = (): CreditGrant => {
		const emptyData = getEmptyCreditGrant();
		return {
			id: uniqueId(),
			credits: emptyData.credits || 0,
			period: emptyData.period || CREDIT_GRANT_PERIOD.MONTHLY,
			name: emptyData.name || 'Free Credits',
			scope: emptyData.scope || CREDIT_SCOPE.SUBSCRIPTION,
			cadence: emptyData.cadence || CREDIT_GRANT_CADENCE.ONETIME,
			period_count: emptyData.period_count || 1,
			plan_id: emptyData.plan_id || '',
			expiration_type: emptyData.expiration_type || CREDIT_GRANT_EXPIRATION_TYPE.NEVER,
			expiration_duration_unit: emptyData.expiration_duration_unit || CREDIT_GRANT_PERIOD_UNIT.DAYS,
			priority: 0,
		} as CreditGrant;
	};

	const handleSaveCreditGrant = (data: CreditGrant) => {
		updatePlanWithCreditGrant(data);
	};

	const handleCancelCreditGrant = () => {
		setCreditGrantModalOpen(false);
	};

	// Price override handlers
	const handleOpenPriceDialog = (price: Price) => {
		setSelectedPrice(price);
		setIsPriceDialogOpen(true);
	};

	const handlePriceOverride = (priceId: string, override: Partial<ExtendedPriceOverride>) => {
		// Update local overridden prices state
		setOverriddenPrices((prev) => ({
			...prev,
			[priceId]: { price_id: priceId, ...override } as ExtendedPriceOverride,
		}));

		// Save the price update to the API
		if (selectedPrice) {
			handleSavePriceUpdate(selectedPrice, override);
		}
	};

	const handleResetOverride = (priceId: string) => {
		// Remove from local overridden prices
		setOverriddenPrices((prev) => {
			const newState = { ...prev };
			delete newState[priceId];
			return newState;
		});
	};

	const handleSavePriceUpdate = (price: Price, override: Partial<ExtendedPriceOverride>) => {
		// Convert the override to UpdatePriceRequest format
		const updateData: UpdatePriceRequest = {};

		// Add amount if it exists and is different from original
		if (override.amount && override.amount !== price.amount) {
			updateData.amount = override.amount;
		}

		// Add billing_model if changed
		if (override.billing_model && override.billing_model !== price.billing_model) {
			// Handle SLAB_TIERED conversion - it maps to TIERED with SLAB tier mode
			if (override.billing_model === 'SLAB_TIERED') {
				updateData.billing_model = 'TIERED' as any; // This is a valid BILLING_MODEL value
			} else {
				updateData.billing_model = override.billing_model as any;
			}
		}

		// Add tier_mode if changed
		if (override.tier_mode && override.tier_mode !== (price.tier_mode || 'VOLUME')) {
			updateData.tier_mode = override.tier_mode;
		}

		// Add tiers if changed
		if (override.tiers && override.tiers.length > 0) {
			updateData.tiers = override.tiers;
		}

		// Add transform_quantity if changed
		if (override.transform_quantity) {
			updateData.transform_quantity = override.transform_quantity;
		}

		// Add effective_from if provided (for scheduling price changes)
		if (override.effective_from) {
			updateData.effective_from = override.effective_from;
		}

		// Call the update mutation
		updatePrice({ priceId: price.id, data: updateData });
	};

	// Combine existing and new credit grants for display
	const allCreditGrants = [...(planData?.credit_grants || []), ...newCreditGrants];

	return (
		<Page
			heading={planData?.name}
			headingCTA={
				<>
					<Button onClick={() => setPlanDrawerOpen(true)} variant={'outline'} className='flex gap-2'>
						<Pencil />
						Edit
					</Button>

					<Button onClick={() => archivePlan()} disabled={planData?.status !== 'published'} variant={'outline'} className='flex gap-2'>
						<EyeOff />
						Archive
					</Button>
				</>
			}>
			<CreditGrantModal
				data={getEmptyCreditGrantForModal()}
				isOpen={creditGrantModalOpen}
				onOpenChange={setCreditGrantModalOpen}
				onSave={handleSaveCreditGrant}
				onCancel={handleCancelCreditGrant}
				getEmptyCreditGrant={getEmptyCreditGrant}
			/>
			<MetadataModal open={metadataModalOpen} data={metadata} onSave={updatePlanMetadata} onClose={() => setMetadataModalOpen(false)} />
			<PlanDrawer data={planData as Plan} open={planDrawerOpen} onOpenChange={setPlanDrawerOpen} refetchQueryKeys={['fetchPlan']} />
			{selectedPrice && (
				<PriceOverrideDialog
					isOpen={isPriceDialogOpen}
					onOpenChange={setIsPriceDialogOpen}
					price={selectedPrice}
					onPriceOverride={handlePriceOverride}
					onResetOverride={handleResetOverride}
					overriddenPrices={overriddenPrices}
					showEffectiveFrom={true}
				/>
			)}
			<ApiDocsContent tags={['Plans']} />
			<AddEntitlementDrawer
				selectedFeatures={planData.entitlements?.map((v) => v.feature)}
				entitlements={planData.entitlements}
				planId={planData.id}
				entityType={ENTITLEMENT_ENTITY_TYPE.PLAN}
				entityId={planData.id}
				isOpen={drawerOpen}
				onOpenChange={(value) => setdrawerOpen(value)}
			/>

			<div className='space-y-6'>
				<DetailsCard variant='stacked' title='Plan Details' data={planDetails} />

				{/* plan charges table */}
				<PlanPriceTable
					plan={planData as Plan}
					onPriceUpdate={() => queryClient.invalidateQueries({ queryKey: ['fetchPlan', planId] })}
					onEditPrice={handleOpenPriceDialog}
				/>

				{planData.entitlements?.length || 0 > 0 ? (
					<Card variant='notched'>
						<CardHeader
							title='Entitlements'
							cta={
								<Button prefixIcon={<Plus />} onClick={() => setdrawerOpen(true)}>
									Add
								</Button>
							}
						/>
						<FlexpriceTable showEmptyRow data={planData.entitlements || []} columns={columnData} />
					</Card>
				) : (
					<NoDataCard
						title='Entitlements'
						subtitle='No entitlements added to the plan yet'
						cta={
							<Button prefixIcon={<Plus />} onClick={() => setdrawerOpen(true)}>
								Add
							</Button>
						}
					/>
				)}

				{allCreditGrants.length > 0 ? (
					<Card variant='notched'>
						<CardHeader
							title='Credit Grants'
							cta={
								<Button prefixIcon={<Plus />} onClick={() => setCreditGrantModalOpen(true)} disabled={isCreatingCreditGrant}>
									{isCreatingCreditGrant ? 'Adding...' : 'Add'}
								</Button>
							}
						/>
						<FlexpriceTable showEmptyRow data={allCreditGrants} columns={creditGrantColumns} />
					</Card>
				) : (
					<NoDataCard
						title='Credit Grants'
						subtitle='No credit grants added to the plan yet'
						cta={
							<Button prefixIcon={<Plus />} onClick={() => setCreditGrantModalOpen(true)} disabled={isCreatingCreditGrant}>
								{isCreatingCreditGrant ? 'Adding...' : 'Add'}
							</Button>
						}
					/>
				)}

				{/* Metadata Section */}
				<Card variant='notched'>
					<CardHeader
						title='Metadata'
						cta={
							<Button variant='outline' size='icon' onClick={() => setMetadataModalOpen(true)}>
								<Pencil className='size-5' />
							</Button>
						}
					/>
					{metadata && Object.keys(metadata).length > 0 ? (
						<DetailsCard
							variant='stacked'
							data={
								metadata && Object.keys(metadata).length > 0
									? Object.entries(metadata).map(([key, value]) => ({ label: key, value }))
									: [{ label: 'No metadata available.', value: '' }]
							}
							cardStyle='borderless'
						/>
					) : (
						<div className='text-center py-8'>
							<h3 className='text-lg font-medium text-gray-900 mb-1'>No metadata</h3>
							<p className='text-sm text-gray-500 mb-4'>Add custom metadata to store additional information about this plan.</p>
						</div>
					)}
				</Card>
				<Spacer className='!h-20' />
			</div>
		</Page>
	);
};

export default PlanDetailsPage;
