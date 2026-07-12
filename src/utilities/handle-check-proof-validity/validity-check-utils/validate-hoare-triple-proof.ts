import {decomposeProofLines} from '@/utilities/handle-check-proof-validity/validity-check-utils/validate-hoare-triple-proof/decompose-proof-lines';
import {parseSupportingProofLines} from '@/utilities/handle-check-proof-validity/validity-check-utils/validate-hoare-triple-proof/parse-supporting-proof-lines';
import type {
	LawTypeOther,
	GetHoareLawCallDetailsType,
	CollectedTripleProofLines,
	SupportingProofLineDetailsType,
} from '@/models/misc';

async function validateHoareTripleProof(
	hoareLawCallDetails: GetHoareLawCallDetailsType | undefined,
	formattedProofContent: string[],
): Promise<boolean> {
	console.log('hoareLawCallDetails:', hoareLawCallDetails);

	// Early return if no hoare law call details passed, hence no hoare logic proof to validate
	if (!hoareLawCallDetails) {
		console.error('No hoare law call detected in proof content');
		return false;
	}

	// Determine the supporting proof line number(s) from the proof line with the hoare law call and check appropiateness for the proof type at hand

	const supportingProofLines: SupportingProofLineDetailsType =
		parseSupportingProofLines({
			formattedProofContent,
			hoareLawCallDetails,
		});

	if (!supportingProofLines) {
		console.error('No appropiate supporting proof lines detected for proof');
		return false;
	}

	// Checking if has further proof line in support of supporting proof line discovered, if so getting details to parse into collectedTripleProofDetails obj
	const hasFurtherProofLine = supportingProofLines.hasFurtherProofLine;

	let furtherSupportingProofLine: SupportingProofLineDetailsType;

	if (hasFurtherProofLine) {
		console.log(
			supportingProofLines.supportingLineSuffix,
			'has suppporting line',
		);

		const law = supportingProofLines.supportingLineSuffix;
		const line = supportingProofLines.proofLine;
		const lineNum = supportingProofLines.supportingProofLineNum;

		const otherLawCallDetails = {
			law: law as LawTypeOther,
			proofLine: line,
			lineNum,
		};

		furtherSupportingProofLine = parseSupportingProofLines({
			formattedProofContent,
			otherLawCallDetails,
		});

		if (furtherSupportingProofLine === undefined) {
			console.error(
				'No appropiate further supporting proof line detected for proof',
			);
			return false;
		}
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
		...(furtherSupportingProofLine
			? {
					furtherSupportingProofLine: {
						lawName:
							furtherSupportingProofLine.supportingLineSuffix as LawTypeOther,
						line: furtherSupportingProofLine.proofLine,
					},
				}
			: {}),
	};

	console.log('collectedTripleProofDetails:', collectedTripleProofDetails);

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
