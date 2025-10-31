import { BaseModel, Metadata } from './base';

export enum GROUP_ENTITY_TYPE {
	PRICE = 'price',
	PLAN = 'plan',
	ADDON = 'addon',
	FEATURE = 'feature',
	METER = 'meter',
	CUSTOMER = 'customer',
}

export interface Group extends BaseModel {
	readonly name: string;
	readonly lookup_key: string;
	readonly entity_type: GROUP_ENTITY_TYPE;
	readonly entity_ids: string[];
	readonly metadata: Metadata | null;
}
