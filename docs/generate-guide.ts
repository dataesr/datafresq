import { Glob } from "bun";
import { resolve, relative } from "node:path";
import GithubSlugger from "github-slugger";

const DOCS_ROOT = resolve(import.meta.dir, "./guide");
const OUTPUT_PATH = resolve(import.meta.dir, "../app/routes/guide/guide-content.generated.ts");

interface Frontmatter {
  label: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  keywords: string[];
}

interface GuideNode {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  icon?: string;
  order: number;
  keywords: string[];
  children?: GuideNode[];
}

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  let inCodeBlock = false;

  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1]!.length;
      const text = match[2]!
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .trim();
      entries.push({ id: slugger.slug(text), text, level });
    }
  }

  return entries;
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing frontmatter");
  }

  const yamlBlock = match[1]!;
  const content = match[2]!.trim();

  const fm: Record<string, unknown> = {};
  let currentKey = "";
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of yamlBlock.split("\n")) {
    if (inArray) {
      const itemMatch = line.match(/^\s+-\s+(.+)$/);
      if (itemMatch) {
        arrayValues.push(itemMatch[1]!.trim());
        continue;
      }
      fm[currentKey] = [...arrayValues];
      arrayValues.length = 0;
      inArray = false;
    }

    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1]!;
    let value = kvMatch[2]!.trim();

    if (value === "") {
      currentKey = key;
      inArray = true;
      continue;
    }

    // Inline array: [a, b, c]
    const inlineArrayMatch = value.match(/^\[(.+)\]$/);
    if (inlineArrayMatch) {
      fm[key] = inlineArrayMatch[1]!.split(",").map((s) => s.trim());
      continue;
    }

    // Strip quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Number
    if (/^\d+$/.test(value)) {
      fm[key] = parseInt(value, 10);
      continue;
    }

    fm[key] = value;
  }

  if (inArray) {
    fm[currentKey] = [...arrayValues];
  }

  return {
    frontmatter: {
      label: (fm.label as string) || "",
      title: (fm.title as string) || "",
      description: (fm.description as string) || "",
      icon: fm.icon as string | undefined,
      order: (fm.order as number) ?? 99,
      keywords: (fm.keywords as string[]) || [],
    },
    content,
  };
}

function filePathToHref(filePath: string): string {
  const rel = relative(DOCS_ROOT, filePath);
  const withoutExt = rel.replace(/\.md$/, "");
  const withoutIndex = withoutExt.replace(/\/index$/, "").replace(/^index$/, "");
  return "/guide" + (withoutIndex ? "/" + withoutIndex : "");
}

function filePathToId(filePath: string): string {
  const href = filePathToHref(filePath);
  if (href === "/guide") return "guide-root";
  return href.replace(/^\/guide\//, "").replace(/\//g, "-");
}

async function readAllDocs(): Promise<Map<string, { frontmatter: Frontmatter; content: string; filePath: string }>> {
  const glob = new Glob("**/*.md");
  const docs = new Map<string, { frontmatter: Frontmatter; content: string; filePath: string }>();

  for await (const path of glob.scan({ cwd: DOCS_ROOT })) {
    const fullPath = resolve(DOCS_ROOT, path);
    const raw = await Bun.file(fullPath).text();
    try {
      const parsed = parseFrontmatter(raw);
      const href = filePathToHref(fullPath);
      docs.set(href, { ...parsed, filePath: fullPath });
    } catch (e) {
      console.error("Error parsing " + path + ": " + e);
    }
  }

  return docs;
}

function buildTree(docs: Map<string, { frontmatter: Frontmatter; content: string; filePath: string }>): GuideNode[] {
  const nodeMap = new Map<string, GuideNode>();

  for (const [href, doc] of docs) {
    nodeMap.set(href, {
      id: filePathToId(doc.filePath),
      label: doc.frontmatter.label,
      title: doc.frontmatter.title,
      description: doc.frontmatter.description,
      href,
      icon: doc.frontmatter.icon,
      order: doc.frontmatter.order,
      keywords: doc.frontmatter.keywords,
    });
  }

  const rootChildren: GuideNode[] = [];

  for (const [href, node] of nodeMap) {
    if (href === "/guide") {
      continue;
    }

    const segments = href.replace(/^\/guide\//, "").split("/");
    if (segments.length === 1) {
      rootChildren.push(node);
    } else {
      const parentHref = "/guide/" + segments.slice(0, -1).join("/");
      const parent = nodeMap.get(parentHref);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        rootChildren.push(node);
      }
    }
  }

  const sortNodes = (nodes: GuideNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  };

  sortNodes(rootChildren);

  const result: GuideNode[] = [];
  const root = nodeMap.get("/guide");
  if (root) {
    result.push(root);
  }
  result.push(...rootChildren);

  return result;
}

function serializeNode(node: GuideNode, indent: number): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];
  lines.push(pad + "{");
  lines.push(pad + "  id: " + JSON.stringify(node.id) + ",");
  lines.push(pad + "  label: " + JSON.stringify(node.label) + ",");
  lines.push(pad + "  title: " + JSON.stringify(node.title) + ",");
  lines.push(pad + "  description: " + JSON.stringify(node.description) + ",");
  lines.push(pad + "  href: " + JSON.stringify(node.href) + ",");
  if (node.icon) {
    lines.push(pad + "  icon: " + JSON.stringify(node.icon) + ",");
  }
  lines.push(pad + "  order: " + node.order + ",");
  lines.push(pad + "  keywords: " + JSON.stringify(node.keywords) + ",");
  if (node.children && node.children.length > 0) {
    lines.push(pad + "  children: [");
    for (const child of node.children) {
      lines.push(serializeNode(child, indent + 2) + ",");
    }
    lines.push(pad + "  ],");
  }
  lines.push(pad + "}");
  return lines.join("\n");
}

