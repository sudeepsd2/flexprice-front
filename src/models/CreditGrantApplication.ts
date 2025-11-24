import { BaseModel, Metadata } from './base';
import { SUBSCRIPTION_STATUS } from './Subscription';

export interface CreditGrantApplication extends BaseModel {
	readonly id: string;
	readonly environment_id: string;
	readonly credit_grant_id: string;
	readonly subscription_id: string;
	readonly scheduled_for: string;
	readonly applied_at?: string | null;
	readonly period_start?: string | null;
	readonly period_end?: string | null;
	readonly application_status: APPLICATION_STATUS;
	readonly credits: number;
	readonly application_reason: CREDIT_GRANT_APPLICATION_REASON;
	readonly subscription_status_at_application: SUBSCRIPTION_STATUS;
	readonly retry_count: number;
	readonly failure_reason?: string | null;
	readonly metadata: Metadata;
	readonly idempotency_key: string;
}

/**
 * ApplicationStatus represents the status of a credit grant application
 */
export enum APPLICATION_STATUS {
	/**
	 * Applied is the status of a credit grant application that has been applied
	 * This is the terminal state of a credit grant application
	 * This is set when application is applied by cron
	 */
	APPLIED = 'applied',

	/**
	 * Failed is the status of a credit grant application that has failed
	 * This is set when application fails to be applied by cron
	 */
	FAILED = 'failed',

	/**
	 * Pending is the status of a credit grant application that is pending
	 * This is the initial state of a credit grant application
	 * This is set when application is created as well is ready to be applied by cron
	 */
	PENDING = 'pending',

	/**
	 * Skipped is the status of a credit grant application that has been skipped
	 * This is set when subscription has been paused so we skip giving credits for that period
	 */
	SKIPPED = 'skipped',

	/**
	 * Cancelled is the status of a credit grant application that has been cancelled
	 * This is set when subscription has been cancelled
	 * This is the terminal state of a credit grant application
	 */
	CANCELLED = 'cancelled',
}

/**
 * CreditGrantApplicationReason defines the reason why a credit grant application is being created.
 */
export enum CREDIT_GRANT_APPLICATION_REASON {
	/**
	 * FirstTimeRecurringCreditGrant is used when a recurring credit is being granted
	 * for the first time for a subscription. Typically applied at the start of a recurring billing cycle.
	 */
	FIRST_TIME_RECURRING_CREDIT_GRANT = 'first_time_recurring_credit_grant',

	/**
	 * RecurringCreditGrant is used for recurring credit grants that are applied
	 * on a regular interval (e.g. monthly, annually) after the initial credit grant has been processed.
	 */
	RECURRING_CREDIT_GRANT = 'recurring_credit_grant',

	/**
	 * OnetimeCreditGrant is used when a one-time credit is granted during subscription creation.
	 */
	ONETIME_CREDIT_GRANT = 'onetime_credit_grant',
}
