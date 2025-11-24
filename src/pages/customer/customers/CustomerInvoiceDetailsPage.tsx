import { useParams } from 'react-router';
import CustomerInvoiceDetail from '../customers/invoice/CustomerInvoiceDetail';
import { useQuery } from '@tanstack/react-query';
import PaymentApi from '@/api/PaymentApi';
import CreditNoteApi from '@/api/CreditNoteApi';
import { ApiDocsContent, CustomTabs } from '@/components/molecules';
import { Loader, NoDataCard, ShortPagination } from '@/components/atoms';
import { InvoicePaymentsTable, CreditNoteTable } from '@/components/molecules';
import usePagination from '@/hooks/usePagination';

const CustomerInvoiceDetailsPage = () => {
	const { invoice_id } = useParams();
	const { limit, offset } = usePagination();

	const { data: payments, isLoading: paymentsLoading } = useQuery({
		queryKey: ['payments', invoice_id],
		queryFn: () =>
			PaymentApi.getAllPayments({
				limit,
				offset,
				destination_id: invoice_id!,
				destination_type: 'INVOICE',
			}),
	});

	const { data: creditNotes, isLoading: creditNotesLoading } = useQuery({
		queryKey: ['creditNotes', invoice_id],
		queryFn: () =>
			CreditNoteApi.getCreditNotes({
				limit,
				offset,
				invoice_id: invoice_id!,
				expand: 'invoice,customer',
			}),
	});

	const tabs = [
		{
			value: 'Overview',
			label: 'Overview',
			content: <CustomerInvoiceDetail breadcrumb_index={4} invoice_id={invoice_id!} />,
		},
		{
			value: 'payments',
			label: 'Payments',
			content: paymentsLoading ? (
				<Loader />
			) : (
				<div>
					<InvoicePaymentsTable data={payments?.items ?? []} />
					<ShortPagination unit='Payments' totalItems={payments?.pagination.total ?? 0} />
				</div>
			),
		},
		{
			value: 'creditNotes',
			label: 'Credit Notes',
			content: creditNotesLoading ? (
				<Loader />
			) : (
				<div>
					{creditNotes?.items?.length === 0 ? (
						<div className='my-6'>
							<NoDataCard title='Credit Notes' subtitle='No credit notes found' />
						</div>
					) : (
						<>
							<CreditNoteTable data={creditNotes?.items ?? []} />
							<ShortPagination unit='Credit Notes' totalItems={creditNotes?.pagination.total ?? 0} />
						</>
					)}
				</div>
			),
		},
	];

	return (
		<div className='mt-5 '>
			<ApiDocsContent tags={['Invoice']} />
			<div className=''>
				<CustomTabs tabs={tabs} defaultValue='Overview' />
			</div>
		</div>
	);
};

export default CustomerInvoiceDetailsPage;
