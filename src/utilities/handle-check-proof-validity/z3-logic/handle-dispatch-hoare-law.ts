import {handleHskipDispatch} from './hskip-law-z3-logic/handle-hskip-dispatch';
import {handleHassignDispatch} from './hassign-law-z3-logic/handle-hassign-dispatch';
import {type LawTypeHoare} from '@/models/misc';
import {
	type DispatchPropsType,
	type HassignDispatchProps,
	type HskipDispatchProps,
} from '@/models/hoare-law-z3-models';

async function handleDispatch(
	dispatchProps: DispatchPropsType,
	tripleLaw: LawTypeHoare,
): Promise<boolean> {
	const props = dispatchProps;
	let dispatchResult: boolean;

	if (tripleLaw === 'hskip') {
		dispatchResult = await handleHskipDispatch(
			...(props as HskipDispatchProps),
		);
	} else if (tripleLaw === 'hassign') {
		dispatchResult = await handleHassignDispatch(
			...(props as HassignDispatchProps),
		);
	} else {
		console.error('tripleLaw is not one of hskip or hassign');
		dispatchResult = false;
	}

	return dispatchResult;
}

export {handleDispatch};
