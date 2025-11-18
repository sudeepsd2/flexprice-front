import { AxiosClient } from '@/core/axios/verbs';
import { Connection, ENTITY_STATUS } from '@/models';
import { generateQueryParams } from '@/utils/common/api_helper';
import { GetConnectionsPayload, GetConnectionsResponse, CreateConnectionPayload, UpdateConnectionPayload } from '@/types/dto';

class ConnectionApi {
	private static baseUrl = '/connections';

	public static async List(payload: GetConnectionsPayload = {}): Promise<GetConnectionsResponse> {
		const url = generateQueryParams(this.baseUrl, payload);
		return await AxiosClient.get<GetConnectionsResponse>(url);
	}

	public static async Get(id: string): Promise<Connection> {
		return await AxiosClient.get<Connection>(`${this.baseUrl}/${id}`);
	}

	public static async ListPublished(): Promise<GetConnectionsResponse> {
		return this.List({ status: ENTITY_STATUS.PUBLISHED });
	}

	public static async Create(payload: CreateConnectionPayload): Promise<Connection> {
		return await AxiosClient.post<Connection>(this.baseUrl, payload);
	}

	public static async Update(id: string, payload: Partial<UpdateConnectionPayload>): Promise<Connection> {
		return await AxiosClient.put<Connection>(`${this.baseUrl}/${id}`, payload);
	}

	public static async Delete(id: string): Promise<void> {
		return await AxiosClient.delete(`${this.baseUrl}/${id}`);
	}
}

export default ConnectionApi;
