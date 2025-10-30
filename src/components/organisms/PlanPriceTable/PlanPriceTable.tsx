import { FC, useCallback, useState, useEffect } from 'react';
import { Button, Card, CardHeader, NoDataCard, Chip } from '@/components/atoms';
import { FlexpriceTable, ColumnData, DropdownMenu, TerminatePriceModal, SyncOption, UpdatePriceDialog } from '@/components/molecules';
import { Price, Plan, PRICE_STATUS } from '@/models';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { PriceApi } from '@/api/PriceApi';
import { PlanApi } from '@/api/PlanApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '@/core/routes/Routes';
import { getPriceTypeLabel } from '@/utils';
import { BILLING_PERIOD } from '@/constants/constants';
import { ChargeValueCell } from '@/components/molecules';
import { formatInvoiceCadence } from '@/pages';
import { Dialog } from '@/components/ui';
import { DeletePriceRequest } from '@/types/dto';

// ===== TYPES & CONSTANTS =====

interface PlanChargesTableProps {
	plan: Plan;
	onPriceUpdate?: () => void;
}

const formatBillingPeriod = (billingPeriod: string) => {
	switch (billingPeriod.toUpperCase()) {
		case BILLING_PERIOD.DAILY:
			return 'Daily';
		case BILLING_PERIOD.WEEKLY:
			return 'Weekly';
		case BILLING_PERIOD.MONTHLY:
			return 'Monthly';
		case BILLING_PERIOD.ANNUAL:
			return 'Yearly';
		case BILLING_PERIOD.QUARTERLY:
			return 'Quarterly';
		case BILLING_PERIOD.HALF_YEARLY:
			return 'Half Yearly';
		default:
			return '--';
	}
};

const getPriceStatus = (price: Price & { start_date?: string; end_date?: string }): PRICE_STATUS => {
	const now = new Date();

	// Check if start_date is in the future
	if (price.start_date && price.start_date.trim() !== '') {
		const startDate = new Date(price.start_date);
		// Check if date is valid (not NaN)
		if (!isNaN(startDate.getTime()) && startDate > now) {
			return PRICE_STATUS.UPCOMING;
		}
	}

	// Check if end_date is in the past
	if (price.end_date && price.end_date.trim() !== '') {
		const endDate = new Date(price.end_date);
		// Check if date is valid (not NaN)
		if (!isNaN(endDate.getTime()) && endDate < now) {
			return PRICE_STATUS.INACTIVE;
		}
	}

	// Default to active
	return PRICE_STATUS.ACTIVE;
};

const getStatusChipVariant = (status: PRICE_STATUS): 'info' | 'default' | 'success' => {
	switch (status) {
		case PRICE_STATUS.UPCOMING:
			return 'info';
		case PRICE_STATUS.INACTIVE:
			return 'default';
		case PRICE_STATUS.ACTIVE:
			return 'success';
		default:
			return 'success';
	}
};

