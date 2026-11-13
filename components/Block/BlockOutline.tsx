"use client";

import React, { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  Modifier,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { ALL_BLOCKS } from "@/config/blocks";
import { Block, BlockName } from "@/types/blocks";
import { getDefaultProps } from "@/lib/block-defaults";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BlockNode,
  BlockPlace,
  MAX_DEPTH,
  buildTree,
  canMoveTo,
  depthOf,
  isContainerType,
  subtreeIds,
} from "@/lib/block-tree";

interface BlockOutlineProps {
  blocks?: Block[];
  onSelect: (block: Block) => void;
  // parentId: the container to add inside, or null for the top level
  onAdd?: (block: Block, parentId: string | null) => void;
  onMove?: (blockId: string, direction: -1 | 1) => void;
  // Dragged, or moved with the keyboard, to a place in the tree
  onMoveTo?: (blockId: string, place: BlockPlace) => void;
  onDelete?: (blockId: string) => void;
  selectedBlockId?: string | null;
}

// A block being moved, and where it would land (null: nowhere it may go)
type Moving = { id: string; place: BlockPlace | null; by: "pointer" | "keyboard" };

const placeKey = (place: BlockPlace | null) =>
  place ? `${place.parentId ?? ""}>${place.beforeId ?? ""}` : "";

/** A band of the outline that stands for one place while a block is dragged. */
const DropZone = ({ id, place, className }: { id: string; place: BlockPlace; className: string }) => {
  const { setNodeRef } = useDroppable({ id, data: { place } });
  return <span ref={setNodeRef} aria-hidden className={cn("absolute inset-x-0 pointer-events-none", className)} />;
};

/** The line that marks where a dragged block will land. */
const DropMarker = ({ className }: { className: string }) => (
  <span
    data-drop-marker
    className={cn("pointer-events-none absolute inset-x-0 z-10 h-0.5 rounded-full bg-primary", className)}
  >
    <span className="absolute -left-1 -top-[3px] size-2 rounded-full border-2 border-primary bg-background" />
  </span>
);

/** A row that can be picked up with the pointer anywhere on it. */
const DraggableRow = ({
  id,
  disabled,
  ...props
}: { id: string; disabled: boolean } & React.HTMLAttributes<HTMLDivElement> & {
    [data: `data-${string}`]: string | number | undefined;
  }) => {
  // Only the pointer listeners: the handle button is the keyboard's way in,
  // so the row itself does not become a button
  const { setNodeRef, listeners } = useDraggable({ id, disabled });
  return <div ref={setNodeRef} {...listeners} {...props} />;
};

/*
 * The dragged block follows the pointer as a chip just below and right of
 * it, so the line marking the place under the pointer stays in view.
 */
const besideCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (!draggingNodeRect || !(activatorEvent instanceof PointerEvent)) return transform;
  return {
    ...transform,
    x: transform.x + activatorEvent.clientX - draggingNodeRect.left + 14,
    y: transform.y + activatorEvent.clientY - draggingNodeRect.top + 10,
  };
};

/*
 * Where the pointer is decides the place: the zone nearest it by height, so
 * the gaps between rows and the indent beside a nested list never leave it
 * over nothing; and nothing once the pointer leaves the outline.
 */
const nearestByHeight =
  (root: React.RefObject<HTMLElement | null>): CollisionDetection =>
  ({ droppableContainers, droppableRects, pointerCoordinates }) => {
    const bounds = root.current?.getBoundingClientRect();
    if (!pointerCoordinates || !bounds) return [];
    const { x, y } = pointerCoordinates;
    if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return [];

    let nearest: (typeof droppableContainers)[number] | null = null;
    let nearestDistance = Infinity;
    for (const zone of droppableContainers) {
      const rect = droppableRects.get(zone.id);
      if (!rect) continue;
      const distance = Math.max(rect.top - y, 0, y - rect.bottom);
      if (distance < nearestDistance) {
        nearest = zone;
        nearestDistance = distance;
      }
    }
    return nearest ? [{ id: nearest.id, data: { droppableContainer: nearest } }] : [];
  };

