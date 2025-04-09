import { validRegexFormats } from "@/lib/regex-formats";
import { checkLawIsPassed } from "@/utilities/common/check-law-is-passed";
import type { LawTypeHoare, LawTypeKeys, LawTypeOther } from "@/models/misc";
import { skip } from "node:test";

type GetHoareLawCallDetailsType = {
	law: LawTypeHoare;
	proofLine: string;
	lineNum: number;
}

type ProofLinesFormatType = {
	hoareLaw: {
		lawName: LawTypeHoare;
		line: string;
	}, 
	supportingProofLine: {
		lawName: LawTypeOther
		line: string
	}
}

type HoareLawStructure = {
	precondition: string;
	program: string;
	postcondition: string;
}

type OtherLawStructure = {
	expr1: string;
	operator: string;
	expr2: string;
}

function parseThroughAllProofLines(formattedProofContent: string[]): GetHoareLawCallDetailsType | undefined {
	function getHoareLawCallDetails(formattedProofLine: string, lineNum: number): GetHoareLawCallDetailsType | undefined {

		const hoareLaws = Object.keys(validRegexFormats.hoareLaws) as Array<keyof typeof validRegexFormats.hoareLaws>;
		
		for (const lawNum in hoareLaws) {

			const lawName: string = hoareLaws[lawNum]
			const regexFormat = validRegexFormats['hoareLaws'][lawName as LawTypeHoare];
			const regExPattern = new RegExp(regexFormat);
			if (regExPattern.test(formattedProofLine)) {
				console.log(`${lawName} hoare law detected`)
				return {
					proofLine: formattedProofLine,
					law: lawName as LawTypeHoare,
					lineNum: lineNum
				};
			}
			
		}
		
		return undefined
	}

	for (const formattedProofLine of formattedProofContent) {
		const checkHoareLawCallResult: GetHoareLawCallDetailsType | undefined = getHoareLawCallDetails(formattedProofLine, formattedProofContent.indexOf(formattedProofLine)+1);

		if (checkHoareLawCallResult) {
			return checkHoareLawCallResult
		}
	}

	return undefined;

}

