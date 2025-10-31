import { AxiosClient } from '@/core/axios/verbs';
import {
	GetAllPricesResponse,
	CreatePriceRequest,
	UpdatePriceRequest,
	PriceFilter,
	CreateBulkPriceRequest,
	CreateBulkPriceResponse,
	PriceResponse,
	DeletePriceRequest,
} from '@/types/dto';
import { generateQueryParams } from '@/utils/common/api_helper';

export class PriceApi {
	private static baseUrl = '/prices';

	/**
	 * List prices with optional filters
	 * @param filters - Optional price filters
	 * @returns Promise<GetAllPricesResponse>
	 */
	public static async ListPrices(filters?: PriceFilter) {
		const url = filters ? generateQueryParams(this.baseUrl, filters) : this.baseUrl;
		return await AxiosClient.get<GetAllPricesResponse>(url);
	}

	/**
	 * Get a price by ID with expanded meter and price unit information
	 * @param id - Price ID
	 * @returns Promise<PriceResponse>
	 */
	public static async GetPriceById(id: string) {
		return await AxiosClient.get<PriceResponse>(`${this.baseUrl}/${id}`);
	}

	/**
	 * Create a new price with the specified configuration
	 * Supports both regular and price unit configurations
	 * @param data - Price configuration
	 * @returns Promise<PriceResponse>
	 */
	public static async CreatePrice(data: CreatePriceRequest) {
		return await AxiosClient.post<PriceResponse>(this.baseUrl, data);
	}

	/**
	 * Create multiple prices in bulk with the specified configurations
	 * Supports both regular and price unit configurations
	 * @param data - Bulk price configuration
	 * @returns Promise<CreateBulkPriceResponse>
	 */
	public static async CreateBulkPrice(data: CreateBulkPriceRequest) {
		return await AxiosClient.post<CreateBulkPriceResponse>(`${this.baseUrl}/bulk`, data);
	}

	/**
	 * Update a price with the specified configuration
	 * Critical fields (amount, billing_model, tier_mode, tiers, transform_quantity)
	 * will create a new price version if effective_from is provided
	 * @param id - Price ID
	 * @param data - Price configuration updates
	 * @returns Promise<PriceResponse>
	 */
	public static async UpdatePrice(id: string, data: UpdatePriceRequest) {
		return await AxiosClient.put<PriceResponse>(`${this.baseUrl}/${id}`, data);
	}

	/**
	 * Delete a price
	 * @param id - Price ID
	 * @param data - Optional delete configuration with end_date
	 * @returns Promise<void>
	 */
	public static async DeletePrice(id: string, data?: DeletePriceRequest) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`, data || {});
	}
}
