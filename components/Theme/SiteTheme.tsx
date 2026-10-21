import { getTheme } from "@/services/theme";
import { Theme, escapeCustomCss, googleFontsUrl, themeVariables } from "@/lib/theme";

type Props = { theme?: Theme; children: React.ReactNode };

/**
 * Wraps the public site in the theme. The theme is CSS variables on this
 * wrapper only, so the admin UI is unaffected. Pass `theme` to preview one
 * that hasn't been saved.
 */
const SiteTheme = async ({ theme, children }: Props) => {
  const active = theme ?? (await getTheme());
  const fontsUrl = googleFontsUrl(active);

  return (
    <div
      className="site-theme"
      style={themeVariables(active) as React.CSSProperties}
    >
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      {active.customCss && (
        <style
          dangerouslySetInnerHTML={{ __html: escapeCustomCss(active.customCss) }}
        />
      )}
      {children}
    </div>
  );
};

export default SiteTheme;
