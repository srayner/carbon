import React from "react";
import { EditableProps } from "@/types/blocks";
import CardView from "@/components/Block/CardView";

// A card is edited from the block's properties panel, so this shows how it
// will look
const CardEditable = ({ block }: EditableProps<"Card">) => (
  <div className="max-w-xs">
    <CardView block={block} />
  </div>
);

export default CardEditable;
