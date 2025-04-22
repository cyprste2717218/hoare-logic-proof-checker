/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */

import {tracker} from '../z3-variable-tracker-class';
import {
	type ArithObjType,
	type ModelValuesType,
	type VariableDictionary,
} from '@/models/hoare-law-z3-models';

async function handleEquationCompose(
	arithObj: ArithObjType,
	variableNames: string[],
	solver: any,
	Not: any,
): Promise<any> {
	function getDefinedVariables(letterVariables: string[]): VariableDictionary {
		// Initialize result dictionary
		const definedVariables: VariableDictionary = {};

		// Process each letter
		for (const letter of letterVariables) {
			// Ensure letter is a single alphabetical character
			if (/^[a-zA-Z]$/.test(letter)) {
				const variable = tracker.getVariable(letter)?.variable;

				// Only add defined variables to the result
				if (variable !== undefined) {
					definedVariables[letter] = variable;
				}
			} else {
				console.warn(`Skipping invalid variable name: ${letter}`);
			}
		}

		return definedVariables;
	}

	function constructZ3Assertion(
		tokens: string[],
		definedVars: Record<string, any>,
	): any {
		if (tokens.length < 3) {
			throw new Error('Expression must have at least 3 tokens');
		}

		// Helper functions
		const isAlpha = (char: string): boolean => /^[a-zA-Z]$/.test(char);
		// Const isDigit = (char: string): boolean => /^\d$/.test(char);
		const isMathOperator = (char: string): boolean =>
			['+', '-', '*', '/'].includes(char);
		const isEqualityOperator = (char: string): boolean =>
			['=', '>', '<', '<=', '>='].includes(char);

		const getZ3MathMethod = (operator: string): string => {
			const methodMap: Record<string, string> = {
				'+': 'add',
				'-': 'sub',
				'*': 'mul',
				'/': 'div',
			};
			return methodMap[operator];
		};

		const getZ3EqualityMethod = (operator: string): string => {
			const methodMap: Record<string, string> = {
				'=': 'eq',
				'>': 'gt',
				'<': 'lt',
				'>=': 'ge',
				'<=': 'le',
			};
			return methodMap[operator];
		};

		// First token must be alphabetical - get corresponding Z3 variable
		if (!isAlpha(tokens[0]) || !definedVars[tokens[0]]) {
			throw new Error('First token must be a defined variable');
		}

		let expression = definedVars[tokens[0]];
		let i = 1;

		// Process the expression until we hit an equality operator
		while (i < tokens.length && !isEqualityOperator(tokens[i])) {
			if (isMathOperator(tokens[i])) {
				const operator = tokens[i];
				i++;

				// Next token must be either a variable or number
				if (i >= tokens.length) {
					throw new Error('Unexpected end of expression');
				}

				const nextToken = tokens[i];
				const operand = isAlpha(nextToken)
					? definedVars[nextToken]
					: Number(nextToken);

				if (operand === undefined) {
					throw new Error(`Invalid operand: ${nextToken}`);
				}

				const methodName = getZ3MathMethod(operator);
				expression = expression[methodName](operand);
				i++;
			} else {
				throw new Error(`Unexpected token: ${tokens[i]}`);
			}
		}

		// Process equality operator and final value
		if (i < tokens.length) {
			const equalityOperator = tokens[i];
			if (!isEqualityOperator(equalityOperator)) {
				throw new Error(`Expected equality operator, got: ${equalityOperator}`);
			}

			i++;
			if (i >= tokens.length) {
				throw new Error('Expected value after equality operator');
			}

			const finalValue = isAlpha(tokens[i])
				? definedVars[tokens[i]]
				: Number(tokens[i]);

			if (finalValue === undefined) {
				throw new Error(`Invalid final value: ${tokens[i]}`);
			}

			const methodName = getZ3EqualityMethod(equalityOperator);
			expression = expression[methodName](finalValue);
		}

		return expression;
	}

	const {expr1, expr2} = arithObj;

	// Check expr1 and expr2 are the correct datatypes:

	if (typeof expr2 === 'string') {
		console.error(
			`Error in handleEquationCompose: expr2 must be string [], but is ${typeof expr2}`,
		);
		return;
	}

	if (expr1 === undefined) {
		console.error('Error in handleEquationCompose: expr1 is undefined');
		return;
	}

	console.log('datatype checks pass for handleEquationCompose');

	// Retrieving z3 variables already defined and added to Map<string, Z3Variable> from adding constraints to z3 stack in addVariableConstraint func

	const definedVars = getDefinedVariables(variableNames); //  { x: Z3Var, y: Z3Var }

	const numVarEntries = Object.entries(definedVars).length;

	if (!numVarEntries) {
		console.error('Error in handleEquationCompose: definedVars is empty');
		return;
	}

	console.log('entries in definedVars:', Object.keys(definedVars));

	const createdZ3Assertion: any = constructZ3Assertion(expr2, definedVars);

	// Creating z3 scope to add assertion created to z3 stack to check if a model can be found with disproves the equation, assertion is deleted from global z3 scope after regardless of whether stack is satisfiable or not
	solver.push();
	console.log(`createdZ3Assertion: ${createdZ3Assertion}`);
	console.log(`Not(createdZ3Assertion): ${Not(createdZ3Assertion).eq(true)}`);
	solver.add(Not(createdZ3Assertion).eq(true));
	const result = await solver.check();

	if (result === 'sat') {
		console.error(
			'Error in handleEquationCompose: z3 found model that doesnt satisfy variable domain constraints:',
		);

		const model = await solver.model();

		const declarations = model.decls();

		const modelValues: ModelValuesType = {
			xValue: undefined,
			yValue: undefined,
			zValue: undefined,
		};
		// Logging values satisfying z3 stack to console

		if (declarations.length > 0) {
			modelValues.xValue =
				declarations[0].name() === 'x'
					? model.get(declarations[0]).asString()
					: undefined;
			console.log('model xValue:', modelValues.xValue);
		}

		if (declarations.length >= 2) {
			if (declarations.length === 2) {
				modelValues.yValue =
					declarations[1].name() === 'y'
						? model.get(declarations[1]).asString()
						: undefined;
				console.log('model yValue:', modelValues.yValue);
			} else {
				modelValues.zValue =
					declarations[1].name() === 'z'
						? model.get(declarations[1]).asString()
						: undefined;
				console.log('model zValue:', modelValues.zValue);
			}
		}

		if (declarations.length === 3) {
			modelValues.yValue =
				declarations[2].name() === 'y'
					? model.get(declarations[2]).asString()
					: undefined;
			console.log('model yValue:', modelValues.yValue);
		}

		solver.pop();
		return false;
	}

	if (result === 'unsat') {
		console.log(
			'No model value found by z3 that disproves statement based on variable domain constraints so must be valid',
		);
		solver.pop();
		return createdZ3Assertion.eq(true);
	}
}

export {handleEquationCompose};
