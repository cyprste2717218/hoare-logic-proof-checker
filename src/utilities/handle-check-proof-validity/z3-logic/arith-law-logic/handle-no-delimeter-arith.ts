/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {splitAroundEquals} from '@/utilities/handle-check-proof-validity/z3-logic/arith-law-logic/check-arith-law-call-validity';
import type {ArithObjType} from '@/models/hoare-law-z3-models';

async function handleNoDelimeterZ3Logic(
	rightExpr1: number,
	rightExpr2: number,
): Promise<boolean> {
	const {Context} = await init();

	// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
	const {Solver, Int, Not, Implies, And, Bool} = new Context('main');

	const isTrue = Bool.const('isTrue');
	const x = Int.const('x');

	const firstStatement = And(x.gt(rightExpr1 - 1), x.lt(rightExpr1 + 1));
	const secondStatement = And(x.gt(rightExpr2 - 1), x.lt(rightExpr2 + 1)); // Should be the exact same bounds as in firstStatement
	const thirdStatement = isTrue.eq(true);

	const solver = new Solver();

	solver.add(firstStatement, secondStatement);
	solver.add(
		And(thirdStatement, Implies(firstStatement, secondStatement)).eq(true),
	);

	const result = await solver.check();

	if (result === 'sat') {
		const model = solver.model();
		const xValue = model.get(x).toString();
		console.log('xValue:', xValue);

		// Check xValue and yValue found to satisfy constraints are the same as rightExpr1 and rightExpr2

		if (Number(xValue) === rightExpr1 && Number(xValue) === rightExpr2) {
			return true;
		}

		console.error(
			"Error: Values discovered to satisfy constraints for arith law call in skip law call proof don't match ones passed to method, hence not a display of validity in this instance",
		);
		return false;
	}

	return false;
}

async function handleNoDelimeterArith(
	arithObj: ArithObjType,
): Promise<boolean | undefined> {
	const {expr1, expr2} = arithObj;

	const rightExpr1 = Number(splitAroundEquals(expr1).variableValue);
	const rightExpr2 = Number(splitAroundEquals(expr2).variableValue);

	console.log('expression1 right expr:', rightExpr1);
	console.log('expression2 right expr', rightExpr2);

	// Dispatching to Z3 to check satisfiability of overall implication statement
	const dispatchResult: boolean = await handleNoDelimeterZ3Logic(
		rightExpr1,
		rightExpr2,
	);

	if (!dispatchResult) {
		console.log('sat checker of arith law returned invalid result');
		return false;
	}

	console.log('sat checker of arith law returned valid result');
	return true;
}

export {handleNoDelimeterArith};
