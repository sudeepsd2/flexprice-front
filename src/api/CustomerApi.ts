import { AxiosClient } from '@/core/axios/verbs';
import { Customer, Pagination, Subscription } from '@/models';
import {
	GetCustomerResponse,
	GetCustomerByFiltersPayload,
	GetCustomerSubscriptionsResponse,
	GetCustomerEntitlementPayload,
	GetUsageSummaryResponse,
	GetCustomerEntitlementsResponse,
	CreateCustomerRequest,
	UpdateCustomerRequest,
	ListCreditGrantApplicationsResponse,
} from '@/types/dto';
import { generateQueryParams } from '@/utils/common/api_helper';

class CustomerApi {
	private static baseUrl = '/customers';

	public static async getCustomerById(id: string): Promise<Customer> {
		return await AxiosClient.get(`${this.baseUrl}/${id}`);
	}
	public static async getAllCustomers({ limit = 10, offset = 0 }: Pagination): Promise<GetCustomerResponse> {
		const url = generateQueryParams(this.baseUrl, { limit, offset });
		return await AxiosClient.get(url);
	}

	public static async getCustomersByFilters(payload: GetCustomerByFiltersPayload): Promise<GetCustomerResponse> {
		return await AxiosClient.post(`${this.baseUrl}/search`, payload);
	}

	public static async deleteCustomerById(id: string): Promise<void> {
		return await AxiosClient.delete(`${this.baseUrl}/${id}`);
	}

	public static async getCustomerSubscriptions(id: string): Promise<GetCustomerSubscriptionsResponse> {
		return await AxiosClient.get(`/subscriptions?customer_id=${id}`);
	}

	public static async getCustomerSubscriptionById(id: string): Promise<Subscription> {
		return await AxiosClient.get(`/subscriptions/${id}`);
	}

	public static async createCustomer(customer: CreateCustomerRequest): Promise<Customer> {
		return await AxiosClient.post(`${this.baseUrl}`, customer);
	}

	public static async updateCustomer(customer: UpdateCustomerRequest, id: string): Promise<Customer> {
		return await AxiosClient.put(`${this.baseUrl}/${id}`, customer);
	}

	public static async getEntitlements(payload: GetCustomerEntitlementPayload): Promise<GetCustomerEntitlementsResponse> {
		return await AxiosClient.get(`${this.baseUrl}/${payload.customer_id}/entitlements`);
	}

	public static async getUsageSummary(payload: GetCustomerEntitlementPayload): Promise<GetUsageSummaryResponse> {
		return await AxiosClient.get(`${this.baseUrl}/${payload.customer_id}/usage`);
	}

	/**
	 * Get upcoming credit grant applications for a customer
	 */
	public static async getUpcomingCreditGrantApplications(customerId: string): Promise<ListCreditGrantApplicationsResponse> {
		return await AxiosClient.get<ListCreditGrantApplicationsResponse>(`${this.baseUrl}/${customerId}/grants/upcoming`);
	}
}

export default CustomerApi;
