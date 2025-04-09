import ProofEntryInput from '../../proof-entry-input/proof-entry-input';
import {HoareTripleInput} from '../../hoare-triple-input/hoare-triple-input';
import {Button} from '@/components/base/button.js';
import type {CurrentProofStateType, ErrorMsg} from '@/models/misc';
import {
	handleCheckProofValidity,
	handleProofSyntaxCheck,
} from '@/utilities/proof-handle-utilities';

type HoareLogicProofValidatorProps = {
	currentProofState: CurrentProofStateType;
	proofContent: string;
	proofErrors: ErrorMsg[];
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
	setProofErrors: React.Dispatch<React.SetStateAction<ErrorMsg[]>>;
};

function HoareLogicProofValidator({
	currentProofState,
	proofContent,
	proofErrors,
	setCurrentProofState,
	setProofContent,
	setProofErrors,
}: HoareLogicProofValidatorProps) {
	const handleClick = () => {
		// Retrieve and set any syntax errors in proof
		const {syntaxErrors, formattedProofLines} = handleProofSyntaxCheck({
			proofContent,
		});
		if (syntaxErrors.length > 0) {
			setCurrentProofState('Invalid - Syntax Error');
			setProofErrors(syntaxErrors);
			return;
		}

		// No syntax errors detected so passing formatted (i.e. whitespace trimmed) proof lines to overall proof validity checker func

		handleCheckProofValidity(formattedProofLines);
	};

	return (
		<>
			<div>
				<div style={{marginTop: '10px', marginBottom: '10px'}}>
					<p
						style={{textAlign: 'left'}}
						className="leading-7 [&:not(:first-child)]:mt-6"
					>
						Enter Your Hoare Triple:
					</p>
				</div>

				<HoareTripleInput />
			</div>
			<br></br>
			<div>
				<div style={{marginTop: '0px', marginBottom: '10px'}}>
					<p
						style={{textAlign: 'left'}}
						className="leading-7 [&:not(:first-child)]:mt-6"
					>
						Enter Your Proof:
					</p>
				</div>

				<ProofEntryInput
					currentProofState={currentProofState}
					setCurrentProofState={setCurrentProofState}
					proofContent={proofContent}
					setProofContent={setProofContent}
					setProofErrors={setProofErrors}
					proofErrors={proofErrors}
				/>
			</div>

			<div style={{marginTop: '20px'}}>
				<Button variant="outline" onClick={handleClick}>
					Check Proof Validity
				</Button>
			</div>
		</>
	);
}

export default HoareLogicProofValidator;
