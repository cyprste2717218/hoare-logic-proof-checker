import * as React from 'react';
import {BookOpen, GalleryVerticalEnd, Settings2} from 'lucide-react';
import {NavMain} from '@/components/nav-main.js';
import {Settings} from '@/components/settings.js';
import {HeaderDetails} from '@/components/header-details.js';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar.js';

const data = {
	footerData: {
		title: 'Settings',
		url: '#',
		icon: Settings2,
	},
	description: {
		name: 'Hoare Logic Validator',
		logo: GalleryVerticalEnd,
		plan: 'v1.0',
	},
	navMain: [
		{
			title: 'Reference Guide',
			url: '#',
			icon: BookOpen,
		},
	],
};

export function AppSidebar({
	handlePageContentChange,
	...properties
}: React.ComponentProps<typeof Sidebar> & {
	handlePageContentChange: (
		pageContent: 'Hoare Logic Proof Validator' | 'Reference Guide' | 'Settings',
	) => void;
}) {
	return (
		<Sidebar collapsible="icon" {...properties}>
			<SidebarHeader>
				<HeaderDetails description={data.description} />
			</SidebarHeader>
			<SidebarContent handlePageContentChange={handlePageContentChange}>
				<NavMain
					handlePageContentChange={handlePageContentChange}
					items={data.navMain}
				/>
			</SidebarContent>
			<SidebarFooter>
				<Settings data={data.footerData} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
