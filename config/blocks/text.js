export const TextBlockConfig = {
  name: "Text",
  properties: [
    { name: "content", type: "richtext", default: "" },
    {
      name: "fontSize",
      type: "enum",
      values: ["small", "medium", "large"],
      default: "medium",
    },
    { name: "color", type: "color", default: "#000000" },
  ],
};
