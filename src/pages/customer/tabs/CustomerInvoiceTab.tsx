import { AddButton, CardHeader, Loader, NoDataCard } from '@/components/atoms';
import { ApiDocsContent, CustomerInvoiceTable } from '@/components/molecules';
import InvoiceApi from '@/api/InvoiceApi';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useOutletContext } from 'react-router';
import { Card } from '@/components/atoms';
import { Invoice as InvoiceModel } from '@/models/Invoice';
import { RouteNames } from '@/core/routes/Routes';

const CustomerInvoiceTab = () => {
	const { id: customerId } = useParams();
	const navigate = useNavigate();

	const { data, isLoading } = useQuery({
		queryKey: ['invoice', customerId],
		queryFn: async () => {
			return await InvoiceApi.getCustomerInvoices(customerId!);
		},

		enabled: !!customerId,
	});

	const { isArchived } = useOutletContext<{ isArchived: boolean }>();

	const handleShowDetails = (invoice: InvoiceModel) => {
		navigate(`${invoice.id}`);
	};

	if (isLoading) {
		return <Loader />;
	}

	if (data?.items?.length === 0) {
		return (
			<NoDataCard
				title='Invoices'
				subtitle='No invoices found'
				cta={
					!isArchived && (
						<AddButton
							label='Add Invoice'
							onClick={() => {
								navigate(`${RouteNames.customers}/${customerId}/invoices/create`);
							}}
						/>
					)
				}
			/>
		);
	}
	return (
		<div>
			<ApiDocsContent tags={['Invoices']} />
			<Card variant='notched'>
				<CardHeader
					title='Invoices'
					cta={
						!isArchived && (
							<AddButton
								label='Add Invoice'
								onClick={() => {
									navigate(`${RouteNames.customers}/${customerId}/invoices/create`);
								}}
							/>
						)
					}
				/>
				<CustomerInvoiceTable onRowClick={handleShowDetails} customerId={customerId} data={data?.items ?? []} />
			</Card>
		</div>
	);
};

export default CustomerInvoiceTab;
