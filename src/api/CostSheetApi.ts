import { AxiosClient } from '@/core/axios/verbs';
import { CostSheet } from '@/models';
import { generateQueryParams } from '@/utils/common/api_helper';
import {
	CreateCostSheetRequest,
	UpdateCostSheetRequest,
	GetCostSheetsPayload,
	GetCostSheetsResponse,
	GetCostSheetsByFilterPayload,
	CostSheetResponse,
} from '@/types/dto';

class CostSheetApi {
	private static baseUrl = '/costsheets';

	public static async ListCostSheets(payload: GetCostSheetsPayload = {}): Promise<GetCostSheetsResponse> {
		const url = generateQueryParams(this.baseUrl, {
			...payload,
			expand: 'prices',
		});
		return await AxiosClient.get<GetCostSheetsResponse>(url);
	}

	public static async GetCostSheetById(id: string) {
		return await AxiosClient.get<CostSheetResponse>(`${this.baseUrl}/${id}`);
	}

	public static async GetCostSheetByLookupKey(lookupKey: string) {
		return await AxiosClient.get<CostSheetResponse>(`${this.baseUrl}/lookup/${lookupKey}`);
	}

	public static async CreateCostSheet(data: CreateCostSheetRequest) {
		return await AxiosClient.post<CostSheet, CreateCostSheetRequest>(this.baseUrl, data);
	}

	public static async UpdateCostSheet(id: string, data: UpdateCostSheetRequest) {
		return await AxiosClient.put<CostSheet, UpdateCostSheetRequest>(`${this.baseUrl}/${id}`, data);
	}

	public static async DeleteCostSheet(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}

	public static async GetCostSheetsByFilter(payload: GetCostSheetsByFilterPayload) {
		return await AxiosClient.post<GetCostSheetsResponse, GetCostSheetsByFilterPayload>(`${this.baseUrl}/search`, payload);
	}
}

export default CostSheetApi;
