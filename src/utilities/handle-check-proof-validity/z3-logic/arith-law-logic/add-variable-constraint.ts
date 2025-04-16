/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */

import {type SplitOperatorType} from '@/models/hoare-law-z3-models';

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

export {addVariableConstraint};
