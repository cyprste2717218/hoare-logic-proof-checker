import {TextAreaWrapper} from '@/components/proof-entry-input/children/textarea-wrapper';
import {type ErrorMsg, type CurrentProofStateType} from '@/models/misc';

type ProofEntryInputProps = {
	currentProofState: CurrentProofStateType;
	proofContent: string;
	proofErrors: ErrorMsg[];
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
};

function ProofEntryInput({
	currentProofState,
	proofContent,
	proofErrors,
	setCurrentProofState,
	setProofContent,
}: ProofEntryInputProps) {
	// Test to see if proof error hover cards render as expected by supplying static data
	const testErrorMsgs: ErrorMsg[] = [
		{
			lineNumber: 8,
			messages: ['This is an error message example', 'and another example'],
		},
		{
			lineNumber: 3,
			messages: ['Invalid - Proof Error', 'test'],
		},
		{
			lineNumber: 4,
			messages: ['Invalid - Proof Error'],
		},
		{
			lineNumber: 26,
			messages: ['Invalid - Proof Error'],
		},
	];

	return (
		<TextAreaWrapper
			name="proof-entry-input-textarea"
			currentProofState={currentProofState}
			numOfLines={10}
			proofContent={proofContent}
			proofErrors={testErrorMsgs}
			setProofContent={setProofContent}
			setCurrentProofState={setCurrentProofState}
		/>
	);
}

export default ProofEntryInput;
