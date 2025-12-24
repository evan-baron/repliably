import { useState, useEffect, useCallback, useRef } from 'react';

// For GET requests - data fetching with caching
export const useQuery = <T>(
	key: string,
	fetcher: () => Promise<T>,
	options: {
		immediate?: boolean;
		onSuccess?: (data: T) => void;
		onError?: (error: Error) => void;
	} = {}
) => {
	const { immediate = false, onSuccess, onError } = options;

	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Use refs to avoid recreating the callback on every render
	const fetcherRef = useRef(fetcher);
	const onSuccessRef = useRef(onSuccess);
	const onErrorRef = useRef(onError);

	// Update refs when props change
	useEffect(() => {
		fetcherRef.current = fetcher;
		onSuccessRef.current = onSuccess;
		onErrorRef.current = onError;
	});

	const refetch = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await fetcherRef.current();
			setData(result);
			onSuccessRef.current?.(result);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			setError(errorMessage);
			onErrorRef.current?.(err as Error);
			console.error(`Query [${key}] failed:`, err);
		} finally {
			setLoading(false);
		}
	}, [key]); // Only depend on key, not the functions

	useEffect(() => {
		if (immediate) {
			refetch();
		}
	}, [immediate, refetch]);

	return { data, loading, error, refetch };
};

// For POST/PUT/DELETE - data mutations
export const useMutation = <TData, TVariables = any>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: {
		onSuccess?: (data: TData, variables: TVariables) => void;
		onError?: (error: Error, variables: TVariables) => void;
	} = {}
) => {
	const { onSuccess, onError } = options;

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mutate = async (variables: TVariables) => {
		setLoading(true);
		setError(null);

		try {
			const result = await mutationFn(variables);
			onSuccess?.(result, variables);
			return result;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			setError(errorMessage);
			onError?.(err as Error, variables);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	return { mutate, loading, error };
};
