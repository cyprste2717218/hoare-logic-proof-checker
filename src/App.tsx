import {useState} from 'react';
import './App.css';
import {Separator} from '@/components/base/separator.js';
import type {CurrentProofStateType} from '@/models/misc';
import CustomSidebar from '@/components/custom-sidebar/custom-sidebar';
import PageContent from '@/components/page-content/page-content';
import HeaderComponent from '@/components/header-component/header-component';

type CurrentPageContentType =
	| 'Hoare Logic Proof Validator'
	| 'Reference Guide'
	| 'Settings';

function App() {
	const [currentPageContent, setCurrentPageContent] =
		useState<CurrentPageContentType>('Hoare Logic Proof Validator');

	const [currentProofState, setCurrentProofState] =
		useState<CurrentProofStateType>('Unchecked');

	const [proofContent, setProofContent] = useState('');

	function handlePageContentChange(newPageContent: CurrentPageContentType) {
		setCurrentProofState('Unchecked'); // To-do: delete this line, just to pass build ts requirements temporarily
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
			<CustomSidebar handlePageContentChange={handlePageContentChange}>
				<HeaderComponent currentPageContent={currentPageContent} />
				<div style={{marginTop: '20px', marginBottom: '10px'}}>
					<Separator orientation="horizontal" />
				</div>
				<PageContent
					currentProofState={currentProofState}
					currentPageContent={currentPageContent}
					proofContent={proofContent}
					setCurrentProofState={setCurrentProofState}
					setProofContent={setProofContent}
				/>
			</CustomSidebar>
		</>
	);
}

export default App;
