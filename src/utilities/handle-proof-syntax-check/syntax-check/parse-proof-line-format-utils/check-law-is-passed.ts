import type {LawTypeKeys} from '@/models/misc';

function isValidSuffix(suffix: unknown): suffix is LawTypeKeys {
	return (
		typeof suffix === 'string' &&
		[
			'hskip',
			'hassign',
			'hwhile',
			'hcond',
			'hseq',
			'arith',
			'subst',
			'simpf',
		].includes(suffix as LawTypeKeys)
	);
}

// Checks if line ends with a particular law suffix
function checkLawIsPassed(textLine: string, suffix: LawTypeKeys): boolean {
	if (typeof textLine !== 'string' || !isValidSuffix(suffix)) {
		return false;
	}

	try {
		const regExPattern = new RegExp(`^.*:${suffix}\\s+\\d+(?:\\s+\\d+)?$`);
		return regExPattern.test(textLine);
	} catch {
		return false;
	}
}

export {checkLawIsPassed};
