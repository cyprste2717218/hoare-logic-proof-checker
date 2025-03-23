'use client';

import {ChevronRight, type LucideIcon} from 'lucide-react';
import {Collapsible, CollapsibleTrigger} from '../base-ui/collapsible.js';
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/base-ui/sidebar.js';

type AllowedPages =
	| 'Hoare Logic Proof Validator'
	| 'Reference Guide'
	| 'Settings';

export function Settings({
	data,
	handlePageContentChange,
}: {
	data: {
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
	};
	handlePageContentChange: (pageContent: AllowedPages) => void;
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
					<SidebarMenuItem
						onClick={() => {
							handlePageContentChange(data.title as AllowedPages);
						}}
					>
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
