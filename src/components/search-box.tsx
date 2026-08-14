"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addressUrl } from "@/lib/address";
import type { AddressResult } from "@/lib/types";

type SearchBoxProps = {
  compact?: boolean;
  onSelect?: (address: AddressResult) => void;
  placeholder?: string;
};

export function SearchBox({
  compact = false,
  onSelect,
  placeholder = "Enter a NYC address",
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();
  const listId = useId();
  const abort = useRef<AbortController | null>(null);
  const canSearch = query.trim().length >= 3;
  const visibleResults = canSearch ? results : [];
  useEffect(() => {
    if (!canSearch) return;
    const timeout = window.setTimeout(async () => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      setLoading(true);
      setError(undefined);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data: { results?: AddressResult[]; error?: string } =
          await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Address search is unavailable.");
        setResults(data.results ?? []);
      } catch (reason) {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setResults([]);
          setError(
            reason instanceof Error
              ? reason.message
              : "Address search is unavailable.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [canSearch, query]);
  function choose(address: AddressResult) {
    setResults([]);
    if (onSelect) onSelect(address);
    else router.push(addressUrl(address));
  }
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={listId}>
        NYC address
      </label>
      <div
        className={`flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm focus-within:ring-2 focus-within:ring-civic dark:border-slate-700 dark:bg-slate-900 ${compact ? "" : "md:p-1.5"}`}
      >
        <input
          id={listId}
          role="combobox"
          aria-expanded={visibleResults.length > 0}
          aria-controls={`${listId}-list`}
          autoComplete="street-address"
          className={`min-w-0 flex-1 bg-transparent px-3 outline-none ${compact ? "py-2" : "py-3 text-lg"}`}
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            if (value.trim().length < 3) {
              setResults([]);
              setError(undefined);
            }
            setQuery(value);
          }}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="focus-ring rounded-lg bg-civic px-4 py-2 font-medium text-white hover:bg-civic/90"
          onClick={() => visibleResults[0] && choose(visibleResults[0])}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
      {canSearch && (visibleResults.length > 0 || error) && (
        <div
          id={`${listId}-list`}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          {error ? (
            <p className="p-4 text-sm text-clay">{error}</p>
          ) : (
            visibleResults.map((result) => (
              <button
                className="focus-ring block w-full border-b border-slate-100 px-4 py-3 text-left text-sm last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                role="option"
                aria-selected={false}
                key={`${result.label}-${result.latitude}`}
                onClick={() => choose(result)}
              >
                <span className="block font-medium">{result.label}</span>
                <span className="text-slate-500">
                  {result.borough}
                  {result.postcode ? ` · ${result.postcode}` : ""}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
