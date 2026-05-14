import { useState, useCallback } from "react";

/**
 * Wraps an async submit handler with a loading flag.
 * While loading, calling submit again is a no-op.
 *
 * Usage:
 *   const [loading, submit] = useSubmit();
 *   const handleSave = () => submit(async () => { await axios.post(...) });
 *
 * Returns [loading, submit].
 */
export function useSubmit(): [boolean, (fn: () => Promise<unknown>) => Promise<void>] {
    const [loading, setLoading] = useState(false);

    const submit = useCallback(async (fn: () => Promise<unknown>) => {
        if (loading) return;
        setLoading(true);
        try {
            await fn();
        } finally {
            setLoading(false);
        }
    }, [loading]);

    return [loading, submit];
}
