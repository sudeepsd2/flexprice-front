import { useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortPaginationProps {
	totalItems: number; // Changed to required
	pageSize?: number;
	showPages?: boolean;
	unit?: string;
}

const ShortPagination = ({
	totalItems,
	pageSize = 10,
	unit = 'items',
	showPages = false,
	// Keep these for backward compatibility
}: ShortPaginationProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentPage = parseInt(searchParams.get('page') || '1', 10);

	// Calculate actual total pages from totalItems and pageSize
	const calculatedTotalPages = Math.ceil(totalItems / pageSize);
	// Use calculated pages, fall back to provided total pages for backward compatibility
	const totalPages = calculatedTotalPages || 1;

	const handlePageChange = (page: number) => {
		if (page < 1 || page > totalPages) return;
		setSearchParams({ page: page.toString() });
	};

	if (totalPages <= 1) return null;

	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalItems);

	return (
		<div className='flex items-center justify-between py-4'>
			<div className='text-sm text-gray-500 font-light'>
				Showing <span className='font-normal'>{startItem}</span> to <span className='font-normal'>{endItem}</span> of{' '}
				<span className='font-normal'>{totalItems}</span> {unit}
			</div>
			<div className='flex items-center space-x-2'>
				<Button
					variant='outline'
					size='icon'
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className={cn('size-8', currentPage === 1 && 'text-gray-300 cursor-not-allowed')}>
					<ChevronLeft className='h-4 w-4' />
				</Button>
				{showPages && (
					<div className='text-sm font-light text-gray-500'>
						Page {currentPage} of {totalPages}
					</div>
				)}
				<Button
					variant='outline'
					size='icon'
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className={cn('size-8', currentPage === totalPages && 'text-gray-300 cursor-not-allowed')}>
					<ChevronRight className='h-4 w-4' />
				</Button>
			</div>
		</div>
	);
};

export default ShortPagination;
