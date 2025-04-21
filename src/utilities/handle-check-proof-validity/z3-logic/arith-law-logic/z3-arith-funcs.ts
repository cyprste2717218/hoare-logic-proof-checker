/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/restrict-template-expressions -- lack of typing in Z3 package */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {checkSatResult} from './check-sat-result';
import {addVariableConstraint} from './add-variable-constraint';
import {
	type ArithObjType,
	type ImpliesPartExpr,
	type SplitOperatorType,
} from '@/models/hoare-law-z3-models';
import {type LawTypeHoare} from '@/models/misc';

type ConstraintPropsType = {
	Int: any;
	And: any;
	Not: any;
	solver: any;
};

type ExprValueLhsTypes = {
	firstExprValueLhs: number | undefined;
	secondExprValueLhs: number | undefined;
	thirdExprValueLhs: number | undefined;
};

type ExprValueRhsTypes = {
	firstExprValueRhs: number | undefined;
	secondExprValueRhs: number | undefined;
	thirdExprValueRhs: number | undefined;
};

type ExprValueTypes = ExprValueLhsTypes & ExprValueRhsTypes;

type ExprOperatorLhsTypes = {
	firstLhsOperator: SplitOperatorType | undefined;
	secondLhsOperator: SplitOperatorType | undefined;
	thirdLhsOperator: SplitOperatorType | undefined;
};

type ExprOperatorRhsTypes = {
	firstRhsOperator: SplitOperatorType | undefined;
	secondRhsOperator: SplitOperatorType | undefined;
	thirdRhsOperator: SplitOperatorType | undefined;
};

type ExprOperatorTypes = ExprOperatorLhsTypes & ExprOperatorRhsTypes;

type FetchConstraintsPropsLhsType = {
	constraintProps: ConstraintPropsType;
} & ExprValueLhsTypes &
	ExprOperatorLhsTypes;

type FetchConstraintsPropsType = {
	constraintProps: ConstraintPropsType;
} & ExprValueTypes &
	ExprOperatorTypes;

type ExpressionValues = {
	firstExprValueLhs?: number;
	secondExprValueLhs?: number;
	thirdExprValueLhs?: number;
	firstExprValueRhs?: number;
	secondExprValueRhs?: number;
	thirdExprValueRhs?: number;
	firstLhsOperator?: SplitOperatorType;
	secondLhsOperator?: SplitOperatorType;
	thirdLhsOperator?: SplitOperatorType;
	firstRhsOperator?: SplitOperatorType;
	secondRhsOperator?: SplitOperatorType;
	thirdRhsOperator?: SplitOperatorType;
};

type CreatedOperatorsType =
	| {lhsOperators: SplitOperatorType[]; rhsOperators?: SplitOperatorType[]}
	| undefined;

type CreatedValuesType =
	| {lhsValues: number[]; rhsValues: number[]}
	| {lhsValues: number[]; rhsValues?: undefined}
	| undefined;

let z3Context: any = null;

