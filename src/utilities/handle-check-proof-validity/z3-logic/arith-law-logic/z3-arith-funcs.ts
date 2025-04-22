/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/restrict-template-expressions -- lack of typing in Z3 package */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {checkSatResult} from './check-sat-result';
import {addVariableConstraint} from './add-variable-constraint';
import {
	type SplitReturnObjType,
	type ArithObjType,
	type SplitOperatorType,
} from '@/models/hoare-law-z3-models';
import {type LawTypeHoare} from '@/models/misc';

type ConstraintPropsType = {
	Int: any;
	And: any;
	Not: any;
	solver: any;
	tracker: any;
};

type ExprValueLhsTypes = {
	firstExprValueLhs: number | undefined;
	secondExprValueLhs: number | undefined;
	thirdExprValueLhs: number | undefined;
};

type ExprValueRhsTypes = {
	firstExprValueRhs: number | undefined;
	secondExprValueRhs: number | undefined;
	thirdExprValueRhs: number | undefined;
};

type ExprValueTypes = ExprValueLhsTypes & ExprValueRhsTypes;

type ExprOperatorLhsTypes = {
	firstLhsOperator: SplitOperatorType | undefined;
	secondLhsOperator: SplitOperatorType | undefined;
	thirdLhsOperator: SplitOperatorType | undefined;
};

type ExprOperatorRhsTypes = {
	firstRhsOperator: SplitOperatorType | undefined;
	secondRhsOperator: SplitOperatorType | undefined;
	thirdRhsOperator: SplitOperatorType | undefined;
};

type ExprOperatorTypes = ExprOperatorLhsTypes & ExprOperatorRhsTypes;

type ExprVarNameLhsTypes = {
	firstExprVarNameLhs: string | undefined;
	secondExprVarNameLhs: string | undefined;
	thirdExprVarNameLhs: string | undefined;
};

type ExprVarNameRhsTypes = {
	firstExprVarNameRhs: string | undefined;
	secondExprVarNameRhs: string | undefined;
	thirdExprVarNameRhs: string | undefined;
};

type ExprVarNameTypes = ExprVarNameLhsTypes & ExprVarNameRhsTypes;

type FetchConstraintsPropsLhsType = {
	constraintProps: ConstraintPropsType;
} & ExprValueLhsTypes &
	ExprOperatorLhsTypes &
	ExprVarNameLhsTypes;

type FetchConstraintsPropsType = {
	constraintProps: ConstraintPropsType;
} & ExprValueTypes &
	ExprOperatorTypes &
	ExprVarNameTypes;

type ExpressionValues = {
	firstExprValueLhs?: number;
	secondExprValueLhs?: number;
	thirdExprValueLhs?: number;
	firstExprValueRhs?: number;
	secondExprValueRhs?: number;
	thirdExprValueRhs?: number;
	firstLhsOperator?: SplitOperatorType;
	secondLhsOperator?: SplitOperatorType;
	thirdLhsOperator?: SplitOperatorType;
	firstRhsOperator?: SplitOperatorType;
	secondRhsOperator?: SplitOperatorType;
	thirdRhsOperator?: SplitOperatorType;
	firstExprVarNameLhs?: string;
	secondExprVarNameLhs?: string;
	thirdExprVarNameLhs?: string;
	firstExprVarNameRhs?: string;
	secondExprVarNameRhs?: string;
	thirdExprVarNameRhs?: string;
};

type CreatedOperatorsType =
	| {lhsOperators: SplitOperatorType[]; rhsOperators?: SplitOperatorType[]}
	| undefined;

type CreatedValuesType =
	| {lhsValues: number[]; rhsValues: number[]}
	| {lhsValues: number[]; rhsValues?: undefined}
	| undefined;

type CreatedVariableNamesType =
	| {
			lhsVarNames: string[];
			rhsVarNames: string[];
	  }
	| {
			lhsVarNames: string[];
			rhsVarNames?: undefined;
	  }
	| undefined;

type Z3Variable = {
	variable: any; // Z3 variable reference
	programVarName: string;
	type: 'Int' | 'Bool' | 'Real';
};

type VariableDictionary = Record<string, any>;

class Z3VariableTracker {
	private readonly variables = new Map<string, Z3Variable>();

	addVariable(programVarName: string, variable: any, type: Z3Variable['type']) {
		this.variables.set(programVarName, {variable, programVarName, type});
	}

