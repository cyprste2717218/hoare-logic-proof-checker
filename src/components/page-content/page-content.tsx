import HoareLogicProofValidator from '@/components/page-content/pages/hoare-logic-proof-validator';
import ReferenceGuide from '@/components/page-content/pages/reference-guide';
import AppSettings from '@/components/page-content/pages/settings-page';
import type {
	CurrentProofStateType,
	CurrentPageContentType,
} from '@/models/misc';

type PageContentProps = {
	currentPageContent: CurrentPageContentType;
	currentProofState: CurrentProofStateType;
	proofContent: string;
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
};

function PageContent({
	currentPageContent,
	currentProofState,
	proofContent,
	setCurrentProofState,
	setProofContent,
}: PageContentProps) {
	switch (currentPageContent) {
		case 'Hoare Logic Proof Validator': {
			return (
				<HoareLogicProofValidator
					currentProofState={currentProofState}
					proofContent={proofContent}
					setCurrentProofState={setCurrentProofState}
					setProofContent={setProofContent}
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
