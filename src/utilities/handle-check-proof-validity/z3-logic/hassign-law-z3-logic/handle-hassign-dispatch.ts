/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */

import {checkSatResult} from '../arith-law-z3-logic/check-sat-result';
import {initialiseContext} from '../initialise-z3-funcs';
import {
	handleCreateExprValues,
	handleCreateOperators,
	handleCreateVariableNames,
} from '../handle-create-construct-funcs';
import {tracker} from '../z3-variable-tracker-class';
import {
	constructImpliesExpr,
	fetchConstraints,
} from '../arith-law-z3-logic/z3-arith-funcs';
import {processConstructs} from '../arith-law-z3-logic/process-constructs';
import {handleEquationCompose} from './handle-equation-compose';
import {type LawTypeHoare} from '@/models/misc';
import {
	type ArithObjType,
	type ConstraintPropsType,
	type CreatedOperatorsType,
	type CreatedValuesType,
	type CreatedVariableNamesType,
	type ExprOperatorLhsTypes,
	type ExprValueLhsTypes,
	type ExprVarNameLhsTypes,
	type FetchConstraintsPropsLhsType,
	type SplitReturnObjType,
} from '@/models/hoare-law-z3-models';

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
	} = processConstructs(lhsValues, lhsOperators, lhsVarNames);

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

export {handleHassignDispatch};
