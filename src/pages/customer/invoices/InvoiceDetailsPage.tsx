import { useParams } from 'react-router';
import CustomerInvoiceDetail from '../customers/invoice/CustomerInvoiceDetail';
import { useQuery } from '@tanstack/react-query';
import usePagination from '@/hooks/usePagination';
import PaymentApi from '@/api/PaymentApi';
import CreditNoteApi from '@/api/CreditNoteApi';
import { CustomTabs } from '@/components/molecules';
import { Loader, NoDataCard, Page, ShortPagination } from '@/components/atoms';
import { ApiDocsContent, InvoicePaymentsTable, CreditNoteTable } from '@/components/molecules';

const InvoiceDetailsPage = () => {
	const { invoiceId } = useParams();
	const { limit, offset } = usePagination();

	const { data: payments, isLoading: paymentsLoading } = useQuery({
		queryKey: ['payments', invoiceId],
		queryFn: () =>
			PaymentApi.getAllPayments({
				limit,
				offset,
				destination_id: invoiceId!,
				destination_type: 'INVOICE',
			}),
	});

	const { data: creditNotes, isLoading: creditNotesLoading } = useQuery({
		queryKey: ['creditNotes', invoiceId],
		queryFn: () =>
			CreditNoteApi.getCreditNotes({
				limit,
				offset,
				invoice_id: invoiceId!,
				expand: 'invoice,customer',
			}),
	});

	const tabs = [
		{
			value: 'Overview',
			label: 'Overview',
			content: <CustomerInvoiceDetail breadcrumb_index={2} invoice_id={invoiceId!} />,
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
		<Page>
			<ApiDocsContent tags={['Invoices']} />
			<CustomTabs tabs={tabs} defaultValue='Overview' />
		</Page>
	);
};

export default InvoiceDetailsPage;
