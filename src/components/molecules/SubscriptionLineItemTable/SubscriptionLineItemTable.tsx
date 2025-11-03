import { Card, CardHeader, NoDataCard, Chip, Tooltip } from '@/components/atoms';
import { ChargeValueCell, ColumnData, FlexpriceTable, TerminateLineItemModal, DropdownMenu } from '@/components/molecules';
import { LineItem } from '@/models/Subscription';
import { FC, useState, useCallback, useMemo } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { ENTITY_STATUS } from '@/models/base';
import { formatBillingPeriodForDisplay, getPriceTypeLabel } from '@/utils/common/helper_functions';
import { PRICE_TYPE, PRICE_STATUS } from '@/models/Price';
import { formatDateTimeWithSecondsAndTimezone } from '@/utils/common/format_date';

interface Props {
	data: LineItem[];
	onEdit?: (lineItem: LineItem) => void;
	onTerminate?: (lineItemId: string, endDate?: string) => void;
	isLoading?: boolean;
}

interface LineItemWithStatus extends LineItem {
	precomputedStatus: PRICE_STATUS;
	statusVariant: 'info' | 'default' | 'success';
	statusLabel: string;
	tooltipContent: React.ReactNode;
}

interface LineItemDropdownProps {
	row: LineItem;
	isEditDisabled: boolean;
	isTerminateDisabled: boolean;
	onEdit: (lineItem: LineItem) => void;
	onTerminate: (lineItem: LineItem) => void;
}

const LineItemDropdown: FC<LineItemDropdownProps> = ({ row, isEditDisabled, isTerminateDisabled, onEdit, onTerminate }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsOpen(!isOpen);
	};

	return (
		<div data-interactive='true' onClick={handleClick}>
			<DropdownMenu
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				options={[
					{
						label: 'Edit',
						icon: <Pencil />,
						onSelect: (e: Event) => {
							e.preventDefault();
							setIsOpen(false);
							onEdit(row);
						},
						disabled: isEditDisabled,
					},
					{
						label: 'Terminate',
						icon: <Trash2 />,
						onSelect: (e: Event) => {
							e.preventDefault();
							setIsOpen(false);
							onTerminate(row);
						},
						disabled: isTerminateDisabled,
					},
				]}
			/>
		</div>
	);
};

