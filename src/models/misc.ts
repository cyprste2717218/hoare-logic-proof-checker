type CurrentProofStateType =
	| 'Valid'
	| 'Invalid - Syntax Error'
	| 'Invalid - Proof Error'
	| 'Unchecked'
	| 'Unchecked - Change Present';

type CurrentPageContentType =
	'Hoare Logic Proof Validator' | 'Reference Guide' | 'Settings';

type ErrorMsg = {
	messages: string[];
	lineNumber: number;
};

type LawType = {
	hoareLaws: {
		hskip: string;
		hassign: string;
		hcond: string;
		hseq: string;
		hwhile: string;
	};
	other: {
		arith: string;
		subst: string;
		simpf: string;
	};
};

type LawTypeHoare = keyof LawType['hoareLaws'];

type LawTypeOther = keyof LawType['other'];

type LawTypeKeys = LawTypeHoare | LawTypeOther;

type DiagnosticsType = {
	isValid: boolean;
	errors: string[];
};

type RegexCheckItem = {
	expression: RegExp;
	message: string;
};

type AllRegexChecks = Record<string, RegexCheckItem>;

type GetLawCallDetailsType = {
	proofLine: string;
	lineNum: number;
};

type GetHoareLawCallDetailsType = {
	law: LawTypeHoare;
} & GetLawCallDetailsType;

type GetOtherLawCallDetailsType = {
	law: LawTypeOther;
} & GetLawCallDetailsType;

type CollectedTripleProofLines = {
	hoareLaw: {
		lawName: LawTypeHoare;
		line: string;
	};
	supportingProofLine: {
		lawName: LawTypeOther;
		line: string;
	};
	furtherSupportingProofLine?: {
		lawName: LawTypeOther;
		line: string;
	};
};

type SupportingProofLineDetailsType =
	| {
			proofLine: string;
			supportingLineSuffix: string;
			supportingProofLineNum: number;
			hasFurtherProofLine: boolean;
	  }
	| undefined;

export type {
	CurrentProofStateType,
	CurrentPageContentType,
	ErrorMsg,
	LawType,
	LawTypeHoare,
	LawTypeOther,
	LawTypeKeys,
	DiagnosticsType,
	RegexCheckItem,
	AllRegexChecks,
	GetHoareLawCallDetailsType,
	GetOtherLawCallDetailsType,
	GetLawCallDetailsType,
	CollectedTripleProofLines,
	SupportingProofLineDetailsType,
};
