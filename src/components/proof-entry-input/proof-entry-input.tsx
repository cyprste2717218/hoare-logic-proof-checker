import {TextAreaWrapper} from '@/components/proof-entry-input/children/textarea-wrapper';
import {type CurrentProofStateType} from '@/models/misc';

type ProofEntryInputProps = {
	currentProofState: CurrentProofStateType;
	proofContent: string;
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
};

function ProofEntryInput({
	currentProofState,
	proofContent,
	setCurrentProofState,
	setProofContent,
}: ProofEntryInputProps) {
	return (
		<TextAreaWrapper
			name="proof-entry-input-textarea"
			currentProofState={currentProofState}
			numOfLines={10}
			proofContent={proofContent}
			setProofContent={setProofContent}
			setCurrentProofState={setCurrentProofState}
		/>
	);
}

export default ProofEntryInput;
