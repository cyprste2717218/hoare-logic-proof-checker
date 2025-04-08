import {validRegexFormats} from '@/lib/regex-formats';
import {doLawSpecificChecks} from '@/utilities/handle-proof-syntax-check/syntax-check/parse-proof-line-format-utils/do-law-specific-checks';
import type {LawTypeKeys, LawType, DiagnosticsType} from '@/models/misc';

// Checks line adheres to spec for a proof line containing that law
function checkSpecificLawRegex(
	textLine: string,
	law: LawTypeKeys,
): DiagnosticsType {
	function checkLawGroup(key: LawTypeKeys): keyof LawType {
		if (key in validRegexFormats.hoareLaws) {
			return 'hoareLaws';
		}

		return 'other';
	}

	const retrievedDiagnostics: DiagnosticsType = {
		isValid: true,
		errors: [],
	};

	const lawGroup = checkLawGroup(law);

	// Do law specific checks
	const {isValid, errors} = doLawSpecificChecks(textLine, lawGroup, law);

	// Set new values for validity and syntax errors discovered
	retrievedDiagnostics.isValid = isValid;
	retrievedDiagnostics.errors = errors;

	return retrievedDiagnostics;
}

export {checkSpecificLawRegex};
