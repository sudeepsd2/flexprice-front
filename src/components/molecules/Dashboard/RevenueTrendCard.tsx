'use client';

import { Loader } from '@/components/atoms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { DollarSign } from 'lucide-react';
import { getTypographyClass } from '@/lib/typography';

interface RevenueMonth {
	month: string;
	revenue: number;
	currency: string;
}

interface RevenueTrendCardProps {
	revenueData: RevenueMonth[];
	isLoading: boolean;
}

export const RevenueTrendCard: React.FC<RevenueTrendCardProps> = ({ revenueData, isLoading }) => {
	return (
		<Card className='shadow-sm'>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className={getTypographyClass('section-title')}>Revenue Trend</CardTitle>
						<CardDescription className={getTypographyClass('helper-text', 'mt-1')}>Last 3 months</CardDescription>
					</div>
					<DollarSign className='w-5 h-5 text-green-600' />
				</div>
			</CardHeader>
			<CardContent className='pt-0'>
				{isLoading ? (
					<div className='flex items-center justify-center py-8'>
						<Loader />
					</div>
				) : revenueData && revenueData.length > 0 ? (
					<div className='space-y-2'>
						{revenueData.map((month, index) => {
							return (
								<div key={index} className='flex items-center justify-between py-3 border-b border-zinc-100 last:border-0'>
									<div className='flex-1'>
										<p className={getTypographyClass('body-default', 'font-medium text-zinc-900')}>{month.month}</p>
									</div>
									<div className='text-right'>
										<p className='text-lg font-semibold text-zinc-900'>
											{new Intl.NumberFormat('en-US', {
												style: 'currency',
												currency: month.currency,
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
											}).format(month.revenue)}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<p className={getTypographyClass('body-small', 'text-center text-zinc-500 py-6')}>No revenue data available</p>
				)}
			</CardContent>
		</Card>
	);
};

export default RevenueTrendCard;
