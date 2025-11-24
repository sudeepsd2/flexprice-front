import React from 'react';
import { ActionButton } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import { CreditGrant } from '@/models';
import { formatExpirationPeriod } from '@/utils/common/credit_grant_helpers';
import { formatBillingPeriodForPrice } from '@/utils/common/helper_functions';
import { formatAmount } from '@/components/atoms/Input/Input';
import CreditGrantApi from '@/api/CreditGrantApi';
import { EllipsisVertical, Trash2 } from 'lucide-react';

interface CreditGrantsTableProps {
	data: CreditGrant[];
	onDelete?: (grant: CreditGrant) => void | Promise<void>;
	showEmptyRow?: boolean;
}

const CreditGrantsTable: React.FC<CreditGrantsTableProps> = ({ data, onDelete, showEmptyRow = false }) => {
	const handleDelete = async (grant: CreditGrant) => {
		await CreditGrantApi.Delete(grant.id);

		if (onDelete) {
			await onDelete(grant);
		}
	};

	const columns: ColumnData<CreditGrant>[] = [
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
			title: 'Cadence',
			render: (row) => {
				const cadence = row.cadence.toLowerCase().replace('_', ' ');
				return cadence.charAt(0).toUpperCase() + cadence.slice(1);
			},
		},
		{
			title: 'Period',
			render: (row) => (row.period ? `${row.period_count || 1} ${formatBillingPeriodForPrice(row.period)}` : '--'),
		},
		{
			title: 'Expiration Config',
			render: (row) => {
				return <span>{formatExpirationPeriod(row)}</span>;
			},
		},
		{
			fieldVariant: 'interactive' as const,
			width: '30px',
			hideOnEmpty: true,
			render: (row) => {
				return (
					<ActionButton
						id={row.id}
						deleteMutationFn={async () => {
							await handleDelete(row);
						}}
						triggerIcon={<EllipsisVertical className='text-foreground size-4' />}
						refetchQueryKey='creditGrants'
						entityName={row.name}
						edit={{
							enabled: false,
						}}
						archive={{
							enabled: true,
							text: 'Delete',
							icon: <Trash2 />,
						}}
					/>
				);
			},
		},
	];

	return <FlexpriceTable showEmptyRow={showEmptyRow} data={data} columns={columns} />;
};

export default CreditGrantsTable;
