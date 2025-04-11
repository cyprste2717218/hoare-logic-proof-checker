import {decomposeProofLines} from '@/utilities/handle-check-proof-validity/validity-check-utils/validate-hoare-triple-proof/decompose-proof-lines';
import {parseSupportingProofLines} from '@/utilities/handle-check-proof-validity/validity-check-utils/validate-hoare-triple-proof/parse-supporting-proof-lines';
import type {
	LawTypeOther,
	GetHoareLawCallDetailsType,
	CollectedTripleProofLines,
} from '@/models/misc';

async function validateHoareTripleProof(
	hoareLawCallDetails: GetHoareLawCallDetailsType | undefined,
	formattedProofContent: string[],
): Promise<boolean> {
	// Find line location of first hoare law call

	console.log('hoareLawCallDetails:', hoareLawCallDetails);

	// Early return if no hoare law call detected, hence no hoare logic proof to validate
	if (!hoareLawCallDetails) {
		console.error('No hoare law call detected in proof content');
		return false;
	}

	// Determine the supporting proof line number(s) from the proof line with the hoare law call and check appropiateness for the proof type at hand

	const supportingProofLines:
		| {supportingLineSuffix: string; proofLine: string}
		| undefined = parseSupportingProofLines(
		formattedProofContent,
		hoareLawCallDetails,
	);

	if (!supportingProofLines) {
		console.error('No appropiate supporting proof lines detected for proof');
		return false;
	}

	// Handling proof lines which have been checked to logically follow, to be decomposed into constituent parts for single hoare triple proof

	const collectedTripleProofDetails: CollectedTripleProofLines = {
		hoareLaw: {
			lawName: hoareLawCallDetails.law,
			line: hoareLawCallDetails.proofLine,
		},
		supportingProofLine: {
			lawName: supportingProofLines.supportingLineSuffix as LawTypeOther,
			line: supportingProofLines.proofLine,
		},
	};

	const checkProofTripleValidity: boolean = await decomposeProofLines(
		collectedTripleProofDetails,
	);

	if (!checkProofTripleValidity) {
		console.log(
			'current triple proof is invalid:',
			collectedTripleProofDetails,
		);
		return false;
	}

	console.log('current triple proof is valid!:', collectedTripleProofDetails);
	return true;
}

export {validateHoareTripleProof};
