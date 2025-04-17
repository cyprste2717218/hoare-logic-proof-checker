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

		// Checks that :arith call is of the form <char><oper><int> /\ <char><oper><int>... -> <char><oper><int> /\ <char><oper><int> ... e.g. x>1 -> x>1, x = 2 /\ y <= 2 -> x=2 /\ y <= 2
		function checkArrowFormat(textLine: string): boolean {
			const pattern =
				/^([a-zA-Z]\s?(?:=|>|<|>=|<=)\s?\d{1,2}(\s*\/\\\s*[a-zA-Z]\s?(?:=|>|<|>=|<=)\s?\d{1,2})*)\s*->\s*([a-zA-Z]\s?(?:=|>|<|>=|<=)\s?\d{1,2}(\s*\/\\\s*[a-zA-Z]\s?(?:=|>|<|>=|<=)\s?\d{1,2})*)\s*$/;
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
				':arith law must be of the form a <op> b -> c <op> d',
				'where <op> can be >, <, <=, >= or =',
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
