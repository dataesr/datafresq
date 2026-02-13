import { type ComponentPropsWithoutRef, type ElementType } from 'react';
import cn from 'classnames';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Link } from 'react-router';

function isInternalLink(href: string): boolean {
  return href.startsWith('/') || href.startsWith('#');
}

function DsfrLink({ href, children, node: _node, ...props }: ComponentPropsWithoutRef<'a'> & { node?: unknown }) {
  if (href && isInternalLink(href)) {
    return (
      <Link to={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function DsfrTable({ children, node: _node, ...props }: ComponentPropsWithoutRef<'table'> & { node?: unknown }) {
  return (
    <div className="fr-table">
      <table {...props}>{children}</table>
    </div>
  );
}

const HEADING_STYLES: Record<string, string> = {
  h2: 'fr-h2 fr-pt-3w',
  h3: 'fr-h3 fr-pt-3w',
  h4: 'fr-h4 fr-pt-3w',
  h5: 'fr-h5 fr-pt-3w',
  h6: 'fr-h6 fr-pt-3w',
};

function createDsfrHeading(level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
  const Tag: ElementType = level;
  const styles = HEADING_STYLES[level];

  return function DsfrHeading({ children, className, node: _node, ...props }: ComponentPropsWithoutRef<typeof level> & { node?: unknown }) {
    return (
      <Tag className={cn(styles, className)} {...props}>
        {children}
      </Tag>
    );
  };
}

const DsfrH1 = createDsfrHeading('h1');
const DsfrH2 = createDsfrHeading('h2');
const DsfrH3 = createDsfrHeading('h3');
const DsfrH4 = createDsfrHeading('h4');
const DsfrH5 = createDsfrHeading('h5');
const DsfrH6 = createDsfrHeading('h6');

// --- Remark plugin for GFM-style callouts ---

interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
  data?: Record<string, unknown>;
}

function walkTree(node: MdastNode, visitor: (n: MdastNode) => void) {
  visitor(node);
  if (node.children) {
    for (const child of node.children) {
      walkTree(child, visitor);
    }
  }
}

const CALLOUT_PATTERN = /^\[!(NOTE|WARNING|TIP|ATTENTION)\]\s*\n?/;

const variants = new Map([
  ['NOTE', 'note'],
  ['WARNING', 'warning'],
  ['TIP', 'tip'],
  ['ATTENTION', 'attention']
]);

function remarkCallouts() {
  return (tree: MdastNode) => {
    walkTree(tree, (node) => {
      if (node.type !== 'blockquote') return;
      if (!node.children?.length) return;

      const firstParagraph = node.children[0];
      if (firstParagraph?.type !== 'paragraph') return;
      if (!firstParagraph.children?.length) return;

      const firstText = firstParagraph.children[0];
      if (firstText?.type !== 'text' || !firstText.value) return;

      const match = firstText.value.match(CALLOUT_PATTERN);
      if (!match) return;

      const directive = match[1]!;
      const variant = variants.get(directive);

      firstText.value = firstText.value.slice(match[0].length);
      if (!firstText.value && firstParagraph.children.length > 1) {
        firstParagraph.children.shift();
      }

      node.data = node.data || {};
      (node.data as Record<string, unknown>).hProperties = {
        ...((node.data as Record<string, unknown>).hProperties as Record<string, unknown> || {}),
        'data-callout': variant,
      };
    });
  };
}

// --- Blockquote component ---

interface BlockquoteProps extends ComponentPropsWithoutRef<'div'> {
  node?: unknown;
  cite?: string;
  'data-callout'?: string;
}

function DsfrBlockquote({ children, node: _node, cite: _cite, 'data-callout': callout, ...props }: BlockquoteProps) {
  if (callout === 'warning') {
    return (
      <div className="fr-callout fr-icon-warning-line fr-callout--brown-caramel fr-my-3w" {...props}>
        <div>{children}</div>
      </div>
    );
  }

  if (callout === 'note') {
    return (
      <div className="fr-callout fr-icon-info-line fr-callout--blue-cumulus fr-my-3w" {...props}>
        <div>{children}</div>
      </div>
    );
  }

  if (callout === 'tip') {
    return (
      <div className="fr-callout fr-icon-lightbulb-line fr-callout--green-emeraude fr-my-3w" {...props}>
        <div>{children}</div>
      </div>
    );
  }

  if (callout === 'attention') {
    return (
      <div className="fr-callout fr-icon-warning-line fr-callout--orange-terre-battue fr-my-3w" {...props}>
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="fr-callout fr-my-3w" {...props}>
      <div>{children}</div>
    </div>
  );
}

// --- Main renderer ---

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkCallouts]}
      rehypePlugins={[rehypeSlug]}
      components={{
        a: DsfrLink as never,
        table: DsfrTable as never,
        blockquote: DsfrBlockquote as never,
        h1: DsfrH1 as never,
        h2: DsfrH2 as never,
        h3: DsfrH3 as never,
        h4: DsfrH4 as never,
        h5: DsfrH5 as never,
        h6: DsfrH6 as never,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
