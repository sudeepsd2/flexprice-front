// React imports
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

// Third-party libraries
import { useMutation, useQuery } from '@tanstack/react-query';
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
	CreditGrantsTable,
	DetailsCard,
	FlexpriceTable,
	MetadataModal,
	PlanDrawer,
	RedirectCell,
} from '@/components/molecules';
import { PlanPriceTable } from '@/components/organisms';
import { getFeatureTypeChips } from '@/components/molecules/CustomerUsageTable/CustomerUsageTable';

// API imports
import { CreditGrantApi, EntitlementApi, PlanApi } from '@/api';

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
	CREDIT_SCOPE,
	CREDIT_GRANT_CADENCE,
	CREDIT_GRANT_PERIOD,
	INVOICE_CADENCE,
} from '@/models';
import { EntitlementResponse } from '@/types';
import { InternalCreditGrantRequest, CreateCreditGrantRequest } from '@/types/dto/CreditGrant';

// Constants and utilities
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import formatDate from '@/utils/common/format_date';
import formatChips from '@/utils/common/format_chips';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';

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
		mutationFn: async (data: CreateCreditGrantRequest) => {
			// Ensure plan_id is set
			const grantWithPlanId = {
				...data,
				plan_id: planId!,
			};

			return await CreditGrantApi.Create(grantWithPlanId);
		},
		onSuccess: () => {
			toast.success('Credit grant added successfully');
			setCreditGrantModalOpen(false);
			refetchQueries(['fetchPlan', planId!]);
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to add credit grant');
		},
	});

	const { mutate: updatePlanMetadata } = useMutation({
		mutationFn: async (data: Record<string, string>) => {
			return await PlanApi.updatePlan(planId!, { metadata: data });
		},
		onSuccess: () => {
			toast.success('Metadata updated successfully');
			setMetadataModalOpen(false);
			refetchQueries(['fetchPlan', planId!]);
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to update metadata');
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
						id={row?.id}
						deleteMutationFn={async () => {
							return await EntitlementApi.deleteEntitlementById(row?.id);
						}}
						refetchQueryKey='fetchPlan'
						entityName={row?.feature?.name}
						archive={{
							enabled: row?.status !== ENTITY_STATUS.ARCHIVED,
							text: 'Delete',
							icon: <Trash2 />,
						}}
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
			value: <Chip label={formatChips(planData?.status)} variant={planData?.status === ENTITY_STATUS.PUBLISHED ? 'success' : 'default'} />,
		},
	];

	const getEmptyCreditGrant = (): InternalCreditGrantRequest => {
		return {
			id: uniqueId('credit-grant-'),
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
			metadata: {},
		};
	};

	const handleSaveCreditGrant = (data: InternalCreditGrantRequest) => {
		// Convert InternalCreditGrantRequest to CreateCreditGrantRequest for API
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, ...createRequest } = data;
		updatePlanWithCreditGrant(createRequest);
	};

	const handleCancelCreditGrant = () => {
		setCreditGrantModalOpen(false);
	};

	return (
		<Page
			heading={planData?.name}
			headingCTA={
				<>
					<Button onClick={() => setPlanDrawerOpen(true)} variant={'outline'} className='flex gap-2'>
						<Pencil />
						Edit
					</Button>

					<Button
						onClick={() => archivePlan()}
						disabled={planData?.status !== ENTITY_STATUS.PUBLISHED}
						variant={'outline'}
						className='flex gap-2'>
						<EyeOff />
						Archive
					</Button>
				</>
			}>
			<CreditGrantModal
				data={undefined}
				isOpen={creditGrantModalOpen}
				onOpenChange={setCreditGrantModalOpen}
				onSave={handleSaveCreditGrant}
				onCancel={handleCancelCreditGrant}
				getEmptyCreditGrant={getEmptyCreditGrant}
			/>
			<MetadataModal open={metadataModalOpen} data={metadata} onSave={updatePlanMetadata} onClose={() => setMetadataModalOpen(false)} />
			<PlanDrawer data={planData as Plan} open={planDrawerOpen} onOpenChange={setPlanDrawerOpen} refetchQueryKeys={['fetchPlan']} />

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
				<PlanPriceTable plan={planData as Plan} onPriceUpdate={() => refetchQueries(['fetchPlan', planId!])} />

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

				{planData.credit_grants && planData.credit_grants.length > 0 ? (
					<Card variant='notched'>
						<CardHeader
							title='Credit Grants'
							cta={
								<Button prefixIcon={<Plus />} onClick={() => setCreditGrantModalOpen(true)} disabled={isCreatingCreditGrant}>
									{isCreatingCreditGrant ? 'Adding...' : 'Add'}
								</Button>
							}
						/>
						<CreditGrantsTable
							data={planData.credit_grants}
							onDelete={async () => {
								refetchQueries(['fetchPlan', planId!]);
							}}
							showEmptyRow
						/>
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
