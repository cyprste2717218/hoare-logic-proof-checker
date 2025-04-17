/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */

/* eslint-disable @typescript-eslint/no-unsafe-call -- Z3 functions such as 'And' are exported in uppercase letter so can't enforce this rule ensuring only uppercase functions are constructors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */

import type {
	ImpliesPartExpr,
	SplitOperatorType,
} from '@/models/hoare-law-z3-models';

type ModelValuesType = {
	xValue: undefined | string;
	yValue: undefined | string;
	zValue: undefined | string;
};
function checkDisallowedModelValues(
	beforeImpliesExpr: ImpliesPartExpr[],
	afterImpliesExpr: ImpliesPartExpr[],
	modelValues: ModelValuesType,
): boolean {
	function setComparisonOperator(
		lhsOperator: SplitOperatorType,
	): SplitOperatorType {
		switch (lhsOperator) {
			case '=': {
				return '=';
			}

			case '>': {
				return '>';
			}

			case '<': {
				return '<';
			}

			case '>=': {
				return '>=';
			}

			case '<=': {
				return '<=';
			}
		}
	}

	function setModelValue(i: number): string {
		switch (i) {
			case 0: {
				if (modelValues.xValue) {
					return modelValues.xValue;
				}

				break;
			}

			case 1: {
				if (modelValues.yValue) {
					return modelValues.yValue;
				}

				break;
			}

			case 2: {
				if (modelValues.zValue) {
					return modelValues.zValue;
				}

				break;
			}

			default: {
				console.log(
					`No applicable modelValue to set based on number i of ${i}`,
				);
				return '';
			}
		}

		return '';
	}

	let errorPresent = false;
	let i = 0;

	while (i < beforeImpliesExpr.length) {
		const lhsValue = beforeImpliesExpr[i].value;
		const lhsOperator = beforeImpliesExpr[i].operator;

		const rhsValue = afterImpliesExpr[i].value;
		const rhsOperator = afterImpliesExpr[i].operator;

		// Map through all operators and values

		if (lhsOperator === rhsOperator) {
			const comparisonOperator: string = setComparisonOperator(lhsOperator);

			// Check xValue found to satisfy constraints is as expected for operator type, i.e. xValue === lhsValue === rhsValue when operator is '=', xValue > lhsValue and xValue > rhsValue when operator is '>' etc.

			const compareOperations = {
				'=': (x: number, y: number) => x === y,
				'>': (x: number, y: number) => x > y,
				'<': (x: number, y: number) => x < y,
				'>=': (x: number, y: number) => x >= y,
				'<=': (x: number, y: number) => x <= y,
			};

			const modelValue = setModelValue(i);

			if (modelValue === '') {
				console.log("modelValue was not assigned a value, i.e. ''");
				errorPresent = true;
			}

			if (
				compareOperations[comparisonOperator as SplitOperatorType](
					Number(modelValue),
					Number(lhsValue),
				) &&
				compareOperations[comparisonOperator as SplitOperatorType](
					Number(modelValue),
					Number(rhsValue),
				)
			) {
				console.log('pass');
			} else {
				console.log(
					`model value ${modelValue} returned didnt meet logical constraint for variable`,
				);
				errorPresent = true;
			}
		} else {
			console.log(
				"Error: Values discovered to satisfy constraints for arith law call in skip law call proof don't match ones passed to method, hence not a display of validity in this instance",
			);
			errorPresent = true;
		}

		i++;
	}

	return errorPresent;
}

function checkSatResult({
	result,
	solver,
	beforeImpliesExpr,
	afterImpliesExpr,
}: {
	result: any;
	solver: any;
	beforeImpliesExpr: ImpliesPartExpr[];
	afterImpliesExpr: ImpliesPartExpr[];
}): boolean {
	console.log('sat result overall is:', result);
	if (result === 'sat') {
		const model = solver.model();
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

		const checkDisallowedModelValuesProps: [
			ImpliesPartExpr[],
			ImpliesPartExpr[],
			ModelValuesType,
		] = [beforeImpliesExpr, afterImpliesExpr, modelValues];

		if (checkDisallowedModelValues(...checkDisallowedModelValuesProps)) {
			console.log(
				'checkSatResult error: model values generated dont match constraints in proof, e.g. xValue = 5 with constraint of x < 3',
			);
			return false;
		}

		return true;
	}

	return false;
}

export {checkSatResult};
