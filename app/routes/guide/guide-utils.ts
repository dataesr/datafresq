import type { GuideNode, GuideSection, NavItem, SearchEntry, TocEntry } from './types';
import guideTree from './guide-tree.generated.json';
import guideContent from './guide-content.generated.json';
import guideToc from './guide-toc.generated.json';

const tree = guideTree as GuideNode[];
const content = guideContent as Record<string, string>;
const toc = guideToc as Record<string, TocEntry[]>;

function toNavItem(node: GuideNode): NavItem {
  return {
    id: node.id,
    label: node.label,
    href: node.href,
    children: node.children?.map(toNavItem),
  };
}

export function getNavItems(): NavItem[] {
  return tree.map(toNavItem);
}

export function getSections(): GuideSection[] {
  return tree
    .filter((n) => n.children && n.children.length > 0)
    .map((n) => ({
      title: n.title,
      description: n.description,
      href: n.href,
      icon: n.icon,
    }));
}

function findNode(nodes: GuideNode[], href: string): GuideNode | undefined {
  for (const node of nodes) {
    if (node.href === href) return node;
    if (node.children) {
      const found = findNode(node.children, href);
      if (found) return found;
    }
  }
  return undefined;
}

export function getChildren(href: string): GuideSection[] {
  const node = findNode(tree, href);
  if (!node?.children) return [];
  return node.children.map((c) => ({
    title: c.title,
    description: c.description,
    href: c.href,
    icon: c.icon,
  }));
}

export function getPage(
  href: string,
): { node: GuideNode; content: string; toc: TocEntry[] } | undefined {
  const node = findNode(tree, href);
  const pageContent = content[href];
  if (!node || pageContent === undefined) return undefined;
  return { node, content: pageContent, toc: toc[href] ?? [] };
}

export function getBreadcrumb(href: string): Array<{ label: string; href?: string }> {
  const crumbs: Array<{ label: string; href?: string }> = [
    { label: 'Accueil', href: '/' },
    { label: "Guide d'utilisation", href: '/guide' },
  ];

  if (href === '/guide') {
    crumbs[crumbs.length - 1] = { label: "Guide d'utilisation" };
    return crumbs;
  }

  const segments = href.replace(/^\/guide\//, '').split('/');
  let currentPath = '/guide';

  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];
    const node = findNode(tree, currentPath);
    if (node) {
      if (i === segments.length - 1) {
        crumbs.push({ label: node.label });
      } else {
        crumbs.push({ label: node.label, href: currentPath });
      }
    }
  }

  return crumbs;
}

function flattenNodes(nodes: GuideNode[], section?: string): SearchEntry[] {
  return nodes.flatMap((node) => {
    const currentSection = section ?? node.label;
    const headings = (toc[node.href] ?? []).map((entry) => entry.text);
    const entry: SearchEntry = {
      title: node.title,
      description: node.description,
      href: node.href,
      section: currentSection,
      keywords: [...node.keywords, ...headings],
    };
    const children = node.children ? flattenNodes(node.children, currentSection) : [];
    return [entry, ...children];
  });
}

const searchIndex = flattenNodes(tree);

export function getSearchIndex(): SearchEntry[] {
  return searchIndex;
}

export function getDefaultSearchResults(): SearchEntry[] {
  return searchIndex.filter((entry) => {
    const segments = entry.href
      .replace(/^\/guide\/?/, '')
      .split('/')
      .filter(Boolean);
    return segments.length === 1;
  });
}

export function searchGuide(query: string): SearchEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return getDefaultSearchResults();

  const terms = trimmed.split(/\s+/);

  return searchIndex
    .map((entry) => {
      const haystack = [entry.title, entry.description, entry.section, ...entry.keywords]
        .join(' ')
        .toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) {
          score += 1;
          if (entry.title.toLowerCase().includes(term)) score += 3;
          if (entry.keywords.some((k) => k.toLowerCase().includes(term))) score += 1;
        }
      }

      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);
}
