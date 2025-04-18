import type {
	/* AllRegexChecks, */ DiagnosticsType,
	LawTypeKeys,
} from '@/models/misc';

function doOtherLawChecks(textLine: string, law: LawTypeKeys): DiagnosticsType {
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

	if (law === 'arith') {
		const arithLawChecks = doArithLawChecks(textLine);

		if (arithLawChecks.errors.length > 0 && !arithLawChecks.isValid) {
			// Early return if errors present in arith checks
			return arithLawChecks;
		}
	}

	return {
		isValid: true,
		errors: [] as string[],
	};
}

export {doOtherLawChecks};
