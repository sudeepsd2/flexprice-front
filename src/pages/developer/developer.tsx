import { Button, Page, ShortPagination, SectionHeader } from '@/components/atoms';
import { ColumnData, FlexpriceTable, SecretKeyDrawer, ApiDocsContent } from '@/components/molecules';
import SecretKeysApi from '@/api/SecretKeysApi';
import { UserApi } from '@/api/UserApi';
import { useQuery } from '@tanstack/react-query';
import { SecretKey } from '@/models/SecretKey';
import { User } from '@/models';
import usePagination from '@/hooks/usePagination';
import { formatDateShort } from '@/utils/common/helper_functions';
import { Plus, Loader, TrashIcon, User2, Bot, LucideIcon, Eye, ShieldCheck, EyeOff, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { EmptyPage } from '@/components/organisms';
import GUIDES from '@/constants/guides';
import ActionButton from '@/components/atoms/ActionButton/ActionButton';
import ServiceAccountDrawer from '@/components/molecules/ServiceAccountDrawer/ServiceAccountDrawer';

// Utility function to format permissions for display
export const formatPermissionDisplay = (permissions: readonly string[]): string => {
	if (!permissions || permissions.length === 0) {
		return 'none';
	}

	const hasRead = permissions.includes('read');
	const hasWrite = permissions.includes('write');

	if (hasRead && hasWrite) {
		return 'full access';
	} else if (hasRead) {
		return 'read';
	} else if (hasWrite) {
		return 'write';
	} else {
		return 'none';
	}
};

export const getPermissionIcon = (permissions: readonly string[]): LucideIcon => {
	if (!permissions || permissions.length === 0) {
		return EyeOff;
	}
	const hasRead = permissions.includes('read');
	const hasWrite = permissions.includes('write');

	if (hasRead && hasWrite) {
		return ShieldCheck; // Full access icon
	} else if (hasRead) {
		return Eye; // Read only icon
	} else if (hasWrite) {
		return PencilIcon; // Write only icon
	} else {
		return EyeOff; // No access icon
	}
};

// Utility function to get color based on permission level
export const getPermissionColor = (permissions: readonly string[]): string => {
	if (!permissions || permissions.length === 0) {
		return 'text-gray-500';
	}
	const hasRead = permissions.includes('read');
	const hasWrite = permissions.includes('write');

	if (hasRead && hasWrite) {
		return 'text-green-600'; // Full access color
	} else if (hasRead) {
		return 'text-blue-600'; // Read only color
	} else if (hasWrite) {
		return 'text-amber-600'; // Write only color
	} else {
		return 'text-gray-500'; // No access color
	}
};
const baseColumns: ColumnData<SecretKey>[] = [
	{
		title: 'Name',
		render(rowData: SecretKey) {
			return (
				<div className='flex gap-2 items-center font-medium'>
					<span>{rowData.name}</span>
				</div>
			);
		},
	},
	{
		title: 'Token',
		render(rowData: SecretKey) {
			const prefix = rowData.display_id.slice(0, 6);
			const suffix = rowData.display_id.slice(-4);
			const masked = `${prefix}••••${suffix}`;

			return (
				<div className='flex gap-2 items-center'>
					<code className='px-2 py-1 text-sm bg-gray-100 rounded font-mono'>{masked}</code>
				</div>
			);
		},
	},
	{
		title: 'Type',
		render(rowData: SecretKey) {
			const isServiceAccount = rowData.user_type === 'service_account';
			return (
				<div className='flex gap-2 items-center'>
					{isServiceAccount ? (
						<div className='flex items-center gap-1.5 text-purple-600'>
							<Bot size={16} />
							<span className='text-sm font-medium'>Service Account</span>
						</div>
					) : (
						<div className='flex items-center gap-1.5 text-blue-600'>
							<User2 size={16} />
							<span className='text-sm font-medium'>User Account</span>
						</div>
					)}
				</div>
			);
		},
	},
	{
		title: 'Roles',
		render(rowData: SecretKey) {
			if (!rowData.roles || rowData.roles.length === 0) {
				return <span className='text-gray-500 text-sm'>Full Access</span>;
			}

			return (
				<div className='flex flex-wrap gap-1'>
					{rowData.roles.map((role) => (
						<span key={role} className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
							{role}
						</span>
					))}
				</div>
			);
		},
	},
	{
		title: 'Created At',
		width: 150,
		align: 'right',
		render(rowData) {
			return <span className='text-gray-600'>{formatDateShort(rowData.created_at)}</span>;
		},
	},
];

const DeveloperPage = () => {
	const { page, limit, offset } = usePagination();
	const [isSecretKeyDrawerOpen, setIsSecretKeyDrawerOpen] = useState(false);
	const [isServiceAccountDrawerOpen, setIsServiceAccountDrawerOpen] = useState(false);

	const {
		data: secretKeys,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['secret-keys', page, limit, offset],
		queryFn: () => SecretKeysApi.getAllSecretKeys({ limit, offset }),
	});

	const {
		data: serviceAccountsResponse,
		isLoading: isLoadingServiceAccounts,
		isError: isServiceAccountsError,
	} = useQuery({
		queryKey: ['service-accounts', page, limit, offset],
		queryFn: async () => {
			const response = await UserApi.getServiceAccounts();
			// Manually paginate since the API returns all items
			const start = offset;
			const end = offset + limit;
			const paginatedItems = response.slice(start, end);
			return {
				items: paginatedItems,
				pagination: {
					total: response.length,
					limit,
					offset,
				},
			};
		},
	});

	const handleAddSecretKey = () => {
		setIsSecretKeyDrawerOpen(true);
	};

	const handleAddServiceAccount = () => {
		setIsServiceAccountDrawerOpen(true);
	};

	const columns: ColumnData<SecretKey>[] = [
		...baseColumns,
		{
			width: '30px',
			align: 'right',
			hideOnEmpty: true,
			render(rowData: SecretKey) {
				return (
					<div className='flex justify-end'>
						<ActionButton
							id={rowData.id}
							deleteMutationFn={async (id: string) => {
								await SecretKeysApi.deleteSecretKey(id);
							}}
							refetchQueryKey={'secret-keys'}
							entityName={'API key'}
							archiveText={'Delete'}
							isEditDisabled
							archiveIcon={<TrashIcon />}
						/>
					</div>
				);
			},
		},
	];

	// Service accounts table columns
	const serviceAccountColumns: ColumnData<User>[] = [
		{
			title: 'ID',
			render(rowData: User) {
				// Display the user ID in a masked format similar to API keys
				const displayId = rowData.id;
				const prefix = displayId.slice(0, 8);
				const suffix = displayId.slice(-4);
				const masked = `${prefix}••••${suffix}`;

				return (
					<div className='flex gap-2 items-center'>
						<code className='px-2 py-1 text-sm bg-gray-100 rounded font-mono'>{masked}</code>
					</div>
				);
			},
		},
		{
			title: 'Type',
			render() {
				return (
					<div className='flex gap-2 items-center'>
						<div className='flex items-center gap-1.5 text-purple-600'>
							<Bot size={16} />
							<span className='text-sm font-medium'>Service Account</span>
						</div>
					</div>
				);
			},
		},
		{
			title: 'Roles',
			render(rowData: User) {
				if (!rowData.roles || rowData.roles.length === 0) {
					return <span className='text-gray-500 text-sm'>No Roles</span>;
				}

				return (
					<div className='flex flex-wrap gap-1'>
						{rowData.roles.map((role) => (
							<span key={role} className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
								{role}
							</span>
						))}
					</div>
				);
			},
		},
		{
			title: 'Created At',
			width: 150,
			align: 'right',
			render(rowData) {
				return <span className='text-gray-600'>{formatDateShort(rowData.tenant?.created_at || rowData.tenant?.updated_at || '')}</span>;
			},
		},
		{
			width: '30px',
			align: 'right',
			hideOnEmpty: true,
			render(rowData: User) {
				return (
					<div className='flex justify-end'>
						<ActionButton
							id={rowData.id}
							deleteMutationFn={async (id: string) => {
								await UserApi.deleteUser(id);
							}}
							refetchQueryKey={'service-accounts'}
							entityName={'Service Account'}
							archiveText={'Delete'}
							isEditDisabled
							archiveIcon={<TrashIcon />}
						/>
					</div>
				);
			},
		},
	];

	if (isLoading || isLoadingServiceAccounts) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching secret keys');
	}

	if (isServiceAccountsError) {
		toast.error('Error fetching service accounts');
	}

	return (
		<div>
			<ApiDocsContent tags={['secrets']} />
			<SecretKeyDrawer isOpen={isSecretKeyDrawerOpen} onOpenChange={setIsSecretKeyDrawerOpen} />
			<ServiceAccountDrawer isOpen={isServiceAccountDrawerOpen} onOpenChange={setIsServiceAccountDrawerOpen} />

			{/* API Keys Section */}
			{secretKeys?.items.length === 0 && (
				<EmptyPage
					heading='API Keys'
					onAddClick={handleAddSecretKey}
					emptyStateCard={{
						heading: 'Generate a secret key',
						description: 'Generate a secret key to authenticate API requests and secure access.',
						buttonLabel: 'Create Secret Key',
						buttonAction: handleAddSecretKey,
					}}
					tutorials={GUIDES.secrets.tutorials}
					tags={['secrets']}
				/>
			)}
			{(secretKeys?.items.length || 0) > 0 && (
				<Page>
					<SectionHeader title='API Keys' titleClassName='text-3xl font-medium'>
						<Button prefixIcon={<Plus />} onClick={handleAddSecretKey}>
							Add
						</Button>
					</SectionHeader>
					<div className='pb-12 mt-2'>
						<FlexpriceTable showEmptyRow columns={columns} data={secretKeys?.items || []} />
						<ShortPagination unit='Secret Keys' totalItems={secretKeys?.pagination.total || 0} />
					</div>

					<SectionHeader title='Service Accounts' titleClassName='text-3xl font-medium' className='mt-8'>
						<Button prefixIcon={<Plus />} onClick={handleAddServiceAccount}>
							Add
						</Button>
					</SectionHeader>
					<div className='pb-12 mt-2'>
						<FlexpriceTable showEmptyRow columns={serviceAccountColumns} data={serviceAccountsResponse?.items || []} />
						<ShortPagination unit='Service Accounts' totalItems={serviceAccountsResponse?.pagination?.total || 0} />
					</div>
				</Page>
			)}
		</div>
	);
};

export default DeveloperPage;
