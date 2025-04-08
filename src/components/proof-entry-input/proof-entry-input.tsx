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
	setProofErrors: React.Dispatch<React.SetStateAction<ErrorMsg[]>>;
};

function ProofEntryInput({
	currentProofState,
	proofContent,
	proofErrors,
	setCurrentProofState,
	setProofContent,
	setProofErrors,
}: ProofEntryInputProps) {
	// Test to see if proof error hover cards render as expected by supplying static data
	/* const testErrorMsgs: ErrorMsg[] = [
		{
			lineNumber: 1,
			messages: ['This is an error message example', 'and another example'],
		},
		{
			lineNumber: 2,
			messages: ['Invalid - Proof Error'],
		},
		{
			lineNumber: 4,
			messages: ['Invalid - Proof Error'],
		},
		{
			lineNumber: 10,
			messages: ['Invalid - Proof Error'],
		},
	]; */

	return (
		<TextAreaWrapper
			name="proof-entry-input-textarea"
			currentProofState={currentProofState}
			numOfLines={10}
			proofContent={proofContent}
			proofErrors={proofErrors}
			setProofContent={setProofContent}
			setCurrentProofState={setCurrentProofState}
			setProofErrors={setProofErrors}
		/>
	);
}

export default ProofEntryInput;
