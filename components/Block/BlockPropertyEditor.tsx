import React from "react";
import { BlockConfig, BlockProperty } from "@/types/blocks";
import UploadField from "@/components/Block/UploadField";
import CategoryField from "@/components/Block/CategoryField";

interface PropertyEditorProps {
  blockConfig: BlockConfig;
  blockData: Record<string, string>;
  onChange: (newData: Record<string, string>) => void;
}

const BlockPropertyEditor: React.FC<PropertyEditorProps> = ({
  blockConfig,
  blockData,
  onChange,
}) => {
  const handleChange = (propName: string, value: string) => {
    onChange({ ...blockData, [propName]: value });
  };

  const Icon = blockConfig?.icon;

  return (
    <div className="space-y-3 p-3 bg-gray-50">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-6 h-6" />}
        <span className="font-semibold">{blockConfig.name} Properties</span>
      </div>

      {blockConfig.properties.map((prop: BlockProperty) => {
        const value = blockData[prop.name] ?? prop.default;

        let inputEl: React.ReactNode;
        switch (prop.type) {
          case "string":
            inputEl = (
              <input
                value={value as string}
                onChange={(e) => handleChange(prop.name, e.target.value)}
                className="border p-1 w-full"
              />
            );
            break;
          case "image":
          case "file":
            inputEl = (
              <UploadField
                kind={prop.type}
                value={(value as string) ?? ""}
                onChange={(url) => handleChange(prop.name, url)}
              />
            );
            break;
          case "category":
            inputEl = (
              <CategoryField
                value={(value as string) ?? ""}
                onChange={(id) => handleChange(prop.name, id)}
              />
            );
            break;
          case "boolean":
            inputEl = (
              <input
                type="checkbox"
                checked={String(value) === "true"}
                onChange={(e) =>
                  handleChange(prop.name, String(e.target.checked))
                }
              />
            );
            break;
          case "enum":
            inputEl = (
              <select
                value={value as string}
                onChange={(e) => handleChange(prop.name, e.target.value)}
                className="border p-1 w-full"
              >
                {prop.values?.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            );
            break;
          case "color":
            inputEl = (
              <input
                type="color"
                value={value as string}
                onChange={(e) => handleChange(prop.name, e.target.value)}
              />
            );
            break;
          case "richtext":
            inputEl = (
              <textarea
                value={value as string}
                onChange={(e) => handleChange(prop.name, e.target.value)}
                className="border p-1 w-full h-24"
              />
            );
            break;
          default:
            inputEl = <span>Unsupported type</span>;
        }

        return (
          <div key={prop.name} className="flex flex-col">
            <label className="text-sm font-medium">{prop.displayName}</label>
            {inputEl}
          </div>
        );
      })}
    </div>
  );
};

export default BlockPropertyEditor;
