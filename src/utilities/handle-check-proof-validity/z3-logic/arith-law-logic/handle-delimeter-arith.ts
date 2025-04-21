/* eslint-disable no-useless-escape  -- needed for informative console.logs and console.errors */

/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-call -- lack of typing in Z3 package */

import {splitAroundOperator} from './check-arith-law-call-validity';
import {handleHskipDispatch, handleHassignDispatch} from './z3-arith-funcs';
import {type LawTypeHoare} from '@/models/misc';
import type {
	ArithObjType,
	ImpliesPartExpr,
	SplitOperatorType,
	SplitReturnObjType,
} from '@/models/hoare-law-z3-models';

type HskipDispatchProps = [ImpliesPartExpr[], ImpliesPartExpr[]];

type HassignDispatchProps = [ImpliesPartExpr[], ArithObjType];

type DispatchPropsType = HskipDispatchProps | HassignDispatchProps;

async function handleDelimiterArith(
	arithObj: ArithObjType,
	tripleLaw: LawTypeHoare,
): Promise<boolean | undefined> {
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

	function checkAppropiateLengthVars(
		tripleLaw: LawTypeHoare,
		expr2Arr: string[],
	): boolean {
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

		if (
			!arraysHaveMatchingVariables(allLhsVariableNames, allRhsVariableNames)
		) {
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

	function assignBeforeImpliesEntries(
		beforeImpliesExprArr: SplitReturnObjType[],
		expr1Arr: string[],
	): true | undefined {
		for (const expression of expr1Arr) {
			const currentExprOperator: SplitOperatorType | undefined =
				findOperator(expression);
			if (currentExprOperator === undefined) {
				console.error(
					'operator in expr1Arr expression is not acceptable, i.e. not one of "=", ">", "<", "<=", ">=" ',
				);
				return;
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
				return;
			}

			beforeImpliesExprArr.push({
				variable,
				operator: currentExprOperator,
				variableValue,
			});
		}

		return true;
	}

	function assignAfterImpliesEntries(
		afterImpliesExprArr: SplitReturnObjType[],
		expr2Arr: string[],
	): true | undefined {
		for (const expression of expr2Arr) {
			const currentExprOperator: SplitOperatorType | undefined =
				findOperator(expression);
			if (currentExprOperator === undefined) {
				console.error(
					'operator in expr1Arr expression is not acceptable, i.e. not one of "=", ">", "<", "<=", ">=" ',
				);
				return;
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
				return;
			}

			afterImpliesExprArr.push({
				variable,
				operator: currentExprOperator,
				variableValue,
			});
		}

		return true;
	}

	async function handleDispatch(
		dispatchProps: DispatchPropsType,
		tripleLaw: LawTypeHoare,
	): Promise<boolean> {
		const props = dispatchProps;
		let dispatchResult: boolean;

		if (tripleLaw === 'hskip') {
			dispatchResult = await handleHskipDispatch(
				...(props as HskipDispatchProps),
			);
		} else if (tripleLaw === 'hassign') {
			dispatchResult = await handleHassignDispatch(
				...(props as HassignDispatchProps),
			);
		} else {
			console.error('tripleLaw is not one of hskip or hassign');
			dispatchResult = false;
		}

		return dispatchResult;
	}

	const {expr1, expr2} = arithObj; // Expr1 and expr2 will contain only one of the following operators respectively: '=', '>', '<', '<=', '>=' within each sub-expression, i.e. 'x=1 /\ y=2' or 'x>1 /\ y>3'

	const expr1Arr: string[] = getDelimitedExpressions(expr1); // [x=1, y>1, ...]
	const expr2Arr: string[] = []; // [x=1, y>1, ...]

	// Get arrays containing the expressions needing verifying

	if (tripleLaw === 'hskip') {
		expr2Arr.push(...getDelimitedExpressions(expr2 as string)); // [x=1, y>1, ...]
	}

	const hasAppropiateNumVars: boolean = checkAppropiateLengthVars(
		tripleLaw,
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

	let dispatchProps: DispatchPropsType;

	if (tripleLaw === 'hskip') {
		dispatchProps = [transformedBeforeImpliesArr, transformedAfterImpliesArr];
	} else if (tripleLaw === 'hassign') {
		dispatchProps = [transformedBeforeImpliesArr, arithObj];
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
