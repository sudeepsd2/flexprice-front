import { FC, useState, useMemo } from 'react';
import { Chip } from '@/components/atoms';
import { FlexpriceTable, ColumnData } from '@/components/molecules';
import { FEATURE_TYPE } from '@/models';
import { Pencil, Info } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { EntitlementOverrideRequest } from '@/types/dto/Subscription';
import EditEntitlementDrawer from './EditEntitlementDrawer';

interface EntitlementOverridesTableProps {
	entitlements: any[];
	overrides: Record<string, EntitlementOverrideRequest>;
	onOverrideChange: (entitlementId: string, override: EntitlementOverrideRequest) => void;
	onOverrideReset?: (entitlementId: string) => void;
}

const EntitlementOverridesTable: FC<EntitlementOverridesTableProps> = ({ entitlements, overrides, onOverrideChange, onOverrideReset }) => {
	const [selectedEntitlement, setSelectedEntitlement] = useState<any | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

	// Merge entitlements with their overrides
	const enrichedEntitlements = useMemo(() => {
		return entitlements.map((ent) => {
			const override = overrides[ent.id];
			return {
				...ent,
				// Show override values if they exist, otherwise show original values
				// Use 'usage_limit' in override to check if it exists (including null for unlimited)
				displayUsageLimit: override && 'usage_limit' in override ? override.usage_limit : ent.usage_limit,
				displayStaticValue: override?.static_value ?? ent.static_value,
				displayIsEnabled: override?.is_enabled ?? ent.is_enabled,
				hasOverride: !!override,
			};
		});
	}, [entitlements, overrides]);

	const handleEdit = (entitlement: any) => {
		setDropdownOpen(null); // Close dropdown first
		setSelectedEntitlement(entitlement);
		setDrawerOpen(true);
	};

	const handleSaveOverride = (override: EntitlementOverrideRequest) => {
		onOverrideChange(override.entitlement_id, override);
		setDrawerOpen(false);
		setSelectedEntitlement(null);
	};

	const handleResetOverride = (entitlementId: string) => {
		if (onOverrideReset) {
			onOverrideReset(entitlementId);
		}
		setDrawerOpen(false);
		setSelectedEntitlement(null);
	};

	const handleCloseDrawer = (open: boolean) => {
		setDrawerOpen(open);
		if (!open) {
			setSelectedEntitlement(null);
		}
	};

	const getFeatureTypeChip = (featureType: string) => {
		const type = featureType?.toLowerCase();
		switch (type) {
			case 'metered':
				return <Chip label='Metered' variant='info' />;
			case 'boolean':
				return <Chip label='Boolean' variant='success' />;
			case 'static':
				return <Chip label='Static' variant='warning' />;
			default:
				return <Chip label={featureType} variant='info' />;
		}
	};

	const getEntitlementValue = (entitlement: any) => {
		const featureType = entitlement.feature_type;
		const hasOverride = entitlement.hasOverride;

		if (featureType === FEATURE_TYPE.METERED) {
			const limit = entitlement.displayUsageLimit;
			const originalLimit = entitlement.usage_limit;
			const resetPeriod = entitlement.usage_reset_period;
			const valueText =
				limit !== null && limit !== undefined
					? `${limit.toLocaleString()}${resetPeriod ? ` / ${resetPeriod.toLowerCase()}` : ''}`
					: 'Unlimited';

			// Check if there's an override and the value has changed (including null to number or vice versa)
			const hasChangedValue = hasOverride && limit !== originalLimit;

			return (
				<div className='flex items-center gap-2'>
					<span>{valueText}</span>
					{hasChangedValue && (
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger>
									<Info className='h-4 w-4 text-orange-600 hover:text-orange-600 transition-colors duration-150' />
								</TooltipTrigger>
								<TooltipContent
									sideOffset={5}
									className='bg-white border border-gray-200 shadow-lg text-sm text-gray-900 px-4 py-3 rounded-lg max-w-[300px]'>
									<div className='space-y-2'>
										<div className='font-medium text-gray-900'>Entitlement Override Applied</div>
										<div className='text-sm text-gray-600'>
											• Usage Limit: {originalLimit === null ? 'Unlimited' : originalLimit?.toLocaleString()} →{' '}
											{limit === null ? 'Unlimited' : limit?.toLocaleString()}
										</div>
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
			);
		} else if (featureType === FEATURE_TYPE.STATIC) {
			const value = entitlement.displayStaticValue || '--';
			const originalValue = entitlement.static_value || '--';

			return (
				<div className='flex items-center gap-2'>
					<span>{value}</span>
					{hasOverride && value !== originalValue && (
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger>
									<Info className='h-4 w-4 text-orange-600 hover:text-orange-600 transition-colors duration-150' />
								</TooltipTrigger>
								<TooltipContent
									sideOffset={5}
									className='bg-white border border-gray-200 shadow-lg text-sm text-gray-900 px-4 py-3 rounded-lg max-w-[300px]'>
									<div className='space-y-2'>
										<div className='font-medium text-gray-900'>Entitlement Override Applied</div>
										<div className='text-sm text-gray-600'>
											• Static Value: {originalValue} → {value}
										</div>
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
			);
		} else if (featureType === FEATURE_TYPE.BOOLEAN) {
			const value = entitlement.displayIsEnabled ? 'Enabled' : 'Disabled';
			const originalValue = entitlement.is_enabled ? 'Enabled' : 'Disabled';

			return (
				<div className='flex items-center gap-2'>
					<span>{value}</span>
					{hasOverride && value !== originalValue && (
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger>
									<Info className='h-4 w-4 text-orange-600 hover:text-orange-600 transition-colors duration-150' />
								</TooltipTrigger>
								<TooltipContent
									sideOffset={5}
									className='bg-white border border-gray-200 shadow-lg text-sm text-gray-900 px-4 py-3 rounded-lg max-w-[300px]'>
									<div className='space-y-2'>
										<div className='font-medium text-gray-900'>Entitlement Override Applied</div>
										<div className='text-sm text-gray-600'>
											• Status: {originalValue} → {value}
										</div>
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
			);
		}
		return '--';
	};

	const columns: ColumnData<any>[] = [
		{
			title: 'Feature Name',
			render: (row: any) => <span>{row.feature?.name || 'Unknown Feature'}</span>,
		},
		{
			title: 'Entity Type',
			render: (row: any) => <span className='capitalize'>{row.entity_type?.toLowerCase()}</span>,
		},
		{
			title: 'Feature Type',
			render: (row: any) => getFeatureTypeChip(row.feature_type),
		},
		{
			title: 'Value',
			render: (row: any) => getEntitlementValue(row),
		},
		{
			title: '',
			width: '30px',
			fieldVariant: 'interactive',
			hideOnEmpty: true,
			render: (row: any) => {
				// Only show edit button for plan entitlements, not addon entitlements
				if (row.entity_type?.toLowerCase() === 'addon') {
					return null;
				}

				return (
					<div
						data-interactive='true'
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}>
						<DropdownMenu open={dropdownOpen === row.id} onOpenChange={(open) => setDropdownOpen(open ? row.id : null)}>
							<DropdownMenuTrigger asChild>
								<button className='focus:outline-none'>
									<BsThreeDotsVertical className='text-base text-muted-foreground hover:text-foreground transition-colors' />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										handleEdit(row);
									}}
									className='flex gap-2 items-center cursor-pointer'>
									<Pencil className='h-4 w-4' />
									<span>Edit</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		},
	];

	if (entitlements.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500'>
				<p>No entitlements available</p>
			</div>
		);
	}

	return (
		<>
			<FlexpriceTable showEmptyRow columns={columns} data={enrichedEntitlements} variant='no-bordered' />
			<EditEntitlementDrawer
				isOpen={drawerOpen}
				onOpenChange={handleCloseDrawer}
				entitlement={selectedEntitlement}
				onSave={handleSaveOverride}
				onReset={handleResetOverride}
			/>
		</>
	);
};

export default EntitlementOverridesTable;
