import {handleDispatch} from '../../z3-logic/handle-dispatch-hoare-law';
import {
	assignBeforeImpliesEntries,
	assignAfterImpliesEntries,
} from './assign-implies-entries';
import {
	getDelimitedExpressions,
	checkAppropiateLengthVars,
	checkAllVariablesReferenced,
} from './misc-handle-delimeter-arith';
import {type LawTypeHoare} from '@/models/misc';
import type {
	ArithObjType,
	DispatchPropsType,
	SplitReturnObjType,
} from '@/models/hoare-law-z3-models';

async function handleDelimiterArith(
	arithObj: ArithObjType,
	tripleLaw: LawTypeHoare,
): Promise<boolean | undefined> {
	const {expr1, expr2} = arithObj; // Expr1 and expr2 will contain only one of the following operators respectively: '=', '>', '<', '<=', '>=' within each sub-expression, i.e. 'x=1 /\ y=2' or 'x>1 /\ y>3'

	const expr1Arr: string[] = getDelimitedExpressions(expr1); // [x=1, y>1, ...]
	const expr2Arr: string[] = []; // [x=1, y>1, ...]

	// Get arrays containing the expressions needing verifying

	if (tripleLaw === 'hskip') {
		expr2Arr.push(...getDelimitedExpressions(expr2 as string)); // [x=1, y>1, ...]
	}

	const hasAppropiateNumVars: boolean = checkAppropiateLengthVars(
		tripleLaw,
		expr1Arr,
		expr2Arr,
	);

	if (!hasAppropiateNumVars) {
		console.error('Inappropiate number of variables within arith proof line');
		return;
	}

	// Expr2Arr will still be empty string arr if tripleLaw is 'hassign', therefore assigning expr2Arr to the decomposed string character array of the expression after the -> (implies) operator in the proof line call

	if (tripleLaw === 'hassign') {
		expr2Arr.push(...expr2);
	}

	/* 
	For hskip proofs: 

	- Getting the operators which splits the value from its variable declaration in each expression, from expr1Arr and expr2Arr and formatting with their variable names and corresponding values into arrs to pass to handleZ3Logic func
	-----------------------
	For hassign proofs:

	- Same function as described for hskip proofs, except only in application for expr1Arr, i.e. lhs values. The values in expr2Arr need processing differently for a hassign proof
	*/

	const beforeImpliesExprArr: SplitReturnObjType[] = [];
	const afterImpliesExprArr: SplitReturnObjType[] = []; // Relevant to hskip proofs only

	if (tripleLaw === 'hskip' || tripleLaw === 'hassign') {
		// Updating beforeImpliesExprArr with values
		const updatedBeforeImpliesExprArr = assignBeforeImpliesEntries(
			beforeImpliesExprArr,
			expr1Arr,
		);

		console.log('updatedBeforeImpliesExprArr:', updatedBeforeImpliesExprArr);

		if (!updatedBeforeImpliesExprArr) {
			console.error(
				'Error assigning entries to beforeImpliesExprArr in arith call',
			);
			return;
		}

		console.log('added elements to beforeImpliesExprArr succesfully');

		console.log(
			'after spreading updatedBeforeImpliesExprArr:',
			beforeImpliesExprArr,
		);
	}

	if (tripleLaw === 'hskip') {
		// Updating afterImpliesExprArr with values
		const updatedAfterImpliesExprArr = assignAfterImpliesEntries(
			afterImpliesExprArr,
			expr2Arr,
		);

		if (!updatedAfterImpliesExprArr) {
			console.error(
				'Error assigning entries to afterImpliesExprArr in arith call',
			);
			return;
		}

		console.log('added elements to afterImpliesExprArr succesfully');

		console.log(
			"operators in expr1Arr and expr2Arr in implies statement respectively are valid, i.e. one of the following: '=', '>', '<', '<=', '>='",
		);
	}

	// Check all variables referenced on lhs, also referenced on rhs (hskip proofs check)
	if (tripleLaw === 'hskip') {
		const allVariablesReferenced: boolean = checkAllVariablesReferenced(
			beforeImpliesExprArr,
			afterImpliesExprArr,
		);

		if (!allVariablesReferenced) {
			console.error(
				'Not all variables referenced on LHS and RHS of implies statement in arith call',
			);
			return;
		}
	}

	// Dispatching to Z3 to check satisfiability of overall implication statement

	let dispatchProps: DispatchPropsType;

	if (tripleLaw === 'hskip') {
		dispatchProps = [beforeImpliesExprArr, afterImpliesExprArr];
	} else if (tripleLaw === 'hassign') {
		dispatchProps = [beforeImpliesExprArr, arithObj];
	} else {
		console.error(
			`unable to define dispatchProps for hoare triple law ${tripleLaw}`,
		);
		return;
	}

	if (dispatchProps === undefined) {
		console.error('dispatchProps is undefined');
		return false;
	}

	const dispatchResult: boolean = await handleDispatch(
		dispatchProps,
		tripleLaw,
	);

	if (!dispatchResult) {
		console.log('sat checker of arith law returned invalid result');
		return false;
	}

	console.log('sat checker of arith law returned valid result');
	return true;
}

export {handleDelimiterArith};
