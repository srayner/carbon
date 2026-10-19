"use client";

import React, { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/api/categories";
import { CategoryRow, flattenCategories } from "@/lib/category-tree";

type CategoryFieldProps = {
  value: string;
  onChange: (categoryId: string) => void;
};

// Picks a category; the block stores its id so renaming it breaks nothing
const CategoryField: React.FC<CategoryFieldProps> = ({ value, onChange }) => {
  const [rows, setRows] = useState<CategoryRow[] | null>(null);

  useEffect(() => {
    fetchCategories()
      .then((all) => setRows(flattenCategories(all)))
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setRows([]);
      });
  }, []);

  const missing = !!value && !!rows && !rows.some((r) => r.id === value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1 w-full"
      disabled={!rows}
    >
      <option value="">{rows ? "Choose a category…" : "Loading…"}</option>
      {missing && <option value={value}>(deleted category)</option>}
      {rows?.map((r) => (
        <option key={r.id} value={r.id}>
          {r.path}
          {r.isEffectivelyActive ? "" : " (inactive)"}
        </option>
      ))}
    </select>
  );
};

export default CategoryField;
