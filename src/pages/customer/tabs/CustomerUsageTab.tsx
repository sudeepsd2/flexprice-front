import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import { Card, CardHeader, Loader, FeatureMultiSelect, Input, Button, DateTimePicker, Select } from '@/components/atoms';
import CustomerApi from '@/api/CustomerApi';
import toast from 'react-hot-toast';
import EventsApi from '@/api/EventsApi';
import Feature from '@/models/Feature';
import { RefreshCw } from 'lucide-react';
import { GetUsageAnalyticsRequest } from '@/types/dto';
import { WindowSize } from '@/models';

const windowSizeOptions = [
	{ label: 'Minute', value: WindowSize.MINUTE },
	{ label: '15 Minute', value: WindowSize.FIFTEEN_MIN },
	{ label: '30 Minute', value: WindowSize.THIRTY_MIN },
	{ label: 'Hour', value: WindowSize.HOUR },
	{ label: '3 Hour', value: WindowSize.THREE_HOUR },
	{ label: '6 Hour', value: WindowSize.SIX_HOUR },
	{ label: '12 Hour', value: WindowSize.TWELVE_HOUR },
	{ label: 'Day', value: WindowSize.DAY },
	{ label: 'Week', value: WindowSize.WEEK },
];

const CustomerUsageTab = () => {
	const { id: customerId } = useParams();
	const { updateBreadcrumb } = useBreadcrumbsStore();

	// Filter states
	const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
	const [sources, setSources] = useState<string>('');
	const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
	const [endDate, setEndDate] = useState<Date>(new Date());
	const [windowSize, setWindowSize] = useState<WindowSize>(WindowSize.HOUR);

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

	// Prepare API parameters
	const apiParams: GetUsageAnalyticsRequest | null = useMemo(() => {
		if (!customer?.external_id) {
			return null;
		}

		const params: GetUsageAnalyticsRequest = {
			external_customer_id: customer.external_id,
		};

		if (selectedFeatures.length > 0) {
			params.feature_ids = selectedFeatures.map((f) => f.id);
		}

		if (sources.trim()) {
			params.sources = sources
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s);
		}

		if (startDate) {
			params.start_time = startDate.toISOString();
		}

		if (endDate) {
			params.end_time = endDate.toISOString();
		}

		if (windowSize) {
			params.window_size = windowSize;
		}

		return params;
	}, [customer?.external_id, selectedFeatures, sources, startDate, endDate, windowSize]);

	// Debounced API parameters with 400ms delay
	const [debouncedApiParams, setDebouncedApiParams] = useState<GetUsageAnalyticsRequest | null>(null);

	useEffect(() => {
		if (apiParams) {
			const timeoutId = setTimeout(() => {
				setDebouncedApiParams(apiParams);
			}, 400);

			return () => clearTimeout(timeoutId);
		} else {
			setDebouncedApiParams(null);
		}
	}, [apiParams]);

	const {
		data: usageData,
		isLoading: usageLoading,
		error: usageError,
	} = useQuery({
		queryKey: ['usage', customerId, debouncedApiParams],
		queryFn: async () => {
			if (!debouncedApiParams) {
				throw new Error('API parameters not available');
			}
			return await EventsApi.getUsageAnalyticsV2(debouncedApiParams);
		},
		enabled: !!debouncedApiParams,
	});

	useEffect(() => {
		updateBreadcrumb(4, 'Usage');
	}, [updateBreadcrumb]);

	const resetFilters = () => {
		setSelectedFeatures([]);
		setSources('');
		setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
		setEndDate(new Date());
		setWindowSize(WindowSize.HOUR);
	};

	if (customerLoading || usageLoading) {
		return <Loader />;
	}

	if (customerError || usageError) {
		toast.error('Error fetching usage data');
	}

	const handleStartDateChange = (date: Date | undefined) => {
		if (date) {
			setStartDate(date);
		}
	};

	const handleEndDateChange = (date: Date | undefined) => {
		if (date) {
			setEndDate(date);
		}
	};

	return (
		<div className='space-y-6'>
			{/* Filter Section */}
			<div>
				<div className=''>
					<div className='flex items-end justify-between gap-2'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
							<FeatureMultiSelect
								label='Features'
								placeholder='Select features to filter'
								values={selectedFeatures.map((f) => f.id)}
								onChange={setSelectedFeatures}
							/>
							<Input label='Sources' placeholder='Enter sources (comma-separated)' value={sources} onChange={setSources} />
							<DateTimePicker
								title='Start Date'
								date={startDate}
								setDate={handleStartDateChange}
								placeholder='Select start date and time'
							/>
							<DateTimePicker title='End Date' date={endDate} setDate={handleEndDateChange} placeholder='Select end date and time' />
							<Select
								label='Window Size'
								className='w-full'
								onChange={(value) => setWindowSize(value as WindowSize)}
								value={windowSize}
								options={windowSizeOptions.map((option) => ({ label: option.label, value: option.value }))}
							/>
						</div>
						<Button variant='outline' onClick={resetFilters} size='icon'>
							<RefreshCw className='size-9' />
						</Button>
					</div>
				</div>
			</div>

			{/* Usage Data Display */}
			<Card>
				<CardHeader title='Usage Analytics' />
				<div className='p-6'>
					<pre className='bg-gray-50 p-4 rounded-md overflow-auto text-sm'>{JSON.stringify(usageData, null, 2)}</pre>
				</div>
			</Card>
		</div>
	);
};

export default CustomerUsageTab;
