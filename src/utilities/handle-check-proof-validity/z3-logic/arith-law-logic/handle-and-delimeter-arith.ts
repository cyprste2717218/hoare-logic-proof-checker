/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable no-useless-escape  -- needed for informative console.logs and console.errors */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */

import type {
	ArithObjType,
	EqualsSplitReturnObjType,
} from '@/models/hoare-law-z3-models';
import {splitAroundEquals} from '@/utilities/handle-check-proof-validity/z3-logic/arith-law-logic/check-arith-law-call-validity';
import {
	handleLengthTwoExpr,
	handleLengthThreeExpr,
} from '@/utilities/handle-check-proof-validity/z3-logic/arith-law-logic/z3-arith-funcs';

async function handleAndDelimeterZ3Logic(
	allLhsExpressionPartsArr: EqualsSplitReturnObjType[],
	allRhsExpressionPartsArr: EqualsSplitReturnObjType[],
): Promise<boolean> {
	// 1). Add constraints for each variable on LHS and RHS respectively to Z3 stack

	// we assume allLhsExpressionsPartArr and allRhsExpressionsPartsArr both have 3 elements at most each, hence indexing from 0 to 2 as follows:

	const lhsLength = allLhsExpressionPartsArr.length;
	const rhsLength = allRhsExpressionPartsArr.length;

	if (lhsLength === 2 && rhsLength === 2) {
		console.log('length of two expressions on lhs and rhs of implies');
		return handleLengthTwoExpr(
			allLhsExpressionPartsArr,
			allRhsExpressionPartsArr,
		);
	}

	if (lhsLength === 3 && rhsLength === 3) {
		console.log('length of three expressions on lhs and rhs of implies');
		return handleLengthThreeExpr(
			allLhsExpressionPartsArr,
			allRhsExpressionPartsArr,
		);
	}

	return false;
}

async function handleAndDelimeterArith(
	arithObj: ArithObjType,
): Promise<boolean | undefined> {
	function compareExprArrs(arr1Length: number, arr2Length: number): boolean {
		if (arr1Length === 0) {
			console.error('expr1 does not contain any "/\" delimited expressions');
			return false;
		}

		if (arr2Length === 0) {
			console.error('expr2 does not contain any "/\" delimited expressions');
			return false;
		}

		if (arr1Length !== arr2Length) {
			// Check same number of statements either side of implies operator, if not return false
			console.error(
				'expr1 and expr2 do not contain the same number of "/\" delimited expressions',
			);
			return false;
		}

		if (arr1Length > 3 && arr2Length > 3) {
			// Check no more than 3 statements either side of implies operator, if not return false
			console.error(
				'expr1 and expr2 contain more than 3 "/\" delimited expressions respectively',
			);
			return false;
		}

		return true;
	}

	function getDelimitedExpressions(str: string): string[] {
		// Match expressions that may contain anything except /\
		const regex = /([^/\\]+?)(?:\/\\|$)/g;
		const matches = [...str.matchAll(regex)];
		return matches.map((match) => match[1].trim());
	}

	function arraysHaveMatchingVariables(
		arr1: string[],
		arr2: string[],
	): boolean {
		if (arr1.length !== arr2.length) {
			console.error(
				'LHS and RHS variable name arrays do not have the same length',
			);
			return false;
		}

		const set1 = new Set(arr1);
		return arr2.every((str) => set1.has(str));
	}

	const {expr1, expr2} = arithObj;

	// Get arrays containing the expressions needing verifying
	const expr1Arr = getDelimitedExpressions(expr1); // [x=1, y=1, ...]
	const expr2Arr = getDelimitedExpressions(expr2); // [x=1, y=1, ...]

	// check the total number of objects on lhs and rhs of implies statement respectively via expr1Arr and expr2Arr match required constraints, i.e. no more than three expressions expressed on each side etc.
	const compareExprArrsResult: boolean = compareExprArrs(
		expr1Arr.length,
		expr2Arr.length,
	);

	if (!compareExprArrsResult) {
		console.error(
			'Error condition triggered during comparison of expression array lengths between lhs and rhs of implies statement',
		);
		return false;
	}

	console.log(
		'Expression array length comparison checks between lhs and rhs of implies statement all pass!',
	);

	// Get the variable in each expression, e.g. 'x' from 'x=1', and add to array for respective side of implies statement for comparison to check all variables on lhs referenced on rhs. a False value is returned otherwise

	// 1). Format into LHS and RHS expression objects arrays

	const allLhsExpressionPartsArr: EqualsSplitReturnObjType[] = expr1Arr.map(
		(expression) => {
			return splitAroundEquals(expression);
		},
	);

	const allRhsExpressionPartsArr: EqualsSplitReturnObjType[] = expr2Arr.map(
		(expression) => {
			return splitAroundEquals(expression);
		},
	);

	// 2). Access and return all variable names from each of above arrays respectively

	const allLhsVariableNames: string[] = allLhsExpressionPartsArr.map(
		(exprObj: EqualsSplitReturnObjType) => {
			return exprObj.variable;
		},
	);

	const allRhsVariableNames: string[] = allRhsExpressionPartsArr.map(
		(exprObj: EqualsSplitReturnObjType) => {
			return exprObj.variable;
		},
	);

	// 3). Comparing and checking all variable names match up

	if (!arraysHaveMatchingVariables(allLhsVariableNames, allRhsVariableNames)) {
		console.error(
			"All variable names on LHS and RHS of '=>' don't match in arith call",
		);
		return false;
	}

	console.log(
		'All variable names on LHS and RHS of implies statement in arith call match!',
	);

	// 4). Dispatch expressions to Z3 to check validity

	const dispatchToZ3 = await handleAndDelimeterZ3Logic(
		allLhsExpressionPartsArr,
		allRhsExpressionPartsArr,
	);

	return dispatchToZ3;
}

export {handleAndDelimeterArith};
