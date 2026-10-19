import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { parseLayout } from "@/lib/template-layout";
import { KIND_LABELS } from "@/lib/fragment-routes";
import { Prisma } from "@/lib/generated/prisma";

type TemplateInput = {
  name: string;
  description?: string | null;
  // slot name -> fragment id, or null/missing to leave the slot empty
  slots?: Record<string, string | null>;
};

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

const cleanInput = (data: TemplateInput) => {
  const name = data.name?.trim();
  if (!name) throw new AppError("Name is required.", 400);
  if (name.length > NAME_MAX) {
    throw new AppError(`Name must be ${NAME_MAX} characters or fewer.`, 400);
  }

  const description = data.description?.trim() || null;
  if (description && description.length > DESCRIPTION_MAX) {
    throw new AppError(
      `Description must be ${DESCRIPTION_MAX} characters or fewer.`,
      400
    );
  }

  return { name, description };
};

const assertNameFree = async (name: string, excludeId: string | null) => {
  const clash = await prisma.template.findFirst({
    where: { name, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  if (clash) {
    throw new AppError("A template with this name already exists.", 409);
  }
};

const shape = (
  template: Prisma.TemplateGetPayload<{
    include: { slots: true; _count: { select: { pages: true } } };
  }>
) => ({
  id: template.id,
  name: template.name,
  description: template.description,
  layout: parseLayout(template.layout),
  isSystem: template.isSystem,
  pageCount: template._count.pages,
  slots: Object.fromEntries(template.slots.map((s) => [s.slot, s.fragmentId])),
});

const include = {
  slots: true,
  _count: { select: { pages: true } },
} satisfies Prisma.TemplateInclude;

export const listTemplates = async () => {
  const templates = await prisma.template.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    include,
  });
  return templates.map(shape);
};

export const getTemplate = async (id: string) => {
  const template = await prisma.template.findUnique({
    where: { id },
    include,
  });
  if (!template) throw new AppError("Template not found.", 404);
  return shape(template);
};

/** Creates a template as a copy of an existing one (layout and slots). */
export const createTemplate = async (
  data: TemplateInput & { basedOnId?: string }
) => {
  const { name, description } = cleanInput(data);
  if (!data.basedOnId) {
    throw new AppError("Choose a template to base this one on.", 400);
  }
  const source = await getTemplate(data.basedOnId);
  await assertNameFree(name, null);

  const created = await prisma.template.create({
    data: {
      name,
      description,
      layout: source.layout,
      slots: {
        create: Object.entries(source.slots).map(([slot, fragmentId]) => ({
          slot,
          fragmentId,
        })),
      },
    },
  });

  return getTemplate(created.id);
};

export const updateTemplate = async (id: string, data: TemplateInput) => {
  const existing = await getTemplate(id);
  const { name, description } = cleanInput(data);
  await assertNameFree(name, id);

  // Only keep slots the layout defines and that have a fragment of that kind
  const requested = Object.entries(data.slots ?? existing.slots).filter(
    (entry): entry is [string, string] => !!entry[1]
  );
  const fragments = await prisma.fragment.findMany({
    where: { id: { in: requested.map(([, fragmentId]) => fragmentId) } },
    select: { id: true, kind: true },
  });

  for (const [slot, fragmentId] of requested) {
    const definition = existing.layout.slots[slot];
    if (!definition) {
      throw new AppError(`This layout has no "${slot}" slot.`, 400);
    }
    const fragment = fragments.find((f) => f.id === fragmentId);
    if (!fragment) throw new AppError("Fragment not found.", 400);
    if (fragment.kind !== definition.kind) {
      throw new AppError(
        `The "${slot}" slot only accepts ${KIND_LABELS[
          definition.kind
        ].toLowerCase()}.`,
        400
      );
    }
  }

  await prisma.$transaction([
    prisma.templateSlot.deleteMany({ where: { templateId: id } }),
    prisma.templateSlot.createMany({
      data: requested.map(([slot, fragmentId]) => ({
        templateId: id,
        slot,
        fragmentId,
      })),
    }),
    prisma.template.update({ where: { id }, data: { name, description } }),
  ]);

  return getTemplate(id);
};

/** Preset templates and templates that pages use can't be deleted. */
export const deleteTemplate = async (id: string) => {
  const template = await getTemplate(id);

  if (template.isSystem) {
    throw new AppError("Preset templates can't be deleted.", 400);
  }
  if (template.pageCount > 0) {
    throw new AppError(
      `This template is used by ${template.pageCount} page${
        template.pageCount === 1 ? "" : "s"
      }. Move them to another template first.`,
      409
    );
  }

  await prisma.template.delete({ where: { id } });
  return { id, name: template.name };
};
