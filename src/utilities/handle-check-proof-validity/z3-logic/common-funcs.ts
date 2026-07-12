import type {HoareLawStructure} from '@/models/hoare-law-z3-models';

function decomposeHoareLawLine(proofLine: string): HoareLawStructure {
	function splitHoareTriple(text: string): string[] {
		const pattern = /{(.*?)}(.*?){(.*?)}/;
		const match = pattern.exec(text);

		if (!match) {
			return ['', '', ''];
		}

		// For Hoare triple of form {P} C {Q}
		// match[1] is precondition (P), match[2] is program (C), match[3] is postcondition (Q)
		return [match[1].trim(), match[2].trim(), match[3].trim()];
	}

	const returnStructure: string[] = splitHoareTriple(proofLine);
	console.log('hoare law line split up:', returnStructure);
	return {
		precondition: returnStructure[0],
		program: returnStructure[1],
		postcondition: returnStructure[2],
	};
}

export {decomposeHoareLawLine};
