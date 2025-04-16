/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/restrict-template-expressions -- lack of typing in Z3 package */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {type SplitReturnObjType} from '@/models/hoare-law-z3-models';

async function initialiseContext() {
	const {Context} = await init();

	// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
	const {Int, And, Solver, Implies} = new Context('main');

	return [Int, And, Solver, Implies];
}

function checkSatResult({
	result,
	solver,
	firstExprValueLhs,
	secondExprValueLhs,
	thirdExprValueLhs,
}: {
	result: any;
	solver: any;
	firstExprValueLhs: number;
	secondExprValueLhs: number;
	thirdExprValueLhs?: number;
}): boolean {
	console.log('sat result overall is:', result);
	if (result === 'sat') {
		const model = solver.model();
		const declarations = model.decls();

		const modelValues: {
			xValue: undefined | string;
			yValue: undefined | string;
			zValue: undefined | string;
		} = {
			xValue: undefined,
			yValue: undefined,
			zValue: undefined,
		};
		// Logging values satisfying z3 stack to console

		modelValues.xValue =
			declarations[0].name() === 'x'
				? model.get(declarations[0]).asString()
				: undefined;
		console.log('model xValue:', modelValues.xValue);
		modelValues.yValue =
			declarations[1].name() === 'y'
				? model.get(declarations[1]).asString()
				: undefined;
		console.log('model yValue:', modelValues.yValue);

		if (declarations.length === 3) {
			modelValues.zValue =
				declarations[2].name() === 'z'
					? model.get(declarations[2]).asString()
					: undefined;
			console.log('model zValue:', modelValues.zValue);
		}

		// Check xValue, yValue and zValue found to satisfy constraints are the same as rightExpr1 and rightExpr2

		const checkConditional: boolean =
			Number(modelValues.xValue) === firstExprValueLhs &&
			Number(modelValues.yValue) === secondExprValueLhs;

		if (modelValues.zValue) {
			return (
				checkConditional && Number(modelValues.zValue) === thirdExprValueLhs
			);
		}

		if (!checkConditional) {
			console.error(
				"Error: Values discovered to satisfy constraints for arith law call in skip law call proof don't match ones passed to method, hence not a display of validity in this instance",
			);
			return false;
		}

		return checkConditional;
	}

	return false;
}

async function addVariableConstraint(
	variableName: 'x' | 'y' | 'z',
	value: number,
	Int: any,
	And: any,
	solver: any,
): Promise<any | false> {
	async function addVariableConstraintX(value: number): Promise<boolean> {
		const x = Int.const('x');
		const constraint = And(x.gt(value - 1), x.lt(value + 1));
		return constraint;
	}

	async function addVariableConstraintY(value: number): Promise<boolean> {
		const y = Int.const('y');
		const constraint = And(y.gt(value - 1), y.lt(value + 1));
		return constraint;
	}

	async function addVariableConstraintZ(value: number): Promise<boolean> {
		const z = Int.const('z');
		const constraint = And(z.gt(value - 1), z.lt(value + 1));
		return constraint;
	}

	let addConstraint;

	// Handle Z3 constant variable to create
	switch (variableName) {
		case 'x': {
			addConstraint = await addVariableConstraintX(value);
			break;
		}

		case 'y': {
			addConstraint = await addVariableConstraintY(value);
			break;
		}

		case 'z': {
			addConstraint = await addVariableConstraintZ(value);
			break;
		}
	}

	solver.add(addConstraint);

	const result = await solver.check();

	if (result === 'sat') {
		console.log(`Constraint added for ${variableName}: ${value}`);
		return addConstraint;
	}

	console.error(`Error adding constraint for ${variableName}: ${value}`);
	return false;
	// Could do with sending message about needing to refresh the page to re-try adding all assertions to z3 stack again due to error encountered
}

async function constructImpliesExpr(
	And: any,
	constraints: any[],
	solver: any,
): Promise<false | any> {
	let impliesExprResult;

	if (constraints.length === 2) {
		impliesExprResult = And(constraints[0], constraints[1]).eq(true);
	} else if (constraints.length === 3) {
		impliesExprResult = And(constraints[0], constraints[1], constraints[2]).eq(
			true,
		);
	}

	solver.add(impliesExprResult);

	const result = await solver.check();

	if (result === 'sat') {
		console.log(
			`Assertion added for implies statement with constraints: ${constraints}`,
		);
		return impliesExprResult;
	}

	console.error(`Error adding assertion for implies statement: ${constraints}`);
	return false;
	// Could do with sending message about needing to refresh the page to re-try adding all assertions to z3 stack again due to error encountered
}

async function constructFinalAssertion(
	Implies: any,
	solver: any,
	beforeImpliesExpr: any,
	afterImpliesExpr: any,
) {
	const result = Implies(beforeImpliesExpr, afterImpliesExpr).eq(true);
	solver.add(result);
	return result;
}

