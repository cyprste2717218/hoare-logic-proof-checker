import {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import {Separator} from '@/components/base/separator.js';
import type {CurrentProofStateType, ErrorMsg} from '@/models/misc';
import CustomSidebar from '@/components/custom-sidebar/custom-sidebar';
import PageContent from '@/components/page-content/page-content';
import HeaderComponent from '@/components/header-component/header-component';
import {Z3ReadyOverlay} from '@/components/z3-ready-overlay/z3-ready-overlay';
import {
	ensureZ3Ready,
	resetZ3Initialization,
	type Z3LoadProgress,
} from '@/utilities/handle-check-proof-validity/z3-logic/initialise-z3-funcs';

type CurrentPageContentType =
	'Hoare Logic Proof Validator' | 'Reference Guide' | 'Settings';

function App() {
	const [currentPageContent, setCurrentPageContent] =
		useState<CurrentPageContentType>('Hoare Logic Proof Validator');

	const [currentProofState, setCurrentProofState] =
		useState<CurrentProofStateType>('Unchecked');

	const [proofContent, setProofContent] = useState('');

	const [proofErrors, setProofErrors] = useState<ErrorMsg[]>([]);

	const [z3Ready, setZ3Ready] = useState(false);
	const [z3Progress, setZ3Progress] = useState<Z3LoadProgress | undefined>(
		undefined,
	);
	const [z3Error, setZ3Error] = useState<Error | undefined>(undefined);

	const aliveRef = useRef(true);

	const runZ3Bootstrap = useCallback(async () => {
		setZ3Error(undefined);
		setZ3Progress({loaded: 0, total: undefined, phase: 'download'});
		try {
			await ensureZ3Ready((progress) => {
				if (aliveRef.current) {
					setZ3Progress(progress);
				}
			});
			if (aliveRef.current) {
				setZ3Ready(true);
				setZ3Error(undefined);
			}
		} catch (error: unknown) {
			if (aliveRef.current) {
				setZ3Ready(false);
				setZ3Error(error instanceof Error ? error : new Error(String(error)));
			}
		}
	}, []);

	useEffect(() => {
		aliveRef.current = true;
		void runZ3Bootstrap();
		return () => {
			aliveRef.current = false;
		};
	}, [runZ3Bootstrap]);

	function handleZ3Retry() {
		resetZ3Initialization();
		setZ3Ready(false);
		setZ3Error(undefined);
		setZ3Progress(undefined);
		aliveRef.current = true;
		void runZ3Bootstrap();
	}

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

	console.log('are CORS isolated:', globalThis.crossOriginIsolated);
	return (
		<>
			<Z3ReadyOverlay
				error={z3Error}
				open={!z3Ready}
				progress={z3Progress}
				onRetry={handleZ3Retry}
			/>
			<CustomSidebar handlePageContentChange={handlePageContentChange}>
				<HeaderComponent currentPageContent={currentPageContent} />
				<div style={{marginTop: '20px', marginBottom: '10px'}}>
					<Separator orientation="horizontal" />
				</div>
				<PageContent
					currentProofState={currentProofState}
					currentPageContent={currentPageContent}
					proofContent={proofContent}
					proofErrors={proofErrors}
					setCurrentProofState={setCurrentProofState}
					setProofContent={setProofContent}
					setProofErrors={setProofErrors}
				/>
			</CustomSidebar>
		</>
	);
}

export default App;
