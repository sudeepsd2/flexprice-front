import { FC } from 'react';
import FlexpriceTable, { ColumnData, TooltipCell } from '../Table';
import { TaxRateResponse } from '@/types/dto/tax';
import { Chip, ActionButton } from '@/components/atoms';
import { formatDateShort } from '@/utils/common/helper_functions';
import { TAX_RATE_TYPE, TAX_RATE_STATUS, TaxRate } from '@/models/Tax';
import TaxApi from '@/api/TaxApi';
import formatChips from '@/utils/common/format_chips';
import { RouteNames } from '@/core/routes/Routes';
import { useNavigate } from 'react-router';

interface Props {
	data: TaxRateResponse[];
	onEdit?: (tax: TaxRateResponse) => void;
}

const getTaxTypeLabel = (type: TAX_RATE_TYPE) => {
	switch (type) {
		case TAX_RATE_TYPE.PERCENTAGE:
			return 'Percentage';
		case TAX_RATE_TYPE.FIXED:
			return 'Fixed Amount';
		default:
			return 'Unknown';
	}
};

// const getStatusChip = (status: TAX_RATE_STATUS) => {
// 	const statusConfig = {
// 		[TAX_RATE_STATUS.ACTIVE]: { label: 'Active', variant: 'success' as const },
// 		[TAX_RATE_STATUS.INACTIVE]: { label: 'Inactive', variant: 'default' as const },
// 		[TAX_RATE_STATUS.DELETED]: { label: 'Deleted', variant: 'failed' as const },
// 	};
// 	const config = statusConfig[status] || { label: 'Unknown', variant: 'default' as const };
// 	return <Chip label={config.label} variant={config.variant} />;
// };

// const getScopeLabel = (scope: TAX_RATE_SCOPE) => {
// 	switch (scope) {
// 		case TAX_RATE_SCOPE.INTERNAL:
// 			return 'Internal';
// 		case TAX_RATE_SCOPE.EXTERNAL:
// 			return 'External';
// 		case TAX_RATE_SCOPE.ONETIME:
// 			return 'One-time';
// 		default:
// 			return 'Unknown';
// 	}
// };

const formatTaxValue = (tax: TaxRateResponse) => {
	if (tax.tax_rate_type === TAX_RATE_TYPE.PERCENTAGE && tax.percentage_value !== undefined) {
		return `${tax.percentage_value}%`;
	}
	if (tax.tax_rate_type === TAX_RATE_TYPE.FIXED && tax.fixed_value !== undefined) {
		return `${tax.fixed_value}`;
	}
	return '--';
};

const TaxTable: FC<Props> = ({ data, onEdit }) => {
	const navigate = useNavigate();
	const columns: ColumnData<TaxRate>[] = [
		{
			title: 'Name',
			fieldName: 'name',
		},
		{
			title: 'Code',
			render: (row) => <TooltipCell tooltipContent={row.code} tooltipText={row.code} />,
		},
		{
			title: 'Type',
			render: (row) => getTaxTypeLabel(row.tax_rate_type),
		},
		{
			title: 'Value',
			render: (row) => formatTaxValue(row),
		},
		{
			title: 'Status',
			render: (row) => {
				const label = formatChips(row?.status);
				return <Chip variant={label === 'Active' ? 'success' : 'default'} label={label} />;
			},
		},
		{
			title: 'Created',
			render: (row) => formatDateShort(row.created_at),
		},
		{
			fieldVariant: 'interactive',
			render(row) {
				return (
					<ActionButton
						id={row?.id}
						deleteMutationFn={async () => {
							return await TaxApi.deleteTaxRate(row?.id);
						}}
						refetchQueryKey='fetchTaxRates'
						entityName={row?.name}
						edit={{
							enabled: true,
							onClick: () => onEdit?.(row),
						}}
						archive={{
							enabled: row?.tax_rate_status !== TAX_RATE_STATUS.DELETED,
						}}
					/>
				);
			},
		},
	];

	return (
		<div>
			<FlexpriceTable onRowClick={(row) => navigate(`${RouteNames.taxes}/${row.id}`)} showEmptyRow={true} columns={columns} data={data} />
		</div>
	);
};

export default TaxTable;
