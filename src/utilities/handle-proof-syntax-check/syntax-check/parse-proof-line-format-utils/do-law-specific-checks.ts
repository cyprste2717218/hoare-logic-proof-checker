import {allChecks} from '@/lib/regex-formats';
import {doHoareLawChecks} from '@/utilities/handle-proof-syntax-check/syntax-check/do-law-specific-checks-utils/do-hoare-law-checks';
import {doOtherLawChecks} from '@/utilities/handle-proof-syntax-check/syntax-check/do-law-specific-checks-utils/do-other-law-checks';
import type {
	LawType,
	LawTypeKeys,
	DiagnosticsType,
	AllRegexChecks,
} from '@/models/misc';

type CheckKeys = keyof typeof allChecks;

function getRelevantChecks(law: LawTypeKeys): AllRegexChecks {
	let lawChecksList: CheckKeys[] = [];
	const returnChecks: AllRegexChecks = {};
	switch (law) {
		case 'hskip': {
			lawChecksList = [
				'preConditionOpenCloseBraces',
				'preConditionBody',
				'programBodyHskip',
				'postConditionOpenCloseBraces',
				'postConditionBody',
			];
			break;
		}

		case 'hassign': {
			lawChecksList = [
				'preConditionOpenCloseBraces',
				'preConditionBody',
				'programBodyHassign',
				'postConditionOpenCloseBraces',
				'postConditionBody',
			];
			break;
		}

		case 'hcond': {
			lawChecksList = [''];
			break;
		}

		case 'hseq': {
			lawChecksList = [''];
			break;
		}

		case 'hwhile': {
			lawChecksList = [''];
			break;
		}

		case 'subst': {
			lawChecksList = [''];
			break;
		}

		case 'simpf': {
			lawChecksList = [''];
			break;
		}

		case 'arith': {
			lawChecksList = [];
			break;
		}
	}

	for (const check of lawChecksList) {
		returnChecks[check] = allChecks[check];
		continue;
	}

	return returnChecks;
}

function doLawSpecificChecks(
	textLine: string,
	lawGroup: keyof LawType,
	law: LawTypeKeys,
): DiagnosticsType {
	// Gathering the checks which are valid to make for usage of the particular law
	// Note: this may not be needed as checks for each law call line doesn't differ
	const checks: AllRegexChecks = getRelevantChecks(
		law as unknown as LawTypeKeys,
	);

	// Retrieving detected errors depending on parsing as instantiation of hoare law, e.g. hskip, or other law, e.g. arith, subst
	if (lawGroup === 'hoareLaws') {
		const diagnostics: DiagnosticsType = doHoareLawChecks(
			textLine,
			law,
			checks,
		);
		return diagnostics;
	}

	// Note: will likely need to add, checks param to this call as with doHoareLawChecks func
	const diagnostics: DiagnosticsType = doOtherLawChecks(textLine, law);
	return diagnostics;
}

export {doLawSpecificChecks};
