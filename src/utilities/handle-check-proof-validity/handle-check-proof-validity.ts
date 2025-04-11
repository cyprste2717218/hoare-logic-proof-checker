import {getTripleValidityArr} from '@/utilities/handle-check-proof-validity/validity-check-utils/get-triple-validity-arr';

async function handleCheckProofValidity(
	formattedProofContent: string[],
): Promise<boolean> {
	const tripleValidityArr: boolean[] = await getTripleValidityArr(
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
