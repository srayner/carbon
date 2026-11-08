import { CardBlockConfig } from "./card";
import { ContainerBlockConfig } from "./container";
import { FileBlockConfig } from "./file";
import { HeadingBlockConfig } from "./heading";
import { ImageBlockConfig } from "./image";
import { KeyValueTableBlockConfig } from "./keyValueTable";
import { ParagraphBlockConfig } from "./paragraph";
import { QueryBlockConfig } from "./query";
import { RichTextBlockConfig } from "./richText";

export const ALL_BLOCKS = [
  HeadingBlockConfig,
  ImageBlockConfig,
  FileBlockConfig,
  CardBlockConfig,
  ParagraphBlockConfig,
  RichTextBlockConfig,
  KeyValueTableBlockConfig,
  QueryBlockConfig,
  ContainerBlockConfig,
];
