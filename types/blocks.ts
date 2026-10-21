import { LucideIcon } from "lucide-react";
import { ALL_BLOCKS } from "@/config/blocks";

/* ----- Config types ----- */

export type BlockProperty = {
  name: string;
  displayName: string;
  type: string;
  values?: readonly string[] | undefined;
  default?: string;
  optional?: boolean | undefined;
};

export type BlockConfig<TName extends string = string> = {
  name: TName;
  icon: LucideIcon;
  properties: readonly BlockProperty[];
};

/* ----- Types derived from the configs in config/blocks ----- */

type AnyBlockConfig = (typeof ALL_BLOCKS)[number];

// Map one property entry -> TS type
type PropertyType<P extends BlockProperty> = P extends { type: "number" }
  ? number
  : P extends { type: "boolean" }
  ? // the property editor stores every value as a string
    "true" | "false"
  : P extends { type: "enum"; values: readonly (infer V)[] }
  ? V
  : string;

type WithOptional<P extends BlockProperty> = P extends { optional: true }
  ? PropertyType<P> | undefined
  : PropertyType<P>;

type PropertiesOf<TProps extends readonly BlockProperty[]> = {
  [P in TProps[number] as P["name"]]: WithOptional<P>;
};

/** The name of every block type, e.g. "Heading" | "Image" | ... */
export type BlockName = AnyBlockConfig["name"];

/** The properties of one block type, from its config. */
export type BlockProps<N extends BlockName = BlockName> = N extends BlockName
  ? PropertiesOf<Extract<AnyBlockConfig, { name: N }>["properties"]>
  : never;

/** A block of one type (or, with no argument, of any type). */
export type Block<N extends BlockName = BlockName> = N extends BlockName
  ? {
      id: string;
      type: N;
      properties: BlockProps<N>;
      order?: number;
      pageId?: string;
      fragmentId?: string;
      parentId?: string | null;
      createdAt?: Date;
      updatedAt?: Date;
    }
  : never;

/* ----- Renderer props ----- */

/** Props for a block's edit renderer, `components/Block/<Name>Editable.tsx`. */
export type EditableProps<N extends BlockName> = {
  block: Block<N>;
  // Merge changes into the block's properties
  onChange: (patch: Partial<BlockProps<N>>) => void;
};

/** The id, class and inline style every block gets, worked out in one place. */
export type SharedBlockProps = {
  id: string | undefined;
  className: string | undefined;
  style: React.CSSProperties;
};

/** Props for a block's published renderer, `components/Block/<Name>View.tsx`. */
export type ViewProps<N extends BlockName> = {
  block: Block<N>;
  shared: SharedBlockProps;
  currentPageId?: string | null;
};
