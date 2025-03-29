import {Separator} from '@/components/base/separator.js';
import {SidebarTrigger} from '@/components/base/sidebar.js';
import type {CurrentPageContentType} from '@/models/misc';

function HeaderComponent({
	currentPageContent,
}: {
	currentPageContent: CurrentPageContentType;
}) {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
					{' '}
					{currentPageContent}{' '}
				</h1>
			</div>
		</header>
	);
}

export default HeaderComponent;