async function fetchConstraints(
	fetchedConstraintsProps:
		| FetchConstraintsPropsType
		| FetchConstraintsPropsLhsType,
) {
	const {constraintProps} = fetchedConstraintsProps;

	const {
		firstExprValueLhs,
		firstExprValueRhs,
		secondExprValueLhs,
		secondExprValueRhs,
		thirdExprValueLhs,
		thirdExprValueRhs,
		firstLhsOperator,
		firstRhsOperator,
		secondLhsOperator,
		secondRhsOperator,
		thirdLhsOperator,
		thirdRhsOperator,
	} = isFetchConstraintsPropsType(fetchedConstraintsProps)
		? fetchedConstraintsProps
		: {
				firstExprValueLhs: undefined,
				firstExprValueRhs: undefined,
				secondExprValueLhs: undefined,
				secondExprValueRhs: undefined,
				thirdExprValueLhs: undefined,
				thirdExprValueRhs: undefined,
				firstLhsOperator: undefined,
				firstRhsOperator: undefined,
				secondLhsOperator: undefined,
				secondRhsOperator: undefined,
				thirdLhsOperator: undefined,
				thirdRhsOperator: undefined,
			};

	// Type guard function
	function isFetchConstraintsPropsType(
		props: FetchConstraintsPropsType | FetchConstraintsPropsLhsType,
	): props is FetchConstraintsPropsType {
		return 'firstExprValueRhs' in props;
	}

	const fetchedConstraints = await Promise.all([
		firstExprValueLhs && firstLhsOperator
			? addVariableConstraint({
					variableName: 'x',
					operator: firstLhsOperator,
					value: firstExprValueLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		firstExprValueRhs && firstRhsOperator
			? addVariableConstraint({
					variableName: 'x',
					operator: firstRhsOperator,
					value: firstExprValueRhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		secondExprValueLhs && secondLhsOperator
			? addVariableConstraint({
					variableName: 'y',
					operator: secondLhsOperator,
					value: secondExprValueLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		secondExprValueRhs && secondRhsOperator
			? addVariableConstraint({
					variableName: 'y',
					operator: secondRhsOperator,
					value: secondExprValueRhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		thirdExprValueLhs && thirdLhsOperator
			? addVariableConstraint({
					variableName: 'z',
					operator: thirdLhsOperator,
					value: thirdExprValueLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		thirdExprValueRhs && thirdRhsOperator
			? addVariableConstraint({
					variableName: 'z',
					operator: thirdRhsOperator,
					value: thirdExprValueRhs,
					...constraintProps,
				})
			: Promise.resolve(true),
	]);

	return fetchedConstraints;
}

async function getZ3Context() {
	if (!z3Context) {
		const {Context} = await init();

		// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
		z3Context = new Context('main');
	}

	return z3Context;
}

async function initialiseContext() {
	const context = await getZ3Context();

	const {Int, And, Solver, Not, Implies} = context;

	return [Int, And, Solver, Not, Implies];
}

function handleCreateExprValues(
	callingProofLaw: LawTypeHoare,
	beforeImpliesExpr: ImpliesPartExpr[],
	afterImpliesExpr?: ImpliesPartExpr[],
) {
	function handleCreateExprValuesLhs(
		beforeImpliesExpr: ImpliesPartExpr[],
	): number[] {
		const lhsValues = beforeImpliesExpr.map((expr) => Number(expr.value));
		return lhsValues;
	}

	function handleCreateExprValuesRhs(
		afterImpliesExpr: ImpliesPartExpr[],
	): number[] {
		const rhsValues = afterImpliesExpr.map((expr) => Number(expr.value));
		return rhsValues;
	}

	if (callingProofLaw === 'hskip') {
		const lhsValues = handleCreateExprValuesLhs(beforeImpliesExpr);
		const rhsValues = handleCreateExprValuesRhs(afterImpliesExpr!);

		return {lhsValues, rhsValues};
	}

	if (callingProofLaw === 'hassign') {
		const lhsValues = handleCreateExprValuesLhs(beforeImpliesExpr);

		return {lhsValues};
	}

	console.error('callingProofLaw is not a valid value');
	return undefined;
}

function handleCreateOperators(
	callingProofLaw: LawTypeHoare,
	beforeImpliesExpr: ImpliesPartExpr[],
	afterImpliesExpr?: ImpliesPartExpr[],
):
	| {lhsOperators: SplitOperatorType[]; rhsOperators?: SplitOperatorType[]}
	| undefined {
	function handleCreateOperatorsLhs(beforeImpliesExpr: ImpliesPartExpr[]) {
		function createOpers(
			beforeImpliesExpr: ImpliesPartExpr[],
		): SplitOperatorType[] {
			const lhsOperators: SplitOperatorType[] = beforeImpliesExpr.map(
				(expr) => expr.operator,
			);

			return lhsOperators;
		}

		const lhsOperators = createOpers(beforeImpliesExpr);

		return lhsOperators;
	}

	function handleCreateOperatorsRhs(
		afterImpliesExpr: ImpliesPartExpr[],
	): SplitOperatorType[] {
		function createOpers(
			afterImpliesExpr: ImpliesPartExpr[],
		): SplitOperatorType[] {
			const rhsOperators: SplitOperatorType[] = afterImpliesExpr.map(
				(expr) => expr.operator,
			);

			return rhsOperators;
		}

		const rhsOperators = createOpers(afterImpliesExpr);

		return rhsOperators;
	}

	const lhsOperators: SplitOperatorType[] = [];
	const rhsOperators: SplitOperatorType[] = [];

	if (callingProofLaw === 'hskip') {
		lhsOperators.push(...handleCreateOperatorsLhs(beforeImpliesExpr));
		rhsOperators.push(...handleCreateOperatorsRhs(afterImpliesExpr!));

		// Check lhsOperators and rhsOperators length match
		if (lhsOperators.length !== rhsOperators.length) {
			console.error('lhsOperators arr length doesnt match rhsOperators length');
			return;
		}

		return {
			lhsOperators,
			rhsOperators,
		};
	}

	if (callingProofLaw === 'hassign') {
		lhsOperators.push(...handleCreateOperatorsLhs(beforeImpliesExpr));

		return {
			lhsOperators,
		};
	}

	console.error('callingProofLaw is not a valid value');
	return undefined;
}

function processValuesAndOperators(
	lhsValues: number[],
	lhsOperators: SplitOperatorType[],
	rhsValues?: number[],
	rhsOperators?: SplitOperatorType[],
): ExpressionValues {
	const result: ExpressionValues = {};

	// Helper function to safely get array value
	const safeGet = <T>(arr: T[] | undefined, index: number): T | undefined =>
		arr?.[index];

	for (let i = 0; i < 3; i++) {
		if (lhsValues.length > i && lhsOperators.length > i) {
			switch (i) {
				case 0: {
					result.firstExprValueLhs = lhsValues[i];
					result.firstLhsOperator = lhsOperators[i];
					result.firstExprValueRhs = safeGet(rhsValues, i);
					result.firstRhsOperator = safeGet(rhsOperators, i);
					break;
				}

				case 1: {
					result.secondExprValueLhs = lhsValues[i];
					result.secondLhsOperator = lhsOperators[i];
					result.secondExprValueRhs = safeGet(rhsValues, i);
					result.secondRhsOperator = safeGet(rhsOperators, i);
					break;
				}

				case 2: {
					result.thirdExprValueLhs = lhsValues[i];
					result.thirdLhsOperator = lhsOperators[i];
					result.thirdExprValueRhs = safeGet(rhsValues, i);
					result.thirdRhsOperator = safeGet(rhsOperators, i);
					break;
				}

				default: {
					console.error(
						'Error handling processValuesAndOperators func, invalid i value of:',
						i,
					);
				}
			}
		}
	}

	// Remove undefined values
	return Object.fromEntries(
		Object.entries(result).filter(([_, value]) => value !== undefined),
	) as ExpressionValues;
}

async function constructImpliesExpr(
	And: any,
	constraints: any[],
	solver: any,
): Promise<false | any> {
	const impliesExprResult = And(...constraints).eq(true);

	solver.add(impliesExprResult);

	const result = await solver.check();

	if (result === 'sat') {
		console.log(
			`Assertion added combining variable constraints for use in lhs or rhs of implies statement -- constraints are : ${constraints}`,
		);
		return impliesExprResult;
	}

	console.error(
		`Error adding assertion combining variable constraints for use in lhs or rhs of implies statement: ${constraints}`,
	);
	return false;
	// Could do with sending message about needing to refresh the page to re-try adding all assertions to z3 stack again due to error encountered
}

async function handleHskipDispatch(
	beforeImpliesExpr: ImpliesPartExpr[],
	afterImpliesExpr: ImpliesPartExpr[],
): Promise<boolean> {
	const [Int, And, Solver, Not, Implies] = await initialiseContext();

	const solver = new Solver();
	await solver.push();

	const constraintProps: ConstraintPropsType = {Int, And, Not, solver};

	// To-do: simplify this into a type alias etc.
	const createdOperators: CreatedOperatorsType = handleCreateOperators(
		'hskip',
		beforeImpliesExpr,
		afterImpliesExpr,
	);

	// Error checking on operators created for use in hskip proof logic
	if (!createdOperators) {
		console.error('createdOperators are undefined in handleHskipDispatch');
		return false;
	}

	if (!createdOperators.rhsOperators) {
		console.error(
			'createdOperators.rhsOperators is undefined in handleHskipDispatch',
		);
		return false;
	}

	// No errors so destructure lhsOperators and rhsOperators
	const {lhsOperators, rhsOperators} = createdOperators;

	const createdValues: CreatedValuesType = handleCreateExprValues(
		'hskip',
		beforeImpliesExpr,
		afterImpliesExpr,
	);

	// Error checking on values created for use in hskip proof logic

	if (!createdValues) {
		console.error('createdValues are undefined in handleHskipDispatch');
		return false;
	}

	if (!createdValues.rhsValues) {
		console.error(
			'createdValues.rhsValues is undefined in handleHskipDispatch',
		);
		return false;
	}

	// No errors so destructure lhsValues and rhsValues
	const {lhsValues, rhsValues} = createdValues;

	let fetchedConstraints: [any, any, any, any, any, any] = [
		true,
		true,
		true,
		true,
		true,
		true,
	];

	const {
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
		firstExprValueRhs,
		secondExprValueRhs,
		thirdExprValueRhs,
		firstLhsOperator,
		secondLhsOperator,
		thirdLhsOperator,
		firstRhsOperator,
		secondRhsOperator,
		thirdRhsOperator,
	} = processValuesAndOperators(
		lhsValues,
		lhsOperators,
		rhsValues,
		rhsOperators,
	);

	const exprValues: ExprValueLhsTypes & ExprValueRhsTypes = {
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
		firstExprValueRhs,
		secondExprValueRhs,
		thirdExprValueRhs,
	};

	const operators: ExprOperatorTypes = {
		firstLhsOperator,
		secondLhsOperator,
		thirdLhsOperator,
		firstRhsOperator,
		secondRhsOperator,
		thirdRhsOperator,
	};
	const fetchedConstraintsProps: FetchConstraintsPropsType = {
		constraintProps,
		...exprValues,
		...operators,
	};
	fetchedConstraints = await fetchConstraints(fetchedConstraintsProps);

	if (fetchedConstraints === undefined) {
		console.error('fetchedConstraints is undefined');
		return false;
	}

	let lhsConstraintX;
	let lhsConstraintY;
	let lhsConstraintZ;
	let rhsConstraintX;
	let rhsConstraintY;
	let rhsConstraintZ;

	if (fetchedConstraints.length >= 2) {
		lhsConstraintX = fetchedConstraints[0];
		rhsConstraintX = fetchedConstraints[1];
	}

	if (fetchedConstraints.length >= 4) {
		lhsConstraintY = fetchedConstraints[2];
		rhsConstraintY = fetchedConstraints[3];
	}

	if (fetchedConstraints.length === 6) {
		lhsConstraintZ = fetchedConstraints[4];
		rhsConstraintZ = fetchedConstraints[5];
	}

	const beforeImpliesConstraints = [
		lhsConstraintX,
		lhsConstraintY,
		lhsConstraintZ,
	].filter((constraint) => constraint !== undefined);

	const afterImpliesConstraints = [
		rhsConstraintX,
		rhsConstraintY,
		rhsConstraintZ,
	].filter((constraint) => constraint !== undefined);

	const beforeImplies = await constructImpliesExpr(
		And,
		beforeImpliesConstraints,
		solver,
	);
	if (beforeImplies === false) {
		return false;
	}

	const afterImplies = await constructImpliesExpr(
		And,
		afterImpliesConstraints,
		solver,
	);
	if (afterImplies === false) {
		return false;
	}

	try {
		solver.add(Implies(beforeImplies, afterImplies).eq(true));
		console.log('final assertion added in handleDispatch');
		console.log(
			'checking satisfiability of z3 stack for constructed proof overall',
		);
		const result = await solver.check();

		const isSatProps: [
			any,
			any,
			ImpliesPartExpr[],
			ImpliesPartExpr[],
			LawTypeHoare,
		] = [result, solver, beforeImpliesExpr, afterImpliesExpr, 'hskip'];

		const isSat = checkSatResult({
			result: isSatProps[0],
			solver: isSatProps[1],
			beforeImpliesExpr: isSatProps[2],
			afterImpliesExpr: isSatProps[3],
			tripleLaw: isSatProps[4],
		});

		return isSat;
	} finally {
		await solver.pop();
	}
}

async function handleHassignDispatch(
	beforeImpliesExpr: ImpliesPartExpr[],
	arithObj: ArithObjType,
): Promise<boolean> {
	// Set constraints for all lhs variables

	// handle arithObj

	const [Int, And, Solver, Not, Implies] = await initialiseContext();

	const solver = new Solver();
	await solver.push();

	const constraintProps: ConstraintPropsType = {Int, And, Not, solver};
	// --------------------------
	// handling creating operators
	// --------------------------
	const createdOperators: CreatedOperatorsType = handleCreateOperators(
		'hassign',
		beforeImpliesExpr,
	);

	// - Error checking on operators created for use in hassign proof logic
	if (!createdOperators) {
		console.error('createdOperators are undefined in handleHassignDispatch');
		return false;
	}

	// - No errors so destructure lhsOperators
	const {lhsOperators} = createdOperators;

	// --------------------------
	// handling creating values
	// --------------------------

	const createdValues: CreatedValuesType = handleCreateExprValues(
		'hassign',
		beforeImpliesExpr,
	);

	// - Error checking on values created for use in hskip proof logic
	if (!createdValues) {
		console.error('createdValues are undefined in handleHassignDispatch');
		return false;
	}

	// - No errors so destructure lhsValues and rhsValues
	const {lhsValues} = createdValues;

	let fetchedConstraints: [any, any, any, undefined, undefined, undefined] = [
		true,
		true,
		true,
		undefined,
		undefined,
		undefined,
	];

	const {
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
		firstLhsOperator,
		secondLhsOperator,
		thirdLhsOperator,
	} = processValuesAndOperators(lhsValues, lhsOperators);

	const exprValues: ExprValueLhsTypes = {
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
	};

	const operators: ExprOperatorLhsTypes = {
		firstLhsOperator,
		secondLhsOperator,
		thirdLhsOperator,
	};
	const fetchedConstraintsProps: FetchConstraintsPropsLhsType = {
		constraintProps,
		...exprValues,
		...operators,
	};
	fetchedConstraints = await fetchConstraints(fetchedConstraintsProps);

	if (fetchedConstraints === undefined) {
		console.error('fetchedConstraints is undefined');
		return false;
	}

	return false;
}

export {handleHskipDispatch, handleHassignDispatch};
