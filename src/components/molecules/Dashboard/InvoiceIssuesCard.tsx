'use client';

import { Loader } from '@/components/atoms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { AlertCircle, CheckCircle, Clock, CreditCard, RefreshCw } from 'lucide-react';
import { getTypographyClass } from '@/lib/typography';

interface Invoice {
	amount_remaining?: number;
	amount_due?: number;
	currency?: string;
}

interface Subscription {
	id: string;
}

interface InvoicesByStatus {
	paid: Invoice[];
	failed: Invoice[];
	pending: Invoice[];
	processing: Invoice[];
	refunded: Invoice[];
}

interface InvoiceIssuesCardProps {
	invoicesByStatus: InvoicesByStatus;
	pastDueSubscriptions: Subscription[];
	isLoading: boolean;
}

export const InvoiceIssuesCard: React.FC<InvoiceIssuesCardProps> = ({ invoicesByStatus, pastDueSubscriptions, isLoading }) => {
	const issuesCount = (invoicesByStatus?.failed?.length || 0) + (pastDueSubscriptions?.length || 0);

	return (
		<Card className='shadow-sm'>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className={getTypographyClass('section-title')}>Invoice Payment Status</CardTitle>
						<CardDescription className={getTypographyClass('helper-text', 'mt-1')}>Requires attention (last 7 days)</CardDescription>
					</div>
					<CreditCard className='w-5 h-5 text-blue-600' />
				</div>
			</CardHeader>
			<CardContent className='pt-0'>
				{isLoading ? (
					<div className='flex items-center justify-center py-8'>
						<Loader />
					</div>
				) : (
					<div className='space-y-3'>
						{/* Paid Invoices */}
						<div className='bg-green-50 border border-green-200 rounded-lg p-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<CheckCircle className='w-5 h-5 text-green-600' />
									<p className={getTypographyClass('body-default', 'font-medium text-green-900')}>Paid</p>
								</div>
								<span className='text-2xl font-bold text-green-600'>{invoicesByStatus?.paid?.length || 0}</span>
							</div>
						</div>

						{/* Failed Payments */}
						<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<AlertCircle className='w-5 h-5 text-red-600' />
									<p className={getTypographyClass('body-default', 'font-medium text-red-900')}>Failed</p>
								</div>
								<span className='text-2xl font-bold text-red-600'>{invoicesByStatus?.failed?.length || 0}</span>
							</div>
						</div>

						{/* Pending Payments */}
						<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<Clock className='w-5 h-5 text-yellow-600' />
									<p className={getTypographyClass('body-default', 'font-medium text-yellow-900')}>Pending</p>
								</div>
								<span className='text-2xl font-bold text-yellow-600'>{invoicesByStatus?.pending?.length || 0}</span>
							</div>
						</div>

						{/* Processing Payments */}
						{(invoicesByStatus?.processing?.length || 0) > 0 && (
							<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<RefreshCw className='w-5 h-5 text-blue-600' />
										<p className={getTypographyClass('body-default', 'font-medium text-blue-900')}>Processing</p>
									</div>
									<span className='text-2xl font-bold text-blue-600'>{invoicesByStatus?.processing?.length || 0}</span>
								</div>
							</div>
						)}

						{/* Summary */}
						{issuesCount > 0 && (
							<div className='pt-4 mt-4 border-t border-zinc-200'>
								<div className='flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg'>
									<p className={getTypographyClass('body-default', 'font-medium text-red-700')}>Issues Requiring Attention</p>
									<p className='text-2xl font-bold text-red-600'>{issuesCount}</p>
								</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default InvoiceIssuesCard;
