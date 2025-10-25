import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import { FormHeader } from '@/components/atoms';
import CustomerApi from '@/api/CustomerApi';

const CustomerUsageTab = () => {
	const { id: customerId } = useParams();
	const { updateBreadcrumb } = useBreadcrumbsStore();

	// Fetch customer details to get external_id
	const {
		data: customer,
		isLoading: customerLoading,
		error: customerError,
	} = useQuery({
		queryKey: ['customer', customerId],
		queryFn: async () => {
			if (!customerId) throw new Error('Customer ID is required');
			return await CustomerApi.getCustomerById(customerId);
		},
		enabled: !!customerId,
	});

	// Update breadcrumb when component mounts
	useEffect(() => {
		updateBreadcrumb(4, 'Usage');
	}, [updateBreadcrumb]);

	// Show loading state while fetching customer
	if (customerLoading) {
		return (
			<div className='space-y-6'>
				<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
					<FormHeader title='Customer Usage Analytics' subtitle='Loading customer details...' variant='default' />
				</div>
				<div className='flex items-center justify-center h-[300px]'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
						<div className='text-sm text-gray-500'>Loading customer details...</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state if customer fetch failed
	if (customerError) {
		return (
			<div className='space-y-6'>
				<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
					<FormHeader title='Customer Usage Analytics' subtitle='Error loading customer details' variant='default' />
				</div>
				<div className='flex items-center justify-center h-[300px]'>
					<div className='text-center'>
						<div className='text-red-600 mb-4'>{customerError.message}</div>
						<div className='text-sm text-gray-500'>Unable to load customer details</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<FormHeader title='Customer Usage' subtitle={`Usage data for ${customer!.external_id}`} variant='default' />

			<div className='text-center py-8'>
				<h3 className='text-lg font-medium text-gray-900 mb-2'>Usage Analytics Coming Soon</h3>
				<p className='text-sm text-gray-500'>We're working on bringing you detailed usage analytics and charts.</p>
			</div>
		</div>
	);
};

export default CustomerUsageTab;
