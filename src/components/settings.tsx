'use client';

import {ChevronRight, type LucideIcon} from 'lucide-react';
import {Collapsible, CollapsibleTrigger} from './ui/collapsible.js';
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar.js';

export function Settings({
	data,
}: {
	data: {
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
	};
}) {
	return (
		<SidebarGroup>
			<SidebarMenu>
				<Collapsible
					key={data.title}
					asChild
					defaultOpen={data.isActive}
					className="group/collapsible"
				>
					<SidebarMenuItem>
						<CollapsibleTrigger asChild>
							<SidebarMenuButton tooltip={data.title}>
								{data.icon && <data.icon />}
								<span>{data.title}</span>
								<ChevronRight className="ml-auto" />
							</SidebarMenuButton>
						</CollapsibleTrigger>
					</SidebarMenuItem>
				</Collapsible>
			</SidebarMenu>
		</SidebarGroup>
	);
}