const PlanPriceTable: FC<PlanChargesTableProps> = ({ plan, onPriceUpdate }) => {
	const navigate = useNavigate();
	const [showTerminateModal, setShowTerminateModal] = useState(false);
	const [selectedPriceForTermination, setSelectedPriceForTermination] = useState<Price | null>(null);
	const [selectedPriceForEdit, setSelectedPriceForEdit] = useState<Price | null>(null);
	const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
	const [dropdownOpenStates, setDropdownOpenStates] = useState<Record<string, boolean>>({});

	// ===== MUTATIONS =====
	const { mutateAsync: deletePrice, isPending: isDeletingPrice } = useMutation({
		mutationFn: async ({ priceId, data }: { priceId: string; data?: DeletePriceRequest }) => {
			return await PriceApi.DeletePrice(priceId, data);
		},
		onSuccess: () => {
			toast.success('Price terminated successfully');
		},
		onError: (error: ServerError) => {
			toast.error(error?.error?.message || 'Error deleting price');
		},
	});

	const { mutateAsync: syncPlanCharges, isPending: isSyncing } = useMutation({
		mutationFn: () => PlanApi.synchronizePlanPricesWithSubscription(plan.id),
		onSuccess: () => {
			toast.success('Sync has been started and will take up to 1 hour to complete.');
		},
		onError: (error: ServerError) => {
			toast.error(error?.error?.message || 'Error synchronizing charges with subscriptions');
		},
	});

	const isPending = isDeletingPrice || isSyncing;

	// ===== DROPDOWN STATE HELPERS =====
	const setDropdownOpen = useCallback((priceId: string, isOpen: boolean) => {
		setDropdownOpenStates((prev) => ({ ...prev, [priceId]: isOpen }));
	}, []);

	const closeDropdown = useCallback(
		(priceId: string) => {
			setDropdownOpen(priceId, false);
		},
		[setDropdownOpen],
	);

	const closeAllDropdowns = useCallback(() => {
		setDropdownOpenStates({});
	}, []);

	// ===== HANDLERS =====
	const handleEditPrice = useCallback(
		(price: Price) => {
			// Close dropdown first, then open modal (ActionButton pattern)
			closeDropdown(price.id);
			setSelectedPriceForEdit(price);
			setIsPriceDialogOpen(true);
		},
		[closeDropdown],
	);

	const handlePriceUpdateSuccess = useCallback(() => {
		setIsPriceDialogOpen(false);
		setSelectedPriceForEdit(null);
		onPriceUpdate?.();
	}, [onPriceUpdate]);

	const handleTerminatePrice = useCallback(
		(priceId: string) => {
			const price = plan.prices?.find((p) => p.id === priceId);
			if (!price) return;

			closeDropdown(priceId);
			setSelectedPriceForTermination(price);
			setShowTerminateModal(true);
		},
		[plan.prices, closeDropdown],
	);

	const handleTerminateConfirm = useCallback(
		async (endDate: string | undefined, syncOption?: SyncOption) => {
			if (!selectedPriceForTermination) return;

			setShowTerminateModal(false);

			try {
				const deleteRequest: DeletePriceRequest | undefined = endDate ? { end_date: endDate } : undefined;
				await deletePrice({ priceId: selectedPriceForTermination.id, data: deleteRequest });

				if (syncOption === SyncOption.EXISTING_ALSO) {
					await syncPlanCharges();
				}

				onPriceUpdate?.();
				setSelectedPriceForTermination(null);
			} catch (error) {
				console.error('Error terminating price:', error);
			}
		},
		[selectedPriceForTermination, deletePrice, syncPlanCharges, onPriceUpdate],
	);

	const handleTerminateCancel = useCallback(() => {
		setShowTerminateModal(false);
		setSelectedPriceForTermination(null);
	}, []);

	// ===== EFFECTS =====
	// Close all dropdowns when modals open (additional safety measure)
	useEffect(() => {
		if (showTerminateModal || isPriceDialogOpen) {
			closeAllDropdowns();
		}
	}, [showTerminateModal, isPriceDialogOpen, closeAllDropdowns]);

	// ===== TABLE COLUMNS =====
	const chargeColumns: ColumnData<Price>[] = [
		{
			title: 'Charge Type',
			render: (row) => {
				return <span>{getPriceTypeLabel(row.type)}</span>;
			},
		},
		{
			title: 'Feature',
			render(rowData) {
				return <span>{rowData.meter?.name ?? '--'}</span>;
			},
		},
		{
			title: 'Billing Timing',
			render(rowData) {
				return <span>{formatInvoiceCadence(rowData.invoice_cadence as string)}</span>;
			},
		},
		{
			title: 'Billing Period',
			render(rowData) {
				return <span>{formatBillingPeriod(rowData.billing_period as string)}</span>;
			},
		},
		{
			title: 'Status',
			render(rowData) {
				const status = getPriceStatus(rowData as Price & { start_date?: string; end_date?: string });
				const variant = getStatusChipVariant(status);
				const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
				return <Chip label={statusLabel} variant={variant} />;
			},
		},
		{
			title: 'Value',
			render(rowData) {
				return <ChargeValueCell data={rowData} />;
			},
		},
		{
			fieldVariant: 'interactive',
			width: '30px',
			hideOnEmpty: true,
			render(row) {
				const hasEndDate = !!(row.end_date && row.end_date.trim() !== '');
				const isDropdownOpen = dropdownOpenStates[row.id] || false;

				return (
					<DropdownMenu
						isOpen={isDropdownOpen}
						onOpenChange={(open) => setDropdownOpen(row.id, open)}
						options={[
							{
								label: 'Edit Price',
								icon: <Pencil />,
								onSelect: (e: Event) => {
									e.preventDefault();
									handleEditPrice(row);
								},
								disabled: hasEndDate,
							},
							{
								label: 'Terminate Price',
								icon: <Trash2 />,
								onSelect: (e: Event) => {
									e.preventDefault();
									handleTerminatePrice(row.id);
								},
								disabled: hasEndDate,
							},
						]}
					/>
				);
			},
		},
	];

	// ===== RENDER =====
	return (
		<>
			{/* Terminate Price Modal */}
			<Dialog open={showTerminateModal} onOpenChange={setShowTerminateModal}>
				{selectedPriceForTermination && (
					<TerminatePriceModal
						planId={plan.id}
						onCancel={handleTerminateCancel}
						onConfirm={handleTerminateConfirm}
						isLoading={isPending}
						showSyncOption={true}
					/>
				)}
			</Dialog>

			{/* Update Price Dialog */}
			{selectedPriceForEdit && (
				<UpdatePriceDialog
					isOpen={isPriceDialogOpen}
					onOpenChange={setIsPriceDialogOpen}
					price={selectedPriceForEdit}
					planId={plan.id}
					onSuccess={handlePriceUpdateSuccess}
				/>
			)}

			{/* Charges Table */}
			{(plan?.prices?.length ?? 0) > 0 ? (
				<Card variant='notched'>
					<CardHeader
						title='Charges'
						cta={
							<Button prefixIcon={<Plus />} onClick={() => navigate(`${RouteNames.plan}/${plan.id}/add-charges`)}>
								Add
							</Button>
						}
					/>
					<FlexpriceTable columns={chargeColumns} data={plan?.prices ?? []} />
				</Card>
			) : (
				<NoDataCard
					title='Charges'
					subtitle='No charges added to the plan yet'
					cta={
						<Button prefixIcon={<Plus />} onClick={() => navigate(`${RouteNames.plan}/${plan.id}/add-charges`)}>
							Add
						</Button>
					}
				/>
			)}
		</>
	);
};

export default PlanPriceTable;
