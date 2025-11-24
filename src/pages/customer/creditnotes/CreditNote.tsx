import { AddButton, CardHeader, Loader, NoDataCard } from '@/components/atoms';
import { ApiDocsContent } from '@/components/molecules';
import { CreditNoteTable } from '@/components/molecules/CreditNoteTable';
import CreditNoteApi from '@/api/CreditNoteApi';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useOutletContext } from 'react-router';
import { Card } from '@/components/atoms';
import { RouteNames } from '@/core/routes/Routes';

const CreditNote = () => {
	const { id: customerId } = useParams();
	const navigate = useNavigate();

	const { data, isLoading } = useQuery({
		queryKey: ['customerCreditNotes', customerId],
		queryFn: async () => {
			// Fetch credit notes for the customer's invoices
			return await CreditNoteApi.getCreditNotes({
				expand: 'invoice,invoice.customer',
			});
		},
		enabled: !!customerId,
		select: (data) => {
			// Filter credit notes for this customer
			const filteredItems = data.items.filter((creditNote) => creditNote.invoice?.customer?.id === customerId);
			return {
				...data,
				items: filteredItems,
			};
		},
	});

	const { isArchived } = useOutletContext<{ isArchived: boolean }>();

	if (isLoading) {
		return <Loader />;
	}

	if (data?.items?.length === 0) {
		return (
			<NoDataCard
				title='Credit Notes'
				subtitle='No credit notes found'
				cta={
					!isArchived && (
						<AddButton
							label='Add Credit Note'
							onClick={() => {
								// Navigate to invoices tab to create credit note from invoice
								navigate(`${RouteNames.customers}/${customerId}/invoice`);
							}}
						/>
					)
				}
			/>
		);
	}

	return (
		<div>
			<ApiDocsContent tags={['Credit Notes']} />
			<Card variant='notched'>
				<CardHeader
					title='Credit Notes'
					cta={
						!isArchived && (
							<AddButton
								onClick={() => {
									// Navigate to invoices tab to create credit note from invoice
									navigate(`${RouteNames.customers}/${customerId}/invoice`);
								}}
							/>
						)
					}
				/>
				<CreditNoteTable data={data?.items ?? []} />
			</Card>
		</div>
	);
};

export default CreditNote;
