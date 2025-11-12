import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
	icon: React.ReactNode;
	label: React.ReactNode;
	subtitle?: React.ReactNode;
	date?: Date;
	className?: string;
	isFirst: boolean;
	isLast: boolean;
}

const TimelineItem: FC<TimelineItemProps> = ({ icon, label, subtitle, isLast, className }) => (
	<div className={cn('flex gap-3 items-start relative', className)}>
		{/* Icon circle container with line */}
		<div className='flex flex-col items-center min-w-[32px] z-10 relative h-full'>
			{/* Icon circle */}
			<div className='flex items-center justify-center h-8 w-8 bg-white rounded-full border border-gray-300 z-10 relative'>
				<div className='flex items-center justify-center w-full h-full'>{icon}</div>
			</div>

			{/* Vertical line - starts from bottom of circle and extends to top of next circle, only if not last item */}
			{!isLast && (
				<div className='absolute left-1/2 top-8 -translate-x-1/2 w-[1px] bg-gray-500' style={{ height: 'calc(100% - 2rem + 1.5rem)' }} />
			)}
		</div>

		{/* Label & Subtitle */}
		<div className='space-y-1.5 pt-0.5 flex-1'>
			<p className='text-base font-medium text-gray-900'>{label}</p>
			{subtitle && <div className='text-sm text-gray-600'>{subtitle}</div>}
		</div>
	</div>
);

export interface PreviewTimelineItem {
	icon: React.ReactNode;
	label: string;
	subtitle?: string | React.ReactNode;
	date?: Date;
}

interface TimelinePreviewProps {
	items: PreviewTimelineItem[];
	className?: string;
}

const TimelinePreview: FC<TimelinePreviewProps> = ({ items, className }) => {
	if (items.length === 0) {
		return (
			<div className={cn('w-full', className)}>
				<Card className='bg-white border border-gray-200'>
					<CardContent className='p-5'>
						<div className='text-center text-gray-400 py-8'>No timeline items available</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className={cn('w-full', className)}>
			<Card className='bg-white border border-gray-200'>
				<CardContent className='p-5'>
					<div className='flex flex-col gap-6'>
						{items.map((item, idx) => (
							<TimelineItem key={idx} {...item} isFirst={idx === 0} isLast={idx === items.length - 1} />
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default TimelinePreview;
