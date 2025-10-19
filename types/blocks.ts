import { HeadingBlockConfig } from "@/config/blocks/heading";
import { ImageBlockConfig } from "@/config/blocks/image";
import { ParagraphBlockConfig } from "@/config/blocks/paragraph";
import { RichTextBlockConfig } from "@/config/blocks/richText";

/* ----- Helper types ----- */

// Extract a union of property entries from a readonly array
type PropEntry = {
  name: string;
  type: string;
  values?: readonly string[] | undefined;
  optional?: boolean | undefined;
};

// Map single prop entry -> TS type
type PropEntryToType<P extends PropEntry> = P extends { type: "string" }
  ? P extends { optional: true }
    ? string | undefined
    : string
  : P extends { type: "color" }
  ? P extends { optional: true }
    ? string | undefined
    : string
  : P extends { type: "number" }
  ? P extends { optional: true }
    ? number | undefined
    : number
  : P extends { type: "boolean" }
  ? P extends { optional: true }
    ? boolean | undefined
    : boolean
  : P extends { type: "enum"; values: readonly (infer V)[] }
  ? P extends { optional: true }
    ? V | undefined
    : V
  : unknown;

// Convert readonly array of props -> { propName: propType, ... }
type PropsFromArray<TProps extends readonly any[]> = {
  [P in TProps[number] as P extends { name: infer N extends string }
    ? N
    : never]: P extends PropEntry ? PropEntryToType<P> : never;
};

/* ----- Infer types for specific block configs ----- */
type HeadingProps = PropsFromArray<(typeof HeadingBlockConfig)["properties"]>;
type ImageProps = PropsFromArray<(typeof ImageBlockConfig)["properties"]>;
type ParagraphProps = PropsFromArray<
  (typeof ParagraphBlockConfig)["properties"]
>;
type RichTextProps = PropsFromArray<(typeof RichTextBlockConfig)["properties"]>;

/* ----- Block type literals ----- */
type HeadingType = (typeof HeadingBlockConfig)["name"];
type ImageType = (typeof ImageBlockConfig)["name"];
type ParagraphType = (typeof ParagraphBlockConfig)["name"];
type RichTextType = (typeof RichTextBlockConfig)["name"];

/* ----- Concrete blocks ----- */
export type HeadingBlock = { id: string; type: HeadingType } & HeadingProps;
export type ImageBlock = { id: string; type: ImageType } & ImageProps;
export type ParagraphBlock = {
  id: string;
  type: ParagraphType;
} & ParagraphProps;
export type RichTextBlock = {
  id: string;
  type: RichTextType;
} & RichTextProps;

/* ----- Union of all blocks ----- */
export type Block = HeadingBlock | ImageBlock | ParagraphBlock | RichTextBlock;

/* ----- Union of block type strings ----- */
export type BlockName = HeadingType | ImageType | ParagraphType | RichTextType;

/* ----- Helper to get props type by block name ----- */
export type PropsForBlockName<T extends BlockName> = T extends HeadingType
  ? HeadingProps
  : T extends ImageType
  ? ImageProps
  : T extends ParagraphType
  ? ParagraphProps
  : T extends RichTextType
  ? RichTextProps
  : never;
