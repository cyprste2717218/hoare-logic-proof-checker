type CurrentProofStateType =
	| 'Valid'
	| 'Invalid - Syntax Error'
	| 'Invalid - Proof Error'
	| 'Unchecked'
	| 'Unchecked - Change Present';

type CurrentPageContentType =
	| 'Hoare Logic Proof Validator'
	| 'Reference Guide'
	| 'Settings';

type ErrorMsg = {
	messages: string[];
	lineNumber: number;
};

type LawType = {
	hoareLaws: {
		hskip: string;
	};
	other: {
		arith: string;
	};
};

type LawTypeKeys = keyof LawType['hoareLaws'] | keyof LawType['other'];

type DiagnosticsType = {
	isValid: boolean;
	errors: string[];
};

type RegexCheckItem = {
	expression: RegExp;
	message: string;
};
type AllRegexChecks = Record<string, RegexCheckItem>;

export type {
	CurrentProofStateType,
	CurrentPageContentType,
	ErrorMsg,
	LawType,
	LawTypeKeys,
	DiagnosticsType,
	RegexCheckItem,
	AllRegexChecks,
};
