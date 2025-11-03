import {
	INVOICE_CADENCE,
	BILLING_CADENCE,
	LineItem as InvoiceLineItem,
	BILLING_CYCLE,
	SUBSCRIPTION_STATUS,
	SubscriptionPhase,
	SUBSCRIPTION_PRORATION_BEHAVIOR,
	SUBSCRIPTION_CANCELLATION_TYPE,
	PAYMENT_BEHAVIOR,
	COLLECTION_METHOD,
	SUBSCRIPTION_LINE_ITEM_ENTITY_TYPE,
	CreditGrant,
	Metadata,
	Subscription,
	Pagination,
	BILLING_MODEL,
	TIER_MODE,
	CreatePriceTier,
	TransformQuantity,
} from '@/models';
import { BILLING_PERIOD } from '@/constants/constants';
import { QueryFilter, TimeRangeFilter } from './base';
import { AddAddonToSubscriptionRequest } from './Addon';
import { Invoice } from '@/models/Invoice';
import { Coupon } from '@/models/Coupon';

// Re-export existing enums for convenience
export { BILLING_PERIOD } from '@/constants/constants';

// SubscriptionFilter interface for listing subscriptions
export interface ListSubscriptionsPayload extends QueryFilter, TimeRangeFilter {
	subscription_ids?: string[];
	customer_id?: string;
	plan_id?: string;
	subscription_status?: SUBSCRIPTION_STATUS[];
	billing_cadence?: BILLING_CADENCE[];
	billing_period?: BILLING_PERIOD[];
	subscription_status_not_in?: SUBSCRIPTION_STATUS[];
	active_at?: string;
	with_line_items?: boolean;
	expand?: string;
	sort?: TypedBackendSort[];
	filters?: TypedBackendFilter[];
}

import { TaxRateOverride } from './tax';
import { TypedBackendFilter, TypedBackendSort } from '../formatters/QueryBuilder';

export interface GetSubscriptionDetailsPayload {
	subscription_id: string;
	period_end?: string;
	period_start?: string;
}

export interface GetSubscriptionPreviewResponse {
	amount_due: number;
	amount_paid: number;
	amount_remaining: number;
	billing_reason: string;
	billing_sequence: number;
	created_at: string;
	created_by: string;
	currency: string;
	customer_id: string;
	description: string;
	due_date: string;
	finalized_at: string;
	id: string;
	idempotency_key: string;
	invoice_number: string;
	invoice_pdf_url: string;
	invoice_status: string;
	invoice_type: string;
	line_items: InvoiceLineItem[];
	metadata: Metadata;
	paid_at: string;
	payment_status: string;
	period_end: string;
	period_start: string;
	status: string;
	subscription_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
	subtotal: number;
	total: number;
	version: number;
	voided_at: string;
	total_discount: number;
	total_tax: number;
}

export interface PauseSubscriptionPayload {
	dry_run?: boolean;
	metadata?: Metadata;
	pause_days?: number;
	pause_end?: string;
	pause_mode?: 'immediate';
	pause_start?: string;
	reason?: string;
}

export interface ResumeSubscriptionPayload {
	dry_run?: boolean;
	metadata?: Metadata;
	resume_mode?: 'immediate';
}

export interface SubscriptionPauseResponse {
	created_at: string;
	created_by: string;
	environment_id: string;
	id: string;
	metadata: Metadata;
	original_period_end: string;
	original_period_start: string;
	pause_end: string;
	pause_mode: string;
	pause_start: string;
	pause_status: string;
	reason: string;
	resume_mode: string;
	resumed_at: string;
	status: 'published';
	subscription_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
}

// Since both responses have the same structure, we can reuse the interface
export type SubscriptionResumeResponse = SubscriptionPauseResponse;

export interface AddSubscriptionPhasePayload {
	billing_cycle: BILLING_CYCLE;
	start_date: string | Date;
	end_date?: string | Date;
	credit_grants?: CreditGrant[];
	commitment_amount?: number;
	overage_factor?: number;
}

export interface ListSubscriptionsResponse extends QueryFilter, TimeRangeFilter {
	items: Subscription[];
	pagination: Pagination;
	sort: TypedBackendSort[];
	filters: TypedBackendFilter[];
}

