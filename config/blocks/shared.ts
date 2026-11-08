import {
  BORDER_STEPS,
  COLOR_ROLES,
  FONT_ROLES,
  RADIUS_STEPS,
  SHADOW_STEPS,
  SPACING_STEPS,
  TEXT_SIZE_STEPS,
  FONT_WEIGHT_NAMES,
} from "@/lib/theme";
import { GROW_OPTIONS } from "@/lib/container-style";

/*
 * Style properties every block has. Each holds the name of a theme token (see
 * lib/theme.ts), never a raw value; "" means "use the theme's default". A
 * block's own raw fields (color, padding, ...) still win over these when they
 * have been changed from their default.
 */
const token = (
  name: string,
  displayName: string,
  group: string,
  values: readonly string[]
) =>
  ({
    name,
    displayName,
    type: "enum",
    values: ["", ...values],
    default: "",
    group,
  }) as const;

export const TOKEN_PROPERTIES = [
  token("paddingSize", "Padding", "Spacing", SPACING_STEPS),
  // Override the sides that Padding sets, e.g. a button wider than it is tall
  token("paddingX", "Padding left and right", "Spacing", SPACING_STEPS),
  token("paddingY", "Padding top and bottom", "Spacing", SPACING_STEPS),
  token("marginTopSize", "Space above", "Spacing", SPACING_STEPS),
  token("marginBottomSize", "Space below", "Spacing", SPACING_STEPS),

  token("radius", "Corner radius", "Box", RADIUS_STEPS),
  token("border", "Border", "Box", BORDER_STEPS),
  token("borderColor", "Border colour", "Box", COLOR_ROLES),
  token("shadow", "Shadow", "Box", SHADOW_STEPS),

  token("background", "Background", "Colour and font", COLOR_ROLES),
  token("textColor", "Text colour", "Colour and font", COLOR_ROLES),
  token("fontRole", "Font", "Colour and font", FONT_ROLES),
  token("textSize", "Text size", "Colour and font", TEXT_SIZE_STEPS),
  // Inherited, so set on a Container it applies to everything inside
  token("weight", "Font weight", "Colour and font", FONT_WEIGHT_NAMES),
] as const;

/*
 * How a block shares its container's space along the container's direction
 * (see lib/container-style.ts). Ignored for a block not in a container.
 */
export const GROW_PROPERTY = {
  name: "grow",
  displayName: "Grow",
  type: "enum",
  values: GROW_OPTIONS,
  default: "content",
  group: "In a container",
} as const;

/** Spread into each block's config, so adding one here adds it to every block. */
export const SHARED_PROPERTIES = [...TOKEN_PROPERTIES, GROW_PROPERTY] as const;
