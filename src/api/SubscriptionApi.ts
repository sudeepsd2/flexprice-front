import { AxiosClient } from '@/core/axios/verbs';
import { SubscriptionUsage } from '@/models';
import {
	ListSubscriptionsPayload,
	ListSubscriptionsResponse,
	GetSubscriptionDetailsPayload,
	GetSubscriptionPreviewResponse,
	PauseSubscriptionPayload,
	ResumeSubscriptionPayload,
	SubscriptionPauseResponse,
	SubscriptionResumeResponse,
	CancelSubscriptionPayload,
	CreateSubscriptionRequest,
	CancelSubscriptionRequest,
	CancelSubscriptionResponse,
	SubscriptionResponse,
	GetUsageBySubscriptionRequest,
	GetUsageBySubscriptionResponse,
	AddAddonRequest,
	RemoveAddonRequest,
	AddonAssociationResponse,
	CreateSubscriptionLineItemRequest,
	UpdateSubscriptionLineItemRequest,
	DeleteSubscriptionLineItemRequest,
	SubscriptionLineItemResponse,
} from '@/types/dto/Subscription';
import { ListCreditGrantApplicationsResponse } from '@/types/dto';
import { generateQueryParams } from '@/utils/common/api_helper';

class SubscriptionApi {
	private static baseUrl = '/subscriptions';

	// =============================================================================
	// CORE SUBSCRIPTION METHODS
	// =============================================================================

	/**
	 * Get a subscription by ID
	 */
	public static async getSubscription(id: string): Promise<SubscriptionResponse> {
		return await AxiosClient.get<SubscriptionResponse>(`${this.baseUrl}/${id}`);
	}

	/**
	 * Create a new subscription
	 */
	public static async createSubscription(payload: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
		return await AxiosClient.post(this.baseUrl, payload);
	}

	/**
	 * List subscriptions
	 */
	public static async listSubscriptions(payload: ListSubscriptionsPayload) {
		const url = generateQueryParams(this.baseUrl, payload);
		return await AxiosClient.get<ListSubscriptionsResponse>(url);
	}

	/**
	 * Search subscriptions
	 */
	public static async searchSubscriptions(payload: ListSubscriptionsPayload): Promise<ListSubscriptionsResponse> {
		return await AxiosClient.post(`${this.baseUrl}/search`, { ...payload });
	}

	/**
	 * Cancel subscription
	 */
	public static async cancelSubscription(
		id: string,
		payload: CancelSubscriptionPayload | CancelSubscriptionRequest,
	): Promise<void | CancelSubscriptionResponse> {
		return await AxiosClient.post(`${this.baseUrl}/${id}/cancel`, payload);
	}

	// =============================================================================
	// SUBSCRIPTION STATUS METHODS
	// =============================================================================

	/**
	 * Pause subscription
	 */
	public static async pauseSubscription(id: string, payload: PauseSubscriptionPayload): Promise<SubscriptionPauseResponse> {
		return await AxiosClient.post(`${this.baseUrl}/${id}/pause`, payload);
	}

	/**
	 * Resume subscription
	 */
	public static async resumeSubscription(id: string, payload: ResumeSubscriptionPayload): Promise<SubscriptionResumeResponse> {
		return await AxiosClient.post(`${this.baseUrl}/${id}/resume`, payload);
	}

	/**
	 * Activate draft subscription
	 */
	public static async activateSubscription(id: string, payload: { start_date: string }): Promise<SubscriptionResponse> {
		return await AxiosClient.post<SubscriptionResponse>(`${this.baseUrl}/${id}/activate`, payload);
	}

	// =============================================================================
	// USAGE & ANALYTICS METHODS
	// =============================================================================

	/**
	 * Get subscription usage (legacy)
	 */
	public static async getSubscriptionUsage(id: string): Promise<SubscriptionUsage> {
		return await AxiosClient.post(`${this.baseUrl}/usage`, { subscription_id: id });
	}

	/**
	 * Get usage by subscription
	 */
	public static async getUsageBySubscription(
		payload: GetUsageBySubscriptionRequest | { subscription_id: string },
	): Promise<GetUsageBySubscriptionResponse> {
		return await AxiosClient.post<GetUsageBySubscriptionResponse>(`${this.baseUrl}/usage`, payload);
	}

	/**
	 * Get subscription invoices preview
	 */
	public static async getSubscriptionInvoicesPreview(payload: GetSubscriptionDetailsPayload): Promise<GetSubscriptionPreviewResponse> {
		return await AxiosClient.post('/invoices/preview', payload, {
			timeout: 60000, // 1 minute
		});
	}

	// =============================================================================
	// ADDON MANAGEMENT METHODS
	// =============================================================================

	/**
	 * Add addon to subscription
	 */
	public static async addAddonToSubscription(payload: AddAddonRequest): Promise<AddonAssociationResponse> {
		return await AxiosClient.post<AddonAssociationResponse>(`${this.baseUrl}/addon`, payload);
	}

	/**
	 * Remove addon from subscription
	 */
	public static async removeAddonFromSubscription(payload: RemoveAddonRequest): Promise<{ message: string }> {
		return await AxiosClient.delete(`${this.baseUrl}/addon`, { data: payload });
	}

	// =============================================================================
	// SUBSCRIPTION LINE ITEM METHODS
	// =============================================================================

	/**
	 * Create a new subscription line item
	 */
	public static async createSubscriptionLineItem(payload: CreateSubscriptionLineItemRequest): Promise<SubscriptionLineItemResponse> {
		return await AxiosClient.post<SubscriptionLineItemResponse>(`${this.baseUrl}/lineitems`, payload);
	}

	/**
	 * Update a subscription line item
	 */
	public static async updateSubscriptionLineItem(
		id: string,
		payload: UpdateSubscriptionLineItemRequest,
	): Promise<SubscriptionLineItemResponse> {
		return await AxiosClient.put<SubscriptionLineItemResponse>(`${this.baseUrl}/lineitems/${id}`, payload);
	}

	/**
	 * Delete a subscription line item
	 */
	public static async deleteSubscriptionLineItem(id: string, payload: DeleteSubscriptionLineItemRequest): Promise<void> {
		return await AxiosClient.delete(`${this.baseUrl}/lineitems/${id}`, payload);
	}

	// =============================================================================
	// SUBSCRIPTION ENTITLEMENT METHODS
	// =============================================================================

	/**
	 * Get subscription entitlements
	 */
	public static async getSubscriptionEntitlements(subscriptionId: string) {
		return await AxiosClient.get<{ features: any[]; subscription_id: string; plan_id: string }>(
			`${this.baseUrl}/${subscriptionId}/entitlements`,
		);
	}

	// =============================================================================
	// CREDIT GRANT APPLICATION METHODS
	// =============================================================================

	/**
	 * Get upcoming credit grant applications for a subscription
	 */
	public static async getUpcomingCreditGrantApplications(subscriptionId: string): Promise<ListCreditGrantApplicationsResponse> {
		return await AxiosClient.get<ListCreditGrantApplicationsResponse>(`${this.baseUrl}/${subscriptionId}/grants/upcoming`);
	}
}

export default SubscriptionApi;
