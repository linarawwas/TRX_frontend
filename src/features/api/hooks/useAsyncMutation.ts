import { useState } from "react";

type MutationState = {
  loading: boolean;
  error: string | null;
};

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
      return await fn(...args);
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
