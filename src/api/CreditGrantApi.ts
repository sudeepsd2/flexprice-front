import { AxiosClient } from '@/core/axios/verbs';
import { generateQueryParams } from '@/utils/common/api_helper';
import {
	CreateCreditGrantRequest,
	UpdateCreditGrantRequest,
	CreditGrantResponse,
	ListCreditGrantsResponse,
	GetCreditGrantsRequest,
} from '@/types/dto';

class CreditGrantApi {
	private static baseUrl = '/creditgrants';

	public static async Create(data: CreateCreditGrantRequest) {
		return AxiosClient.post<CreditGrantResponse, CreateCreditGrantRequest>(this.baseUrl, data);
	}

	public static async List(data: GetCreditGrantsRequest) {
		const url = generateQueryParams(this.baseUrl, data);
		return await AxiosClient.get<ListCreditGrantsResponse>(url);
	}

	public static async Update(id: string, data: UpdateCreditGrantRequest) {
		return await AxiosClient.put<CreditGrantResponse, UpdateCreditGrantRequest>(`${this.baseUrl}/${id}`, data);
	}

	public static async Delete(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}

	public static async Get(id: string) {
		return await AxiosClient.get<CreditGrantResponse>(`${this.baseUrl}/${id}`);
	}
}

export default CreditGrantApi;
