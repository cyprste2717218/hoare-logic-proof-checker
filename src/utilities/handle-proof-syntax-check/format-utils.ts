function formatProof(text: string): string[] {
	const lines: string[] = text.split('\n');
	if (lines.length > 0) {
		const trimmedLines: string[] = lines.map((line) => line.trim());

		return trimmedLines;
	}

	return [];
}

export {formatProof};
