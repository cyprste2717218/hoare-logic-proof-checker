import type {/* AllRegexChecks, */ DiagnosticsType} from '@/models/misc';

function doOtherLawChecks(textLine: string): DiagnosticsType {
	// To-do: to be further instantiated
	console.log(textLine);

	// Check for presence of syntax errors, 'reading' proof line from left to right

	/* 	for (const checkName of checkKeys) {
		if (!checks[checkName].expression.test(textLine)) {
			diagnostics.errors.push(checks[checkName].message);
			diagnostics.isValid = false;
		}
	}
	 */
	return {
		isValid: true,
		errors: [] as string[],
	};
}

export {doOtherLawChecks};
