import { useState } from "react";

type MutationState = {
  loading: boolean;
  error: string | null;
};

type ApiResultLike = {
  data: unknown;
  error: string | null;
};

function isApiResultLike(value: unknown): value is ApiResultLike {
  return (
    !!value &&
    typeof value === "object" &&
    "data" in value &&
    "error" in value &&
    typeof (value as { error?: unknown }).error !== "undefined"
  );
}

export function useAsyncMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  fallbackMessage: string
) {
  const [state, setState] = useState<MutationState>({
    loading: false,
    error: null,
  });

  const submit = async (...args: TArgs): Promise<TResult> => {
    setState({ loading: true, error: null });
    try {
      const result = await fn(...args);
      if (isApiResultLike(result) && result.error) {
        setState({ loading: false, error: result.error });
      }
      return result;
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : fallbackMessage,
      });
      throw err;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    submit,
    loading: state.loading,
    error: state.error,
  };
}
