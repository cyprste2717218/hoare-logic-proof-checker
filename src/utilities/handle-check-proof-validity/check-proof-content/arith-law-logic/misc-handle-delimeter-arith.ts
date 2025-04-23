/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */

/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */

import {type SplitReturnObjType} from '@/models/hoare-law-z3-models';
import {type LawTypeHoare} from '@/models/misc';

function getDelimitedExpressions(str: string): string[] {
	// Match expressions that may contain anything except /\
	const regex = /([^/\\]+?)(?:\/\\|$)/g;
	const matches = [...str.matchAll(regex)];
	return matches.map((match) => match[1].trim());
}

function checkAppropiateLengthVars(
	tripleLaw: LawTypeHoare,
	expr1Arr: string[],
	expr2Arr: string[],
): boolean {
	function compareExprArrs(arr1Length: number, arr2Length: number): boolean {
		if (arr1Length === 0) {
			console.error('expr1 does not contain any "/\\" delimited expressions');
			return false;
		}

		if (arr2Length === 0) {
			console.error('expr2 does not contain any "/\\" delimited expressions');
			return false;
		}

		if (arr1Length !== arr2Length) {
			// Check same number of statements either side of implies operator, if not return false
			console.error(
				'expr1 and expr2 do not contain the same number of "/\\" delimited expressions',
			);
			return false;
		}

		if (arr1Length > 3 && arr2Length > 3) {
			// Check no more than 3 statements either side of implies operator, if not return false
			console.error(
				'expr1 and expr2 contain more than 3 "/\\" delimited expressions respectively',
			);
			return false;
		}

		return true;
	}

	function determineCondition(tripleLaw: LawTypeHoare): boolean {
		if (tripleLaw === 'hskip') {
			// Check the total number of objects on lhs and rhs of implies statement respectively via expr1Arr and expr2Arr match required constraints, i.e. no more than three expressions expressed on each side etc.

			const compareExprArrsResult: boolean = compareExprArrs(
				expr1Arr.length,
				expr2Arr.length,
			);
			console.log('compareExprArrsResult:', compareExprArrsResult);

			return compareExprArrsResult;
		}

		if (tripleLaw === 'hassign') {
			// Alternatively for a hassign triple, check num of objects on lhs of impliest statement is not >3, thus returning false as num >3 variables is not currently supported

			const checkMeetsNumVariablesReq: boolean = expr1Arr.length <= 3;
			console.log('compareExprArrsResult:', checkMeetsNumVariablesReq);

			return checkMeetsNumVariablesReq;
		}

		return false;
	}

	const conditionResult: boolean = determineCondition(tripleLaw);
	if (!conditionResult) {
		console.error(
			`Error condition triggered during check of expression array lengths for ${tripleLaw} triple`,
		);
		return false;
	}

	console.log(
		`Expression array length comparison checks for ${tripleLaw} triple all pass!`,
	);

	return true;
}

function checkAllVariablesReferenced(
	beforeImpliesExprArr: SplitReturnObjType[],
	afterImpliesExprArr: SplitReturnObjType[],
): boolean {
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

	// Get the variable in each expression, e.g. 'x' from 'x=1', and add to array for respective side of implies statement for comparison to check all variables on lhs referenced on rhs. a False value is returned otherwise

	// 1). Access and return all variable names from each of above arrays respectively

	const allLhsVariableNames: string[] = beforeImpliesExprArr.map(
		(exprObj: SplitReturnObjType) => {
			return exprObj.variable;
		},
	);

	let allRhsVariableNames: string[] = [];
	console.log('this is afterImpliesExprArr here:', afterImpliesExprArr);
	allRhsVariableNames = afterImpliesExprArr.map(
		(exprObj: SplitReturnObjType) => {
			return exprObj.variable;
		},
	);

	// Error checking for rhs variable names arr assignment
	if (allRhsVariableNames.length === 0) {
		console.error(
			'error extracting all rhs variable names from arith expression',
		);
		return false;
	}

	// 2). Comparing and checking all variable names match up

	if (!arraysHaveMatchingVariables(allLhsVariableNames, allRhsVariableNames)) {
		console.error(
			"All variable names on LHS and RHS of '=>' don't match in arith call",
		);
		return false;
	}

	console.log(
		'All variable names on LHS and RHS of implies statement in arith call match!',
	);

	return true;
}

export {
	getDelimitedExpressions,
	checkAppropiateLengthVars,
	checkAllVariablesReferenced,
};
