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
};