export interface CreateSubscriptionPayload {
	customer_id: string;
	billing_cadence: BILLING_CADENCE;
	billing_period: BILLING_PERIOD;
	billing_period_count: number;
	currency: string;
	invoice_cadence: INVOICE_CADENCE;
	plan_id: string;
	start_date: string;
	end_date: string | null;
	lookup_key: string;
	trial_end: string | null;
	trial_start: string | null;
	billing_cycle?: BILLING_CYCLE;
	phases?: SubscriptionPhase[];
	credit_grants?: CreditGrant[];
	commitment_amount?: number;
	overage_factor?: number;
	override_line_items?: SubscriptionLineItemOverrideRequest[];
	subscription_coupons?: string[];
	addons?: AddAddonToSubscriptionRequest[];
	coupons?: string[];
	line_item_coupons?: Record<string, string[]>;
	tax_rate_overrides?: TaxRateOverride[];
}

export interface SubscriptionLineItemOverrideRequest {
	price_id: string;
	quantity?: number;
	amount?: number;
	billing_model?: BILLING_MODEL;
	tier_mode?: TIER_MODE;
	tiers?: CreatePriceTier[];
	transform_quantity?: TransformQuantity;
	tax_rate_overrides?: TaxRateOverride[];
}

export interface CancelSubscriptionPayload {
	proration_behavior?: SUBSCRIPTION_PRORATION_BEHAVIOR;
	cancellation_type?: SUBSCRIPTION_CANCELLATION_TYPE;
	reason?: string;
}

// =============================================================================
// ENHANCED SUBSCRIPTION REQUEST/RESPONSE TYPES
// =============================================================================

export interface CreateSubscriptionRequest {
	// Customer identification
	customer_id?: string;
	external_customer_id?: string;

	// Plan and billing configuration
	plan_id: string;
	currency: string;
	lookup_key?: string;
	billing_cadence: BILLING_CADENCE;
	billing_period: BILLING_PERIOD;
	billing_period_count?: number;
	billing_cycle?: BILLING_CYCLE;

	// Dates
	start_date?: string;
	end_date?: string;
	trial_start?: string;
	trial_end?: string;

	// Payment behavior
	payment_behavior?: PAYMENT_BEHAVIOR;
	collection_method?: COLLECTION_METHOD;
	gateway_payment_method_id?: string;

	// Proration and workflow
	proration_behavior?: SUBSCRIPTION_PRORATION_BEHAVIOR;
	workflow?: string;

	// Customer timezone
	customer_timezone?: string;

	// Metadata and configuration
	metadata?: Metadata;

	// Credit grants
	credit_grants?: CreateCreditGrantRequest[];

	// Commitment and overage
	commitment_amount?: number;
	overage_factor?: number;

	// Subscription phases
	phases?: SubscriptionSchedulePhaseInput[];

	// Tax rate overrides
	tax_rate_overrides?: TaxRateOverride[];

	// Coupons
	coupons?: string[];
	line_item_coupons?: Record<string, string[]>;

	// Price overrides
	override_line_items?: OverrideLineItemRequest[];

	// Addons
	addons?: AddAddonToSubscriptionRequest[];
}

export interface CreateCreditGrantRequest {
	amount: number;
	currency: string;
	description?: string;
	expires_at?: string;
	scope: 'SUBSCRIPTION';
}

export interface SubscriptionSchedulePhaseInput {
	start_date: string;
	end_date?: string;
	billing_cycle?: BILLING_CYCLE;
	credit_grants?: CreateCreditGrantRequest[];
	commitment_amount?: number;
	overage_factor?: number;
	line_items?: SubscriptionPhaseLineItemInput[];
}

export interface SubscriptionPhaseLineItemInput {
	price_id: string;
	quantity?: number;
	override_amount?: number;
}

export interface OverrideLineItemRequest {
	price_id: string;
	quantity?: number;
	billing_model?: BILLING_MODEL;
	amount?: number;
	tier_mode?: TIER_MODE;
	tiers?: CreatePriceTier[];
	transform_quantity?: TransformQuantity;
}

export interface CancelSubscriptionRequest {
	proration_behavior?: SUBSCRIPTION_PRORATION_BEHAVIOR;
	cancellation_type: SUBSCRIPTION_CANCELLATION_TYPE;
	reason?: string;
	suppress_webhook?: boolean;
}

export interface CancelSubscriptionResponse {
	subscription_id: string;
	cancellation_type: SUBSCRIPTION_CANCELLATION_TYPE;
	effective_date: string;
	status: SUBSCRIPTION_STATUS;
	reason?: string;
	proration_invoice?: Invoice;
	proration_details: ProrationDetail[];
	total_credit_amount: number;
	message: string;
	processed_at: string;
}

