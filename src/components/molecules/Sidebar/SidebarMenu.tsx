'use client';

import { FC } from 'react';
import { SidebarGroup, SidebarMenu } from '@/components/ui/sidebar';
import SidebarItem from './SidebarItem';
import { useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

export type NavItem = {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	disabled?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
	isOpen?: boolean;
	onToggle?: () => void;
};

const SidebarNav: FC<{ items: NavItem[] }> = ({ items }) => {
	const location = useLocation();

	return (
		<SidebarGroup className='mb-0'>
			<SidebarMenu className='gap-3'>
				{items.map((item) => {
					// Check if current path matches the main item URL or any of its sub-items
					const isMainItemActive = location.pathname.startsWith(item.url) && item.url !== '#';
					const isSubItemActive = item.items?.some((subItem) => location.pathname.startsWith(subItem.url));
					const isActive = isMainItemActive || isSubItemActive;

					// Special case: If we're on any product catalog route, open Product Catalog section
					const isProductCatalogRoute = location.pathname.startsWith('/product-catalog');
					const isProductCatalog = item.title === 'Product Catalog';
					const shouldOpenByDefault = isActive || (isProductCatalogRoute && isProductCatalog);

					item.isActive = isActive;

					return <SidebarItem key={item.title} {...item} defaultOpen={shouldOpenByDefault} />;
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default SidebarNav;
