import {useState} from 'react';
import './App.css';
import AppSettings from './components/pages/settings-page';
import {AppSidebar} from '@/components/app-sidebar.js';
import {Separator} from '@/components/ui/separator.js';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar.js';
import HoareLogicProofValidator from '@/components/pages/hoare-logic-proof-validator';
import ReferenceGuide from '@/components/pages/reference-guide';

type CurrentPageContentType =
	| 'Hoare Logic Proof Validator'
	| 'Reference Guide'
	| 'Settings';

function App() {
	const [currentPageContent, setCurrentPageContent] =
		useState<CurrentPageContentType>('Hoare Logic Proof Validator');

	function handlePageContentChange(newPageContent: CurrentPageContentType) {
		switch (newPageContent) {
			case 'Hoare Logic Proof Validator': {
				setCurrentPageContent('Hoare Logic Proof Validator');
				break;
			}

			case 'Reference Guide': {
				setCurrentPageContent('Reference Guide');
				break;
			}

			case 'Settings': {
				setCurrentPageContent('Settings');
				break;
			}
		}
	}

	return (
		<>
			<SidebarProvider>
				<AppSidebar handlePageContentChange={handlePageContentChange} />
				<SidebarInset>
					<HeaderComponent currentPageContent={currentPageContent} />
					<Separator orientation="horizontal" />
					<PageContent currentPageContent={currentPageContent} />
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}

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

function PageContent({
	currentPageContent,
}: {
	currentPageContent: CurrentPageContentType;
}) {
	switch (currentPageContent) {
		case 'Hoare Logic Proof Validator': {
			return <HoareLogicProofValidator />;
		}

		case 'Reference Guide': {
			return <ReferenceGuide />;
		}

		case 'Settings': {
			return <AppSettings />;
		}
	}
}

export default App;
