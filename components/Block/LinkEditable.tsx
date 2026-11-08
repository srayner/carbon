"use client";

import React from "react";
import { EditableProps } from "@/types/blocks";
import { getLinkClasses } from "@/lib/link-style";
import { safeHref } from "@/lib/link-url";

// The link as it will look, but not followed on the canvas: the text, address
// and style are edited in the properties panel
const LinkEditable = ({ block }: EditableProps<"Link">) => {
  const { label, url } = block.properties;
  const broken = !safeHref(url);

  return (
    <span
      className={getLinkClasses(block.properties)}
      title={broken ? "This link has no valid address" : String(url)}
      data-broken={broken || undefined}
    >
      {label || "Link"}
    </span>
  );
};

export default LinkEditable;
