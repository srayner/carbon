import React from "react";
import { EditableProps } from "@/types/blocks";
import CardView from "@/components/Block/CardView";

// A card is edited from the block's properties panel, so this shows how it
// will look
const CardEditable = ({ block }: EditableProps<"Card">) => (
  <CardView block={block} shared={{ id: undefined, className: undefined, style: {} }} />
);

export default CardEditable;
