import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';

export interface BreadcrumbItem {
	label: string;
	path: string;
}

const formatPathSegment = (segment: string): string => {
	return segment
		.replace(/-/g, ' ')
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export const useBreadcrumbs = () => {
	const location = useLocation();
	const { setBreadcrumbs, setLoading } = useBreadcrumbsStore();

	useEffect(() => {
		setLoading(true);
		const pathSegments = location.pathname.split('/').filter(Boolean);

		const newBreadcrumbs = pathSegments.map((segment, index, arr) => {
			const path = `/${arr.slice(0, index + 1).join('/')}`;

			const label = formatPathSegment(segment);

			return {
				label,
				path,
			};
		});

		setBreadcrumbs(newBreadcrumbs);
		setLoading(false);
	}, [location.pathname, setBreadcrumbs, setLoading]);
};
