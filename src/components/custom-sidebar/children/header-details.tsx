import * as React from 'react';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/base/sidebar.js';

type AllowedPages =
	| 'Hoare Logic Proof Validator'
	| 'Reference Guide'
	| 'Settings';

export function HeaderDetails({
	description,
	handlePageContentChange,
}: {
	description: {
		name: string;
		logo: React.ElementType;
		plan: string;
	};
	handlePageContentChange: (pageContent: AllowedPages) => void;
}) {
	return (
		<SidebarMenu handlePageContentChange={handlePageContentChange}>
			<SidebarMenuItem
				onClick={() => {
					handlePageContentChange('Hoare Logic Proof Validator');
				}}
			>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
						<description.logo className="size-4" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">{description.name}</span>
						<span className="truncate text-xs">{description.plan}</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
