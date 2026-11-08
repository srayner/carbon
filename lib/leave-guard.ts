export const LEAVE_MESSAGE = "You have unsaved changes. Leave without saving them?";

/** The parts of a click on a link that decide where it goes. */
export type LinkClick = {
  button: number; // 0 is the main button
  modified: boolean; // Ctrl, Cmd, Shift or Alt held
  href: string; // the link's resolved address
  target: string; // the link's target attribute, "" when not set
  download: boolean; // the link has a download attribute
};

/**
 * Whether a click on a link takes the user away from this page within the
 * app, so unsaved changes should be confirmed first.
 *
 * Clicks that open a new tab or window, or download a file, leave the page
 * where it is. Links to another site load a new document, which the
 * browser's own prompt (beforeunload) covers. A link to a spot on this page
 * does not leave it.
 */
export const clickLeavesPage = (click: LinkClick, currentUrl: string): boolean => {
  if (click.button !== 0 || click.modified || click.download) return false;
  if (click.target && click.target !== "_self") return false;

  const current = new URL(currentUrl);
  const next = new URL(click.href, current);
  if (next.origin !== current.origin) return false;
  return next.pathname !== current.pathname || next.search !== current.search;
};
