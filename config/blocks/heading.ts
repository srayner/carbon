export const HeadingBlockConfig = {
  name: "Heading",
  properties: [
    {
      name: "content",
      type: "string",
      default: "My Fancy Heading", // default text for rendering
    },
    {
      name: "level",
      type: "enum",
      values: ["h1", "h2", "h3", "h4"],
      default: "h1",
    },
  ],
};
