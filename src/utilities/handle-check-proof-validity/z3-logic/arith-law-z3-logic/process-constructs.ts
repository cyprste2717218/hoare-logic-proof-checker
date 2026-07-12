import {
	type ExpressionValues,
	type SplitOperatorType,
} from '@/models/hoare-law-z3-models';

function processConstructs(
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

export {processConstructs};
