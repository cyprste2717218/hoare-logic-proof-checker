/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */

import {initialiseContext} from '../initialise-z3-funcs';
import {
	handleCreateExprValues,
	handleCreateOperators,
	handleCreateVariableNames,
} from '../handle-create-construct-funcs';
import {processConstructs} from '../arith-law-z3-logic/process-constructs';
import {
	constructImpliesExpr,
	fetchConstraints,
} from '../arith-law-z3-logic/z3-arith-funcs';
import {checkSatResult} from '../arith-law-z3-logic/check-sat-result';
import {tracker} from '../z3-variable-tracker-class';
import {type LawTypeHoare} from '@/models/misc';
import {
	type ConstraintPropsType,
	type CreatedOperatorsType,
	type CreatedValuesType,
	type CreatedVariableNamesType,
	type ExprOperatorTypes,
	type ExprValueTypes,
	type ExprVarNameTypes,
	type FetchConstraintsPropsType,
	type SplitReturnObjType,
} from '@/models/hoare-law-z3-models';

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
	} = processConstructs(
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

export {handleHskipDispatch};