async function generate() {
  const docs = await readAllDocs();
  const tree = buildTree(docs);

  const contentEntries: string[] = [];
  const tocEntries: string[] = [];
  for (const [href, doc] of docs) {
    contentEntries.push("  " + JSON.stringify(href) + ": " + JSON.stringify(doc.content) + ",");
    const toc = extractToc(doc.content);
    tocEntries.push("  " + JSON.stringify(href) + ": " + JSON.stringify(toc) + ",");
  }
  contentEntries.sort();
  tocEntries.sort();

  const treeStr = tree.map((n) => serializeNode(n, 1)).join(",\n");

  const lines: string[] = [];
  lines.push("// AUTO-GENERATED FILE — do not edit manually.");
  lines.push("// Run `bun scripts/generate-guide.ts` to regenerate from docs/guide/**/*.md");
  lines.push("");
  lines.push("export interface GuideNode {");
  lines.push("  id: string;");
  lines.push("  label: string;");
  lines.push("  title: string;");
  lines.push("  description: string;");
  lines.push("  href: string;");
  lines.push("  icon?: string;");
  lines.push("  order: number;");
  lines.push("  keywords: string[];");
  lines.push("  children?: GuideNode[];");
  lines.push("}");
  lines.push("");
  lines.push("export const GUIDE_TREE: GuideNode[] = [");
  lines.push(treeStr + ",");
  lines.push("];");
  lines.push("");
  lines.push("export interface TocEntry {");
  lines.push("  id: string;");
  lines.push("  text: string;");
  lines.push("  level: number;");
  lines.push("}");
  lines.push("");
  lines.push("export const GUIDE_CONTENT: Record<string, string> = {");
  lines.push(contentEntries.join("\n"));
  lines.push("};");
  lines.push("");
  lines.push("export const GUIDE_TOC: Record<string, TocEntry[]> = {");
  lines.push(tocEntries.join("\n"));
  lines.push("};");
  lines.push("");
  lines.push("// --- Derived helpers ---");
  lines.push("");
  lines.push("export interface NavItem {");
  lines.push("  id: string;");
  lines.push("  label: string;");
  lines.push("  href: string;");
  lines.push("  children?: NavItem[];");
  lines.push("}");
  lines.push("");
  lines.push("function toNavItem(node: GuideNode): NavItem {");
  lines.push("  return {");
  lines.push("    id: node.id,");
  lines.push("    label: node.label,");
  lines.push("    href: node.href,");
  lines.push("    children: node.children?.map(toNavItem),");
  lines.push("  };");
  lines.push("}");
  lines.push("");
  lines.push("export function getNavItems(): NavItem[] {");
  lines.push("  return GUIDE_TREE.map(toNavItem);");
  lines.push("}");
  lines.push("");
  lines.push("export interface GuideSection {");
  lines.push("  title: string;");
  lines.push("  description: string;");
  lines.push("  href: string;");
  lines.push("  icon?: string;");
  lines.push("}");
  lines.push("");
  lines.push("export function getSections(): GuideSection[] {");
  lines.push("  return GUIDE_TREE");
  lines.push('    .filter((n) => n.children && n.children.length > 0)');
  lines.push("    .map((n) => ({");
  lines.push("      title: n.title,");
  lines.push("      description: n.description,");
  lines.push("      href: n.href,");
  lines.push("      icon: n.icon,");
  lines.push("    }));");
  lines.push("}");
  lines.push("");
  lines.push("function findNode(nodes: GuideNode[], href: string): GuideNode | undefined {");
  lines.push("  for (const node of nodes) {");
  lines.push("    if (node.href === href) return node;");
  lines.push("    if (node.children) {");
  lines.push("      const found = findNode(node.children, href);");
  lines.push("      if (found) return found;");
  lines.push("    }");
  lines.push("  }");
  lines.push("  return undefined;");
  lines.push("}");
  lines.push("");
  lines.push("export function getChildren(href: string): GuideSection[] {");
  lines.push("  const node = findNode(GUIDE_TREE, href);");
  lines.push("  if (!node?.children) return [];");
  lines.push("  return node.children.map((c) => ({");
  lines.push("    title: c.title,");
  lines.push("    description: c.description,");
  lines.push("    href: c.href,");
  lines.push("    icon: c.icon,");
  lines.push("  }));");
  lines.push("}");
  lines.push("");
  lines.push("export function getPage(href: string): { node: GuideNode; content: string; toc: TocEntry[] } | undefined {");
  lines.push("  const node = findNode(GUIDE_TREE, href);");
  lines.push("  const content = GUIDE_CONTENT[href];");
  lines.push("  if (!node || content === undefined) return undefined;");
  lines.push("  return { node, content, toc: GUIDE_TOC[href] ?? [] };");
  lines.push("}");
  lines.push("");
  lines.push("export function getBreadcrumb(href: string): Array<{ label: string; href?: string }> {");
  lines.push("  const crumbs: Array<{ label: string; href?: string }> = [");
  lines.push('    { label: "Accueil", href: "/" },');
  lines.push('    { label: "Guide d\'utilisation", href: "/guide" },');
  lines.push("  ];");
  lines.push("");
  lines.push('  if (href === "/guide") {');
  lines.push('    crumbs[crumbs.length - 1] = { label: "Guide d\'utilisation" };');
  lines.push("    return crumbs;");
  lines.push("  }");
  lines.push("");
  lines.push('  const segments = href.replace(/^\\/guide\\//, "").split("/");');
  lines.push('  let currentPath = "/guide";');
  lines.push("");
  lines.push("  for (let i = 0; i < segments.length; i++) {");
  lines.push('    currentPath += "/" + segments[i];');
  lines.push("    const node = findNode(GUIDE_TREE, currentPath);");
  lines.push("    if (node) {");
  lines.push("      if (i === segments.length - 1) {");
  lines.push("        crumbs.push({ label: node.label });");
  lines.push("      } else {");
  lines.push("        crumbs.push({ label: node.label, href: currentPath });");
  lines.push("      }");
  lines.push("    }");
  lines.push("  }");
  lines.push("");
  lines.push("  return crumbs;");
  lines.push("}");
  lines.push("");
  lines.push("export interface SearchEntry {");
  lines.push("  title: string;");
  lines.push("  description: string;");
  lines.push("  href: string;");
  lines.push("  section: string;");
  lines.push("  keywords: string[];");
  lines.push("}");
  lines.push("");
  lines.push("function flattenNodes(nodes: GuideNode[], section?: string): SearchEntry[] {");
  lines.push("  return nodes.flatMap((node) => {");
  lines.push("    const currentSection = section ?? node.label;");
  lines.push("    const entry: SearchEntry = {");
  lines.push("      title: node.title,");
  lines.push("      description: node.description,");
  lines.push("      href: node.href,");
  lines.push("      section: currentSection,");
  lines.push("      keywords: node.keywords,");
  lines.push("    };");
  lines.push("    const children = node.children");
  lines.push("      ? flattenNodes(node.children, currentSection)");
  lines.push("      : [];");
  lines.push("    return [entry, ...children];");
  lines.push("  });");
  lines.push("}");
  lines.push("");
  lines.push("export function getSearchIndex(): SearchEntry[] {");
  lines.push("  return flattenNodes(GUIDE_TREE);");
  lines.push("}");
  lines.push("");
  lines.push("export function searchGuide(query: string): SearchEntry[] {");
  lines.push('  const trimmed = query.trim().toLowerCase();');
  lines.push('  if (!trimmed) return [];');
  lines.push("");
  lines.push('  const terms = trimmed.split(/\\s+/);');
  lines.push("  const index = getSearchIndex();");
  lines.push("");
  lines.push("  return index");
  lines.push("    .map((entry) => {");
  lines.push("      const haystack = [");
  lines.push("        entry.title,");
  lines.push("        entry.description,");
  lines.push("        entry.section,");
  lines.push("        ...entry.keywords,");
  lines.push("      ]");
  lines.push('        .join(" ")');
  lines.push("        .toLowerCase();");
  lines.push("");
  lines.push("      let score = 0;");
  lines.push("      for (const term of terms) {");
  lines.push("        if (haystack.includes(term)) {");
  lines.push("          score += 1;");
  lines.push("          if (entry.title.toLowerCase().includes(term)) score += 3;");
  lines.push("          if (entry.keywords.some((k) => k.toLowerCase().includes(term))) score += 1;");
  lines.push("        }");
  lines.push("      }");
  lines.push("");
  lines.push("      return { entry, score };");
  lines.push("    })");
  lines.push("    .filter(({ score }) => score > 0)");
  lines.push("    .sort((a, b) => b.score - a.score)");
  lines.push("    .map(({ entry }) => entry);");
  lines.push("}");
  lines.push("");

  const output = lines.join("\n");
  await Bun.write(OUTPUT_PATH, output);

  const pageCount = docs.size;
  const sectionCount = tree.filter((n) => n.children && n.children.length > 0).length;
  console.log("✅ Generated " + OUTPUT_PATH);
  console.log("   " + pageCount + " pages, " + sectionCount + " sections");
}

generate().catch((err) => {
  console.error("❌ Generation failed:", err);
  process.exit(1);
});
