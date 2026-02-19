import { Glob } from "bun";
import { resolve, relative } from "node:path";
import GithubSlugger from "github-slugger";

const DOCS_ROOT = resolve(import.meta.dir, "./guide");
const OUTPUT_DIR = resolve(import.meta.dir, "../app/routes/guide");

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

    const inlineArrayMatch = value.match(/^\[(.+)\]$/);
    if (inlineArrayMatch) {
      fm[key] = inlineArrayMatch[1]!.split(",").map((s) => s.trim());
      continue;
    }

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

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
    if (href === "/guide") continue;

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
  if (root) result.push(root);
  result.push(...rootChildren);

  return result;
}

async function generate() {
  const docs = await readAllDocs();
  const tree = buildTree(docs);

  const contentMap: Record<string, string> = {};
  const tocMap: Record<string, TocEntry[]> = {};

  for (const [href, doc] of docs) {
    contentMap[href] = doc.content;
    tocMap[href] = extractToc(doc.content);
  }

  const treePath = resolve(OUTPUT_DIR, "guide-tree.generated.json");
  const contentPath = resolve(OUTPUT_DIR, "guide-content.generated.json");
  const tocPath = resolve(OUTPUT_DIR, "guide-toc.generated.json");

  await Promise.all([
    Bun.write(treePath, JSON.stringify(tree, null, 2)),
    Bun.write(contentPath, JSON.stringify(contentMap, null, 2)),
    Bun.write(tocPath, JSON.stringify(tocMap, null, 2)),
  ]);

  const pageCount = docs.size;
  const sectionCount = tree.filter((n) => n.children && n.children.length > 0).length;
  console.log("✅ Generated guide JSON files in " + OUTPUT_DIR);
  console.log("   " + pageCount + " pages, " + sectionCount + " sections");
}

generate().catch((err) => {
  console.error("❌ Generation failed:", err);
  process.exit(1);
});
