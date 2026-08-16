"use client";

import { useEffect, useRef, useState } from "react";
import type { PlaceSuggestion } from "@/app/api/places/route";

interface Props {
  id: string;
  value: string;
  onChange: (label: string) => void;
  placeholder?: string;
  required?: boolean;
}

/**
 * Place-of-birth / city picker — always select-from-a-list, never raw free
 * text, so every downstream geocode is guaranteed to resolve. Debounced
 * search against /api/places (Open-Meteo). The input still shows/edits the
 * chosen label as text, but onChange only fires with a real suggestion pick
 * — outside clicks revert to the last confirmed value if nothing was chosen.
 */
export default function PlaceAutocomplete({ id, value, onChange, placeholder, required }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value); // revert unconfirmed typing
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [value]);

  function onInput(next: string) {
    setQuery(next);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(next.trim())}`);
        const data = (await res.json()) as { results: PlaceSuggestion[] };
        setSuggestions(data.results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function pick(s: PlaceSuggestion) {
    onChange(s.label);
    setQuery(s.label);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="place-autocomplete" ref={wrapRef}>
      <input
        id={id}
        required={required}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => onInput(e.target.value)}
      />
      {open && (query.trim().length >= 2) && (
        <div className="place-suggestions" role="listbox">
          {loading && <div className="place-suggestion place-suggestion-empty">Searching…</div>}
          {!loading && suggestions.length === 0 && (
            <div className="place-suggestion place-suggestion-empty">No matches — try a nearby bigger city</div>
          )}
          {!loading && suggestions.map((s) => (
            <button type="button" key={`${s.label}-${s.latitude}`} className="place-suggestion" onClick={() => pick(s)}>
              📍 {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
