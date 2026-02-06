export async function minTimer<T>(
	promise: Promise<T>,
	minTime: number = 1000,
): Promise<T> {
	const start = Date.now();
	const result = await promise;
	const elapsed = Date.now() - start;
	const remaining = minTime - elapsed;

	if (remaining > 0) {
		await new Promise((resolve) => setTimeout(resolve, remaining));
	}

	return result;
}
