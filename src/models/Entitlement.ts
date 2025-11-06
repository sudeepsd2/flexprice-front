import { BaseModel } from './base';
import Feature from './Feature';

export interface Entitlement extends BaseModel {
	readonly feature: Feature;
	readonly feature_id: string;
	readonly feature_type: string;
	readonly is_enabled: boolean;
	readonly is_soft_limit: boolean;
	readonly entity_type: ENTITLEMENT_ENTITY_TYPE;
	readonly entity_id: string;
	readonly static_value: string;
	readonly tenant_id: string;
	readonly usage_limit: number | null;
	readonly usage_reset_period: string | null;
}

export enum ENTITLEMENT_ENTITY_TYPE {
	PLAN = 'PLAN',
	ADDON = 'ADDON',
	FEATURE = 'FEATURE',
	SUBSCRIPTION = 'SUBSCRIPTION',
}
