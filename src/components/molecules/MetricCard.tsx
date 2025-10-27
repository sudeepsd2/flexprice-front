import { formatNumber } from '@/utils/common';
import { getCurrencySymbol } from '@/utils/common/helper_functions';

interface MetricCardProps {
	title: string;
	value: number;
	currency: string;
	showPercentage?: boolean;
	percentage?: number;
	showChangeIndicator?: boolean;
	isNegative?: boolean;
	indicatorRightPosition?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
	title,
	value,
	currency,
	showPercentage = false,
	percentage = 0,
	showChangeIndicator = false,
	isNegative = false,
	indicatorRightPosition = '[13.46px]',
}) => {
	const valueColor = isNegative ? 'text-[#DC2626]' : 'text-[#111827]';
	const indicatorColor = isNegative ? 'text-[#DC2626]' : 'text-[#16A34A]';
	const changeSymbol = isNegative ? '↓' : '↑';

	return (
		<div className='bg-white border border-[#E5E7EB] p-[25px] flex flex-col gap-3 relative rounded-md' style={{ isolation: 'isolate' }}>
			<p className='text-[14px] leading-[21px] text-[#4B5563] font-normal' style={{ fontFamily: 'Inter' }}>
				{title}
			</p>
			<p className={`text-[24px] leading-[28px] font-medium ${valueColor}`} style={{ fontFamily: 'Inter' }}>
				{getCurrencySymbol(currency)} {formatNumber(value, 2)}
			</p>
			{showChangeIndicator && (
				<div className={`absolute right-${indicatorRightPosition} top-[13px] flex items-center px-2 py-1 gap-[3.99px] z-10`}>
					<span className={`text-[12px] leading-[18px] font-medium ${indicatorColor}`} style={{ fontFamily: 'Inter' }}>
						{changeSymbol}
					</span>
					{showPercentage && (
						<span className={`text-[12px] leading-[18px] font-medium ${indicatorColor}`} style={{ fontFamily: 'Inter' }}>
							{formatNumber(Math.abs(percentage), 2)}%
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default MetricCard;
