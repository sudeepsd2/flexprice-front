import { FC, useCallback } from 'react';
import { NavItem } from './SidebarMenu';
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui';
// import { ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarItemProps extends NavItem {
	isOpen?: boolean;
	onToggle?: (isOpen: boolean) => void;
}

const SidebarItem: FC<SidebarItemProps> = (item) => {
	const navigate = useNavigate();
	const location = useLocation();
	const isOpen = item.isOpen ?? false;

	const hasChildren = item.items && item.items.length > 0;
	const Icon = item.icon;

	const isMainItemActive = item.isActive;
	const iconActive = isMainItemActive;

	const handleNavigation = useCallback(
		(url: string) => {
			if (url && url !== '#') {
				navigate(url);
			}
		},
		[navigate],
	);

	const handleClick = () => {
		if (hasChildren) {
			const willOpen = !isOpen;
			// Toggle the open/close state via parent handler
			item.onToggle?.(willOpen);
			// If opening and URL is not '#', navigate to it (which will be the first child's URL)
			// Small delay to let the accordion animation start smoothly
			if (willOpen && item.url && item.url !== '#') {
				setTimeout(() => {
					handleNavigation(item.url);
				}, 100);
			}
		} else {
			handleNavigation(item.url);
		}
	};

	const handleOpenChange = (open: boolean) => {
		item.onToggle?.(open);
	};

	return (
		<Collapsible key={item.title} open={isOpen} onOpenChange={handleOpenChange} asChild className='group/collapsible'>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						disabled={item.disabled}
						onClick={handleClick}
						tooltip={item.title}
						className={cn(
							'flex items-center gap-2 h-10 px-2  py-[10px] rounded-[10px] text-[14px] cursor-pointer font-normal transition-all duration-200 ease-in-out',
							isMainItemActive ? 'bg-white shadow-sm font-medium' : 'font-thin',
							item.disabled && 'cursor-not-allowed opacity-50',
						)}>
						{Icon && (
							<Icon absoluteStrokeWidth className={cn('!size-5 !stroke-[1.5px] mr-1', iconActive ? 'text-[#3C87D2]' : 'text-[#3F3F46]')} />
						)}
						<span className='text-[14px] select-none font-normal'>{item.title}</span>
						{/* {hasChildren && (
							<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
						)} */}
					</SidebarMenuButton>
				</CollapsibleTrigger>
				{hasChildren && (
					<CollapsibleContent className='my-3 overflow-hidden transition-all duration-300 ease-in-out'>
						<SidebarMenuSub className='gap-0 transition-opacity duration-200'>
							{item.items?.map((subItem) => {
								const subActive = location.pathname.startsWith(subItem.url);
								return (
									<SidebarMenuSubItem key={subItem.title}>
										<SidebarMenuSubButton
											asChild={false}
											isActive={subActive}
											className={cn('w-full font-light text-black transition-colors duration-200')}
											onClick={() => handleNavigation(subItem.url)}>
											{subItem.title}
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								);
							})}
						</SidebarMenuSub>
					</CollapsibleContent>
				)}
			</SidebarMenuItem>
		</Collapsible>
	);
};

export default SidebarItem;
