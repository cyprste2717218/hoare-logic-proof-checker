import {type CurrentProofStateType} from '@/models/misc';
import {cn} from '@/lib/utils';

type ProofOutcomeTextProps = {
	currentProofState: CurrentProofStateType;
};

function ProofOutcomeText({currentProofState}: ProofOutcomeTextProps) {
	let message = '';

	switch (currentProofState) {
		case 'Valid': {
			message = 'Provided Proof is Valid!';
			break;
		}

		case 'Invalid - Syntax Error':
		case 'Invalid - Proof Error': {
			message = 'Provided Proof is not valid';
			break;
		}

		case 'Unchecked': {
			message = '';
			break;
		}

		case 'Unchecked - Change Present': {
			message =
				'Detected change to proof body,  run checker again to assure validity';
			break;
		}
	}

	return (
		<div className="text-left m-3 ml-2">
			<p className={cn('text-sm text-slate-500')}>{message}</p>
		</div>
	);
}

export {ProofOutcomeText};
