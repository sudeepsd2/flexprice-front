import { FC } from 'react';
import { Subscription, SUBSCRIPTION_STATUS } from '@/models/Subscription';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { Chip } from '@/components/atoms';
import { formatBillingPeriodForDisplay } from '@/utils/common/helper_functions';
import formatDate from '@/utils/common/format_date';
import SubscriptionActionButton from './SubscriptionActionButton';

export interface SubscriptionTableProps {
	data: Subscription[];
	onRowClick?: (row: Subscription) => void;
	allowRedirect?: boolean;
}

export const getSubscriptionStatus = (status: string) => {
	switch (status) {
		case SUBSCRIPTION_STATUS.ACTIVE:
			return <Chip variant='success' label='Active' />;
		case SUBSCRIPTION_STATUS.PAUSED:
			return <Chip variant='warning' label='Paused' />;
		case SUBSCRIPTION_STATUS.CANCELLED:
			return <Chip variant='failed' label='Cancelled' />;
		case SUBSCRIPTION_STATUS.INCOMPLETE:
			return <Chip variant='warning' label='Incomplete' />;
		case SUBSCRIPTION_STATUS.INCOMPLETE_EXPIRED:
			return <Chip variant='failed' label='Incomplete Expired' />;
		case SUBSCRIPTION_STATUS.PAST_DUE:
			return <Chip variant='failed' label='Past Due' />;
		case SUBSCRIPTION_STATUS.TRIALING:
			return <Chip variant='warning' label='Trialing' />;
		case SUBSCRIPTION_STATUS.UNPAID:
			return <Chip variant='failed' label='Unpaid' />;
		case SUBSCRIPTION_STATUS.DRAFT:
			return <Chip variant='warning' label='Draft' />;
		default:
			return <Chip variant='default' label='Inactive' />;
	}
};

export const formatSubscriptionStatus = (status: string) => {
	switch (status) {
		case SUBSCRIPTION_STATUS.ACTIVE:
			return 'Active';
		case SUBSCRIPTION_STATUS.PAUSED:
			return 'Paused';
		case SUBSCRIPTION_STATUS.CANCELLED:
			return 'Cancelled';
		case SUBSCRIPTION_STATUS.INCOMPLETE:
			return 'Incomplete';
		case SUBSCRIPTION_STATUS.INCOMPLETE_EXPIRED:
			return 'Incomplete Expired';
		case SUBSCRIPTION_STATUS.PAST_DUE:
			return 'Past Due';
		case SUBSCRIPTION_STATUS.TRIALING:
			return 'Trialing';
		case SUBSCRIPTION_STATUS.UNPAID:
			return 'Unpaid';
		case SUBSCRIPTION_STATUS.DRAFT:
			return 'Draft';
		default:
			return 'Inactive';
	}
};

const SubscriptionTable: FC<SubscriptionTableProps> = ({ data, onRowClick, allowRedirect = true }): JSX.Element => {
	const columns: ColumnData<Subscription>[] = [
		{
			title: 'Plan Name',
			render: (row) => row.plan?.name,
		},
		{
			title: 'Billing Period',
			render: (row) => <span>{formatBillingPeriodForDisplay(row.billing_period)}</span>,
		},
		{
			title: 'Status',
			render: (row) => getSubscriptionStatus(row.subscription_status),
		},
		{
			title: 'Start Date',
			render: (row) => <span>{formatDate(row.start_date)}</span>,
		},
		{
			title: 'Renewal Date',
			render: (row) => <span>{formatDate(row.current_period_end)}</span>,
		},
		...(allowRedirect
			? [
					{
						width: '30px',
						fieldVariant: 'interactive' as const,
						hideOnEmpty: true,
						render: (row: Subscription) => <SubscriptionActionButton subscription={row} />,
					},
				]
			: []),
	];

	return (
		<FlexpriceTable
			onRowClick={(row) => {
				onRowClick?.(row);
			}}
			columns={columns}
			data={data}
			variant='no-bordered'
		/>
	);
};

export default SubscriptionTable;
