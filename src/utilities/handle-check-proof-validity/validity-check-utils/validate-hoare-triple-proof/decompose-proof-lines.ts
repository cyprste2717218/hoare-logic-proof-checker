import {checkHskipLawProof} from '@/utilities/handle-check-proof-validity/validity-check-utils/validate-hoare-triple-proof/hoare-law-z3-solver-funcs';
import type {CollectedTripleProofLines} from '@/models/misc';

function decomposeProofLines(
	collectedTripleProofDetails: CollectedTripleProofLines,
): boolean {
	function performLawSpecificSteps(
		collectedTripleProofDetails: CollectedTripleProofLines,
	): boolean {
		const passedHoareLawName = collectedTripleProofDetails.hoareLaw.lawName;

		if (passedHoareLawName === 'hskip') {
			console.log(
				'gets to here in performLawSpecificSteps:',
				passedHoareLawName,
			);
			const checkHskipProofOutcome: boolean = checkHskipLawProof(
				collectedTripleProofDetails,
			);

			return checkHskipProofOutcome;
		}

		// Return false if passedHoareLawName in proof doesnt match up against ones in the conditional above
		return false;
	}

	const checkTripleProofOutcome: boolean = performLawSpecificSteps(
		collectedTripleProofDetails,
	);

	return checkTripleProofOutcome;
}

export {decomposeProofLines};
