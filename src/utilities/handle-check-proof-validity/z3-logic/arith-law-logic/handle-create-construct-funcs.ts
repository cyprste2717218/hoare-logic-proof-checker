import type {LawTypeHoare} from '@/models/misc';
import type {
	SplitOperatorType,
	SplitReturnObjType,
} from '@/models/hoare-law-z3-models';

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

export {
	handleCreateExprValues,
	handleCreateOperators,
	handleCreateVariableNames,
};
