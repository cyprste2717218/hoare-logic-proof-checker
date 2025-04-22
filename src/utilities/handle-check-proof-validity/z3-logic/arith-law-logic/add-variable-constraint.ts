/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/naming-convention -- Named exports from Z3 dont adhere to strictCamelCase */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */

import {type SplitOperatorType} from '@/models/hoare-law-z3-models';

type CommonPropsType = {
	operator: SplitOperatorType;
	And: any;
	Not: any;
	value: number;
	tracker: any;
	realProgramVarName: string;
};

type GetConstraintPropsType = {
	passedVarName: any;
} & CommonPropsType;

type AddVariableConstraintPropsType = {
	variableName: 'x' | 'y' | 'z';
	realProgramVarName: string;
	Int: any;
	solver: any;
} & CommonPropsType;

async function getConstraint(
	getConstraintProps: GetConstraintPropsType,
): Promise<{firstStatement: any}> {
	let firstStatement;

	const {passedVarName, value, operator, And, Not} = getConstraintProps;

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
	addVariableConstraintProps: AddVariableConstraintPropsType,
): Promise<any | false> {
	async function addVariableConstraintX(
		addVariableConstraintProps: CommonPropsType,
	): Promise<any> {
		const {tracker, realProgramVarName} = addVariableConstraintProps;
		const x = Int.const('x');
		tracker.addVariable(realProgramVarName, x, 'Int');

		const addVariableConstraintPropsX: GetConstraintPropsType = {
			passedVarName: x,
			...addVariableConstraintProps,
		};
		const constraint = getConstraint(addVariableConstraintPropsX);
		return constraint;
	}

	async function addVariableConstraintY(
		addVariableConstraintProps: CommonPropsType,
	): Promise<any> {
		const {tracker, realProgramVarName} = addVariableConstraintProps;
		const y = Int.const('y');
		tracker.addVariable(realProgramVarName, y, 'Int');

		const addVariableConstraintPropsY: GetConstraintPropsType = {
			passedVarName: y,
			...addVariableConstraintProps,
		};
		const constraint = getConstraint(addVariableConstraintPropsY);
		return constraint;
	}

	async function addVariableConstraintZ(
		addVariableConstraintProps: CommonPropsType,
	): Promise<any> {
		const {tracker, realProgramVarName} = addVariableConstraintProps;
		const z = Int.const('z');
		tracker.addVariable(realProgramVarName, z, 'Int');

		const addVariableConstraintPropsZ: GetConstraintPropsType = {
			passedVarName: z,
			...addVariableConstraintProps,
		};
		const constraint = getConstraint(addVariableConstraintPropsZ);
		return constraint;
	}

	const {
		variableName,
		realProgramVarName,
		operator,
		value,
		Int,
		And,
		Not,
		solver,
		tracker,
	} = addVariableConstraintProps;
	const paramProps: CommonPropsType = {
		operator,
		And,
		Not,
		value,
		tracker,
		realProgramVarName,
	};
	let addConstraint;

	// Handle Z3 constant variable to create
	switch (variableName) {
		case 'x': {
			addConstraint = await addVariableConstraintX(paramProps);
			break;
		}

		case 'y': {
			addConstraint = await addVariableConstraintY(paramProps);
			break;
		}

		case 'z': {
			addConstraint = await addVariableConstraintZ(paramProps);
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
