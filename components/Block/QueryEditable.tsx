"use client";

import React, { useEffect, useState } from "react";
import { EditableProps } from "@/types/blocks";
import { fetchCategories } from "@/lib/api/categories";
import { CategoryRow, flattenCategories } from "@/lib/category-tree";

// Stands in for the query's results while editing
const QueryEditable = ({ block }: EditableProps<"Query">) => {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const { category, display, columns, orderBy, limit, includeSubcategories } =
    block.properties;

  useEffect(() => {
    fetchCategories()
      .then((all) => setRows(flattenCategories(all)))
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const name = rows.find((r) => r.id === category)?.path;

  return (
    <div className="not-prose rounded-lg border border-dashed bg-muted/40 p-4 text-sm">
      <div className="font-semibold">
        {category
          ? `Pages in ${name ?? "…"}`
          : "Query: choose a category in the block properties"}
      </div>
      <div className="text-muted-foreground">
        {display === "list" ? "List of links" : `Cards, ${columns} wide`}
        {" · "}
        {orderBy}
        {" · up to "}
        {limit || "all"}
        {includeSubcategories === "true" && " · with sub-categories"}
      </div>
    </div>
  );
};

export default QueryEditable;
