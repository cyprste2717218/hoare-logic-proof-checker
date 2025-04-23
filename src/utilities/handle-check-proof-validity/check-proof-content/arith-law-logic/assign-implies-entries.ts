import {splitAroundOperator} from '../../z3-logic/arith-law-z3-logic/check-arith-law-call-validity';
import {
	type SplitOperatorType,
	type SplitReturnObjType,
} from '@/models/hoare-law-z3-models';

function findOperator(input: string): SplitOperatorType | undefined {
	const operatorRegex = /\s*(>=|<=|=|>|<)\s*/;
	const match = operatorRegex.exec(input);

	return match ? (match[1].trim() as SplitOperatorType) : undefined;
}

function assignBeforeImpliesEntries(
	beforeImpliesExprArr: SplitReturnObjType[],
	expr1Arr: string[],
): true | undefined {
	for (const expression of expr1Arr) {
		const currentExprOperator: SplitOperatorType | undefined =
			findOperator(expression);
		if (currentExprOperator === undefined) {
			console.error(
				'operator in expr1Arr expression is not acceptable, i.e. not one of "=", ">", "<", "<=", ">=" ',
			);
			return;
		}

		const currentImpliesExpr: SplitReturnObjType = splitAroundOperator(
			expression,
			currentExprOperator,
		);

		const {variable, operator, variableValue} = currentImpliesExpr;

		if (variable === '' || operator === '' || variableValue === '') {
			console.error(
				"splitReturnObj returned '' for either variable, operator or variableValue",
			);
			return;
		}

		beforeImpliesExprArr.push({
			variable,
			operator: currentExprOperator,
			variableValue,
		});
	}

	return true;
}

function assignAfterImpliesEntries(
	afterImpliesExprArr: SplitReturnObjType[],
	expr2Arr: string[],
): true | undefined {
	for (const expression of expr2Arr) {
		const currentExprOperator: SplitOperatorType | undefined =
			findOperator(expression);
		if (currentExprOperator === undefined) {
			console.error(
				'operator in expr1Arr expression is not acceptable, i.e. not one of "=", ">", "<", "<=", ">=" ',
			);
			return;
		}

		const currentImpliesExpr: SplitReturnObjType = splitAroundOperator(
			expression,
			currentExprOperator,
		);

		const {variable, operator, variableValue} = currentImpliesExpr;

		if (variable === '' || operator === '' || variableValue === '') {
			console.error(
				"splitReturnObj returned '' for either variable, operator or variableValue",
			);
			return;
		}

		afterImpliesExprArr.push({
			variable,
			operator: currentExprOperator,
			variableValue,
		});
	}

	return true;
}

export {assignBeforeImpliesEntries, assignAfterImpliesEntries};
