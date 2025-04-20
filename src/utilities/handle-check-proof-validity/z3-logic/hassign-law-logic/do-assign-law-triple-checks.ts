import type {CollectedTripleProofLines} from '@/models/misc';
import {type ProofAssignLawDetails} from '@/models/hoare-law-z3-models';

function doAssignLawTripleChecks(
	formattedProofContent: CollectedTripleProofLines,
): ProofAssignLawDetails {
	return {
		subst: {
			precondition,
			postcondition,
			substitutionExpression,
		},
		hskip: {
			precondition,
			program,
			postcondition,
		},
	};
}

export {doAssignLawTripleChecks};
