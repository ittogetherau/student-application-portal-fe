"use client";

import * as React from "react";
import type { RowSelectionState, Updater } from "@tanstack/react-table";

const storageKeyFor = (key: string) => `selected-rows:${key}`;

const readFromStorage = (key: string): RowSelectionState => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKeyFor(key));
    if (!raw) return {};
    const ids: string[] = JSON.parse(raw);
    return Object.fromEntries(ids.map((id) => [id, true]));
  } catch {
    return {};
  }
};

const writeToStorage = (key: string, selection: RowSelectionState) => {
  if (typeof window === "undefined") return;
  const ids = Object.entries(selection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);
  if (ids.length === 0) {
    window.localStorage.removeItem(storageKeyFor(key));
  } else {
    window.localStorage.setItem(storageKeyFor(key), JSON.stringify(ids));
  }
};

/**
 * Row selection state keyed by stable row id, persisted to localStorage per
 * `storageKey` so it survives page navigation and reloads. Pass a distinct
 * key per independent table view (e.g. active vs archived) to keep their
 * selections from bleeding into each other.
 */
export function usePersistedRowSelection(storageKey: string) {
  const [rowSelection, setRowSelectionState] =
    React.useState<RowSelectionState>(() => readFromStorage(storageKey));

  React.useEffect(() => {
    setRowSelectionState(readFromStorage(storageKey));
  }, [storageKey]);

  const setRowSelection = React.useCallback(
    (updater: Updater<RowSelectionState>) => {
      setRowSelectionState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        writeToStorage(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const clearSelection = React.useCallback(() => {
    setRowSelectionState({});
    writeToStorage(storageKey, {});
  }, [storageKey]);

  const selectedIds = React.useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [rowSelection],
  );

  return { rowSelection, setRowSelection, clearSelection, selectedIds };
}
