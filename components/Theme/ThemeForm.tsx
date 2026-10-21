"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchTheme, saveTheme } from "@/lib/api/theme";
import {
  COLOR_ROLES,
  CUSTOM_CSS_MAX,
  DEFAULT_THEME,
  FONT_ROLES,
  FontKey,
  RADIUS_STEPS,
  SPACING_STEPS,
  Theme,
  escapeCustomCss,
  fontOptions,
  googleFontsUrl,
  themeVariables,
} from "@/lib/theme";

const COLOR_LABELS: Record<(typeof COLOR_ROLES)[number], string> = {
  background: "Background",
  surface: "Surface (headers, footers)",
  text: "Text",
  muted: "Muted text",
  accent: "Accent (links)",
  border: "Border",
};

const FONT_LABELS: Record<(typeof FONT_ROLES)[number], string> = {
  heading: "Headings",
  body: "Body text",
  mono: "Code",
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-3">
    <h2 className="text-lg font-semibold">{title}</h2>
    {children}
  </section>
);

// Sets one value inside a group of the theme (colors, fonts, ...)
type Group = "colors" | "fonts" | "spacing" | "radius";

export default function ThemeForm() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [saved, setSaved] = useState<Theme | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTheme()
      .then((loaded) => {
        setTheme(loaded);
        setSaved(loaded);
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Failed to load.")
      );
  }, []);

  if (!theme) return <p>Loading...</p>;

  const setValue = (group: Group, key: string, value: string) =>
    setTheme({ ...theme, [group]: { ...theme[group], [key]: value } });

  const dirty = JSON.stringify(theme) !== JSON.stringify(saved);
  const fontsUrl = googleFontsUrl(theme);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveTheme(theme);
      setTheme(result);
      setSaved(result);
      toast.success("Theme saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-8">
        <Section title="Colours">
          <div className="grid gap-3 sm:grid-cols-2">
            {COLOR_ROLES.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <input
                  type="color"
                  className="h-9 w-10 shrink-0 cursor-pointer rounded border"
                  value={theme.colors[role]}
                  onChange={(e) => setValue("colors", role, e.target.value)}
                />
                <span className="flex-1">{COLOR_LABELS[role]}</span>
                <Input
                  className="w-28 font-mono"
                  value={theme.colors[role]}
                  maxLength={7}
                  onChange={(e) => setValue("colors", role, e.target.value)}
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title="Fonts">
          <div className="grid gap-3 sm:grid-cols-3">
            {FONT_ROLES.map((role) => (
              <label key={role} className="block text-sm">
                <span className="mb-1 block">{FONT_LABELS[role]}</span>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={theme.fonts[role]}
                  onChange={(e) =>
                    setValue("fonts", role, e.target.value as FontKey)
                  }
                >
                  {fontOptions().map(([key, font]) => (
                    <option key={key} value={key}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Spacing">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {SPACING_STEPS.map((step) => (
              <label key={step} className="block text-sm">
                <span className="mb-1 block">{step}</span>
                <Input
                  value={theme.spacing[step]}
                  onChange={(e) => setValue("spacing", step, e.target.value)}
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title="Corner radius">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {RADIUS_STEPS.map((step) => (
              <label key={step} className="block text-sm">
                <span className="mb-1 block">{step}</span>
                <Input
                  value={theme.radius[step]}
                  onChange={(e) => setValue("radius", step, e.target.value)}
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title="Layout">
          <label className="block max-w-xs text-sm">
            <span className="mb-1 block">
              Content width (templates with narrow content)
            </span>
            <Input
              value={theme.contentWidth}
              onChange={(e) =>
                setTheme({ ...theme, contentWidth: e.target.value })
              }
            />
          </label>
        </Section>

        <Section title="Custom CSS">
          <p className="text-sm text-muted-foreground">
            Added to every public page. Classes defined here can be used in a
            block&apos;s CSS Class field.
          </p>
          <Textarea
            className="min-h-40 font-mono text-sm"
            value={theme.customCss}
            maxLength={CUSTOM_CSS_MAX}
            onChange={(e) => setTheme({ ...theme, customCss: e.target.value })}
          />
        </Section>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save theme"}
          </Button>
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => setTheme(DEFAULT_THEME)}
          >
            Reset to defaults
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Preview</h2>
        {/* Same wrapper and variables as the public site (not saved yet) */}
        <div
          className="site-theme overflow-hidden rounded-md border"
          style={themeVariables(theme) as React.CSSProperties}
        >
          {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
          {theme.customCss && (
            <style
              dangerouslySetInnerHTML={{
                __html: escapeCustomCss(theme.customCss),
              }}
            />
          )}
          <div className="border-b bg-site-surface px-6 py-[var(--space-m)] text-sm">
            Header area
          </div>
          <div className="prose prose-lg max-w-none p-[var(--space-l)]">
            <h1>A heading</h1>
            <p>
              Body text with a <a href="#">link</a>, some <strong>bold</strong>{" "}
              and <code>inline code</code>.
            </p>
            <blockquote>A quote, set off by the border colour.</blockquote>
            <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
              {["First card", "Second card"].map((title) => (
                <div
                  key={title}
                  className="rounded-site-l border bg-site-background p-4"
                >
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-site-muted">Muted description.</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t bg-site-surface px-6 py-6 text-sm">
            Footer area
          </div>
        </div>
      </div>
    </div>
  );
}
