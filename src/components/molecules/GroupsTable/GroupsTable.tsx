import { FC } from 'react';
import { ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import { Group } from '@/models/Group';
import { ENTITY_STATUS } from '@/models';
import formatDate from '@/utils/common/format_date';
import { GroupApi } from '@/api/GroupApi';

export interface GroupsTableProps {
	data: Group[];
	onEdit: (group: Group) => void;
}

const GroupsTable: FC<GroupsTableProps> = ({ data, onEdit }) => {
	const mappedData = data?.map((group) => ({
		...group,
	}));

	const columns: ColumnData<Group>[] = [
		{
			fieldName: 'name',
			title: 'Name',
		},
		{
			title: 'Lookup Key',
			fieldName: 'lookup_key',
		},
		{
			title: 'Entity Type',
			render: (row) => {
				const label = row.entity_type.charAt(0).toUpperCase() + row.entity_type.slice(1);
				return <Chip variant='default' label={label} />;
			},
		},
		{
			title: 'Updated at',
			render: (row) => {
				return formatDate(row.updated_at);
			},
		},
		{
			fieldVariant: 'interactive',
			render: (row) => (
				<ActionButton
					id={row.id}
					deleteMutationFn={(id) => GroupApi.deleteGroup(id)}
					refetchQueryKey='fetchGroups'
					entityName='Group'
					edit={{
						onClick: () => onEdit(row),
					}}
					archive={{
						enabled: row.status === ENTITY_STATUS.PUBLISHED,
					}}
				/>
			),
		},
	];

	return <FlexpriceTable columns={columns} data={mappedData} showEmptyRow />;
};

export default GroupsTable;
