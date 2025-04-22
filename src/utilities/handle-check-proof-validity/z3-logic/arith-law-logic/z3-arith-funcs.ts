/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/restrict-template-expressions -- lack of typing in Z3 package */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {handleEquationCompose} from '../hassign-law-logic/handle-equation-compose';
import {tracker} from '../z3-variable-tracker-class';
import {checkSatResult} from './check-sat-result';
import {addVariableConstraint} from './add-variable-constraint';
import {
	handleCreateExprValues,
	handleCreateOperators,
	handleCreateVariableNames,
} from './handle-create-construct-funcs';
import {
	type SplitReturnObjType,
	type ArithObjType,
	type SplitOperatorType,
	Z3Variable,
	type FetchConstraintsPropsType,
	type ConstraintPropsType,
	type CreatedOperatorsType,
	type CreatedValuesType,
	type CreatedVariableNamesType,
	type ExpressionValues,
	type FetchConstraintsPropsLhsType,
	ModelValuesType,
	VariableDictionary,
	type ExprVarNameTypes,
	type ExprValueTypes,
	type ExprOperatorTypes,
	type ExprVarNameLhsTypes,
	type ExprValueLhsTypes,
	type ExprOperatorLhsTypes,
} from '@/models/hoare-law-z3-models';
import {type LawTypeHoare} from '@/models/misc';

let z3Context: any = null;

