/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {splitAroundOperator} from '@/utilities/handle-check-proof-validity/z3-logic/arith-law-logic/check-arith-law-call-validity';
import type {
	ArithObjType,
	ImpliesPartExpr,
	SplitOperatorType,
} from '@/models/hoare-law-z3-models';

async function handleNoDelimeterZ3Logic(
	beforeImpliesExpr: ImpliesPartExpr,
	afterImpliesExpr: ImpliesPartExpr,
): Promise<boolean> {
	async function handleStatementConstruction(
		beforeImpliesExpr: ImpliesPartExpr,
		afterImpliesExpr: ImpliesPartExpr,
	) {
		let firstStatement;
		let secondStatement;

		const lhsValue = beforeImpliesExpr.value;
		const lhsOperator = beforeImpliesExpr.operator;

		const rhsValue = afterImpliesExpr.value;
		const rhsOperator = afterImpliesExpr.operator;

		// Currently not supporting different operators in expressions before and after implies in arith call currently so throwing error in such case
		if (lhsOperator !== rhsOperator) {
			console.error(
				'beforeImplies and afterImplies have different operators in single expression arith call which is currently unsupported',
			);
			return false;
		}

		switch (lhsOperator) {
			case '=': {
				firstStatement = And(x.gt(lhsValue - 1), x.lt(lhsValue + 1)).eq(true);
				secondStatement = And(x.gt(rhsValue - 1), x.lt(rhsValue + 1)).eq(true); // Should be the exact same bounds as in firstStatement
				break;
			}

			case '<': {
				firstStatement = x.lt(lhsValue).eq(true);
				secondStatement = x.lt(rhsValue).eq(true);
				break;
			}

			case '>': {
				firstStatement = x.gt(lhsValue).eq(true);
				secondStatement = x.gt(rhsValue).eq(true);
				break;
			}

			case '<=': {
				firstStatement = Not(x.gt(lhsValue)).eq(true);
				secondStatement = Not(x.gt(rhsValue)).eq(true);
				break;
			}

			case '>=': {
				firstStatement = Not(x.lt(lhsValue)).eq(true);
				secondStatement = Not(x.lt(rhsValue)).eq(true);
				break;
			}
		}

		return {firstStatement, secondStatement};
	}

	const {Context} = await init();

	// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
	const {Solver, Int, Not, Implies, And, Bool} = new Context('main');
	const x = Int.const('x');

	const solver = new Solver();

	const constructedStatements = await handleStatementConstruction(
		beforeImpliesExpr,
		afterImpliesExpr,
	);

	if (
		constructedStatements === false ||
		constructedStatements.firstStatement === undefined ||
		constructedStatements.secondStatement === undefined
	) {
		console.error(
			'Error constructing logical statements for z3 solver in handleNoDelimeterZ3Logic',
		);
		return false;
	}

	const {firstStatement, secondStatement} = constructedStatements;

	try {
		solver.add(firstStatement, secondStatement);
		solver.add(Implies(firstStatement, secondStatement).eq(true));

		const result = await solver.check();

		if (result === 'sat') {
			const model = solver.model();
			const xValue = model.get(x).toString();
			console.log('xValue:', xValue);

			const lhsValue = beforeImpliesExpr.value;
			const lhsOperator = beforeImpliesExpr.operator;

			const rhsValue = afterImpliesExpr.value;
			const rhsOperator = afterImpliesExpr.operator;

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

				// In your existing code where eval is used:
				if (
					compareOperations[comparisonOperator as SplitOperatorType](
						Number(xValue),
						lhsValue,
					) &&
					compareOperations[comparisonOperator as SplitOperatorType](
						Number(xValue),
						rhsValue,
					)
				) {
					return true;
				}
			}

			console.error(
				"Error: Values discovered to satisfy constraints for arith law call in skip law call proof don't match ones passed to method, hence not a display of validity in this instance",
			);
			return false;
		}

		return false;
	} finally {
		// Clean up
		solver.reset();
	}
}

async function handleNoDelimeterArith(
	arithObj: ArithObjType,
): Promise<boolean | undefined> {
	function findOperator(input: string): SplitOperatorType | undefined {
		const operatorRegex = /\s*(>=|<=|=|>|<)\s*/;
		const match = operatorRegex.exec(input);

		return match ? (match[1].trim() as SplitOperatorType) : undefined;
	}

	const {expr1, expr2} = arithObj; // Expr1 and expr2 will contain only one of the following operators respectively: '=', '>', '<', '<=', '>='

	// Getting the operator which splits the value, i.e. number on the right-hand side, from its variable declaration on the left-hand side
	const expr1Operator = findOperator(expr1);
	const expr2Operator = findOperator(expr2);

	if (expr1Operator === undefined || expr2Operator === undefined) {
		console.error(
			"one or both of operators in expr1 and expr2 in implies statement are not acceptable, i.e. not one of '=', '>', '<', '<=', '>=' ",
		);
		return false;
	}

	console.log(
		"operators in expr1 and expr2 in implies statement respectively are valid, i.e. one of the following: '=', '>', '<', '<=', '>='",
	);

	const beforeImpliesExpr: ImpliesPartExpr = {
		operator: expr1Operator,
		value: Number(splitAroundOperator(expr1, expr1Operator).variableValue),
	};

	const afterImpliesExpr: ImpliesPartExpr = {
		operator: expr2Operator,
		value: Number(splitAroundOperator(expr2, expr2Operator).variableValue),
	};

	console.log('expression1 right expr:', beforeImpliesExpr.value);
	console.log('expression2 right expr', afterImpliesExpr.value);

	// Dispatching to Z3 to check satisfiability of overall implication statement
	const dispatchResult: boolean = await handleNoDelimeterZ3Logic(
		beforeImpliesExpr,
		afterImpliesExpr,
	);

	if (!dispatchResult) {
		console.log('sat checker of arith law returned invalid result');
		return false;
	}

	console.log('sat checker of arith law returned valid result');
	return true;
}

export {handleNoDelimeterArith};
