import { NetworkError } from "@/components/ErrorBoundary";

const ErrorRetryWhitelist = new Set([NetworkError.Codes.UNAUTHORIZED]);

function isRetryError(error: unknown): boolean {
	if (error instanceof NetworkError) {
		return ErrorRetryWhitelist.has(error.statusCode);
	}
	return false;
}

function sleep(timeout: number) {
	return new Promise((res) => {
		setTimeout(res, timeout);
	});
}

const RETRY_DELAY_MS = 500;
const MAX_RETRIES = 3;

export async function withRetry<Return, Fetch extends () => Promise<Return>>(
	fetchFn: Fetch,
): Promise<Return> {
	let retries = 0;
	for (;;) {
		try {
			return await fetchFn();
		} catch (error) {
			if (retries < MAX_RETRIES && isRetryError(error)) {
				await sleep(RETRY_DELAY_MS);
				retries++;
				continue;
			}
			throw error;
		}
	}
}
