import {checkLawIsPassed} from '@/utilities/common/check-law-is-passed';
import {validRegexFormats} from '@/lib/regex-formats';
import type {
	GetHoareLawCallDetailsType,
	LawTypeHoare,
	LawTypeKeys,
} from '@/models/misc';

type SupportingProofLineDetailsType =
	| {
			proofLine: string;
			supportingLineSuffix: string;
	  }
	| undefined;

function retrieveSupportingProofLines(
	hoareLawCallDetails: GetHoareLawCallDetailsType,
	formattedProofContent: string[],
): string[] {
	function getSupportingProofLinesArr(
		formattedProofContent: string[],
		lineNums: number[],
	): string[] {
		const supportingProofLines: string[] = [];

		for (const proofLineNum of lineNums) {
			const proofContentLine: string = formattedProofContent[proofLineNum - 1];

			if (proofContentLine) {
				supportingProofLines.push(formattedProofContent[proofLineNum - 1]);
			}

			console.error(`No proof line ${proofLineNum} detected`);
		}

		return supportingProofLines;
	}

	function extractSupportingLineNumsString(
		text: string,
		phrase: string,
	): string {
		const index = text.indexOf(phrase);

		// Get everything after the phrase by adding phrase length to index
		return text.slice(Math.max(0, index + phrase.length)).trim();
	}

	function extractLineNumbersFromProofLine(text: string): number[] {
		// Match one or more digits
		const matches = text.match(/\d+/g);

		// If no matches found, return empty array
		if (!matches) {
			return [];
		}

		// Convert string matches to numbers
		return matches.map((match) => Number.parseInt(match, 10));
	}

	// Extract relevant proof line with hoare law call
	const relevantProofLine =
		formattedProofContent[hoareLawCallDetails.lineNum - 1];

	// Retrieve the substring containing the line number calls, parse the line number(s) stated and retrieve the corresponding proof lines

	const lineNumCalls: string = extractSupportingLineNumsString(
		relevantProofLine,
		hoareLawCallDetails.law,
	);

	const extractedLineNums: number[] =
		extractLineNumbersFromProofLine(lineNumCalls);
	if (extractedLineNums.length === 0) {
		console.error(
			`No supporting proof lines detected on hoare law ${hoareLawCallDetails.law} proof line call`,
		);
		return [];
	}

	const supportingProofLines: string[] = getSupportingProofLinesArr(
		formattedProofContent,
		extractedLineNums,
	);

	return supportingProofLines;
}

function processSupportingProofLines(
	retrievedLines: string[],
	hoareLaw: LawTypeHoare,
): SupportingProofLineDetailsType {
	function checkSupportingLineSuffix(
		supportingProofLine: string,
	): LawTypeKeys | undefined {
		// Check that the line suffix is valid for the hoare law call

		function getLineSuffix(
			supportingProofLine: string,
			allLawSuffixs: LawTypeKeys[],
		): LawTypeKeys | undefined {
			for (const law of allLawSuffixs) {
				if (checkLawIsPassed(supportingProofLine, law)) {
					return law;
				}
			}
		}

		const allLawSuffixs: LawTypeKeys[] = [
			...(Object.keys(validRegexFormats.hoareLaws) as LawTypeKeys[]),
			...(Object.keys(validRegexFormats.other) as LawTypeKeys[]),
		];

		const supportingLineSuffix: LawTypeKeys | undefined = getLineSuffix(
			supportingProofLine,
			allLawSuffixs,
		);

		if (!supportingLineSuffix) {
			console.error(
				`No valid line suffix detected for supporting proof line: ${supportingProofLine}`,
			);
			return;
		}

		console.log('supporting line suffix is:', supportingLineSuffix);

		return supportingLineSuffix;
	}

	function checkAppropiateSupportingLaw(
		supportingLineSuffix: string,
		hoareLaw: LawTypeHoare,
	) {
		// Disabling exhaustive check as function is known to be incomplete and support for other hoare laws will be added soon but application can function without support for now
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (hoareLaw) {
			case 'hskip': {
				if (supportingLineSuffix === 'arith') {
					return true;
				}

				console.error(`Invalid line suffix for hskip: ${supportingLineSuffix}`);
				return false;
			}

			/* To-do: add cases for other hoare law calls and their allowed supporting proof line law calls, i.e. other hoare law calls and/or 'other' laws such as 'arith', 'subst' etc. */
		}
	}

	// Work out what law is being used by checking line suffix

	// for now only getting first line from supporting proof lines arr, hence index to retrievedLines[0]
	const supportingLineSuffix: LawTypeKeys | undefined =
		checkSupportingLineSuffix(retrievedLines[0]);

	if (!supportingLineSuffix) {
		console.error(
			`No supporting line suffix detected for supporting proof line: ${retrievedLines[0]}`,
		);
		return;
	}

	// Check that it is the appropiate supporting law for the hoare law call, i.e. hskip should have an :arith call for its proof line

	if (!checkAppropiateSupportingLaw(supportingLineSuffix, hoareLaw)) {
		console.error(
			`Invalid supporting proof line detected for hoare law ${hoareLaw} call`,
		);
		return;
	}

	console.log(
		`valid supporting proof line call ${supportingLineSuffix} for hoare law call ${hoareLaw}`,
	);

	// For other functions do other relevant checks, but for hskip check that all the P and Q values are the same, excluding the C in {P} C {Q} which can have a ':' before the '=' in a single variable call i.e. {x=1} x:=1 {x=1}, if not the proof is invalid

	// check that P -> Q :arith line returns true via Z3 solver, if so return overall proof as valid

	return {
		proofLine: retrievedLines[0],
		supportingLineSuffix,
	};
}

function parseSupportingProofLines(
	formattedProofContent: string[],
	hoareLawCallDetails: GetHoareLawCallDetailsType,
): SupportingProofLineDetailsType {
	const supportingProofLines: string[] = retrieveSupportingProofLines(
		hoareLawCallDetails,
		formattedProofContent,
	);

	console.log('supporting proof lines:', supportingProofLines);

	if (supportingProofLines.length === 0) {
		console.error(
			'No supporting proof lines retrieved for hoare law call:',
			hoareLawCallDetails.law,
			'on line number',
			hoareLawCallDetails.lineNum,
		);
		// Need to return something to alter proof state to be invalid and border set to red for proof error issue
		return;
	}

	const processedSupportingLines: SupportingProofLineDetailsType =
		processSupportingProofLines(supportingProofLines, hoareLawCallDetails.law);

	if (!processSupportingProofLines) {
		console.error('error returning processed supporting lines for proof');
		return;
	}

	return processedSupportingLines;
}

export {parseSupportingProofLines};
