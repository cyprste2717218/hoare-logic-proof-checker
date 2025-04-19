import type {AllRegexChecks, DiagnosticsType, LawTypeKeys} from '@/models/misc';

function doOtherLawChecks(
	textLine: string,
	law: LawTypeKeys,
	checks: AllRegexChecks,
): DiagnosticsType {
	function doArithLawChecks(textLine: string): DiagnosticsType {
		function extractBeforeArithSuffix(line: string): string {
			const pattern = /(.*):arith$/;
			const match = pattern.exec(line);
			return match ? match[1] : '';
		}

		function checkArrowFormat(textLine: string): boolean {
			/*
			| Key: 
			| <char> = alphabetical character, i.e. 'a', 'b', 'c'
			| <num> = number, i.e. '1', '2', '3'
			| <mop> = mathematical operator, i.e. '+', '-', '*', '/'
			| <cop> = comparison operator, i.e. '=', '>', '<', '>=', '<='
			| [n..*] = n or more occurences
			| [n..m] = n to m occurences
	
			Checks that :arith call is of the form:
			(<char><cop><num>) /\ (<char><cop><num>) -> <char><cop><num> | [1..*](<char|num><mop><char|num>)<cop>[1..*](<char|num><mop><char|num>)
			
			For example:
			 x>1 /\ y>1 -> x+y>2
			 x=1 -> x+2=3
			*/
			const pattern =
				/^([a-zA-Z](?:=|>|<|>=|<=)\s?\d{1,2}(\s*\/\\\s*[a-zA-Z](?:=|>|<|>=|<=)\s?\d{1,2})*)\s*->\s*([a-zA-Z](?:[*\-+/][a-zA-Z\d])*(?:=|>|<|>=|<=)[a-zA-Z\d](?:[*\-+/][a-zA-Z\d])*(\s*\/\\\s*[a-zA-Z](?:[*\-+/][a-zA-Z\d])*(?:=|>|<|>=|<=)[a-zA-Z\d](?:[*\-+/][a-zA-Z\d])*)*)\s*$/;
			return pattern.test(textLine);
		}

		const diagnostics: DiagnosticsType = {
			isValid: true,
			errors: [] as string[],
		};

		const retrieveLineWithoutSuffix = extractBeforeArithSuffix(textLine);
		console.log('retrieveLineWithoutSuffix', retrieveLineWithoutSuffix);
		if (retrieveLineWithoutSuffix === '') {
			diagnostics.isValid = false;
			diagnostics.errors.push(
				'Unable to retrieve location of arith law from text line',
			);

			return diagnostics;
		}

		if (!checkArrowFormat(retrieveLineWithoutSuffix)) {
			diagnostics.isValid = false;
			diagnostics.errors.push(
				'arith law must be of the form:',
				'--------------------------------',
				'a<cop>b -> c<mop>d<cop>e',
				'--------------------------------',
				'where <cop> can be >, <, <=, >= or =',
				'and <mop> can be +, -, / or *',
				'e.g. x=1 -> x+2=3',
			);
		}

		return diagnostics;
	}

	function doSubstLawChecks(textLine: string): DiagnosticsType {
		function extractAfterImpliesArrow(line: string): string {
			const pattern = /->(.*?)$/;
			const match = pattern.exec(line);
			return match ? match[1].trimEnd() : '';
		}

		function checkSubstitutionFormat(textLine: string): boolean {
			function extractBetweenSquareBrackets(text: string): string {
				if (!text.endsWith(']')) {
					return '';
				}

				const pattern = /\[(.*?)]$/;
				const match = pattern.exec(text);
				return match ? match[1] : '';
			}

			const extractedSubstExpr: string = extractBetweenSquareBrackets(textLine);
			if (extractedSubstExpr.length === 0) {
				console.log(
					"unable to find and extract expression between :subst '[' and ']' susbtitution braces",
				);
				return false;
			}

			console.log(
				'found expression between substitution square braces in :subst call:',
				extractedSubstExpr,
			);

			// Check body meets expected format for a hoare triple postcondition body
			const substExpresionCheck =
				checks.substitution.expression.test(extractedSubstExpr);
			return substExpresionCheck;
		}

		function checkPostConditionFormat(textLine: string): boolean {
			function extractBetweenParentheses(text: string): string {
				if (!text.startsWith('(')) {
					return '';
				}

				const pattern = /^\((.*?)\)/;
				const match = pattern.exec(text);
				return match ? match[1] : '';
			}

			const extractedPostCond: string = extractBetweenParentheses(textLine);
			console.log('extracted postcond in subst call:', extractedPostCond);

			if (extractedPostCond.length === 0) {
				console.log(
					"unable to find and extract expression between :subst '(' and ')' postcondition braces",
				);
				return false;
			}

			console.log(
				'found expression between postcondition braces in :subst call:',
				extractedPostCond,
			);

			// Check body meets expected format for a hoare triple postcondition body
			const postConditionBodyCheck =
				checks.postConditionBody.expression.test(extractedPostCond);
			return postConditionBodyCheck;
		}

		function checkPreConditionFormat(textLine: string): boolean {
			function extractBeforeImpliesArrow(line: string): string {
				const pattern = /(.*?)->/;
				const match = pattern.exec(line);
				return match ? match[1] : '';
			}

			const extractedPreCond: string = extractBeforeImpliesArrow(textLine);

			// If precond expression before -> doesnt return a result
			if (extractedPreCond.length === 0) {
				return false;
			}

			// Check body meets expected format for a hoare triple precondition body
			const preConditionBodyCheck =
				!checks.preConditionBody.expression.test(extractedPreCond);
			return preConditionBodyCheck;
		}

		function checkArrowFormat(textLine: string) {
			const pattern = /^.+->.+$/;
			return pattern.test(textLine);
		}

		function extractBeforeSubstSuffix(line: string): string {
			const pattern = /(.*):subst\s\d$/;
			const match = pattern.exec(line);
			return match ? match[1] : '';
		}

		const diagnostics: DiagnosticsType = {
			isValid: true,
			errors: [] as string[],
		};

		const retrieveLineWithoutSuffix = extractBeforeSubstSuffix(textLine);
		console.log('retrieveLineWithoutSuffix', retrieveLineWithoutSuffix);
		if (retrieveLineWithoutSuffix === '') {
			diagnostics.isValid = false;
			diagnostics.errors.push(
				'Unable to retrieve location of subst law from text line',
			);

			return diagnostics;
		}

		// Check -> present delimiting expressions of length>1 before and after the operator
		if (!checkArrowFormat(retrieveLineWithoutSuffix)) {
			diagnostics.isValid = false;
			diagnostics.errors.push(
				'subst law must be of the form:',
				'--------------------------------',
				'<expr> -> (<expr>)[<expr>|><expr>]',
				'--------------------------------',
				'e.g. x=1 -> (x=3)[x |> x+2]',
			);

			return diagnostics;
		}

		console.log('expressions delimited by -> present in :subst law call');

		// Check precondition format meets expected syntax for :subst call
		if (!checkPreConditionFormat(retrieveLineWithoutSuffix)) {
			diagnostics.isValid = false;
			diagnostics.errors.push(
				'Malformed precondition body in :subst law call:',
				checks.preConditionBody.message,
			);

			return diagnostics;
		}

		console.log('precondition format met in :subst law call');

		// Extract part of line following the '->' call for further extraction of postcondition and susbstitution expression as needed in subsequent checks

		const expressionAfterImplies: string = extractAfterImpliesArrow(
			retrieveLineWithoutSuffix,
		);

		if (expressionAfterImplies.length === 0) {
			console.error(
				'Error: extracted expression after -> operator in :subst call has length 0',
			);
		}

		// Check postcondition meets expected syntax for :subst call
		if (!checkPostConditionFormat(expressionAfterImplies)) {
			diagnostics.isValid = false;
			diagnostics.errors.push(
				'Malformed postcondition body in :subst law call:',
				checks.postConditionBody.message,
			);

			return diagnostics;
		}

		console.log('postcondition format met in :subst law call');

		// Check substitution expression meets expected syntax in :subst call
		if (!checkSubstitutionFormat(expressionAfterImplies)) {
			diagnostics.isValid = false;
			diagnostics.errors.push(checks.substitution.message);

			return diagnostics;
		}

		console.log('substitution expression format met in :subst law call');

		return diagnostics;
	}

	if (law === 'arith') {
		const arithLawChecks = doArithLawChecks(textLine);

		if (arithLawChecks.errors.length > 0 && !arithLawChecks.isValid) {
			// Early return if errors present in arith checks
			return arithLawChecks;
		}
	} else if (law === 'subst') {
		const substLawChecks = doSubstLawChecks(textLine);

		if (substLawChecks.errors.length > 0 && !substLawChecks.isValid) {
			// Early return if errors present in subst checks
			return substLawChecks;
		}
	}

	return {
		isValid: true,
		errors: [] as string[],
	};
}

export {doOtherLawChecks};
