import type {LawTypeKeys} from '@/models/misc';
import {validRegexFormats} from '@/lib/regex-formats';
import {checkLawGroup} from '@/utilities/handle-proof-syntax-check/syntax-check/parse-proof-line-format';

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

	console.log('gets to here');

	try {
		console.log('gets to here as well');
		const lawGroup = checkLawGroup(suffix);
		const regexFormat = (validRegexFormats[lawGroup] as Record<string, string>)[
			suffix
		];
		const regExPattern = new RegExp(regexFormat);
		console.log('this is the regExPattern:', regExPattern);
		console.log(regExPattern.test(textLine));
		return regExPattern.test(textLine);
	} catch {
		return false;
	}
}

export {checkLawIsPassed};
