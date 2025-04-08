import {type LawTypeKeys, type DiagnosticsType} from '@/models/misc';
import {checkSpecificLawRegex} from '@/utilities/handle-proof-syntax-check/syntax-check/parse-proof-line-format-utils/check-specific-law-regex';
import {checkLawIsPassed} from '@/utilities/handle-proof-syntax-check/syntax-check/parse-proof-line-format-utils/check-law-is-passed';

function parseProofLineFormat(
	textLine: string,
	lawSuffixs: LawTypeKeys[],
): DiagnosticsType {
	const retrievedDiagnostics: DiagnosticsType = {
		isValid: true,
		errors: [],
	};

	for (const law of lawSuffixs) {
		console.log('Checking each law suffix, currently checking:', law);

		// Check if line ends with a particular law suffix
		if (checkLawIsPassed(textLine, law)) {
			// Pass law suffix to method to check against specific regex for expression using that law
			console.log('law:', law, 'is present in textline:', textLine);

			// Checks line adheres to spec for a proof line containing that law, if not retrieving the relevant errors and setting proof to be invalid, i.e. isValid = false
			const {isValid, errors} = checkSpecificLawRegex(textLine, law);
			retrievedDiagnostics.isValid = isValid;
			retrievedDiagnostics.errors = errors;
			break;
		} else {
			retrievedDiagnostics.isValid = false;
			retrievedDiagnostics.errors = [
				"Line does not end with a recognised law suffix, e.g. ':hskip <int>'",
			];
		}
	}

	// Setting retrievedDiagnostics to state no rule is recognised after doing initial regex parse with all applicable law suffixes

	return retrievedDiagnostics;
}

export {parseProofLineFormat};
