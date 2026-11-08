import React from "react";
import { BlockConfig, BlockProperty } from "@/types/blocks";
import UploadField from "@/components/Block/UploadField";
import CategoryField from "@/components/Block/CategoryField";
import { DEFAULT_GROUP, groupProperties } from "@/lib/property-groups";
import { URL_HINT, safeHref } from "@/lib/link-url";

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
  const groups = groupProperties(blockConfig.properties);

  const renderField = (prop: BlockProperty) => {
    const value = blockData[prop.name] ?? prop.default;

    // A checkbox sits before its label, which toggles it too
    if (prop.type === "boolean") {
      return (
        <label key={prop.name} className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={String(value) === "true"}
            onChange={(e) => handleChange(prop.name, String(e.target.checked))}
          />
          {prop.displayName}
        </label>
      );
    }

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
      case "url": {
        // Saving refuses an address that can't be linked; say so while typing
        const text = String(value ?? "");
        const refused = text.trim() !== "" && safeHref(text) === null;
        inputEl = (
          <>
            <input
              value={text}
              placeholder="https://… or /page"
              aria-invalid={refused || undefined}
              onChange={(e) => handleChange(prop.name, e.target.value)}
              className={`border p-1 w-full ${refused ? "border-destructive" : ""}`}
            />
            {refused && (
              <p role="alert" className="mt-1 text-xs text-destructive">
                {URL_HINT}
              </p>
            )}
          </>
        );
        break;
      }
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
      case "enum":
        inputEl = (
          <select
            value={value as string}
            onChange={(e) => handleChange(prop.name, e.target.value)}
            className="border p-1 w-full"
          >
            {prop.values?.map((v) => (
              <option key={v} value={v}>
                {/* "" is a theme token left unset */}
                {v === "" ? "Theme default" : v}
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
  };

  return (
    <div className="space-y-3 p-3 bg-muted">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-6 h-6" />}
        <span className="font-semibold">{blockConfig.name} Properties</span>
      </div>

      {groups.map(([group, props]) => (
        <details
          key={`${blockConfig.name}-${group}`}
          open={group === DEFAULT_GROUP || groups.length === 1}
          className="rounded-sm border bg-card"
        >
          <summary className="cursor-pointer select-none px-2 py-1 text-sm font-semibold">
            {group}
          </summary>
          <div className="space-y-3 p-2">{props.map(renderField)}</div>
        </details>
      ))}
    </div>
  );
};

export default BlockPropertyEditor;
