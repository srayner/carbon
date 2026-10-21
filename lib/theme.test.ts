import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  escapeCustomCss,
  googleFontsUrl,
  themeSchema,
  themeVariables,
  withDefaults,
} from "@/lib/theme";

const clone = () => structuredClone(DEFAULT_THEME);

describe("themeSchema", () => {
  it("accepts the default theme", () => {
    // Regression: the default radius "9999px" was once rejected, so no
    // theme could be saved
    expect(themeSchema.safeParse(DEFAULT_THEME).success).toBe(true);
  });

  it("rejects a colour that is not a six digit hex", () => {
    const theme = clone();
    theme.colors.accent = "red";
    expect(themeSchema.safeParse(theme).success).toBe(false);
  });

  it("rejects a length without a unit", () => {
    const theme = clone();
    theme.spacing.m = "16";
    expect(themeSchema.safeParse(theme).success).toBe(false);
  });

  it("accepts zero as a length", () => {
    const theme = clone();
    theme.spacing.none = "0";
    expect(themeSchema.safeParse(theme).success).toBe(true);
  });

  it("rejects a font that is not in the list", () => {
    const theme = clone();
    theme.fonts.body = "comic-sans" as never;
    expect(themeSchema.safeParse(theme).success).toBe(false);
  });

  it("rejects custom CSS over the size limit", () => {
    const theme = clone();
    theme.customCss = "a".repeat(20001);
    expect(themeSchema.safeParse(theme).success).toBe(false);
  });
});

describe("withDefaults", () => {
  it("returns the defaults when nothing is stored", () => {
    expect(withDefaults(null)).toEqual(DEFAULT_THEME);
  });

  it("keeps stored values and fills the rest from the defaults", () => {
    const theme = withDefaults({ colors: { accent: "#ff0000" } });
    expect(theme.colors.accent).toBe("#ff0000");
    expect(theme.colors.text).toBe(DEFAULT_THEME.colors.text);
    expect(theme.fonts).toEqual(DEFAULT_THEME.fonts);
  });
});

describe("themeVariables", () => {
  it("has a variable for every token", () => {
    const vars = themeVariables(DEFAULT_THEME);
    expect(vars["--color-accent"]).toBe(DEFAULT_THEME.colors.accent);
    expect(vars["--space-m"]).toBe("1rem");
    expect(vars["--radius-full"]).toBe("9999px");
    expect(vars["--content-width"]).toBe(DEFAULT_THEME.contentWidth);
    expect(vars["--font-mono"]).toContain("monospace");
  });
});

describe("googleFontsUrl", () => {
  it("is null when only system fonts are used", () => {
    expect(googleFontsUrl(DEFAULT_THEME)).toBeNull();
  });

  it("lists each Google font once", () => {
    const theme = clone();
    theme.fonts = {
      heading: "space-grotesk",
      body: "space-grotesk",
      mono: "ibm-plex-mono",
    };
    const url = googleFontsUrl(theme)!;
    expect(url.match(/family=Space\+Grotesk/g)).toHaveLength(1);
    expect(url).toContain("family=IBM+Plex+Mono");
  });
});

describe("escapeCustomCss", () => {
  it("stops the CSS closing its style element", () => {
    const css = "a{color:red}</style><script>alert(1)</script>";
    expect(escapeCustomCss(css)).not.toMatch(/<\/style/i);
  });

  it("leaves ordinary CSS alone", () => {
    expect(escapeCustomCss(".a > .b { color: red; }")).toBe(
      ".a > .b { color: red; }"
    );
  });
});
