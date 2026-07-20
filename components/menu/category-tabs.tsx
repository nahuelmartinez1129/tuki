"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_GROUP_LABELS, type MenuCategoryGroup } from "@/lib/data/products";

const GROUPS = Object.keys(CATEGORY_GROUP_LABELS) as MenuCategoryGroup[];

interface CategoryTabsProps {
  active: MenuCategoryGroup;
  onChange: (group: MenuCategoryGroup) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
      {GROUPS.map((group) => {
        const isActive = group === active;
        return (
          <button
            key={group}
            type="button"
            onClick={() => onChange(group)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 font-display text-sm font-bold transition-colors",
              isActive
                ? "bg-tuki-lime text-tuki-night shadow-soft"
                : "bg-white/5 text-tuki-cream/70 hover:bg-white/10"
            )}
          >
            {CATEGORY_GROUP_LABELS[group]}
          </button>
        );
      })}
    </div>
  );
}
