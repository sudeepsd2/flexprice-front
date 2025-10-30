import { AxiosClient } from '@/core/axios/verbs';
import { Pagination } from '@/models';
import { generateQueryParams } from '@/utils/common/api_helper';
import {
	CreateGroupRequest,
	UpdateGroupRequest,
	GroupResponse,
	ListGroupsResponse,
	GroupFilter,
	AddEntityToGroupRequest,
} from '@/types/dto';

export class GroupApi {
	private static baseUrl = '/groups';

	public static async createGroup(data: CreateGroupRequest) {
		return await AxiosClient.post<GroupResponse, CreateGroupRequest>(this.baseUrl, data);
	}

	public static async getAllGroups({ limit, offset }: Pagination) {
		const payload = {
			limit,
			offset,
		};
		const url = generateQueryParams(this.baseUrl, payload);
		return await AxiosClient.get<ListGroupsResponse>(url);
	}

	public static async getGroupById(id: string) {
		return await AxiosClient.get<GroupResponse>(`${this.baseUrl}/${id}`);
	}

	public static async updateGroup(id: string, data: UpdateGroupRequest) {
		return await AxiosClient.put<GroupResponse, UpdateGroupRequest>(`${this.baseUrl}/${id}`, data);
	}

	public static async deleteGroup(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}

	public static async searchGroups(query: string, { limit, offset }: Pagination) {
		const payload = {
			limit,
			offset,
			query,
		};
		return await AxiosClient.post<ListGroupsResponse>(`${this.baseUrl}/search`, payload);
	}

	public static async getGroupsByFilter(payload: GroupFilter) {
		return await AxiosClient.post<ListGroupsResponse>(`${this.baseUrl}/search`, payload);
	}

	public static async addEntityToGroup(id: string, data: AddEntityToGroupRequest) {
		return await AxiosClient.post<GroupResponse, AddEntityToGroupRequest>(`${this.baseUrl}/${id}/entities`, data);
	}
}
