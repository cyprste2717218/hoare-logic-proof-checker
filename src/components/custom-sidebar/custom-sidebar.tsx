import {AppSidebar} from '@/components/custom-sidebar/children/app-sidebar.js';
import {SidebarInset, SidebarProvider} from '@/components/base/sidebar.js';

type CustomSidebarProps = {
	children: React.ReactNode;
	handlePageContentChange: (
		pageContent: 'Hoare Logic Proof Validator' | 'Reference Guide' | 'Settings',
	) => void;
};

function CustomSidebar({
	children,
	handlePageContentChange,
}: CustomSidebarProps) {
	return (
		<SidebarProvider>
			<AppSidebar handlePageContentChange={handlePageContentChange} />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}

export default CustomSidebar;
