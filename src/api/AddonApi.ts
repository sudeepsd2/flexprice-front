import { AxiosClient } from '@/core/axios/verbs';
import { Addon } from '@/models';
import { generateQueryParams } from '@/utils/common/api_helper';
import {
	CreateAddonRequest,
	UpdateAddonRequest,
	GetAddonsPayload,
	GetAddonsResponse,
	GetAddonByFilterPayload,
	AddAddonToSubscriptionRequest,
	AddonResponse,
} from '@/types/dto';

class AddonApi {
	private static baseUrl = '/addons';

	public static async ListAddon(payload: GetAddonsPayload = {}): Promise<GetAddonsResponse> {
		const url = generateQueryParams(this.baseUrl, {
			...payload,
			expand: 'prices,entitlements',
		});
		return await AxiosClient.get<GetAddonsResponse>(url);
	}

	public static async GetAddonById(id: string) {
		return await AxiosClient.get<AddonResponse>(`${this.baseUrl}/${id}`);
	}

	public static async GetAddonByLookupKey(lookupKey: string) {
		return await AxiosClient.get<AddonResponse>(`${this.baseUrl}/lookup/${lookupKey}`);
	}

	public static async CreateAddon(data: CreateAddonRequest) {
		return await AxiosClient.post<Addon, CreateAddonRequest>(this.baseUrl, data);
	}

	public static async UpdateAddon(id: string, data: UpdateAddonRequest) {
		return await AxiosClient.put<Addon, UpdateAddonRequest>(`${this.baseUrl}/${id}`, data);
	}

	public static async DeleteAddon(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}

	public static async GetAddonsByFilter(payload: GetAddonByFilterPayload) {
		return await AxiosClient.post<GetAddonsResponse, GetAddonByFilterPayload>(`${this.baseUrl}/search`, payload);
	}

	public static async AddAddonToSubscription(subscriptionId: string, data: AddAddonToSubscriptionRequest) {
		return await AxiosClient.post(`/subscriptions/${subscriptionId}/addons`, data);
	}

	public static async RemoveAddonFromSubscription(subscriptionId: string, addonId: string) {
		return await AxiosClient.delete<void>(`/subscriptions/${subscriptionId}/addons/${addonId}`);
	}

	public static async getAddonEntitlements(addonId: string) {
		return await AxiosClient.get<{ items: any[]; total: number; page: number; limit: number }>(`${this.baseUrl}/${addonId}/entitlements`);
	}
}

export default AddonApi;
