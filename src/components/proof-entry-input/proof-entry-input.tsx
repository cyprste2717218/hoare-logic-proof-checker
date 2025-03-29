import {TextArea} from './textarea';
import {type CurrentProofStateType} from '@/models/misc';

type ProofEntryInputProps = {
	currentProofState: CurrentProofStateType;
	proofContent: string;
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
};

export default function ProofEntryInput({
	currentProofState,
	proofContent,
	setCurrentProofState,
	setProofContent,
}: ProofEntryInputProps) {
	return (
		<TextArea
			name="proof-entry-input-textarea"
			currentProofState={currentProofState}
			numOfLines={10}
			proofContent={proofContent}
			setProofContent={setProofContent}
			setCurrentProofState={setCurrentProofState}
		/>
	);
}
