/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/restrict-template-expressions -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/no-unsafe-argument -- lack of typing in Z3 package */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {checkSatResult} from './check-sat-result';
import {addVariableConstraint} from './add-variable-constraint';
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
