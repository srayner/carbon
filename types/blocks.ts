export type PropertyType = "string" | "boolean" | "enum" | "color" | "richtext";

export interface BlockProperty {
  name: string;
  type: PropertyType;
  default?: string | boolean;
  values?: string[]; // for enum
}

export interface BlockConfig {
  name: string;
  properties: BlockProperty[];
}

export interface Block {
  id: string;
  type: string;
  data: BlockData;
}

export type BlockData = Record<string, string | boolean>;
