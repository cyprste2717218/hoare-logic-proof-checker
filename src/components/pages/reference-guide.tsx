import {type JSX} from 'react';

type LawReferenceComponentType = {
	name: string;
	usageSyntax: string;
};

const lawsData: LawReferenceComponentType[] = [
	{
		name: 'The Skip Law',
		usageSyntax: '{P} C {Q} :hskip <int>',
	},
	{
		name: 'The Assign Law',
		usageSyntax: '{P} C {Q} :hassign <int>',
	},
	{
		name: 'The Conditional Law',
		usageSyntax: '{P} C {Q} :hcond <int>',
	},
	{
		name: 'The Sequential Law',
		usageSyntax: '{P} C {Q} :hseq <int>',
	},
	{
		name: 'The While Law',
		usageSyntax: '{P} C {Q} :hwhile <int>',
	},
];

const nonLawsData: LawReferenceComponentType[] = [
	{
		name: 'Variable Substitution',
		usageSyntax: 'P → Q[x/y] :subst <int>',
	},
	{
		name: 'Statement Simplification',
		usageSyntax: '<expr> :simpf <int>',
	},
	{
		name: 'Arithmetic',
		usageSyntax: 'P → Q :arith',
	},
];

function ReferenceGuide() {
	return (
		<>
			{' '}
			<br></br>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-left">
				Hoare Logic Laws:
			</h3>
			<br></br>
			<div className="grid grid-cols-2 gap-4">
				<AllLawReferenceComponents inputData={lawsData} />
			</div>
			<br></br>
			<br></br>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-left">
				Other:
			</h3>
			<div className="grid grid-cols-2 gap-4">
				<AllLawReferenceComponents inputData={nonLawsData} />
			</div>
		</>
	);
}

function AllLawReferenceComponents({
	inputData,
}: {
	inputData: LawReferenceComponentType[];
}): JSX.Element[] {
	const allResults: JSX.Element[] = [];
	for (const law of inputData) {
		allResults.push(
			<LawReferenceComponent name={law.name} usageSyntax={law.usageSyntax} />,
		);
	}

	return allResults;
}

function LawReferenceComponent({name, usageSyntax}: LawReferenceComponentType) {
	return (
		<div className="w-[250px] m-[20px]">
			<h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-left">
				{name}
			</h4>
			<p className="leading-7 [&:not(:first-child)]:mt-6 text-left">
				Usage Syntax:
			</p>
			<div style={{display: 'flex', justifyContent: 'left', marginTop: '10px'}}>
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-left">
					{usageSyntax}
				</code>
			</div>
		</div>
	);
}

export default ReferenceGuide;
