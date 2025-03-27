import {ProofEntryInput} from '../proof-entry-input/proof-entry-input';
import {HoareTripleInput} from '../hoare-triple-input/hoare-triple-input';
import {Button} from '@/components/base-ui/button.js';

function HoareLogicProofValidator() {
	return (
		<>
			<div>
				<p
					style={{textAlign: 'left'}}
					className="leading-7 [&:not(:first-child)]:mt-6"
				>
					Enter Your Hoare Triple:
				</p>
				<HoareTripleInput />
			</div>
			<br></br>
			<div>
				<p
					style={{textAlign: 'left'}}
					className="leading-7 [&:not(:first-child)]:mt-6"
				>
					Enter Your Proof:
				</p>
				<ProofEntryInput />
			</div>

			<Button variant="outline">Check Proof Validity</Button>
		</>
	);
}

export default HoareLogicProofValidator;
