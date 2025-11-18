import { CreditGrantApplication, APPLICATION_STATUS } from '@/models';
import { QueryFilter, TimeRangeFilter } from './base';
import { Pagination } from '@/models';

// ============================================
// Credit Grant Application Response Types
// ============================================

export type CreditGrantApplicationResponse = CreditGrantApplication;

export interface ListCreditGrantApplicationsResponse extends Pagination {
	items: CreditGrantApplicationResponse[];
}

// ============================================
// Credit Grant Application Filter Types
// ============================================

export interface GetCreditGrantApplicationsRequest extends QueryFilter, TimeRangeFilter {
	application_ids?: string[];
	credit_grant_ids?: string[];
	subscription_ids?: string[];
	scheduled_for?: string;
	applied_at?: string;
	application_statuses?: APPLICATION_STATUS[];
}

export interface GetUpcomingCreditGrantApplicationsRequest extends QueryFilter, TimeRangeFilter {
	subscription_ids?: string[];
}
