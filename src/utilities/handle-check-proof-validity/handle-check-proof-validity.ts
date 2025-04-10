import {getTripleValidityArr} from '@/utilities/handle-check-proof-validity/validity-check-utils/get-triple-validity-arr';

function handleCheckProofValidity(formattedProofContent: string[]): boolean {
	const tripleValidityArr: boolean[] = getTripleValidityArr(
		formattedProofContent,
	);

	if (!tripleValidityArr.includes(false)) {
		console.log('overall proof is valid');
		return true;
	}

	console.log('overall proof is invalid');
	return false;
}

export {handleCheckProofValidity};
