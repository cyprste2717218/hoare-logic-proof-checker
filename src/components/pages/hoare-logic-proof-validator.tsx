import ProofEntryInput from '../proof-entry-input/proof-entry-input';
import {HoareTripleInput} from '../hoare-triple-input/hoare-triple-input';
import {Button} from '@/components/base-ui/button.js';
import type {CurrentProofStateType} from '@/models/misc';

type HoareLogicProofValidatorProps = {
	currentProofState: CurrentProofStateType;
	proofContent: string;
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
};

function HoareLogicProofValidator({
	currentProofState,
	proofContent,
	setCurrentProofState,
	setProofContent,
}: HoareLogicProofValidatorProps) {
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
				<Button variant="outline">Check Proof Validity</Button>
			</div>
		</>
	);
}

export default HoareLogicProofValidator;
