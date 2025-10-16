export const ImageBlockConfig = {
  name: "Image",
  properties: [
    { name: "altText", type: "string", default: "" },
    { name: "caption", type: "string", default: "" },
    {
      name: "aspectRatio",
      type: "enum",
      values: ["1:1", "16:9", "4:3"],
      default: "16:9",
    },
    { name: "fullWidth", type: "boolean", default: false },
    { name: "backgroundColor", type: "color", default: "#ffffff" },
  ],
};
