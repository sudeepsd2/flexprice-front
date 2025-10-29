import { Connection } from '@/models';

export interface GetConnectionsPayload {
	status?: string;
	provider_type?: string;
	limit?: number;
	offset?: number;
}

export interface GetConnectionsResponse {
	connections: Connection[];
	total: number;
	limit: number;
	offset: number;
}

export interface CreateConnectionPayload {
	name: string;
	provider_type: string;
	encrypted_secret_data:
		| {
				provider_type: 'stripe';
				account_id?: string;
				publishable_key?: string;
				secret_key?: string;
				webhook_secret?: string;
		  }
		| {
				provider_type: 's3';
				aws_access_key_id?: string;
				aws_secret_access_key?: string;
				aws_session_token?: string;
		  }
		| {
				provider_type: 'hubspot';
				access_token?: string;
				client_secret?: string;
		  };
	sync_config?: {
		plan?: {
			inbound: boolean;
			outbound: boolean;
		};
		subscription?: {
			inbound: boolean;
			outbound: boolean;
		};
		invoice?: {
			inbound: boolean;
			outbound: boolean;
		};
		deal?: {
			inbound: boolean;
			outbound: boolean;
		};
	};
}

export interface UpdateConnectionPayload {
	name: string;
	sync_config?: {
		plan?: {
			inbound: boolean;
			outbound: boolean;
		};
		subscription?: {
			inbound: boolean;
			outbound: boolean;
		};
		invoice?: {
			inbound: boolean;
			outbound: boolean;
		};
		deal?: {
			inbound: boolean;
			outbound: boolean;
		};
	};
}
