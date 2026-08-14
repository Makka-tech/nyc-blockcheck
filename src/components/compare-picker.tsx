"use client";

import { useRouter } from "next/navigation";
import { comparisonUrl } from "@/lib/address";
import type { AddressResult } from "@/lib/types";
import { SearchBox } from "@/components/search-box";

export function ComparePicker({ addresses }: { addresses: AddressResult[] }) {
  const router = useRouter();
  function update(next: AddressResult[]) {
    router.push(comparisonUrl(next));
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="label">Addresses</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Compare up to three selected NYC addresses.
          </p>
        </div>
        <span className="text-sm tabular-nums text-slate-500">
          {addresses.length}/3
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {addresses.map((address) => (
          <button
            className="focus-ring rounded-full border border-slate-300 px-3 py-1.5 text-left text-sm dark:border-slate-700"
            key={`${address.label}-${address.latitude}`}
            onClick={() => update(addresses.filter((item) => item !== address))}
          >
            <span>
              {address.houseNumber} {address.street || address.label}
            </span>
            <span
              className="ml-2 text-slate-500"
              aria-label={`Remove ${address.label}`}
            >
              ×
            </span>
          </button>
        ))}
      </div>
      {addresses.length < 3 && (
        <div className="mt-4 max-w-xl">
          <SearchBox
            compact
            placeholder="Add another NYC address"
            onSelect={(address) =>
              !addresses.some(
                (item) =>
                  item.latitude === address.latitude &&
                  item.longitude === address.longitude,
              ) && update([...addresses, address])
            }
          />
        </div>
      )}
    </div>
  );
}