async function handleLengthTwoExpr(
	allLhsExpressionPartsArr: SplitReturnObjType[],
	allRhsExpressionPartsArr: SplitReturnObjType[],
): Promise<boolean> {
	const [Int, And, Solver, Implies] = await initialiseContext();

	const solver = new Solver();
	const constraintProps: [any, any, any] = [Int, And, solver];

	const [firstExprValueLhs, secondExprValueLhs] = allLhsExpressionPartsArr.map(
		(expr) => Number(expr.variableValue),
	);
	const [firstExprValueRhs, secondExprValueRhs] = allRhsExpressionPartsArr.map(
		(expr) => Number(expr.variableValue),
	);

	const [lhsConstraintX, lhsConstraintY, rhsConstraintX, rhsConstraintY] =
		await Promise.all([
			addVariableConstraint('x', firstExprValueLhs, ...constraintProps),
			addVariableConstraint('y', secondExprValueLhs, ...constraintProps),
			addVariableConstraint('x', firstExprValueRhs, ...constraintProps),
			addVariableConstraint('y', secondExprValueRhs, ...constraintProps),
		]);

	const beforeImpliesConstraints = [lhsConstraintX, lhsConstraintY];
	const beforeImpliesExpr = await constructImpliesExpr(
		And,
		beforeImpliesConstraints,
		solver,
	);
	if (beforeImpliesExpr === false) {
		return false;
	}

	const afterImpliesConstraints = [rhsConstraintX, rhsConstraintY];
	const afterImpliesExpr = await constructImpliesExpr(
		And,
		afterImpliesConstraints,
		solver,
	);
	if (afterImpliesExpr === false) {
		return false;
	}

	// Concatenate all variables with their constraints in a Z3 And function, add that assertion to the Z3 stack and determine whether or not skip law triple (hskip) is valid or not

	const allAssertions: [any, any, any, any] = [
		Implies,
		solver,
		beforeImpliesExpr,
		afterImpliesExpr,
	];

	const finalAssertion = await constructFinalAssertion(...allAssertions);
	solver.add(finalAssertion);

	console.log('final assertion added in handleLengthTwoExpr');
	console.log(
		'checking satisfiability of z3 stack for constructed proof overall',
	);
	const result = await solver.check();

	const isSatProps: [any, any, number, number] = [
		result,
		solver,
		firstExprValueLhs,
		secondExprValueLhs,
	];

	const isSat = checkSatResult({
		result: isSatProps[0],
		solver: isSatProps[1],
		firstExprValueLhs: isSatProps[2],
		secondExprValueLhs: isSatProps[3],
	});

	return isSat;
}

async function handleLengthThreeExpr(
	allLhsExpressionPartsArr: SplitReturnObjType[],
	allRhsExpressionPartsArr: SplitReturnObjType[],
): Promise<boolean> {
	const [Int, And, Solver, Implies] = await initialiseContext();

	const solver = new Solver();
	const constraintProps: [any, any, any] = [Int, And, solver];

	const [firstExprValueLhs, secondExprValueLhs, thirdExprValueLhs] =
		allLhsExpressionPartsArr.map((expr) => Number(expr.variableValue));
	const [firstExprValueRhs, secondExprValueRhs, thirdExprValueRhs] =
		allRhsExpressionPartsArr.map((expr) => Number(expr.variableValue));

	const [
		lhsConstraintX,
		lhsConstraintY,
		lhsConstraintZ,
		rhsConstraintX,
		rhsConstraintY,
		rhsConstraintZ,
	] = await Promise.all([
		addVariableConstraint('x', firstExprValueLhs, ...constraintProps),
		addVariableConstraint('y', secondExprValueLhs, ...constraintProps),
		addVariableConstraint('z', thirdExprValueLhs, ...constraintProps),
		addVariableConstraint('x', firstExprValueRhs, ...constraintProps),
		addVariableConstraint('y', secondExprValueRhs, ...constraintProps),
		addVariableConstraint('z', thirdExprValueRhs, ...constraintProps),
	]);

	const beforeImpliesConstraints = [
		lhsConstraintX,
		lhsConstraintY,
		lhsConstraintZ,
	];
	const afterImpliesConstraints = [
		rhsConstraintX,
		rhsConstraintY,
		rhsConstraintZ,
	];

	const beforeImpliesExpr = await constructImpliesExpr(
		And,
		beforeImpliesConstraints,
		solver,
	);
	if (beforeImpliesExpr === false) {
		return false;
	}

	const afterImpliesExpr = await constructImpliesExpr(
		And,
		afterImpliesConstraints,
		solver,
	);
	if (afterImpliesExpr === false) {
		return false;
	}

	// Concatenate all variables with their constraints in a Z3 And function, add that assertion to the Z3 stack and determine whether or not skip law triple (hskip) is valid or not

	const allAssertions: [any, any, any, any] = [
		Implies,
		solver,
		beforeImpliesExpr,
		afterImpliesExpr,
	];

	const finalAssertion = await constructFinalAssertion(...allAssertions);
	solver.add(finalAssertion);

	console.log('final assertion added in handleLengthThreeExpr');
	console.log(
		'checking satisfiability of z3 stack for constructed proof overall',
	);
	const result = await solver.check();

	const isSatProps: [any, any, number, number, number] = [
		result,
		solver,
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
	];

	const isSat = checkSatResult({
		result: isSatProps[0],
		solver: isSatProps[1],
		firstExprValueLhs: isSatProps[2],
		secondExprValueLhs: isSatProps[3],
	});

	return isSat;
}

export {handleLengthTwoExpr, handleLengthThreeExpr};
