import React from "react";

// Stands in for a block whose renderer file cannot be found, so a typo or a
// forgotten file is visible instead of the block silently vanishing
const MissingRenderer = ({ name, file }: { name: string; file: string }) => (
  <div className="not-prose rounded-sm border-2 border-dashed border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
    Missing renderer for the {name} block: add components/Block/{file}.tsx
  </div>
);

export default MissingRenderer;
