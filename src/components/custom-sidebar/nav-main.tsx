'use client';

import {ChevronRight, type LucideIcon} from 'lucide-react';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/base-ui/collapsible.js';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/base-ui/sidebar.js';

type AllowedPages =
	| 'Hoare Logic Proof Validator'
	| 'Reference Guide'
	| 'Settings';

export function NavMain({
	items,
	handlePageContentChange,
}: {
	items: Array<{
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		};
	}>;
	handlePageContentChange: (title: AllowedPages) => void;
}) {
	return (
		<SidebarGroup handlePageContentChange={handlePageContentChange}>
			<SidebarGroupLabel>Options</SidebarGroupLabel>
			<SidebarMenu handlePageContentChange={handlePageContentChange}>
				{items.map((item) => (
					<Collapsible
						key={item.title}
						asChild
						defaultOpen={item.isActive}
						className="group/collapsible"
						handlePageContentChange={handlePageContentChange}
					>
						<SidebarMenuItem
							onClick={() => {
								handlePageContentChange(item.title as AllowedPages);
							}}
						>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={item.title}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent></CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
