import {parseProofLineFormat} from '@/utilities/handle-proof-syntax-check/syntax-check/parse-proof-line-format';
import {type LawTypeKeys, type ErrorMsg} from '@/models/misc';

function hasFormatErrors(
	trimmedLines: string[],
	lawSuffixes: LawTypeKeys[],
): ErrorMsg[] {
	// Check each lines syntax matches up to expected format, if not set the errorMessage
	const errorMessages: ErrorMsg[] = [];

	for (const line of trimmedLines) {
		const lineFormatResult = parseProofLineFormat(line, lawSuffixes);
		if (!lineFormatResult.isValid) {
			const allErrorMessagesForLine: ErrorMsg = {
				messages: lineFormatResult.errors,
				lineNumber: trimmedLines.indexOf(line) + 1,
			};
			errorMessages.push(allErrorMessagesForLine);
		}
	}

	return errorMessages;
}

export {hasFormatErrors};
