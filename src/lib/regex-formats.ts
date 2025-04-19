/* eslint-disable no-useless-escape */
import type {LawType, AllRegexChecks} from '@/models/misc';

const validRegexFormats: LawType = {
	hoareLaws: {
		// Pattern matches: expr1 :hskip <int>
		hskip: '.*:hskip\\s*[0-9]{1,2}$',
		// Pattern matches: expr1 :hseq <int>
		hseq: '.*:hseq\\s*[0-9]{1,2}$',
		// Pattern matches: expr1 :hassign <int>
		hassign: '.*:hassign\\s*[0-9]{1,2}$',
		// Pattern matches: expr1 :hcond <int> <int>
		hcond: '.*:hcond\\s*[0-9]{1,2}\s*[0-9]{1,2}$',
		// Pattern matches: expr1 :hwhile <int>
		hwhile: '.*:hwhile\\s*[0-9]{1,2}$',
	},
	other: {
		// Pattern matches: expr1 :arith
		arith: '.*:arith$',
		// Pattern matches: expr1 :subst <int>
		subst: '.*:subst\\s*[0-9]{1,2}$',
		// Pattern matches: expr1 :simpf <int>
		simpf: '.*:simpf\\s*[0-9]{1,2}$',
	},
};

const allChecks: AllRegexChecks = {
	// To-do: allow for optional single whitespace char between constants and operators, i.e. x = 3, y > 4
	preConditionOpenCloseBraces: {
		expression: /^{[^{}]*}/,
		message:
			"Precondition does not contain both closing and opening braces, '{}'",
	},
	preConditionBody: {
		expression:
			/^(?:[a-zA-Z]+(?:[<>]=?|=)[a-zA-Z\d](?:\s*\/\\\s*[a-zA-Z]+(?:[<>]=?|=)[a-zA-Z\d])*|T)$/,
		message:
			'Precondition body is incorrectly formatted, should be singular/list of expressions of form <expr><operator><expr> delimited by /\\, e.g. x=2 /\\ y>=3',
	},
	postConditionOpenCloseBraces: {
		expression: /^{[^{}]*}.*$/,
		message:
			"Postcondition does not contain both closing and opening braces, '{}'",
	},
	postConditionBody: {
		expression:
			/^[a-zA-Z]+(?:[<>]=?|=)[a-zA-Z\d](?:\s*\/\\\s*[a-zA-Z]+(?:[<>]=?|=)[a-zA-Z\d])*$/,
		message:
			'Postcondition body is incorrectly formatted, should be singular/list of expressions of form <expr><operator><expr> delimited by /\\, e.g. x=2 /\\ y>=3',
	},
	programBodyHskip: {
		expression:
			/^[a-zA-Z]+(?:[<>]=?|=|:=)[a-zA-Z\d](?:\s*\/\\\s*[a-zA-Z]+(?:[<>]=?|=|:=)[a-zA-Z\d])*$/,
		message:
			'Program supplied to triple in Skip Law call is incorrectly formatted, should be a single expression or a list of expressions of the form <expr><operator><expr> delimited by /\\, e.g. x:=3',
	},
	programBodyHassign: {
		expression: /^[a-zA-Z]:=(?:[a-zA-Z\d]|[a-zA-Z\d](?:[*\-+/][a-zA-Z\d])+)$/,
		message:
			'Program supplied to triple in Assignment Law call is incorrectly formatted, should be a single expression of the form <char>:=<expr>, e.g. x:=x+2',
	},
};

export {validRegexFormats, allChecks};
