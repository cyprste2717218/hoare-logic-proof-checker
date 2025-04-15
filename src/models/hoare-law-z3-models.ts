type ProofLawDetails = {
	arith: {
		expr1: string;
		expr2: string;
	};
	hskip: {
		precondition: string;
		program: string;
		postcondition: string;
	};
};

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

type EqualsSplitReturnObjType = {
	variable: string;
	variableValue: string;
};

export type {
	ProofLawDetails,
	HoareLawStructure,
	OtherLawStructure,
	ArithObjType,
	EqualsSplitReturnObjType,
};
