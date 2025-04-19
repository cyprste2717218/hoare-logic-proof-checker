import {checkLawIsPassed} from '@/utilities/common/check-law-is-passed';
import {validRegexFormats} from '@/lib/regex-formats';
import type {
	GetHoareLawCallDetailsType,
	GetOtherLawCallDetailsType,
	LawTypeKeys,
	SupportingProofLineDetailsType,
} from '@/models/misc';

type ParseSupportingProofLinesType = {
	formattedProofContent: string[];
} & (
	| {
			hoareLawCallDetails: GetHoareLawCallDetailsType;
			otherLawCallDetails?: never;
	  }
	| {
			hoareLawCallDetails?: never;
			otherLawCallDetails: GetOtherLawCallDetailsType;
	  }
);

type RetrieveSupportingProofLinesType = ParseSupportingProofLinesType;

function retrieveSupportingProofLines({
	formattedProofContent,
	hoareLawCallDetails,
	otherLawCallDetails,
}: RetrieveSupportingProofLinesType):
	| {
			supportingProofLines: string[];
			supportingLineNum: number;
	  }
	| undefined {
	function getSupportingProofLinesArr(
		formattedProofContent: string[],
		lineNums: number[],
	): string[] {
		const supportingProofLines: string[] = [];

		for (const proofLineNum of lineNums) {
			const proofContentLine: string = formattedProofContent[proofLineNum - 1];

			if (proofContentLine) {
				supportingProofLines.push(proofContentLine);
			} else {
				console.error(`No proof line ${proofLineNum} detected`);
			}
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

	// Extract relevant proof line with hoare or other law call

	let lawCallDetails:
		| GetHoareLawCallDetailsType
		| GetOtherLawCallDetailsType
		| undefined;
	let lawName = '';
	let lineNum = 999; // Default value which shouldnt likely ever be reached

	if (
		(!hoareLawCallDetails && !otherLawCallDetails) ||
		(hoareLawCallDetails && otherLawCallDetails)
	) {
		return;
	}

	if (hoareLawCallDetails !== undefined) {
		lawCallDetails = hoareLawCallDetails;
		lawName = lawCallDetails.law;
		lineNum = lawCallDetails.lineNum;
	} else if (otherLawCallDetails !== undefined) {
		lawCallDetails = otherLawCallDetails;
		lawName = lawCallDetails.law;
		lineNum = lawCallDetails.lineNum;
	}

	if (lawCallDetails === undefined) {
		console.error('No law call details detected');
		return;
	}

	if (lineNum === 999) {
		console.error(
			'lineNum set to default in retrieveSupportingProofLines, indicating error setting lineNum',
		);
		return;
	}

	const relevantProofLine = formattedProofContent[lineNum - 1];

	// Retrieve the substring containing the line number calls, parse the line number(s) stated and retrieve the corresponding proof lines

	const lineNumCalls: string = extractSupportingLineNumsString(
		relevantProofLine,
		lawName,
	);

	const extractedLineNums: number[] =
		extractLineNumbersFromProofLine(lineNumCalls);
	if (extractedLineNums.length === 0) {
		console.error(
			`No supporting proof lines detected on law ${lawName} proof line call`,
		);
		return;
	}

	const supportingProofLines: string[] = getSupportingProofLinesArr(
		formattedProofContent,
		extractedLineNums,
	);

	const supportingProofLinesObj = {
		supportingProofLines,
		supportingLineNum: extractedLineNums[0],
	};

	return supportingProofLinesObj;
}

function processSupportingProofLines(
	retrievedLines: string[],
	supportingProofLineNum: number,
	law: LawTypeKeys,
): SupportingProofLineDetailsType {
	function hasFurtherProofLine(supportingLineSuffix: LawTypeKeys): boolean {
		switch (supportingLineSuffix) {
			case 'arith': {
				return false;
			}

			case 'subst': {
				return true;
			}

			default: {
				return false;
			}
		}
	}

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
		law: LawTypeKeys,
	) {
		// Disabling exhaustive check as function is known to be incomplete and support for other hoare laws will be added soon but application can function without support for now
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (law) {
			case 'hskip': {
				if (supportingLineSuffix === 'arith') {
					return true;
				}

				console.error(`Invalid line suffix for hskip: ${supportingLineSuffix}`);
				return false;
			}

			case 'hassign': {
				if (supportingLineSuffix === 'subst') {
					return true;
				}

				console.error(
					`Invalid line suffix for hassign: ${supportingLineSuffix}`,
				);
				return false;
			}

			case 'subst': {
				if (supportingLineSuffix === 'arith') {
					return true;
				}

				console.error(`Invalid line suffix for subst: ${supportingLineSuffix}`);
				return false;
			}

			/* To-do: add cases for other hoare law calls and their allowed supporting proof line law calls, i.e. other hoare law calls and/or 'other' laws such as 'arith', 'subst' etc. */
		}
	}

	// Work out what law is being used by checking line suffix

	// for now only getting first line from supporting proof lines arr, hence index to retrievedLines[0]
	const supportingLineSuffix: LawTypeKeys | undefined =
		checkSupportingLineSuffix(retrievedLines[0]);

	// Defining variable for determining if further parsing is needed, i.e. in case of further proof line, and the object to store the retrieved values of these further proof line details in to be returned
	let checkFurtherProofLine = false;

	if (!supportingLineSuffix) {
		console.error(
			`No supporting line suffix detected for supporting proof line: ${retrievedLines[0]}`,
		);
		return;
	}

	// Check that it is the appropiate supporting law for the hoare law call, i.e. hskip should have an :arith call for its proof line

	if (!checkAppropiateSupportingLaw(supportingLineSuffix, law)) {
		console.error(
			`Invalid supporting proof line detected for hoare law ${law} call`,
		);
		return;
	}

	// Determine if supporting law has any proof line(s) which support it, if so return details
	if (hasFurtherProofLine(supportingLineSuffix)) {
		checkFurtherProofLine = true;
	}

	console.log(
		`valid supporting proof line call ${supportingLineSuffix} for law call ${law}`,
	);

	// For other functions do other relevant checks, but for hskip check that all the P and Q values are the same, excluding the C in {P} C {Q} which can have a ':' before the '=' in a single variable call i.e. {x=1} x:=1 {x=1}, if not the proof is invalid

	return {
		proofLine: retrievedLines[0],
		supportingLineSuffix,
		supportingProofLineNum,
		hasFurtherProofLine: checkFurtherProofLine,
	};
}

function parseSupportingProofLines({
	formattedProofContent,
	hoareLawCallDetails,
	otherLawCallDetails,
}: ParseSupportingProofLinesType): SupportingProofLineDetailsType {
	let supportingProofLinesObj:
		| {
				supportingProofLines: string[];
				supportingLineNum: number;
		  }
		| undefined;
	let supportingProofLines: string[] = [];
	let supportingProofLineNum: number;
	let lawCallDetails:
		| GetHoareLawCallDetailsType
		| GetOtherLawCallDetailsType
		| undefined;
	let lawName = '';
	let lineNum = '';

	// Checking that constraints met for determining how to parse supporting line based on law type of given proof line, and not running into runtime issues from allowing definition of both law types or neither
	if (
		(!hoareLawCallDetails && !otherLawCallDetails) ||
		(hoareLawCallDetails && otherLawCallDetails)
	) {
		return;
	}

	if (hoareLawCallDetails !== undefined) {
		supportingProofLinesObj = retrieveSupportingProofLines({
			hoareLawCallDetails,
			formattedProofContent,
		});
		lawCallDetails = hoareLawCallDetails;
		lawName = lawCallDetails.law;
		lineNum = lawCallDetails.lineNum.toString();
	} else if (otherLawCallDetails !== undefined) {
		supportingProofLinesObj = retrieveSupportingProofLines({
			otherLawCallDetails,
			formattedProofContent,
		});

		lawCallDetails = otherLawCallDetails;
		lawName = lawCallDetails.law;
		lineNum = lawCallDetails.lineNum.toString();
	}

	if (lawCallDetails === undefined) {
		return;
	}

	if (supportingProofLinesObj) {
		supportingProofLines = supportingProofLinesObj.supportingProofLines;
		supportingProofLineNum = supportingProofLinesObj.supportingLineNum;
	} else {
		return;
	}

	if (supportingProofLines.length === 0) {
		console.error(
			'No supporting proof lines retrieved for law call:',
			lawName,
			'on line number',
			lineNum,
		);
		// Need to return something to alter proof state to be invalid and border set to red for proof error issue
		return;
	}

	console.log(
		'supporting proof lines:',
		supportingProofLinesObj.supportingProofLines,
	);

	const processedSupportingLines: SupportingProofLineDetailsType =
		processSupportingProofLines(
			supportingProofLines,
			supportingProofLineNum,
			lawName as LawTypeKeys,
		);

	if (!processedSupportingLines) {
		console.error('error returning processed supporting lines for proof');
		return;
	}

	return processedSupportingLines;
}

export {parseSupportingProofLines};