export interface ProrationDetail {
	line_item_id: string;
	price_id: string;
	plan_name?: string;
	original_amount: number;
	credit_amount: number;
	charge_amount: number;
	proration_days: number;
	description?: string;
}

export interface SubscriptionResponse extends Subscription {
	coupon_associations?: Coupon[];
	latest_invoice?: Invoice;
}

export interface SubscriptionScheduleResponse {
	id: string;
	subscription_id: string;
	status: string;
	current_phase_index: number;
	end_behavior: string;
	start_date: string;
	phases: SubscriptionPhase[];
	metadata: Metadata;
}

export interface GetUsageBySubscriptionRequest {
	subscription_id: string;
	start_time: string;
	end_time: string;
	lifetime_usage?: boolean;
}

export interface GetUsageBySubscriptionResponse {
	amount: number;
	currency: string;
	display_amount: string;
	start_time: string;
	end_time: string;
	charges: SubscriptionUsageByMetersResponse[];
	commitment_amount?: number;
	overage_factor?: number;
	commitment_utilized?: number;
	overage_amount?: number;
	has_overage: boolean;
}

export interface SubscriptionUsageByMetersResponse {
	amount: number;
	currency: string;
	display_amount: string;
	quantity: number;
	filter_values: Metadata;
	meter_id: string;
	meter_display_name: string;
	price: {
		id: string;
		amount?: string;
		currency: string;
	};
	is_overage: boolean;
	overage_factor?: number;
}

export interface AddSchedulePhaseRequest {
	billing_cycle?: BILLING_CYCLE;
	start_date: string;
	end_date?: string;
	credit_grants?: CreateCreditGrantRequest[];
	commitment_amount?: number;
	overage_factor?: number;
}

export interface AddAddonRequest {
	subscription_id: string;
	addon_id: string;
	quantity?: number;
	start_date?: string;
	end_date?: string;
	metadata?: Metadata;
}

export interface RemoveAddonRequest {
	subscription_id: string;
	addon_id: string;
	reason?: string;
}

export interface AddonAssociationResponse {
	id: string;
	subscription_id: string;
	addon_id: string;
	quantity: number;
	start_date: string;
	end_date?: string;
	status: string;
	metadata: Metadata;
	created_at: string;
	updated_at: string;
}

// =============================================================================
// SUBSCRIPTION LINE ITEM TYPES
// =============================================================================

export interface CreateSubscriptionLineItemRequest {
	price_id: string;
	quantity?: number;
	start_date?: string;
	end_date?: string;
	metadata?: Metadata;
	display_name?: string;
}

export interface UpdateSubscriptionLineItemRequest {
	effective_from?: string;
	billing_model?: BILLING_MODEL;
	amount?: number;
	tier_mode?: TIER_MODE;
	tiers?: CreatePriceTier[];
	transform_quantity?: TransformQuantity;
	metadata?: Metadata;
}

export interface DeleteSubscriptionLineItemRequest {
	effective_from?: string;
}

export interface SubscriptionLineItemResponse {
	id: string;
	subscription_id: string;
	customer_id: string;
	price_id: string;
	price_type: string;
	currency: string;
	billing_period: string;
	invoice_cadence: string;
	trial_period?: number;
	price_unit_id?: string;
	price_unit?: string;
	entity_type: SUBSCRIPTION_LINE_ITEM_ENTITY_TYPE;
	entity_id?: string;
	plan_display_name?: string;
	meter_id?: string;
	meter_display_name?: string;
	display_name: string;
	quantity: number;
	start_date: string;
	end_date?: string;
	metadata: Metadata;
	created_at: string;
	updated_at: string;
}

// =============================================================================
// ENHANCED SUBSCRIPTION FILTER TYPES
// =============================================================================

export interface SubscriptionFilter extends QueryFilter, TimeRangeFilter {
	subscription_ids?: string[];
	customer_id?: string;
	external_customer_id?: string;
	plan_id?: string;
	subscription_status?: SUBSCRIPTION_STATUS[];
	billing_cadence?: BILLING_CADENCE[];
	billing_period?: BILLING_PERIOD[];
	subscription_status_not_in?: SUBSCRIPTION_STATUS[];
	active_at?: string;
	with_line_items?: boolean;
	expand?: string;
	sort?: TypedBackendSort[];
	filters?: TypedBackendFilter[];
}
