"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/lib/i18n";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
} from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";

/**
 * Language dropdown driving the app's own i18next instance.
 *
 * Switching is synchronous and in-place: no page reload, so in-progress
 * screens (e.g. the product listing wizard) keep their state, and there is
 * no flash of English while an external translator re-renders the page.
 * The choice is persisted to localStorage by changeLanguage().
 */
export default function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  /** Icon-tight variant for narrow headers/sidebars. */
  compact?: boolean;
}) {
  const { i18n } = useTranslation();
  const lang = isSupportedLanguage(i18n.language) ? i18n.language : "en";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Languages
        className="h-4 w-4 shrink-0 text-neutral-500"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <select
        aria-label="Choose language"
        value={lang}
        onChange={(e) => {
          const target = e.target.value;
          if (isSupportedLanguage(target)) changeLanguage(target);
        }}
        className={cn(
          "cursor-pointer rounded-md border-2 border-neutral-300 bg-white text-sm font-medium text-black focus-visible:border-black focus-visible:outline-none",
          compact ? "h-8 px-1.5 py-0.5" : "h-9 px-2 py-1",
        )}
      >
        {SUPPORTED_LANGUAGES.map((code) => (
          <option key={code} value={code} lang={code}>
            {LANGUAGE_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
