// Plain text (as Heading and Paragraph blocks store it) as the HTML the text
// editor loads. Escaped, so text that looks like markup or an entity stays
// text: "Tom &amp; Jerry" is shown as typed, not as "Tom & Jerry".
export const plainTextToHtml = (text: string) =>
  `<p>${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</p>`;
