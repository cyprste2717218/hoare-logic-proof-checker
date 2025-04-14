import {checkHskipLawProof} from '@/utilities/handle-check-proof-validity/z3-logic/hoare-law-z3-solver-funcs';
import type {CollectedTripleProofLines} from '@/models/misc';

async function decomposeProofLines(
	collectedTripleProofDetails: CollectedTripleProofLines,
): Promise<boolean> {
	async function performLawSpecificSteps(
		collectedTripleProofDetails: CollectedTripleProofLines,
	): Promise<boolean> {
		const passedHoareLawName = collectedTripleProofDetails.hoareLaw.lawName;

		if (passedHoareLawName === 'hskip') {
			console.log(
				'gets to here in performLawSpecificSteps:',
				passedHoareLawName,
			);
			const checkHskipProofOutcome: boolean = await checkHskipLawProof(
				collectedTripleProofDetails,
			);

			return checkHskipProofOutcome;
		}

		// Return false if passedHoareLawName in proof doesnt match up against ones in the conditional above
		return false;
	}

	const checkTripleProofOutcome: boolean = await performLawSpecificSteps(
		collectedTripleProofDetails,
	);

	return checkTripleProofOutcome;
}

export {decomposeProofLines};
