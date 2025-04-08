import HoareLogicProofValidator from '@/components/page-content/pages/hoare-logic-proof-validator';
import ReferenceGuide from '@/components/page-content/pages/reference-guide';
import AppSettings from '@/components/page-content/pages/settings-page';
import type {
	CurrentProofStateType,
	CurrentPageContentType,
	ErrorMsg,
} from '@/models/misc';

type PageContentProps = {
	currentPageContent: CurrentPageContentType;
	currentProofState: CurrentProofStateType;
	proofContent: string;
	proofErrors: ErrorMsg[];
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
	setProofErrors: React.Dispatch<React.SetStateAction<ErrorMsg[]>>;
};

function PageContent({
	currentPageContent,
	currentProofState,
	proofContent,
	proofErrors,
	setCurrentProofState,
	setProofContent,
	setProofErrors,
}: PageContentProps) {
	switch (currentPageContent) {
		case 'Hoare Logic Proof Validator': {
			return (
				<HoareLogicProofValidator
					currentProofState={currentProofState}
					proofContent={proofContent}
					proofErrors={proofErrors}
					setCurrentProofState={setCurrentProofState}
					setProofContent={setProofContent}
					setProofErrors={setProofErrors}
				/>
			);
		}

		case 'Reference Guide': {
			return <ReferenceGuide />;
		}

		case 'Settings': {
			return <AppSettings />;
		}
	}
}

export default PageContent;