const getLineItemStatus = (lineItem: LineItem): PRICE_STATUS => {
	const now = new Date();
	const defaultEndDate = '0001-01-01T00:00:00Z';

	// Check if start_date is in the future
	if (lineItem.start_date && lineItem.start_date.trim() !== '') {
		const startDate = new Date(lineItem.start_date);
		// Check if date is valid (not NaN)
		if (!isNaN(startDate.getTime()) && startDate > now) {
			return PRICE_STATUS.UPCOMING;
		}
	}

	// Check if end_date is in the past
	if (lineItem.end_date && lineItem.end_date.trim() !== '' && lineItem.end_date !== defaultEndDate) {
		const endDate = new Date(lineItem.end_date);
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

const formatLineItemDateTooltip = (lineItem: LineItem): React.ReactNode => {
	const dateItems: React.ReactNode[] = [];
	const defaultEndDate = '0001-01-01T00:00:00Z';

	if (lineItem.start_date && lineItem.start_date.trim() !== '') {
		try {
			const startDate = new Date(lineItem.start_date);
			if (!isNaN(startDate.getTime())) {
				dateItems.push(
					<div key='start' className='flex items-center gap-2'>
						<span className='text-xs font-medium text-gray-500'>Start</span>
						<span className='text-sm font-medium'>{formatDateTimeWithSecondsAndTimezone(startDate)}</span>
					</div>,
				);
			}
		} catch {
			// Ignore invalid dates
		}
	}

	if (lineItem.end_date && lineItem.end_date.trim() !== '' && lineItem.end_date !== defaultEndDate) {
		try {
			const endDate = new Date(lineItem.end_date);
			if (!isNaN(endDate.getTime())) {
				dateItems.push(
					<div key='end' className='flex items-center gap-2'>
						<span className='text-xs font-medium text-gray-500'>End</span>
						<span className='text-sm font-medium'>{formatDateTimeWithSecondsAndTimezone(endDate)}</span>
					</div>,
				);
			}
		} catch {
			// Ignore invalid dates
		}
	}

	if (dateItems.length === 0) {
		return <span className='text-sm'>No date information</span>;
	}

	return <div className='flex flex-col gap-2'>{dateItems}</div>;
};

const SubscriptionLineItemTable: FC<Props> = ({ data, onEdit, onTerminate, isLoading }) => {
	const [showTerminateModal, setShowTerminateModal] = useState(false);
	const [selectedLineItem, setSelectedLineItem] = useState<LineItem | null>(null);

	// ===== HANDLERS =====
	const handleEditClick = useCallback(
		(lineItem: LineItem) => {
			onEdit?.(lineItem);
		},
		[onEdit],
	);

	const handleTerminateClick = useCallback((lineItem: LineItem) => {
		setSelectedLineItem(lineItem);
		setShowTerminateModal(true);
	}, []);

	const handleTerminateConfirm = (endDate: string | undefined) => {
		if (selectedLineItem) {
			onTerminate?.(selectedLineItem.id, endDate);
		}
		setShowTerminateModal(false);
		setSelectedLineItem(null);
	};

	const handleTerminateCancel = () => {
		setShowTerminateModal(false);
		setSelectedLineItem(null);
	};

	const handleDialogChange = (open: boolean) => {
		if (!open) {
			setShowTerminateModal(false);
			setSelectedLineItem(null);
		}
	};

	// ===== PROCESSED LINE ITEMS WITH PRECOMPUTED STATUS =====
	const processedLineItems = useMemo<LineItemWithStatus[]>(() => {
		if (!data || data.length === 0) return [];

		// Precompute status and related data for each line item
		const lineItemsWithStatus: LineItemWithStatus[] = data.map((lineItem) => {
			const status = getLineItemStatus(lineItem);
			const variant = getStatusChipVariant(status);
			const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
			const tooltipContent = formatLineItemDateTooltip(lineItem);

			return {
				...lineItem,
				precomputedStatus: status,
				statusVariant: variant,
				statusLabel,
				tooltipContent,
			};
		});

		// Sort: active first, then upcoming, then inactive
		const statusOrder: Record<PRICE_STATUS, number> = {
			[PRICE_STATUS.ACTIVE]: 0,
			[PRICE_STATUS.UPCOMING]: 1,
			[PRICE_STATUS.INACTIVE]: 2,
		};

		return lineItemsWithStatus.sort((a, b) => {
			return statusOrder[a.precomputedStatus] - statusOrder[b.precomputedStatus];
		});
	}, [data]);

	// ===== TABLE COLUMNS =====
	const columns: ColumnData<LineItemWithStatus>[] = [
		{
			title: 'Display Name',
			fieldName: 'display_name',
		},
		{
			title: 'Price Type',
			render: (row) => <span>{getPriceTypeLabel(row.price_type)}</span>,
		},
		{
			title: 'Billing Period',
			render: (row) => formatBillingPeriodForDisplay(row.billing_period),
		},
		{
			title: 'Status',
			render(rowData) {
				return (
					<Tooltip
						content={rowData.tooltipContent}
						delayDuration={0}
						sideOffset={5}
						className='bg-white border border-gray-200 shadow-lg text-sm text-gray-900 px-4 py-3 rounded-lg max-w-[320px]'>
						<span>
							<Chip label={rowData.statusLabel} variant={rowData.statusVariant} />
						</span>
					</Tooltip>
				);
			},
		},
		{
			title: 'Charge',
			render: (row) => <div className='flex items-center gap-2'>{row.price ? <ChargeValueCell data={row.price} /> : '--'}</div>,
		},
		{
			fieldVariant: 'interactive',
			width: '30px',
			hideOnEmpty: true,
			render: (row) => {
				const isArchived = row.status === ENTITY_STATUS.ARCHIVED;
				const defaultEndDate = '0001-01-01T00:00:00Z';
				const hasEndDate = !!(row.end_date && row.end_date.trim() !== '' && row.end_date !== defaultEndDate);
				const isTerminateDisabled = isArchived || hasEndDate;
				const isEditDisabled = isArchived || hasEndDate || row.price_type !== PRICE_TYPE.USAGE;

				return (
					<LineItemDropdown
						row={row}
						isEditDisabled={isEditDisabled}
						isTerminateDisabled={isTerminateDisabled}
						onEdit={handleEditClick}
						onTerminate={handleTerminateClick}
					/>
				);
			},
		},
	];

	if (isLoading) {
		return (
			<Card variant='notched'>
				<CardHeader title='Subscription Line Items' />
				<div className='p-4'>
					<div className='animate-pulse space-y-4'>
						<div className='h-4 bg-gray-200 rounded w-3/4'></div>
						<div className='h-4 bg-gray-200 rounded w-1/2'></div>
						<div className='h-4 bg-gray-200 rounded w-5/6'></div>
					</div>
				</div>
			</Card>
		);
	}

	if (!processedLineItems || processedLineItems.length === 0) {
		return <NoDataCard title='Subscription Line Items' subtitle='No line items found for this subscription' />;
	}

	return (
		<>
			{/* Terminate Line Item Modal */}
			{selectedLineItem && (
				<TerminateLineItemModal
					isOpen={showTerminateModal}
					onOpenChange={handleDialogChange}
					onCancel={handleTerminateCancel}
					onConfirm={handleTerminateConfirm}
					isLoading={isLoading}
				/>
			)}

			<Card variant='notched'>
				<CardHeader title='Subscription Line Items' />
				<FlexpriceTable showEmptyRow={false} data={processedLineItems} columns={columns} />
			</Card>
		</>
	);
};

export default SubscriptionLineItemTable;