async function fetchConstraints(
	fetchedConstraintsProps:
		| FetchConstraintsPropsType
		| FetchConstraintsPropsLhsType,
) {
	const {constraintProps} = fetchedConstraintsProps;

	// Extract all values, using type guard to determine which properties to include
	const {
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
		firstLhsOperator,
		secondLhsOperator,
		thirdLhsOperator,
		firstExprVarNameLhs,
		secondExprVarNameLhs,
		thirdExprVarNameLhs,
	} = fetchedConstraintsProps;

	// Type guard function
	function isFetchConstraintsPropsType(
		props: FetchConstraintsPropsType | FetchConstraintsPropsLhsType,
	): props is FetchConstraintsPropsType {
		return 'firstExprValueRhs' in props;
	}

	// Get RHS values only if the type is FetchConstraintsPropsType
	const {
		firstExprValueRhs,
		secondExprValueRhs,
		thirdExprValueRhs,
		firstRhsOperator,
		secondRhsOperator,
		thirdRhsOperator,
		firstExprVarNameRhs,
		secondExprVarNameRhs,
		thirdExprVarNameRhs,
	} = isFetchConstraintsPropsType(fetchedConstraintsProps)
		? fetchedConstraintsProps
		: {
				firstExprValueRhs: undefined,
				secondExprValueRhs: undefined,
				thirdExprValueRhs: undefined,
				firstRhsOperator: undefined,
				secondRhsOperator: undefined,
				thirdRhsOperator: undefined,
				firstExprVarNameRhs: undefined,
				secondExprVarNameRhs: undefined,
				thirdExprVarNameRhs: undefined,
			};

	console.log(
		'firstExprValueLhs:',
		firstExprValueLhs,
		'firstLhsOperator:',
		firstLhsOperator,
		'firstExprVarNamLhs:',
		firstExprVarNameLhs,
	);

	const fetchedConstraints = await Promise.all([
		// LHS constraints - these will always be processed
		firstExprValueLhs && firstLhsOperator && firstExprVarNameLhs
			? addVariableConstraint({
					variableName: 'x',
					operator: firstLhsOperator,
					value: firstExprValueLhs,
					realProgramVarName: firstExprVarNameLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		// RHS constraints - these will only be processed if type is FetchConstraintsPropsType
		isFetchConstraintsPropsType(fetchedConstraintsProps) &&
		firstExprValueRhs &&
		firstRhsOperator &&
		firstExprVarNameRhs
			? addVariableConstraint({
					variableName: 'x',
					operator: firstRhsOperator,
					value: firstExprValueRhs,
					realProgramVarName: firstExprVarNameRhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		secondExprValueLhs && secondLhsOperator && secondExprVarNameLhs
			? addVariableConstraint({
					variableName: 'y',
					operator: secondLhsOperator,
					value: secondExprValueLhs,
					realProgramVarName: secondExprVarNameLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		isFetchConstraintsPropsType(fetchedConstraintsProps) &&
		secondExprValueRhs &&
		secondRhsOperator &&
		secondExprVarNameRhs
			? addVariableConstraint({
					variableName: 'y',
					operator: secondRhsOperator,
					value: secondExprValueRhs,
					realProgramVarName: secondExprVarNameRhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		thirdExprValueLhs && thirdLhsOperator && thirdExprVarNameLhs
			? addVariableConstraint({
					variableName: 'z',
					operator: thirdLhsOperator,
					value: thirdExprValueLhs,
					realProgramVarName: thirdExprVarNameLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		isFetchConstraintsPropsType(fetchedConstraintsProps) &&
		thirdExprValueRhs &&
		thirdRhsOperator &&
		thirdExprVarNameRhs
			? addVariableConstraint({
					variableName: 'z',
					operator: thirdRhsOperator,
					value: thirdExprValueRhs,
					realProgramVarName: thirdExprVarNameRhs,
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

function processValuesOperatorsNames(
	lhsValues: number[],
	lhsOperators: SplitOperatorType[],
	lhsVarNames: string[],
	rhsValues?: number[],
	rhsOperators?: SplitOperatorType[],
	rhsVarNames?: string[],
): ExpressionValues {
	const result: ExpressionValues = {};

	// Helper function to safely get array value
	const safeGet = <T>(arr: T[] | undefined, index: number): T | undefined =>
		arr?.[index];

	for (let i = 0; i < 3; i++) {
		if (
			lhsValues.length > i &&
			lhsOperators.length > i &&
			lhsVarNames.length > i
		) {
			switch (i) {
				case 0: {
					result.firstExprValueLhs = lhsValues[i];
					result.firstLhsOperator = lhsOperators[i];
					result.firstExprVarNameLhs = lhsVarNames[i];
					result.firstExprValueRhs = safeGet(rhsValues, i);
					result.firstRhsOperator = safeGet(rhsOperators, i);
					result.firstExprVarNameRhs = safeGet(rhsVarNames, i);
					break;
				}

				case 1: {
					result.secondExprValueLhs = lhsValues[i];
					result.secondLhsOperator = lhsOperators[i];
					result.secondExprVarNameLhs = lhsVarNames[i];
					result.secondExprValueRhs = safeGet(rhsValues, i);
					result.secondRhsOperator = safeGet(rhsOperators, i);
					result.secondExprVarNameRhs = safeGet(rhsVarNames, i);
					break;
				}

				case 2: {
					result.thirdExprValueLhs = lhsValues[i];
					result.thirdLhsOperator = lhsOperators[i];
					result.thirdExprVarNameLhs = lhsVarNames[i];
					result.thirdExprValueRhs = safeGet(rhsValues, i);
					result.thirdRhsOperator = safeGet(rhsOperators, i);
					result.thirdExprVarNameRhs = safeGet(rhsVarNames, i);
					break;
				}

				default: {
					console.error(
						'Error handling processValuesOperatorsNames func, invalid i value of:',
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
	console.log('this is constraints:', constraints);
	console.log('this is impliesExprResult:', impliesExprResult);

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
	beforeImpliesExpr: SplitReturnObjType[],
	afterImpliesExpr: SplitReturnObjType[],
): Promise<boolean> {
	const [Int, And, Solver, Not, Implies] = await initialiseContext();

	const solver = new Solver();
	await solver.push();

	const constraintProps: ConstraintPropsType = {Int, And, Not, solver, tracker};

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

	// --------------------------
	// handling creating variable names
	// --------------------------

	const createdVariableNames: CreatedVariableNamesType =
		handleCreateVariableNames('hassign', beforeImpliesExpr, afterImpliesExpr);

	// - Error checking on variable names created for use in hskip proof logic
	if (!createdVariableNames) {
		console.error('createdVariableNames are undefined in handleHskipDispatch');
		return false;
	}

	// - No errors so destructure lhsValues and rhsValues
	const {lhsVarNames, rhsVarNames} = createdVariableNames;

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
		firstExprVarNameLhs,
		secondExprVarNameLhs,
		thirdExprVarNameLhs,
		firstExprVarNameRhs,
		secondExprVarNameRhs,
		thirdExprVarNameRhs,
	} = processValuesOperatorsNames(
		lhsValues,
		lhsOperators,
		lhsVarNames,
		rhsValues,
		rhsOperators,
		rhsVarNames,
	);

	const exprVariableNames: ExprVarNameTypes = {
		firstExprVarNameLhs,
		secondExprVarNameLhs,
		thirdExprVarNameLhs,
		firstExprVarNameRhs,
		secondExprVarNameRhs,
		thirdExprVarNameRhs,
	};

	const exprValues: ExprValueTypes = {
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
		...exprVariableNames,
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
			SplitReturnObjType[],
			SplitReturnObjType[],
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
	beforeImpliesExpr: SplitReturnObjType[],
	arithObj: ArithObjType,
): Promise<boolean> {
	// Set constraints for all lhs variables

	// handle arithObj

	const [Int, And, Solver, Not, Implies] = await initialiseContext();

	const solver = new Solver();
	await solver.push();

	const constraintProps: ConstraintPropsType = {Int, And, Not, solver, tracker};
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

	// --------------------------
	// handling creating variable names
	// --------------------------

	const createdVariableNames: CreatedVariableNamesType =
		handleCreateVariableNames('hassign', beforeImpliesExpr);

	// - Error checking on variable names created for use in hskip proof logic
	if (!createdVariableNames) {
		console.error(
			'createdVariableNames are undefined in handleHassignDispatch',
		);
		return false;
	}

	// - No errors so destructure lhsVarNames
	const {lhsVarNames} = createdVariableNames;

	let fetchedConstraints: [any, any, any, undefined, undefined, undefined] = [
		true,
		true,
		true,
		undefined,
		undefined,
		undefined,
	];

	console.log(
		'these are lhsValues, lhsOperators and lhsVarNames:',
		lhsValues,
		lhsOperators,
		lhsVarNames,
	);

	const {
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
		firstLhsOperator,
		secondLhsOperator,
		thirdLhsOperator,
		firstExprVarNameLhs,
		secondExprVarNameLhs,
		thirdExprVarNameLhs,
	} = processValuesOperatorsNames(lhsValues, lhsOperators, lhsVarNames);

	const exprVariableNames: ExprVarNameLhsTypes = {
		firstExprVarNameLhs,
		secondExprVarNameLhs,
		thirdExprVarNameLhs,
	};

	console.log('these are exprVariableNames:', exprVariableNames);

	const exprValues: ExprValueLhsTypes = {
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
	};

	console.log('these are exprValues:', exprValues);

	const operators: ExprOperatorLhsTypes = {
		firstLhsOperator,
		secondLhsOperator,
		thirdLhsOperator,
	};

	console.log('these are operators:', operators);

	const fetchedConstraintsProps: FetchConstraintsPropsLhsType = {
		constraintProps,
		...exprValues,
		...operators,
		...exprVariableNames,
	};

	console.log('this is the fetchedConstraintsProps:', fetchedConstraintsProps);
	fetchedConstraints = await fetchConstraints(fetchedConstraintsProps);

	if (fetchedConstraints === undefined) {
		console.error('fetchedConstraints is undefined');
		return false;
	}

	let lhsConstraintX;
	let lhsConstraintY;
	let lhsConstraintZ;

	if (fetchedConstraints.length > 0) {
		lhsConstraintX = fetchedConstraints[0];
	}

	if (fetchedConstraints.length >= 2) {
		lhsConstraintY = fetchedConstraints[1];
	}

	if (fetchedConstraints.length >= 3) {
		lhsConstraintZ = fetchedConstraints[2];
	}

	const beforeImpliesConstraints = [
		lhsConstraintX,
		lhsConstraintY,
		lhsConstraintZ,
	].filter((constraint) => constraint !== undefined);

	console.log('beforeImpliesConstraints:', beforeImpliesConstraints);

	const beforeImplies = await constructImpliesExpr(
		And,
		beforeImpliesConstraints,
		solver,
	);
	if (beforeImplies === false) {
		return false;
	}

	// Get content for afterImplies by calling to handleEquationCompose func

	const afterImplies = await handleEquationCompose(
		arithObj,
		lhsVarNames,
		solver,
		Not,
	);

	if (afterImplies === false) {
		console.error(
			'Discovered counterexample to proof, so not evidence of valid hoare triple assignment proof',
		);
		return false;
	}

	try {
		solver.add(Implies(beforeImplies, afterImplies).eq(true));
		console.log('final assertion added in handleDispatch');
		console.log(
			'checking satisfiability of z3 stack for constructed proof overall',
		);
		const result = await solver.check();

		const isSatProps: [any, any, SplitReturnObjType[], LawTypeHoare] = [
			result,
			solver,
			beforeImpliesExpr,
			'hassign',
		];

		const isSat = checkSatResult({
			result: isSatProps[0],
			solver: isSatProps[1],
			beforeImpliesExpr: isSatProps[2],
			tripleLaw: isSatProps[3],
		});

		return isSat;
	} finally {
		await solver.pop();
	}
}

export {handleHskipDispatch, handleHassignDispatch};
