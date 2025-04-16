/* eslint-disable no-useless-escape  -- needed for informative console.logs and console.errors */

/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-call -- lack of typing in Z3 package */

import {splitAroundOperator} from './check-arith-law-call-validity';
import {handleDispatch} from './z3-arith-funcs';
import type {
	ArithObjType,
	ImpliesPartExpr,
	SplitOperatorType,
	SplitReturnObjType,
} from '@/models/hoare-law-z3-models';

async function handleDelimiterArith(
	arithObj: ArithObjType,
): Promise<boolean | undefined> {
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

	function findOperator(input: string): SplitOperatorType | undefined {
		const operatorRegex = /\s*(>=|<=|=|>|<)\s*/;
		const match = operatorRegex.exec(input);

		return match ? (match[1].trim() as SplitOperatorType) : undefined;
	}

	const {expr1, expr2} = arithObj; // Expr1 and expr2 will contain only one of the following operators respectively: '=', '>', '<', '<=', '>=' within each sub-expression, i.e. 'x=1 /\ y=2' or 'x>1 /\ y>3'

	// Get arrays containing the expressions needing verifying
	const expr1Arr = getDelimitedExpressions(expr1); // [x=1, y>1, ...]
	const expr2Arr = getDelimitedExpressions(expr2); // [x=1, y>1, ...]

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

	// Getting the operators which splits the value from its variable declaration in each expression, from expr1Arr and expr2Arr and formatting with their variable names and corresponding values into arrs to pass to handleZ3Logic func

	const beforeImpliesExprArr: SplitReturnObjType[] = [];
	const afterImpliesExprArr: SplitReturnObjType[] = [];

	for (const expression of expr1Arr) {
		const currentExprOperator: SplitOperatorType | undefined =
			findOperator(expression);
		if (currentExprOperator === undefined) {
			console.error(
				'operator in expr1Arr expression is not acceptable, i.e. not one of "=", ">", "<", "<=", ">=" ',
			);
			return false;
		}

		const currentImpliesExpr: SplitReturnObjType = splitAroundOperator(
			expression,
			currentExprOperator,
		);

		const {variable, operator, variableValue} = currentImpliesExpr;

		if (variable === '' || operator === '' || variableValue === '') {
			console.error(
				"splitReturnObj returned '' for either variable, operator or variableValue",
			);
			return false;
		}

		beforeImpliesExprArr.push({
			variable,
			operator: currentExprOperator,
			variableValue,
		});
	}

	for (const expression of expr2Arr) {
		const currentExprOperator: SplitOperatorType | undefined =
			findOperator(expression);
		if (currentExprOperator === undefined) {
			console.error(
				'operator in expr1Arr expression is not acceptable, i.e. not one of "=", ">", "<", "<=", ">=" ',
			);
			return false;
		}

		const currentImpliesExpr: SplitReturnObjType = splitAroundOperator(
			expression,
			currentExprOperator,
		);

		const {variable, operator, variableValue} = currentImpliesExpr;

		if (variable === '' || operator === '' || variableValue === '') {
			console.error(
				"splitReturnObj returned '' for either variable, operator or variableValue",
			);
			return false;
		}

		afterImpliesExprArr.push({
			variable,
			operator: currentExprOperator,
			variableValue,
		});
	}

	console.log(
		"operators in expr1Arr and expr2Arr in implies statement respectively are valid, i.e. one of the following: '=', '>', '<', '<=', '>='",
	);

	// Get the variable in each expression, e.g. 'x' from 'x=1', and add to array for respective side of implies statement for comparison to check all variables on lhs referenced on rhs. a False value is returned otherwise

	// 1). Access and return all variable names from each of above arrays respectively

	const allLhsVariableNames: string[] = beforeImpliesExprArr.map(
		(exprObj: SplitReturnObjType) => {
			return exprObj.variable;
		},
	);

	const allRhsVariableNames: string[] = afterImpliesExprArr.map(
		(exprObj: SplitReturnObjType) => {
			return exprObj.variable;
		},
	);

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

	// Removing unneeded 'variable' property from each object and renaming variableValue prop as value in beforeImpliesExprArr and afterImpliesExprArr

	const transformedBeforeImpliesArr = beforeImpliesExprArr.map(
		({variable, variableValue, ...rest}) => ({
			...rest,
			value: variableValue,
		}),
	) as ImpliesPartExpr[];

	const transformedAfterImpliesArr = afterImpliesExprArr.map(
		({variable, variableValue, ...rest}) => ({
			...rest,
			value: variableValue,
		}),
	) as ImpliesPartExpr[];

	// Dispatching to Z3 to check satisfiability of overall implication statement
	const dispatchResult: boolean = await handleDispatch(
		transformedBeforeImpliesArr,
		transformedAfterImpliesArr,
	);

	if (!dispatchResult) {
		console.log('sat checker of arith law returned invalid result');
		return false;
	}

	console.log('sat checker of arith law returned valid result');
	return true;
}

export {handleDelimiterArith};