/**
 * The page's blocks as an indented tree. Each container has its own "add
 * inside" button; the button at the bottom adds to the top level. Move up and
 * down stay among a block's siblings.
 *
 * A block can be dragged to any place in the tree, or moved there with the
 * keyboard from its handle. Every place is "before a block" or "at the end of
 * a container (or the page)", which has a strip at the end of its list; a
 * line marks the place. Places it may not go get no line, and a drop there
 * changes nothing.
 */
export const BlockOutline: React.FC<BlockOutlineProps> = ({
  blocks = [],
  onSelect,
  onAdd,
  onMove,
  onMoveTo,
  onDelete,
  selectedBlockId = null,
}) => {
  // Where the add form adds to: undefined when closed, null for the top level
  const [addingTo, setAddingTo] = useState<string | null | undefined>(undefined);
  const [newType, setNewType] = useState<BlockName>(ALL_BLOCKS[0].name);
  // The form closes if the container it adds to is deleted while it is open
  const isAdding =
    addingTo === null ||
    (addingTo !== undefined && blocks.some((b) => b.id === addingTo));

  // A container at the deepest level could not hold anything, so none is offered
  const newDepth = addingTo ? depthOf(blocks, addingTo) + 1 : 0;
  const choices = ALL_BLOCKS.filter(
    (config) => newDepth < MAX_DEPTH || !isContainerType(config.name)
  );

  const openAdd = (parentId: string | null) => {
    setAddingTo(parentId);
    setNewType(ALL_BLOCKS[0].name);
  };

  const handleAdd = () => {
    const config = choices.find((b) => b.name === newType);
    if (!config || !isAdding || addingTo === undefined) return;

    const newBlock = {
      id: crypto.randomUUID(),
      type: newType,
      properties: { ...getDefaultProps(config) },
    } as Block;

    onAdd?.(newBlock, addingTo);
    setAddingTo(undefined);
  };

  const [moving, setMoving] = useState<Moving | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const dndId = useId();
  // A small move first, so a click on a row still selects it
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const tree = buildTree(blocks);
  const typeOf = (id: string | null) => blocks.find((b) => b.id === id)?.type ?? "";

  // Every place, top to bottom, as the keyboard steps through them
  const allPlaces = () => {
    const places: BlockPlace[] = [];
    const walk = (nodes: BlockNode<Block>[], parentId: string | null) => {
      for (const { block, children } of nodes) {
        places.push({ parentId, beforeId: block.id });
        if (isContainerType(block.type)) {
          walk(children, block.id);
          places.push({ parentId: block.id, beforeId: null });
        }
      }
    };
    walk(tree, null);
    places.push({ parentId: null, beforeId: null });
    return places;
  };

  // The place a drop zone stands for, if the block may go there
  const placeAt = (zone: { data: { current?: Record<string, unknown> } } | null, id: string) => {
    const place = zone?.data.current?.place as BlockPlace | undefined;
    return place && canMoveTo(blocks, id, place) ? place : null;
  };

  const describe = (place: BlockPlace) =>
    place.beforeId
      ? `Before ${typeOf(place.beforeId)} ${
          place.parentId ? `inside ${typeOf(place.parentId)}` : "on the page"
        }`
      : `At the end of ${place.parentId ? typeOf(place.parentId) : "the page"}`;

  const markedKey = placeKey(moving?.place ?? null);
  const marker = (place: BlockPlace, className: string) =>
    moving && markedKey === placeKey(place) ? <DropMarker className={className} /> : null;

  /*
   * Ends a move. A keyboard move commits at once, then puts focus back on the
   * moved block's handle, which is a new element when the block changed list.
   */
  const drop = (id: string, place: BlockPlace | null, by: Moving["by"]) => {
    setMoving(null);
    if (!place) return;
    if (by === "pointer") return onMoveTo?.(id, place);
    flushSync(() => onMoveTo?.(id, place));
    rootRef.current?.querySelector<HTMLElement>(`[data-drag-handle="${id}"]`)?.focus();
  };

  const isPointerDrag = moving?.by === "pointer";

  // Keyboard: Space or Enter picks the block up and drops it, the arrows step
  // through the places it may go, Escape (or leaving the handle) cancels
  const handleKey = (e: React.KeyboardEvent, block: Block) => {
    const isPick = e.key === " " || e.key === "Enter";
    if (moving?.id !== block.id || moving.by !== "keyboard") {
      if (!isPick) return;
      e.preventDefault();
      const start = { parentId: block.parentId ?? null, beforeId: block.id };
      setMoving({ id: block.id, place: start, by: "keyboard" });
      setAnnouncement(
        `Moving ${block.type}. Arrow keys choose a place, Enter drops it, Escape cancels.`
      );
      return;
    }
    if (isPick) {
      e.preventDefault();
      drop(block.id, moving.place, "keyboard");
      setAnnouncement(`Moved ${block.type}.`);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMoving(null);
      setAnnouncement(`Move cancelled.`);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const allowed = allPlaces().filter((p) => canMoveTo(blocks, block.id, p));
      const at = allowed.findIndex((p) => placeKey(p) === markedKey);
      const next = allowed[at + (e.key === "ArrowUp" ? -1 : 1)];
      if (!next) return;
      setMoving({ ...moving, place: next });
      setAnnouncement(describe(next));
    }
  };

  // The end of a list. Always there, so nothing shifts when a drag starts.
  const endStrip = (parentId: string | null) => {
    const place = { parentId, beforeId: null };
    return (
      <li className="relative h-2" data-drop-end={parentId ?? "page"}>
        <DropZone id={`end:${parentId ?? ""}`} place={place} className="inset-y-0" />
        {marker(place, "top-[3px]")}
      </li>
    );
  };

  const iconButton = "size-7 text-muted-foreground hover:text-foreground [&_svg]:size-3.5";

  const renderNodes = (nodes: BlockNode<Block>[]): React.ReactNode =>
    nodes.map(({ block, depth, children }, index) => {
      const isContainer = isContainerType(block.type);
      const parentId = block.parentId ?? null;
      const isSelected = selectedBlockId === block.id;
      // The container a moving block would land in
      const isTarget = moving?.place?.parentId === block.id;
      const before = { parentId, beforeId: block.id };
      // The top half of a row is the place before it; the bottom half is the
      // start of a container, or the place after a plain block
      const below: BlockPlace = isContainer
        ? { parentId: block.id, beforeId: children[0]?.block.id ?? null }
        : { parentId, beforeId: nodes[index + 1]?.block.id ?? null };
      return (
        <li key={block.id} className={cn("space-y-1", moving?.id === block.id && "opacity-40")}>
          <DraggableRow
            id={block.id}
            disabled={!onMoveTo}
            onClick={() => onSelect(block)}
            data-block-id={block.id}
            data-block-type={block.type}
            data-depth={depth}
            aria-current={isSelected ? "true" : undefined}
            className={cn(
              "group relative flex items-center gap-1 rounded-md border py-0.5 pl-0.5 pr-1 text-sm cursor-pointer transition-colors",
              isSelected ? "border-ring bg-accent" : "bg-card hover:bg-accent/60",
              isTarget && "border-primary bg-primary/10 ring-1 ring-primary"
            )}
          >
            {onMoveTo && (
              <>
                <DropZone id={`top:${block.id}`} place={before} className="top-0 h-1/2" />
                <DropZone id={`bottom:${block.id}`} place={below} className="bottom-0 h-1/2" />
              </>
            )}
            {marker(before, "-top-[3px]")}
            {onMoveTo && (
              <button
                type="button"
                data-drag-handle={block.id}
                aria-label={`Move ${block.type}`}
                aria-pressed={moving?.id === block.id && moving.by === "keyboard"}
                title="Drag to move, or press Space and use the arrow keys"
                className="flex h-7 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground/60 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => handleKey(e, block)}
                onBlur={() => setMoving((m) => (m?.by === "keyboard" ? null : m))}
              >
                <GripVertical className="size-3.5" />
              </button>
            )}
            <span className="flex-1 truncate font-medium">{block.type}</span>
            <span className="flex shrink-0" onClick={(e) => e.stopPropagation()}>
              {isContainer && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Add block inside ${block.type}`}
                  title={depth >= MAX_DEPTH ? "Nested as deep as allowed" : "Add block inside"}
                  disabled={depth >= MAX_DEPTH}
                  className={iconButton}
                  onClick={() => openAdd(block.id)}
                >
                  <Plus />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Move ${block.type} up`}
                title="Move up"
                disabled={index === 0}
                className={iconButton}
                onClick={() => onMove?.(block.id, -1)}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Move ${block.type} down`}
                title="Move down"
                disabled={index === nodes.length - 1}
                className={iconButton}
                onClick={() => onMove?.(block.id, 1)}
              >
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete ${block.type}`}
                title="Delete"
                className={cn(iconButton, "hover:text-destructive")}
                onClick={() => onDelete?.(block.id)}
              >
                <Trash2 />
              </Button>
            </span>
          </DraggableRow>
          {(children.length > 0 || isContainer) && (
            <ul
              className={cn(
                "ml-3 space-y-1 border-l pl-2 transition-colors",
                isTarget && "border-l-2 border-primary pl-[7px]"
              )}
            >
              {renderNodes(children)}
              {isContainer && endStrip(block.id)}
            </ul>
          )}
        </li>
      );
    });

  const target = addingTo ? blocks.find((b) => b.id === addingTo) : undefined;
  const dragged = isPointerDrag ? blocks.find((b) => b.id === moving.id) : undefined;
  const draggedInside = dragged ? subtreeIds(blocks, dragged.id).size - 1 : 0;

  return (
    <div ref={rootRef} className="p-3 space-y-2 bg-muted">
      <h2 className="font-bold text-lg">Blocks</h2>

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={nearestByHeight(rootRef)}
        // Only near the panel's top and bottom edges, and never sideways
        autoScroll={{ threshold: { x: 0, y: 0.1 } }}
        onDragStart={({ active }) =>
          setMoving({ id: String(active.id), place: null, by: "pointer" })
        }
        onDragOver={({ over }) =>
          setMoving((m) => (m && m.by === "pointer" ? { ...m, place: placeAt(over, m.id) } : m))
        }
        // The place under the pointer at release, not the last one marked
        onDragEnd={({ active, over }) =>
          drop(String(active.id), placeAt(over, String(active.id)), "pointer")
        }
        onDragCancel={() => setMoving(null)}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) => `Picked up ${typeOf(String(active.id))}.`,
            onDragOver: ({ active, over }) => {
              const place = placeAt(over, String(active.id));
              return place ? describe(place) : "Can't move it here.";
            },
            onDragEnd: ({ active, over }) =>
              placeAt(over, String(active.id)) ? "Dropped." : "Not moved.",
            onDragCancel: () => "Move cancelled.",
          },
        }}
      >
        {/* Mid-drag the rows ignore the pointer, so nothing under it lights
            up; dnd-kit finds the place from the pointer's position alone */}
        <ul className={cn("space-y-1", isPointerDrag && "pointer-events-none")}>
          {renderNodes(tree)}
          {endStrip(null)}
        </ul>

        {/* The block being dragged; the row it came from stays, faded */}
        <DragOverlay modifiers={[besideCursor]} dropAnimation={null}>
          {dragged && (
            <div className="inline-flex w-max items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-sm font-medium shadow-lg ring-1 ring-primary/30">
              <GripVertical className="size-3.5 text-muted-foreground" />
              <span>{dragged.type}</span>
              {draggedInside > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  +{draggedInside} inside
                </span>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <p aria-live="assertive" className="sr-only">
        {announcement}
      </p>

      {isAdding ? (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-muted-foreground">
            {target ? `Adding inside ${target.type}` : "Adding to the page"}
          </p>
          <div className="flex space-x-2 items-center">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as BlockName)}
              className="border p-1 flex-1"
            >
              {choices.map((block) => (
                <option key={block.name} value={block.name}>
                  {block.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              className="bg-emerald-600 text-white px-3 py-1 rounded-sm"
            >
              Add
            </button>
            <button
              onClick={() => setAddingTo(undefined)}
              className="px-3 py-1 rounded-sm border"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => openAdd(null)}
          className="mt-2 w-full text-center bg-primary text-primary-foreground rounded-sm p-2"
        >
          + Add Block
        </button>
      )}
    </div>
  );
};
