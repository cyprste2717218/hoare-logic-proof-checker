import { type ErrorMsg, type LawTypeKeys } from '@/models/misc';
import { validRegexFormats } from '@/lib/regex-formats';
import {
	formatProof,
	hasFormatErrors,
} from '@/utilities/handle-proof-syntax-check/format-utils';

type HandleProofCheckProps = {
	proofContent: string;
};

type HandleProofSyntaxCheckProps = {
	formattedProofLines: string[];
	syntaxErrors: ErrorMsg[];
};

function handleProofSyntaxCheck({
	proofContent,
}: HandleProofCheckProps): HandleProofSyntaxCheckProps {
	const lawSuffixs: LawTypeKeys[] = [
		...(Object.keys(validRegexFormats.hoareLaws) as LawTypeKeys[]),
		...(Object.keys(validRegexFormats.other) as LawTypeKeys[]),
	];
	const errors: ErrorMsg[] = [];

	console.log('before formatting:', proofContent);

	// Format the proof into array of proof lines and check for syntax errors
	const formattedProofLines = formatProof(proofContent);

	console.log('formatted proof lines:', formattedProofLines);
	const syntaxErrors: ErrorMsg[] = hasFormatErrors(
		formattedProofLines,
		lawSuffixs,
	);

	// Check for any syntax errors and return them, or if no errors return formatted proof lines
	if (syntaxErrors.length > 0) {
		errors.push(...syntaxErrors);
		console.log('Proof does not adhere to syntax');
	} else {
		console.log('Proof adheres to syntax');
	}

	return { syntaxErrors: errors, formattedProofLines };
}

export { handleProofSyntaxCheck };
