import { FC, useState } from 'react';
import { ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import { Coupon } from '@/models/Coupon';
import { COUPON_TYPE } from '@/types/common/Coupon';
import { ENTITY_STATUS } from '@/models';
import formatChips from '@/utils/common/format_chips';
import formatDate from '@/utils/common/format_date';
import CouponApi from '@/api/CouponApi';
import { useNavigate } from 'react-router';
import CouponDrawer from '../CouponDrawer';
import { RouteNames } from '@/core/routes/Routes';
import { getCurrencySymbol } from '@/utils/common/helper_functions';

export interface CouponTableProps {
	data: Coupon[];
	onEdit?: (coupon: Coupon) => void;
}

const CouponTable: FC<CouponTableProps> = ({ data, onEdit }) => {
	const navigate = useNavigate();
	const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const mappedData = data?.map((coupon) => ({
		...coupon,
	}));

	const handleEdit = (coupon: Coupon) => {
		setSelectedCoupon(coupon);
		setIsDrawerOpen(true);
		onEdit?.(coupon);
	};

	const columns: ColumnData<Coupon>[] = [
		{
			fieldName: 'name',
			title: 'Name',
		},
		{
			title: 'Type',
			render: (row) => {
				const label = row.type === COUPON_TYPE.FIXED ? 'Fixed Amount' : 'Percentage';
				return <Chip variant='default' label={label} />;
			},
		},
		{
			title: 'Discount',
			render: (row) => {
				if (row.type === COUPON_TYPE.FIXED) {
					return row.amount_off ? `${getCurrencySymbol(row.currency)} ${row.amount_off}` : '-';
				} else {
					return row.percentage_off ? `${row.percentage_off}%` : '-';
				}
			},
		},
		{
			title: 'Redemptions',
			render: (row) => {
				const max = row.max_redemptions || '∞';
				const current = row.total_redemptions;
				return `${current}/${max}`;
			},
		},
		{
			title: 'Status',
			render: (row) => {
				const label = formatChips(row.status);
				return <Chip variant={label === 'Active' ? 'success' : 'default'} label={label} />;
			},
		},
		{
			title: 'Updated at',
			render: (row) => {
				return formatDate(row.updated_at);
			},
		},
		{
			fieldVariant: 'interactive',
			render: (row) => (
				<ActionButton
					id={row.id}
					deleteMutationFn={(id) => CouponApi.deleteCoupon(id)}
					refetchQueryKey='fetchCoupons'
					entityName='Coupon'
					edit={{
						path: `${RouteNames.couponDetails}/${row.id}`,
						onClick: () => handleEdit(row),
					}}
					archive={{
						enabled: row.status === ENTITY_STATUS.PUBLISHED,
					}}
				/>
			),
		},
	];

	return (
		<>
			<FlexpriceTable
				columns={columns}
				data={mappedData}
				showEmptyRow
				onRowClick={(row) => {
					navigate(`${RouteNames.couponDetails}/${row.id}`);
				}}
			/>
			<CouponDrawer data={selectedCoupon} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} refetchQueryKeys={['fetchCoupons']} />
		</>
	);
};

export default CouponTable;
