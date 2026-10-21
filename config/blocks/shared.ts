import {
  BORDER_STEPS,
  COLOR_ROLES,
  FONT_ROLES,
  RADIUS_STEPS,
  SHADOW_STEPS,
  SPACING_STEPS,
} from "@/lib/theme";

/*
 * Style properties every block has. Each holds the name of a theme token (see
 * lib/theme.ts), never a raw value; "" means "use the theme's default". A
 * block's own raw fields (color, padding, ...) still win over these when they
 * have been changed from their default.
 *
 * Spread into each block's config, so adding one here adds it to every block.
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

export const SHARED_PROPERTIES = [
  token("paddingSize", "Padding", "Spacing", SPACING_STEPS),
  token("marginTopSize", "Space above", "Spacing", SPACING_STEPS),
  token("marginBottomSize", "Space below", "Spacing", SPACING_STEPS),

  token("radius", "Corner radius", "Box", RADIUS_STEPS),
  token("border", "Border", "Box", BORDER_STEPS),
  token("shadow", "Shadow", "Box", SHADOW_STEPS),

  token("background", "Background", "Colour and font", COLOR_ROLES),
  token("textColor", "Text colour", "Colour and font", COLOR_ROLES),
  token("fontRole", "Font", "Colour and font", FONT_ROLES),
] as const;
