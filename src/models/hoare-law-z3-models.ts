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

type ProofSkipLawDetails = ArithLawExpr & HoareLaw;

type ProofAssignLawDetails = SubstLawExpr & HoareLaw;

type ArithAndSubstDetails = SubstLawExpr & ArithLawExpr;

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
	expr2: string;
};

type SubstObjType = {
	precondition: string;
	postcondition: string;
	substitutionExpression: string;
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
