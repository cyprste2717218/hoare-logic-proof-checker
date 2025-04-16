/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/restrict-template-expressions -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/no-unsafe-argument -- lack of typing in Z3 package */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {
	type ImpliesPartExpr,
	type SplitOperatorType,
} from '@/models/hoare-law-z3-models';

async function initialiseContext() {
	const {Context} = await init();

	// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
	const {Int, And, Solver, Not, Implies} = new Context('main');

	return [Int, And, Solver, Not, Implies];
}

function checkSatResult({
	result,
	solver,
	beforeImpliesExpr,
	afterImpliesExpr,
}: {
	result: any;
	solver: any;
	beforeImpliesExpr: ImpliesPartExpr[];
	afterImpliesExpr: ImpliesPartExpr[];
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

		if (declarations.length === 2) {
			modelValues.yValue =
				declarations[1].name() === 'y'
					? model.get(declarations[1]).asString()
					: undefined;
			console.log('model yValue:', modelValues.yValue);
		}

		if (declarations.length === 3) {
			modelValues.zValue =
				declarations[2].name() === 'z'
					? model.get(declarations[2]).asString()
					: undefined;
			console.log('model zValue:', modelValues.zValue);
		}

		let errorPresent = false;

		let i = 0;

		while (i < beforeImpliesExpr.length) {
			const lhsValue = beforeImpliesExpr[i].value;
			const lhsOperator = beforeImpliesExpr[i].operator;

			const rhsValue = afterImpliesExpr[i].value;
			const rhsOperator = afterImpliesExpr[i].operator;

			// Map through all operators and values

			if (lhsOperator === rhsOperator) {
				let comparisonOperator: string;

				switch (lhsOperator) {
					case '=': {
						comparisonOperator = '=';
						break;
					}

					case '>': {
						comparisonOperator = '>';
						break;
					}

					case '<': {
						comparisonOperator = '<';
						break;
					}

					case '>=': {
						comparisonOperator = '>=';
						break;
					}

					case '<=': {
						comparisonOperator = '<=';
						break;
					}
				}

				// Check xValue found to satisfy constraints is as expected for operator type, i.e. xValue === lhsValue === rhsValue when operator is '=', xValue > lhsValue and xValue > rhsValue when operator is '>' etc.

				const compareOperations = {
					'=': (x: number, y: number) => x === y,
					'>': (x: number, y: number) => x > y,
					'<': (x: number, y: number) => x < y,
					'>=': (x: number, y: number) => x >= y,
					'<=': (x: number, y: number) => x <= y,
				};

				let modelValue = '';

				switch (i) {
					case 0: {
						if (modelValues.xValue) {
							modelValue = modelValues.xValue;
						}

						break;
					}

					case 1: {
						if (modelValues.yValue) {
							modelValue = modelValues.yValue;
						}

						break;
					}

					case 2: {
						if (modelValues.zValue) {
							modelValue = modelValues.zValue;
						}

						break;
					}

					default: {
						console.log(
							`No applicable modelValue to set based on number i of ${i}`,
						);
						errorPresent = true;
					}
				}

				if (modelValue === '') {
					console.log("modelValue was not assigned a value, i.e. ''");
					errorPresent = true;
				}

				if (
					compareOperations[comparisonOperator as SplitOperatorType](
						Number(modelValue),
						Number(lhsValue),
					) &&
					compareOperations[comparisonOperator as SplitOperatorType](
						Number(modelValue),
						Number(rhsValue),
					)
				) {
					console.log('pass');
				} else {
					console.log(
						`model value ${modelValue} returned didnt meet logical constraint for variable`,
					);
					errorPresent = true;
				}
			} else {
				console.log(
					"Error: Values discovered to satisfy constraints for arith law call in skip law call proof don't match ones passed to method, hence not a display of validity in this instance",
				);
				errorPresent = true;
			}

			i++;
		}

		if (errorPresent) {
			console.log(
				'checkSatResult error: model values generated dont match constraints in proof, e.g. xValue = 5 with constraint of x < 3',
			);
			return false;
		}

		return true;
	}

	return false;
}

