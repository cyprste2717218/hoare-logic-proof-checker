'use client';

import {ChevronRight, type LucideIcon} from 'lucide-react';
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/base/sidebar.js';

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
				<SidebarMenuItem
					onClick={() => {
						handlePageContentChange(data.title as AllowedPages);
					}}
				>
					<SidebarMenuButton tooltip={data.title}>
						{data.icon && <data.icon />}
						<span>{data.title}</span>
						<ChevronRight className="ml-auto" />
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
