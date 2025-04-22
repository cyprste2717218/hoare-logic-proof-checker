/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */
/* eslint-disable @typescript-eslint/restrict-template-expressions -- lack of typing in Z3 package */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';
import {addVariableConstraint} from './add-variable-constraint';
import {
	type FetchConstraintsPropsType,
	type FetchConstraintsPropsLhsType,
} from '@/models/hoare-law-z3-models';

async function fetchConstraints(
	fetchedConstraintsProps:
		| FetchConstraintsPropsType
		| FetchConstraintsPropsLhsType,
) {
	const {constraintProps} = fetchedConstraintsProps;

	// Extract all values, using type guard to determine which properties to include
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
	} = fetchedConstraintsProps;

	// Type guard function
	function isFetchConstraintsPropsType(
		props: FetchConstraintsPropsType | FetchConstraintsPropsLhsType,
	): props is FetchConstraintsPropsType {
		return 'firstExprValueRhs' in props;
	}

	// Get RHS values only if the type is FetchConstraintsPropsType
	const {
		firstExprValueRhs,
		secondExprValueRhs,
		thirdExprValueRhs,
		firstRhsOperator,
		secondRhsOperator,
		thirdRhsOperator,
		firstExprVarNameRhs,
		secondExprVarNameRhs,
		thirdExprVarNameRhs,
	} = isFetchConstraintsPropsType(fetchedConstraintsProps)
		? fetchedConstraintsProps
		: {
				firstExprValueRhs: undefined,
				secondExprValueRhs: undefined,
				thirdExprValueRhs: undefined,
				firstRhsOperator: undefined,
				secondRhsOperator: undefined,
				thirdRhsOperator: undefined,
				firstExprVarNameRhs: undefined,
				secondExprVarNameRhs: undefined,
				thirdExprVarNameRhs: undefined,
			};

	console.log(
		'firstExprValueLhs:',
		firstExprValueLhs,
		'firstLhsOperator:',
		firstLhsOperator,
		'firstExprVarNamLhs:',
		firstExprVarNameLhs,
	);

	const fetchedConstraints = await Promise.all([
		// LHS constraints - these will always be processed
		firstExprValueLhs && firstLhsOperator && firstExprVarNameLhs
			? addVariableConstraint({
					variableName: 'x',
					operator: firstLhsOperator,
					value: firstExprValueLhs,
					realProgramVarName: firstExprVarNameLhs,
					...constraintProps,
				})
			: Promise.resolve(true),
		// RHS constraints - these will only be processed if type is FetchConstraintsPropsType
		isFetchConstraintsPropsType(fetchedConstraintsProps) &&
		firstExprValueRhs &&
		firstRhsOperator &&
		firstExprVarNameRhs
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
		isFetchConstraintsPropsType(fetchedConstraintsProps) &&
		secondExprValueRhs &&
		secondRhsOperator &&
		secondExprVarNameRhs
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
		isFetchConstraintsPropsType(fetchedConstraintsProps) &&
		thirdExprValueRhs &&
		thirdRhsOperator &&
		thirdExprVarNameRhs
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

async function constructImpliesExpr(
	And: any,
	constraints: any[],
	solver: any,
): Promise<false | any> {
	const impliesExprResult = And(...constraints).eq(true);
	console.log('this is constraints:', constraints);
	console.log('this is impliesExprResult:', impliesExprResult);

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

export {fetchConstraints, constructImpliesExpr};