function parseSupportingProofLines(formattedProofContent: string[], hoareLawCallDetails: GetHoareLawCallDetailsType): {
	proofLine: string;
	supportingLineSuffix: string} | undefined {
	
	function retrieveSupportingProofLines(): string[] {
		function getSupportingProofLinesArr(formattedProofContent: string[], lineNums: number[]): string[] {
		
			const supportingProofLines: string[] = [];
	
			for (const proofLineNum of lineNums) {
				formattedProofContent[proofLineNum-1] ? supportingProofLines.push(formattedProofContent[proofLineNum-1]) : console.error(`No proof line ${proofLineNum} detected`)
			}
	
			return supportingProofLines;
		}
	
		function extractSupportingLineNumsString(text: string, phrase: string): string {
			const index = text.indexOf(phrase);
			
			// Get everything after the phrase by adding phrase length to index
			return text.substring(index + phrase.length).trim();
		}
	
		function extractLineNumbersFromProofLine(text: string): number[] {
			// Match one or more digits
			const matches = text.match(/\d+/g);
			
			// If no matches found, return empty array
			if (!matches) {
				return [];
			}
			
			// Convert string matches to numbers
			return matches.map(match => parseInt(match, 10));
		}
		
		// extract relevant proof line with hoare law call
		const relevantProofLine = formattedProofContent[hoareLawCallDetails.lineNum-1];
	
		// retrieve the substring containing the line number calls, parse the line number(s) stated and retrieve the corresponding proof lines
	
		const lineNumCalls: string = extractSupportingLineNumsString(relevantProofLine, hoareLawCallDetails.law);
	
		const extractedLineNums: number[] = extractLineNumbersFromProofLine(lineNumCalls);
		if (extractedLineNums.length === 0) {
			console.error(`No supporting proof lines detected on hoare law ${hoareLawCallDetails.law} proof line call`)
			return [];
		}
	
		const supportingProofLines: string[] = getSupportingProofLinesArr(formattedProofContent, extractedLineNums);
	
		return supportingProofLines;	
	}

	function processSupportingProofLines(retrievedLines: string[], hoareLaw: LawTypeHoare): {
		proofLine: string;
		supportingLineSuffix: string} | undefined {

		function checkSupportingLineSuffix(supportingProofLine: string): LawTypeKeys | undefined {
			// check that the line suffix is valid for the hoare law call
			
			function getLineSuffix(supportingProofLine: string, allLawSuffixs: LawTypeKeys[]): LawTypeKeys | undefined {

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

			const supportingLineSuffix: LawTypeKeys | undefined = getLineSuffix(supportingProofLine, allLawSuffixs);

			if (!supportingLineSuffix) {
				console.error(`No valid line suffix detected for supporting proof line: ${supportingProofLine}`)
				return;
			}

			console.log("supporting line suffix is:", supportingLineSuffix);

			return supportingLineSuffix;
		}

		function checkAppropiateSupportingLaw(supportingLineSuffix: string, hoareLaw: LawTypeHoare) {
			
			switch(hoareLaw) {
				case "hskip":
					if (supportingLineSuffix === "arith") {
						return true;
					} else {
						console.error(`Invalid line suffix for hskip: ${supportingLineSuffix}`)
						return false;
					}
				/* To-do: add cases for other hoare law calls and their allowed supporting proof line law calls, i.e. other hoare law calls and/or 'other' laws such as 'arith', 'subst' etc. */
			}
		
		}

		// work out what law is being used by checking line suffix
		
		// for now only getting first line from supporting proof lines arr, hence index to retrievedLines[0]
		const supportingLineSuffix: LawTypeKeys | undefined = checkSupportingLineSuffix(retrievedLines[0])

		if (!supportingLineSuffix) {
			console.error(`No supporting line suffix detected for supporting proof line: ${retrievedLines[0]}`)
			return;
		}

		// check that it is the appropiate supporting law for the hoare law call, i.e. hskip should have an :arith call for its proof line

		if(!checkAppropiateSupportingLaw(supportingLineSuffix, hoareLaw)) {
			console.error(`Invalid supporting proof line detected for hoare law ${hoareLaw} call`)
			return;
		}

		console.log(`valid supporting proof line call ${supportingLineSuffix} for hoare law call ${hoareLaw}`);

		// for other functions do other relevant checks, but for hskip check that all the P and Q values are the same, excluding the C in {P} C {Q} which can have a ':' before the '=' in a single variable call i.e. {x=1} x:=1 {x=1}, if not the proof is invalid

		// check that P -> Q :arith line returns true via Z3 solver, if so return overall proof as valid

		return {
			proofLine: retrievedLines[0],
			supportingLineSuffix: supportingLineSuffix}
	}
	
	const supportingProofLines: string[] = retrieveSupportingProofLines();

	console.log("supporting proof lines:", supportingProofLines);

	if (supportingProofLines.length === 0) {
		console.error("No supporting proof lines retrieved for hoare law call:", hoareLawCallDetails.law, "on line number", hoareLawCallDetails.lineNum)
		// need to return something to alter proof state to be invalid and border set to red for proof error issue
		return;
	}

	const processedSupportingLines: {
		proofLine: string
		supportingLineSuffix: string} | undefined = processSupportingProofLines(supportingProofLines, hoareLawCallDetails.law);

	if (!processSupportingProofLines) {
		console.error("error returning processed supporting lines for proof")
		return;
	}

	return processedSupportingLines;

}

function checkArithLawCallValidity(arithProofLine: string): boolean {
	return false;
}

function decomposeProofLines(formattedProofContent: ProofLinesFormatType) {


	function doSkipLawChecks(formattedProofContent: ProofLinesFormatType) {
		function decomposeArithLawLine(proofLine: string): OtherLawStructure {


			return {
				expr1: '',
				operator: '',
				expr2: ''
			}
		}

		function decomposeSkipLawLine(proofLine: string): HoareLawStructure {
			return {
				precondition: '',
				program: '',
				postcondition: ''
			}
		}

		const arithProofLine: string = formattedProofContent.supportingProofLine.line;
		const {expr1, expr2} = decomposeArithLawLine(arithProofLine)

		const skipLawProofLine: string = formattedProofContent.hoareLaw.line;	
		const {precondition, program, postcondition} = decomposeSkipLawLine(skipLawProofLine)


		// check arith law proof line has same expression before and after ->
		if (expr1 !== expr2) {
			return
		} 

		// check precondition is same as postcondition
		if (precondition !== postcondition) {
			return;
		}

		// check program is same as precondition (comparing to precondition or postcondition is of no impact here, equivalent result either way)
		if (program !== precondition) {
			return;
		}

		// check statement in arith call is the same as the precondition and postcondition
		if (expr1 !== precondition) {
			return;
		}
		
	}


	function performLawSpecificSteps(formattedProofContent: ProofLinesFormatType) {
		const passedHoareLawName = formattedProofContent.hoareLaw.lawName;

		if (passedHoareLawName === 'hskip') {
			console.log("gets to here in performLawSpecificSteps:", passedHoareLawName)
			// check that content in precondition, postcondition, program body in hskip proof line call and statement body of arith proof line call is the same
			doSkipLawChecks(formattedProofContent);

			// given previous check, check if arith proof line is valid via discharge to Z3 SMT solver (i.e. checking validity of implies statement)
			const arithProofLine: string = formattedProofContent.supportingProofLine.line;
			const arithLawCheckResult: boolean = checkArithLawCallValidity(arithProofLine);

			// return proof as valid if arithLawCheckResult is true, otherwise proof is invalid

			if (!arithLawCheckResult) {

			}

			

		}
	}

	return performLawSpecificSteps(formattedProofContent);
}


function handleCheckProofValidity(formattedProofContent: string[]): void {
	
	// find line location of first hoare law call

	const hoareLawCallDetails: GetHoareLawCallDetailsType | undefined = parseThroughAllProofLines(formattedProofContent) ;

	console.log('hoareLawCallDetails:', hoareLawCallDetails)

	// early return if no hoare law call detected, hence no hoare logic proof to validate
	if (!hoareLawCallDetails) {
		
		console.error("No hoare law call detected in proof content")
		return;	
	}

	

	// determine the supporting proof line number(s) from the proof line with the hoare law call and check appropiateness for the proof type at hand
	
	const supportingProofLines: {supportingLineSuffix: string
								proofLine: string
	} | undefined = parseSupportingProofLines(formattedProofContent, hoareLawCallDetails);

	if (!supportingProofLines) {
		console.error("No appropiate supporting proof lines detected for proof")
		return;
	}

	// handling proof lines which have been checked to logically follow, to be decomposed into constituent parts
	
	const proofLines: ProofLinesFormatType = {
		hoareLaw: {
			lawName: hoareLawCallDetails.law,
			line: hoareLawCallDetails.proofLine
		},
		supportingProofLine: {
			lawName: supportingProofLines.proofLine as LawTypeOther,
			line: supportingProofLines.supportingLineSuffix
		}
	}

	decomposeProofLines(proofLines);


	





	



	
	 
	
	

	




}

export {handleCheckProofValidity};
