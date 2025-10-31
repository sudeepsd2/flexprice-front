import { Group, GROUP_ENTITY_TYPE, Pagination, Metadata } from '@/models';
import { QueryFilter } from './base';

export interface CreateGroupRequest {
	name: string;
	lookup_key: string;
	entity_type: GROUP_ENTITY_TYPE;
	metadata?: Metadata;
}

export interface UpdateGroupRequest {
	name?: string;
	entity_ids?: string[];
	metadata?: Metadata;
}

export interface GroupResponse extends Omit<Group, 'entity_ids'> {
	entity_ids: string[];
}

export interface ListGroupsResponse {
	items: GroupResponse[];
	pagination: Pagination;
}

export interface GroupFilter extends QueryFilter {
	entity_type?: GROUP_ENTITY_TYPE;
	name?: string;
	lookup_key?: string;
}

export interface AddEntityToGroupRequest {
	entity_ids: string[];
}
