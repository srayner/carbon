import React from "react";

// Stands in for a block whose renderer file cannot be found, so a typo or a
// forgotten file is visible instead of the block silently vanishing
const MissingRenderer = ({ name, file }: { name: string; file: string }) => (
  <div className="not-prose rounded border-2 border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-700">
    Missing renderer for the {name} block: add components/Block/{file}.tsx
  </div>
);

export default MissingRenderer;
