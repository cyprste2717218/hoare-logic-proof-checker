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
			const pattern = /^[a-zA-Z]=\d{1,2}\s*->\s*[a-zA-Z]=\d{1,2}\s*$/;
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
			diagnostics.errors.push(':arith law must be of the form a=b->c=d');
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