	getVariable(name: string): Z3Variable | undefined {
		return this.variables.get(name);
	}

	getAllVariables(): Z3Variable[] {
		return Array.from(this.variables.values());
	}
}

let z3Context: any = null;
const tracker = new Z3VariableTracker();

async function fetchConstraints(
	fetchedConstraintsProps:
		| FetchConstraintsPropsType
		| FetchConstraintsPropsLhsType,
) {
	const {constraintProps} = fetchedConstraintsProps;

	const {
		firstExprValueLhs,
		firstExprValueRhs,
		secondExprValueLhs,
		secondExprValueRhs,
		thirdExprValueLhs,
		thirdExprValueRhs,
		firstLhsOperator,
		firstRhsOperator,
		secondLhsOperator,
		secondRhsOperator,
		thirdLhsOperator,
		thirdRhsOperator,
		firstExprVarNameLhs,
		firstExprVarNameRhs,
		secondExprVarNameLhs,
		secondExprVarNameRhs,
		thirdExprVarNameLhs,
		thirdExprVarNameRhs,
	} = isFetchConstraintsPropsType(fetchedConstraintsProps)
		? fetchedConstraintsProps
		: {
				firstExprValueLhs: undefined,
				firstExprValueRhs: undefined,
				secondExprValueLhs: undefined,
				secondExprValueRhs: undefined,
				thirdExprValueLhs: undefined,
				thirdExprValueRhs: undefined,
				firstLhsOperator: undefined,
				firstRhsOperator: undefined,
				secondLhsOperator: undefined,
				secondRhsOperator: undefined,
				thirdLhsOperator: undefined,
				thirdRhsOperator: undefined,
				firstExprVarNameLhs: undefined,
				firstExprVarNameRhs: undefined,
				secondExprVarNameLhs: undefined,
				secondExprVarNameRhs: undefined,
				thirdExprVarNameLhs: undefined,
				thirdExprVarNameRhs: undefined,
			};

	// Type guard function
	function isFetchConstraintsPropsType(
		props: FetchConstraintsPropsType | FetchConstraintsPropsLhsType,
	): props is FetchConstraintsPropsType {
		return 'firstExprValueRhs' in props;
	}

	const fetchedConstraints = await Promise.all([
		firstExprValueLhs && firstLhsOperator && firstExprVarNameLhs
			? addVariableConstraint({
					variableName: 'x',
					operator: firstLhsOperator,
					value: firstExprValueLhs,
					realProgramVarName: firstExprVarNameLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		firstExprValueRhs && firstRhsOperator && firstExprVarNameRhs
			? addVariableConstraint({
					variableName: 'x',
					operator: firstRhsOperator,
					value: firstExprValueRhs,
					realProgramVarName: firstExprVarNameRhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		secondExprValueLhs && secondLhsOperator && secondExprVarNameLhs
			? addVariableConstraint({
					variableName: 'y',
					operator: secondLhsOperator,
					value: secondExprValueLhs,
					realProgramVarName: secondExprVarNameLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		secondExprValueRhs && secondRhsOperator && secondExprVarNameRhs
			? addVariableConstraint({
					variableName: 'y',
					operator: secondRhsOperator,
					value: secondExprValueRhs,
					realProgramVarName: secondExprVarNameRhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		thirdExprValueLhs && thirdLhsOperator && thirdExprVarNameLhs
			? addVariableConstraint({
					variableName: 'z',
					operator: thirdLhsOperator,
					value: thirdExprValueLhs,
					realProgramVarName: thirdExprVarNameLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		thirdExprValueRhs && thirdRhsOperator && thirdExprVarNameRhs
			? addVariableConstraint({
					variableName: 'z',
					operator: thirdRhsOperator,
					value: thirdExprValueRhs,
					realProgramVarName: thirdExprVarNameRhs,
					...constraintProps,
				})
			: Promise.resolve(true),
	]);

	return fetchedConstraints;
}

async function getZ3Context() {
	if (!z3Context) {
		const {Context} = await init();

		// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
		z3Context = new Context('main');
	}

	return z3Context;
}

async function initialiseContext() {
	const context = await getZ3Context();

	const {Int, And, Solver, Not, Implies} = context;

	return [Int, And, Solver, Not, Implies];
}

function handleCreateVariableNames(
	callingProofLaw: LawTypeHoare,
	beforeImpliesExpr: SplitReturnObjType[],
	afterImpliesExpr?: SplitReturnObjType[],
) {
	function handleCreateExprVarNamesLhs(
		beforeImpliesExpr: SplitReturnObjType[],
	): string[] {
		const lhsVarNames = beforeImpliesExpr.map((expr) => expr.variable);
		return lhsVarNames;
	}

	function handleCreateExprVarNamesRhs(
		afterImpliesExpr: SplitReturnObjType[],
	): string[] {
		const rhsVarNames = afterImpliesExpr.map((expr) => expr.variable);
		return rhsVarNames;
	}

	if (callingProofLaw === 'hskip') {
		const lhsVarNames = handleCreateExprVarNamesLhs(beforeImpliesExpr);
		const rhsVarNames = handleCreateExprVarNamesRhs(afterImpliesExpr!);

		return {lhsVarNames, rhsVarNames};
	}

	if (callingProofLaw === 'hassign') {
		const lhsVarNames = handleCreateExprVarNamesLhs(beforeImpliesExpr);

		return {lhsVarNames};
	}

	console.error(
		'callingProofLaw in handleCreateVariableNames is not a valid value',
	);
	return undefined;
}

function handleCreateExprValues(
	callingProofLaw: LawTypeHoare,
	beforeImpliesExpr: SplitReturnObjType[],
	afterImpliesExpr?: SplitReturnObjType[],
) {
	function handleCreateExprValuesLhs(
		beforeImpliesExpr: SplitReturnObjType[],
	): number[] {
		const lhsValues = beforeImpliesExpr.map((expr) =>
			Number(expr.variableValue),
		);
		return lhsValues;
	}

	function handleCreateExprValuesRhs(
		afterImpliesExpr: SplitReturnObjType[],
	): number[] {
		const rhsValues = afterImpliesExpr.map((expr) =>
			Number(expr.variableValue),
		);
		return rhsValues;
	}

	if (callingProofLaw === 'hskip') {
		const lhsValues = handleCreateExprValuesLhs(beforeImpliesExpr);
		const rhsValues = handleCreateExprValuesRhs(afterImpliesExpr!);

		return {lhsValues, rhsValues};
	}

	if (callingProofLaw === 'hassign') {
		const lhsValues = handleCreateExprValuesLhs(beforeImpliesExpr);

		return {lhsValues};
	}

	console.error(
		'callingProofLaw in handleCreateExprValues is not a valid value',
	);
	return undefined;
}

function handleCreateOperators(
	callingProofLaw: LawTypeHoare,
	beforeImpliesExpr: SplitReturnObjType[],
	afterImpliesExpr?: SplitReturnObjType[],
):
	| {lhsOperators: SplitOperatorType[]; rhsOperators?: SplitOperatorType[]}
	| undefined {
	function handleCreateOperatorsLhs(beforeImpliesExpr: SplitReturnObjType[]) {
		function createOpers(
			beforeImpliesExpr: SplitReturnObjType[],
		): SplitOperatorType[] {
			const lhsOperators: SplitOperatorType[] = beforeImpliesExpr.map(
				(expr) => expr.operator as SplitOperatorType,
			);

			return lhsOperators;
		}

		const lhsOperators = createOpers(beforeImpliesExpr);

		return lhsOperators;
	}

	function handleCreateOperatorsRhs(
		afterImpliesExpr: SplitReturnObjType[],
	): SplitOperatorType[] {
		function createOpers(
			afterImpliesExpr: SplitReturnObjType[],
		): SplitOperatorType[] {
			const rhsOperators: SplitOperatorType[] = afterImpliesExpr.map(
				(expr) => expr.operator as SplitOperatorType,
			);

			return rhsOperators;
		}

		const rhsOperators = createOpers(afterImpliesExpr);

		return rhsOperators;
	}

	const lhsOperators: SplitOperatorType[] = [];
	const rhsOperators: SplitOperatorType[] = [];

	if (callingProofLaw === 'hskip') {
		lhsOperators.push(...handleCreateOperatorsLhs(beforeImpliesExpr));
		rhsOperators.push(...handleCreateOperatorsRhs(afterImpliesExpr!));

		// Check lhsOperators and rhsOperators length match
		if (lhsOperators.length !== rhsOperators.length) {
			console.error('lhsOperators arr length doesnt match rhsOperators length');
			return;
		}

		return {
			lhsOperators,
			rhsOperators,
		};
	}

	if (callingProofLaw === 'hassign') {
		lhsOperators.push(...handleCreateOperatorsLhs(beforeImpliesExpr));

		return {
			lhsOperators,
		};
	}

	console.error('callingProofLaw is not a valid value');
	return undefined;
}

function processValuesOperatorsNames(
	lhsValues: number[],
	lhsOperators: SplitOperatorType[],
	lhsVarNames: string[],
	rhsValues?: number[],
	rhsOperators?: SplitOperatorType[],
	rhsVarNames?: string[],
): ExpressionValues {
	const result: ExpressionValues = {};

	// Helper function to safely get array value
	const safeGet = <T>(arr: T[] | undefined, index: number): T | undefined =>
		arr?.[index];

	for (let i = 0; i < 3; i++) {
		if (
			lhsValues.length > i &&
			lhsOperators.length > i &&
			lhsVarNames.length > i
		) {
			switch (i) {
				case 0: {
					result.firstExprValueLhs = lhsValues[i];
					result.firstLhsOperator = lhsOperators[i];
					result.firstExprVarNameLhs = lhsVarNames[i];
					result.firstExprValueRhs = safeGet(rhsValues, i);
					result.firstRhsOperator = safeGet(rhsOperators, i);
					result.firstExprVarNameRhs = safeGet(rhsVarNames, i);
					break;
				}

				case 1: {
					result.secondExprValueLhs = lhsValues[i];
					result.secondLhsOperator = lhsOperators[i];
					result.secondExprVarNameLhs = lhsVarNames[i];
					result.secondExprValueRhs = safeGet(rhsValues, i);
					result.secondRhsOperator = safeGet(rhsOperators, i);
					result.secondExprVarNameRhs = safeGet(rhsVarNames, i);
					break;
				}

				case 2: {
					result.thirdExprValueLhs = lhsValues[i];
					result.thirdLhsOperator = lhsOperators[i];
					result.thirdExprVarNameLhs = lhsVarNames[i];
					result.thirdExprValueRhs = safeGet(rhsValues, i);
					result.thirdRhsOperator = safeGet(rhsOperators, i);
					result.thirdExprVarNameRhs = safeGet(rhsVarNames, i);
					break;
				}

				default: {
					console.error(
						'Error handling processValuesOperatorsNames func, invalid i value of:',
						i,
					);
				}
			}
		}
	}

	// Remove undefined values
	return Object.fromEntries(
		Object.entries(result).filter(([_, value]) => value !== undefined),
	) as ExpressionValues;
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

async function handleEquationCompose(
	arithObj: ArithObjType,
	variableNames: string[],
	tracker: Z3VariableTracker,
): Promise<any> {
	function getDefinedVariables(
		letterVariables: string[],
		tracker: Z3VariableTracker,
	): VariableDictionary {
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
		const isDigit = (char: string): boolean => /^\d$/.test(char);
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

		return expression.eq(true);
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

	const definedVars = getDefinedVariables(variableNames, tracker); //  { x: Z3Var, y: Z3Var }

	const numVarEntries = Object.entries(definedVars).length;

	if (!numVarEntries) {
		console.error('Error in handleEquationCompose: definedVars is empty');
		return;
	}

	if (numVarEntries === 1) {
		console.log('has 1 entry in definedVars:', definedVars[0]);
	}

	const createdZ3Assertion: any = constructZ3Assertion(expr2, definedVars);

	return createdZ3Assertion;
}

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
	} = processValuesOperatorsNames(
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

	const exprValues: ExprValueLhsTypes & ExprValueRhsTypes = {
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
	} = processValuesOperatorsNames(lhsValues, lhsOperators, lhsVarNames);

	const exprVariableNames: ExprVarNameLhsTypes = {
		firstExprVarNameLhs,
		secondExprVarNameLhs,
		thirdExprVarNameLhs,
	};

	const exprValues: ExprValueLhsTypes = {
		firstExprValueLhs,
		secondExprValueLhs,
		thirdExprValueLhs,
	};

	const operators: ExprOperatorLhsTypes = {
		firstLhsOperator,
		secondLhsOperator,
		thirdLhsOperator,
	};
	const fetchedConstraintsProps: FetchConstraintsPropsLhsType = {
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

	const beforeImpliesConstraints = [
		lhsConstraintX,
		lhsConstraintY,
		lhsConstraintZ,
	].filter((constraint) => constraint !== undefined);

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
		tracker,
	);

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

export {handleHskipDispatch, handleHassignDispatch};
