type HoareLaw = {
	hoareLaw: {
		precondition: string;
		program: string;
		postcondition: string;
	};
};

type ArithLawExpr = {
	arith: ArithObjType;
};

type SubstLawExpr = {
	subst: SubstObjType;
};

type SubstLawUndefined = {
	substitutionExpression: string;
};
type ArithLawUndefined = {
	arithExpression: string;
};

type ProofSkipLawDetails = ArithLawExpr & HoareLaw;

type ProofAssignLawDetails = SubstLawUndefined & HoareLaw & ArithLawUndefined;

type ArithAndSubstDetails = SubstLawExpr & ArithLawUndefined;

type HoareLawStructure = {
	precondition: string;
	program: string;
	postcondition: string;
};

type OtherLawStructure = {
	expr1: string;
	operator: string;
	expr2: string;
};

type ArithObjType = {
	expr1: string;
	expr2: string | string[];
};

type SubstObjType = {
	substPrecondition: string;
	substPostcondition: string;
	substVariable: string;
	substAssignment: string;
};

type SplitOperatorType = '=' | '>' | '<' | '<=' | '>=';

type SplitReturnObjType = {
	variable: string;
	operator: SplitOperatorType | '';
	variableValue: string;
};

type ImpliesPartExpr = {
	operator: SplitOperatorType;
	value: string;
};

type ModelValuesType = {
	xValue: undefined | string;
	yValue: undefined | string;
	zValue: undefined | string;
};

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

type HskipDispatchProps = [SplitReturnObjType[], SplitReturnObjType[]];

type HassignDispatchProps = [SplitReturnObjType[], ArithObjType];

type DispatchPropsType = HskipDispatchProps | HassignDispatchProps;

export type {
	ArithLawExpr,
	SubstLawExpr,
	ArithAndSubstDetails,
	ProofSkipLawDetails,
	ProofAssignLawDetails,
	HoareLawStructure,
	OtherLawStructure,
	ArithObjType,
	SplitReturnObjType,
	SplitOperatorType,
	ImpliesPartExpr,
	ConstraintPropsType,
	FetchConstraintsPropsLhsType,
	FetchConstraintsPropsType,
	ModelValuesType,
	ExpressionValues,
	CreatedOperatorsType,
	CreatedValuesType,
	CreatedVariableNamesType,
	Z3Variable,
	VariableDictionary,
	ExprVarNameLhsTypes,
	ExprVarNameRhsTypes,
	ExprVarNameTypes,
	ExprValueLhsTypes,
	ExprValueRhsTypes,
	ExprValueTypes,
	ExprOperatorLhsTypes,
	ExprOperatorRhsTypes,
	ExprOperatorTypes,
	HskipDispatchProps,
	HassignDispatchProps,
	DispatchPropsType,
};
