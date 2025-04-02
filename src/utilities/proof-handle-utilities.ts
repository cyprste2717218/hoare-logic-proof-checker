function handleProofCheck(proof: string) {

	// format the proof into array of proof lines and check for syntax errors
	const result: string = formatAndCheckProof(proof);

	// check validity of overall proof


}

function formatAndCheckProof(proof: string) {
	const formattedProofLines = formatProof(proof);
	const checkFormatResult = hasFormatErrors(formattedProofLines);

}


function formatProof(text: string): string[] {
	const lines: string[] = text.split('\n');
	const trimmedLines: string[] = lines.map((line) => line.trim());

	return trimmedLines;

}

function hasFormatErrors(trimmedLines: string[]): string {


	// Check each lines syntax matches up to expected format, if not set the errorMessage
	let message = 'Valid';
	trimmedLines.some(line => {
		const lineFormatResult = parseProofLineFormat(line);
		if (lineFormatResult !== 'Valid') {
			message = lineFormatResult;
			return true;
		}
	})

	return message;

}

function parseProofLineFormat(textLine: string): string {
	return ''
}



export default handleProofCheck;