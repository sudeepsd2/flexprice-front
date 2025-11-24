import React from 'react';
import { FormHeader, Chip, Tooltip } from '@/components/atoms';
import FlexpriceTable, { ColumnData, RedirectCell } from '../Table';
import { CreditGrantApplication, APPLICATION_STATUS } from '@/models';
import { formatDateShort } from '@/utils/common/helper_functions';
import { formatDateTimeWithSecondsAndTimezone } from '@/utils/common/format_date';
import { formatAmount } from '@/components/atoms/Input/Input';
import { Card } from '@/components/atoms';

interface UpcomingCreditGrantApplicationsTableProps {
	data: CreditGrantApplication[];
	customerId?: string;
}

const getStatusChip = (status: APPLICATION_STATUS) => {
	switch (status) {
		case APPLICATION_STATUS.PENDING:
			return <Chip variant='success' label='Scheduled' />;
		case APPLICATION_STATUS.APPLIED:
			return <Chip variant='success' label='Applied' />;
		case APPLICATION_STATUS.FAILED:
			return <Chip variant='failed' label='Failed' />;
		case APPLICATION_STATUS.SKIPPED:
			return <Chip variant='default' label='Skipped' />;
		case APPLICATION_STATUS.CANCELLED:
			return <Chip variant='failed' label='Cancelled' />;
		default:
			return <Chip variant='default' label={status} />;
	}
};

const UpcomingCreditGrantApplicationsTable: React.FC<UpcomingCreditGrantApplicationsTableProps> = ({ data, customerId }) => {
	const columns: ColumnData<CreditGrantApplication>[] = [
		{
			title: 'Credits',
			render: (row) => {
				return <span>{formatAmount(row.credits.toString())}</span>;
			},
		},
		{
			title: 'Scheduled For',
			render: (row) => {
				return (
					<Tooltip content={formatDateTimeWithSecondsAndTimezone(row.scheduled_for)} delayDuration={0} sideOffset={5}>
						<span>{formatDateShort(row.scheduled_for)}</span>
					</Tooltip>
				);
			},
		},

		...(customerId
			? [
					{
						title: 'Subscription',
						width: '100px',
						render: (row) => {
							if (row.subscription_id) {
								const redirectUrl = `/billing/customers/${customerId}/subscription/${row.subscription_id}`;
								return (
									<RedirectCell redirectUrl={redirectUrl} allowRedirect={!!row.subscription_id}>
										{row.subscription_id}
									</RedirectCell>
								);
							}
							return <span>--</span>;
						},
					} as ColumnData<CreditGrantApplication>,
				]
			: []),
		{
			title: 'Status',
			render: (row) => {
				return getStatusChip(row.application_status);
			},
		},
	];

	if (!data || data.length === 0) {
		return null;
	}

	return (
		<Card className='card mt-8'>
			<FormHeader title='Upcoming Credits' variant='sub-header' titleClassName='font-semibold' />
			<div className='mt-4'>
				<FlexpriceTable data={data} columns={columns} showEmptyRow={false} />
			</div>
		</Card>
	);
};

export default UpcomingCreditGrantApplicationsTable;
