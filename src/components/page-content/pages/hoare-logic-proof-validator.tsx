import ProofEntryInput from '../../proof-entry-input/proof-entry-input';
import {HoareTripleInput} from '../../hoare-triple-input/hoare-triple-input';
import {Button} from '@/components/base/button.js';
import type {CurrentProofStateType, ErrorMsg} from '@/models/misc';
import handleProofSyntaxCheck from '@/utilities/proof-handle-utilities';

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
	// TO-DO: instantiate proofErrors state here,
	setCurrentProofState,
	setProofContent,
	setProofErrors,
}: HoareLogicProofValidatorProps) {
	const handleClick = () => {
		const syntaxErrors: ErrorMsg[] = handleProofSyntaxCheck({proofContent});
		if (syntaxErrors.length > 0) {
			setCurrentProofState('Invalid - Syntax Error');
			setProofErrors(syntaxErrors);
		}
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