async function addVariableConstraint(
	variableName: 'x' | 'y' | 'z',
	operator: SplitOperatorType,
	value: number,
	Int: any,
	And: any,
	Not: any,
	solver: any,
): Promise<any | false> {
	async function addVariableConstraintX(
		value: number,
		operator: SplitOperatorType,
		And: any,
		Not: any,
	): Promise<any> {
		const x = Int.const('x');
		const constraint = getConstraint(x, value, operator, And, Not);
		return constraint;
	}

	async function addVariableConstraintY(
		value: number,
		operator: SplitOperatorType,
		And: any,
		Not: any,
	): Promise<any> {
		const y = Int.const('y');
		const constraint = getConstraint(y, value, operator, And, Not);
		return constraint;
	}

	async function addVariableConstraintZ(
		value: number,
		operator: SplitOperatorType,
		And: any,
		Not: any,
	): Promise<any> {
		const z = Int.const('z');
		const constraint = getConstraint(z, value, operator, And, Not);
		return constraint;
	}

	let addConstraint;

	// Handle Z3 constant variable to create
	switch (variableName) {
		case 'x': {
			addConstraint = await addVariableConstraintX(value, operator, And, Not);
			break;
		}

		case 'y': {
			addConstraint = await addVariableConstraintY(value, operator, And, Not);
			break;
		}

		case 'z': {
			addConstraint = await addVariableConstraintZ(value, operator, And, Not);
			break;
		}
	}

	if (addConstraint === false || addConstraint === undefined) {
		console.error(
			'Error constructing logical statements for z3 solver in addVariableConstraint',
		);
		return false;
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

async function getConstraint(
	passedVarName: any,
	value: number,
	operator: SplitOperatorType,
	And: any,
	Not: any,
): Promise<{firstStatement: any}> {
	let firstStatement;

	switch (operator) {
		case '=': {
			firstStatement = And(
				passedVarName.gt(value - 1),
				passedVarName.lt(value + 1),
			).eq(true); // Should be the exact same bounds as in firstStatement
			break;
		}

		case '<': {
			firstStatement = passedVarName.lt(value).eq(true);
			break;
		}

		case '>': {
			firstStatement = passedVarName.gt(value).eq(true);
			break;
		}

		case '<=': {
			firstStatement = Not(passedVarName.gt(value)).eq(true);
			break;
		}

		case '>=': {
			firstStatement = Not(passedVarName.lt(value)).eq(true);
			break;
		}
	}

	return firstStatement;
}

async function constructImpliesExpr(
	And: any,
	constraints: any[],
	solver: any,
): Promise<false | any> {
	const impliesExprResult = And(...constraints).eq(true);

	/* If (constraints.length === 2) {
		impliesExprResult = And(constraints[0], constraints[1]).eq(true);
	} else if (constraints.length === 3) {
		impliesExprResult = And(constraints[0], constraints[1], constraints[2]).eq(
			true,
		);
	} */

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

async function handleDispatch(
	beforeImpliesExpr: ImpliesPartExpr[],
	afterImpliesExpr: ImpliesPartExpr[],
): Promise<boolean> {
	const [Int, And, Solver, Not, Implies] = await initialiseContext();

	const solver = new Solver();
	const constraintProps: [any, any, any, any] = [Int, And, Not, solver];

	let firstExprValueLhs;
	let secondExprValueLhs;
	let thirdExprValueLhs;
	let firstExprValueRhs;
	let secondExprValueRhs;
	let thirdExprValueRhs;
	const lhsValues = beforeImpliesExpr.map((expr) => Number(expr.value));

	const rhsValues = afterImpliesExpr.map((expr) => Number(expr.value));

	let firstLhsOperator;
	let secondLhsOperator;
	let thirdLhsOperator;
	let firstRhsOperator;
	let secondRhsOperator;
	let thirdRhsOperator;
	const lhsOperators: SplitOperatorType[] = beforeImpliesExpr.map(
		(expr) => expr.operator,
	);
	const rhsOperators: SplitOperatorType[] = afterImpliesExpr.map(
		(expr) => expr.operator,
	);

	// Check lhsOperators and rhsOperators length match
	if (lhsOperators.length !== rhsOperators.length) {
		console.error('lhsOperators arr length doesnt match rhsOperators length');
		return false;
	}

	if (
		lhsValues.length > 0 &&
		rhsValues.length > 0 &&
		lhsOperators.length > 0 &&
		rhsOperators.length > 0
	) {
		firstExprValueLhs = lhsValues[0];
		firstExprValueRhs = rhsValues[0];

		// Set the operators for the expression based on position
		firstLhsOperator = lhsOperators[0];
		firstRhsOperator = rhsOperators[0];
	}

	if (
		lhsValues.length >= 2 &&
		rhsValues.length >= 2 &&
		lhsOperators.length >= 2 &&
		rhsOperators.length >= 2
	) {
		secondExprValueLhs = lhsValues[1];
		secondExprValueRhs = rhsValues[1];

		// Set the operators for the expression based on position
		secondLhsOperator = lhsOperators[1];
		secondRhsOperator = rhsOperators[1];
	}

	if (
		lhsValues.length === 3 &&
		rhsValues.length === 3 &&
		lhsOperators.length === 3 &&
		rhsOperators.length === 3
	) {
		thirdExprValueLhs = lhsValues[2];
		thirdExprValueRhs = rhsValues[2];

		// Set the operators for the expression based on position
		thirdLhsOperator = lhsOperators[2];
		thirdRhsOperator = rhsOperators[2];
	}

	const fetchedConstraints = await Promise.all([
		firstExprValueLhs && firstLhsOperator
			? addVariableConstraint(
					'x',
					firstLhsOperator,
					firstExprValueLhs,
					...constraintProps,
				)
			: Promise.resolve(true),
		firstExprValueRhs && firstRhsOperator
			? addVariableConstraint(
					'x',
					firstRhsOperator,
					firstExprValueRhs,
					...constraintProps,
				)
			: Promise.resolve(true),
		secondExprValueLhs && secondLhsOperator
			? addVariableConstraint(
					'y',
					secondLhsOperator,
					secondExprValueLhs,
					...constraintProps,
				)
			: Promise.resolve(true),
		secondExprValueRhs && secondRhsOperator
			? addVariableConstraint(
					'y',
					secondRhsOperator,
					secondExprValueRhs,
					...constraintProps,
				)
			: Promise.resolve(true),
		thirdExprValueLhs && thirdLhsOperator
			? addVariableConstraint(
					'z',
					thirdLhsOperator,
					thirdExprValueLhs,
					...constraintProps,
				)
			: Promise.resolve(true),
		thirdExprValueRhs && thirdRhsOperator
			? addVariableConstraint(
					'z',
					thirdRhsOperator,
					thirdExprValueRhs,
					...constraintProps,
				)
			: Promise.resolve(true),
	]);

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

		const isSatProps: [any, any, ImpliesPartExpr[], ImpliesPartExpr[]] = [
			result,
			solver,
			beforeImpliesExpr,
			afterImpliesExpr,
		];

		const isSat = checkSatResult({
			result: isSatProps[0],
			solver: isSatProps[1],
			beforeImpliesExpr: isSatProps[2],
			afterImpliesExpr: isSatProps[3],
		});

		return isSat;
	} finally {
		// Clean up
		solver.reset();
	}
}

export {handleDispatch};
