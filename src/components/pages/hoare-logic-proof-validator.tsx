import {Button} from '@/components/ui/button.js';
import {Input} from '@/components/ui/input.js';

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
				<Input />
			</div>
			<br></br>
			<div>
				<p
					style={{textAlign: 'left'}}
					className="leading-7 [&:not(:first-child)]:mt-6"
				>
					Enter Your Proof:
				</p>
				<Input />
			</div>

			<Button variant="outline">Check Proof Validity</Button>
		</>
	);
}

export default HoareLogicProofValidator;
