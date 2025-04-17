import {validRegexFormats} from '@/lib/regex-formats';
import {validateHoareTripleProof} from '@/utilities/handle-check-proof-validity/validity-check-utils/validate-hoare-triple-proof';
import type {GetHoareLawCallDetailsType} from '@/models/misc';

function getHoareLawCallDetails(
	formattedProofLine: string,
	lineNum: number,
): GetHoareLawCallDetailsType | undefined {
	const hoareLaws = Object.keys(validRegexFormats.hoareLaws) as Array<
		keyof typeof validRegexFormats.hoareLaws
	>;

	for (const lawName of hoareLaws) {
		const regexFormat = validRegexFormats.hoareLaws[lawName];
		const regExPattern = new RegExp(regexFormat);
		if (regExPattern.test(formattedProofLine)) {
			console.log(`${lawName} hoare law detected`);
			return {
				proofLine: formattedProofLine,
				law: lawName,
				lineNum,
			};
		}
	}

	return undefined;
}

async function getTripleValidityArr(
	formattedProofContent: string[],
): Promise<boolean[]> {
	// Iterate through each hoare triple and check validity, if valid concatenate into boolean array

	const tripleValidityArr: boolean[] = [];

	for (const formattedProofLine of formattedProofContent) {
		const checkHoareLawCallResult: GetHoareLawCallDetailsType | undefined =
			getHoareLawCallDetails(
				formattedProofLine,
				formattedProofContent.indexOf(formattedProofLine) + 1,
			);

		if (checkHoareLawCallResult) {
			/* eslint-disable no-await-in-loop -- Could be a performance gain here if altering this code to use Promises.all() and allowing other loops to execute snchronously but sufficient to leave for now in current use case */
			const tripleValidResult: boolean = await validateHoareTripleProof(
				checkHoareLawCallResult,
				formattedProofContent,
			);
			/* eslint-enable no-await-in-loop */
			tripleValidityArr.push(tripleValidResult);
		}
	}

	/* No hoare triple calls detected but getting here means syntax check passed, so expression is likely made up of otherLaw calls, i.e. arith, simf, subst statements only, hence tripleValidityArr should be empty. Need to return false as not a valid proof for a hoare triple. 
	Note: May want to alter the action taken here to describe the issue as described to the user, leaving for now however
	*/
	if (tripleValidityArr.length === 0) {
		console.log('no hoare triple calls detected so sending invalid response');
		return [false];
	}

	return tripleValidityArr;
}

export {getTripleValidityArr};
