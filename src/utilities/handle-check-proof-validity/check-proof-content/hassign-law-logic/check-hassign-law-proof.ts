import {doSubstLawChecks} from '../subst-law-logic/do-subst-law-checks';
import {doSupportingArithLawChecks} from '../subst-law-logic/do-supporting-arith-law-checks';
import {doAssignLawTripleChecks} from './do-assign-law-triple-checks';
import {checkArithLawCallValidity} from '@/utilities/handle-check-proof-validity/z3-logic/arith-law-z3-logic/check-arith-law-call-validity';
import type {CollectedTripleProofLines} from '@/models/misc';
import {
	type ArithAndSubstDetails,
	type ArithLawExpr,
	type ProofAssignLawDetails,
} from '@/models/hoare-law-z3-models';

async function checkHassignLawProof(
	collectedTripleProofDetails: CollectedTripleProofLines,
): Promise<boolean> {
	// Check that no variable name is referenced which isnt defined in the precondition yet used/referenced in the program and postcondition

	const passedAssignLawTripleChecks: ProofAssignLawDetails | undefined =
		doAssignLawTripleChecks(collectedTripleProofDetails);

	if (!passedAssignLawTripleChecks) {
		console.error('hassign triple content checks failed');
		return false;
	}

	console.log('passed assign law triple content checks for hassign triple');

	// Check content of subst line calls matches up with hassign triple details
	const passedSubstLineCallChecks: ArithAndSubstDetails | undefined =
		doSubstLawChecks(passedAssignLawTripleChecks);

	if (!passedSubstLineCallChecks) {
		console.error('subst law content checks for hassign triple failed');
		return false;
	}

	console.log(
		'passed substitution expression content checks for hassign triple',
	);

	// Check content of arith line call matches up with subst line details
	const passedArithLineCallChecks: ArithLawExpr | undefined =
		doSupportingArithLawChecks(passedSubstLineCallChecks);

	if (!passedArithLineCallChecks) {
		console.error('arith law content checks for subst law call failed');
		return false;
	}

	console.log(
		'passed arith expression content checks for substitution expression in hassign triple',
	);

	// Given previous check passes, check if arith proof line is valid via discharge to Z3 SMT solver (i.e. checking validity of implies statement)

	// Return proof as valid if arithLawCheckResult is true, otherwise proof is invalid
	try {
		const arithLawCheckResult: boolean = await checkArithLawCallValidity(
			passedArithLineCallChecks.arith,
			'hassign',
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

export {checkHassignLawProof};
