import {
	type ArithAndSubstDetails,
	type ArithLawExpr,
} from '@/models/hoare-law-z3-models';

function doSupportingArithLawChecks(
	relevantProofDetails: ArithAndSubstDetails,
): ArithLawExpr {
	return {
		arith: {
			expr1: '',
			expr2: '',
		},
	};
}

export {doSupportingArithLawChecks};
