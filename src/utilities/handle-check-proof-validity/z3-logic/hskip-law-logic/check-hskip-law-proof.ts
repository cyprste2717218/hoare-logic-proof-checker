import {checkArithLawCallValidity} from '@/utilities/handle-check-proof-validity/z3-logic/arith-law-logic/check-arith-law-call-validity';
import {doSkipLawChecks} from '@/utilities/handle-check-proof-validity/z3-logic/hskip-law-logic/do-skip-law-checks';
import type {CollectedTripleProofLines} from '@/models/misc';
import type {ProofLawDetails} from '@/models/hoare-law-z3-models';

async function checkHskipLawProof(
	collectedTripleProofDetails: CollectedTripleProofLines,
): Promise<boolean> {
	// Check that content in precondition, postcondition, program body in hskip proof line call and statement body of arith proof line call is the same
	const passedSkipLawChecks: ProofLawDetails | undefined = doSkipLawChecks(
		collectedTripleProofDetails,
	);

	if (!passedSkipLawChecks) {
		console.error('hskip law checks failed');
		return false;
	}

	// Given previous check passes, check if arith proof line is valid via discharge to Z3 SMT solver (i.e. checking validity of implies statement)

	// Return proof as valid if arithLawCheckResult is true, otherwise proof is invalid
	try {
		const arithLawCheckResult: boolean = await checkArithLawCallValidity(
			passedSkipLawChecks.arith,
		);

		if (arithLawCheckResult) {
			console.log('arith law proof line validity check passed!');
			return arithLawCheckResult;
		}

		throw new Error(`arithLawCheckResult returned ${arithLawCheckResult}`);
	} catch (error) {
		// To-do: need to display a system error banner in UI with this error message in this situation
		console.error('arith law check failed:', error);
		return false;
	}
}

export {checkHskipLawProof};
