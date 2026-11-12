import { BlockConfig, BlockName, BlockProps } from "@/types/blocks";

/**
 * A block's properties with every one set to its config default, so a block
 * built in code gets each property, including shared ones added later,
 * without listing them. The property editor stores every value as a string,
 * and so do these.
 */
export const getDefaultProps = <N extends BlockName>(
  config: BlockConfig<N>
): BlockProps<N> =>
  Object.fromEntries(
    config.properties.map((prop) => [prop.name, prop.default ?? ""])
  ) as BlockProps<N>;
