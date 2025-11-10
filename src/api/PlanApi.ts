import { AxiosClient } from '@/core/axios/verbs';
import { Pagination } from '@/models';
import { generateQueryParams } from '@/utils/common/api_helper';
import {
	CreatePlanRequest,
	UpdatePlanRequest,
	PlanResponse,
	CreatePlanResponse,
	ListPlansResponse,
	GetPlanCreditGrantsResponse,
	SynchronizePlanPricesWithSubscriptionResponse,
	ExpandedPlan,
} from '@/types/dto';
import { TypedBackendFilter, TypedBackendSort } from '@/types/formatters/QueryBuilder';

export interface GetAllPlansResponse {
	items: PlanResponse[] | ExpandedPlan[];
	pagination: Pagination;
}

export interface GetPlansByFilterPayload extends Pagination {
	filters: TypedBackendFilter[];
	sort: TypedBackendSort[];
}

export class PlanApi {
	private static baseUrl = '/plans';

	public static async createPlan(data: CreatePlanRequest) {
		return await AxiosClient.post<CreatePlanResponse, CreatePlanRequest>(this.baseUrl, data);
	}

	public static async getAllPlans({ limit, offset }: Pagination) {
		const payload = {
			limit,
			offset,
			expand: 'entitlements,prices,meters,features,credit_grants',
		};
		const url = generateQueryParams(this.baseUrl, payload);
		return await AxiosClient.get<GetAllPlansResponse>(url);
	}

	public static async getAllActivePlans({ limit, offset }: Pagination) {
		const payload = {
			status: 'published',
			limit,
			offset,
			expand: 'entitlements,prices,meters,features,credit_grants',
		};
		const url = generateQueryParams(this.baseUrl, payload);
		return await AxiosClient.get<GetAllPlansResponse>(url);
	}

	public static async getPlansByFilter(payload: GetPlansByFilterPayload) {
		return await AxiosClient.post<GetAllPlansResponse>(`${this.baseUrl}/search`, payload);
	}

	public static async searchPlans(query: string, { limit, offset }: Pagination) {
		const payload = {
			limit,
			offset,
			query,
			expand: 'entitlements,prices,meters,features,credit_grants',
		};
		return await AxiosClient.post<GetAllPlansResponse>(`${this.baseUrl}/search`, payload);
	}

	public static async getExpandedPlan() {
		const payload = {
			expand: 'prices,meters,entitlements,credit_grants',
		};
		const url = generateQueryParams(this.baseUrl, payload);
		const response = await AxiosClient.get<GetAllPlansResponse>(url);
		return response.items as ExpandedPlan[];
	}

	public static async getActiveExpandedPlan(query?: Pagination) {
		const payload = {
			expand: 'prices,meters,credit_grants',
			status: 'published',
			limit: query?.limit,
			offset: query?.offset,
		};
		const url = generateQueryParams(this.baseUrl, payload);
		const response = await AxiosClient.get<GetAllPlansResponse>(url);
		return response.items as ExpandedPlan[];
	}

	public static async getPlanById(id: string) {
		const payload = {
			expand: 'meters,entitlements,prices,features,credit_grants',
		};
		const url = generateQueryParams(`${this.baseUrl}/${id}`, payload);
		return await AxiosClient.get<PlanResponse>(url);
	}

	public static async updatePlan(id: string, data: UpdatePlanRequest) {
		return await AxiosClient.put<PlanResponse, UpdatePlanRequest>(`${this.baseUrl}/${id}`, data);
	}

	public static async deletePlan(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}

	public static async synchronizePlanPricesWithSubscription(id: string) {
		return await AxiosClient.post<SynchronizePlanPricesWithSubscriptionResponse>(`${this.baseUrl}/${id}/sync/subscriptions`);
	}

	public static async getPlanCreditGrants(id: string) {
		return await AxiosClient.get<GetPlanCreditGrantsResponse>(`${this.baseUrl}/${id}/creditgrants`);
	}

	public static async listPlans({ limit, offset }: Pagination) {
		const payload = {
			limit,
			offset,
			expand: 'prices,entitlements,credit_grants',
		};
		const url = generateQueryParams(this.baseUrl, payload);
		return await AxiosClient.get<ListPlansResponse>(url);
	}

	public static async getPlanEntitlements(planId: string) {
		return await AxiosClient.get<{ items: any[]; total: number; page: number; limit: number }>(`${this.baseUrl}/${planId}/entitlements`);
	}
}
