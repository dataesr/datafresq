import { useLocation } from 'react-router';
import { Breadcrumb } from '@/components/Breadcrumb';
import { getBreadcrumb, getChildren, getPage } from '../guide-utils';
import MarkdownRenderer from './MarkdownRenderer';
import PageFeedback from './PageFeedback';
import SectionLinks from './SectionLinks';
import TableOfContents from './TableOfContents';

export default function GuidePage() {
  const { pathname } = useLocation();
  const href = pathname.replace(/\/$/, '') || '/guide';
  const page = getPage(href);

  if (!page) {
    return (
      <div>
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: "Guide d'utilisation", href: '/guide' },
            { label: 'Page introuvable' },
          ]}
        />
        <h1>Page introuvable</h1>
        <p className="fr-text--lead">La page demandée n'existe pas dans le guide.</p>
      </div>
    );
  }

  const breadcrumbItems = getBreadcrumb(href).map((item) =>
    item.href
      ? { label: item.label, href: item.href }
      : { label: item.label, current: true as const },
  );

  const children = getChildren(href);

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-8">
          <h1>{page.node.title}</h1>
          <p>{page.node.description}</p>
          <MarkdownRenderer content={page.content} />
        </div>
        {page.toc.length > 0 && (
          <div className="fr-col-12 fr-col-xl-3 fr-col-offset-xl-1">
            <TableOfContents entries={page.toc} />
          </div>
        )}
      </div>
      <div className="fullwidth-bg fx-shadow-border-top fr-mt-8w fr-background-alt--grey">
        <div className="fx-flex fx-justify-between fx-flex-wrap fx-items-start fx-gap-8w fr-py-6w">
          {children.length > 0 && <SectionLinks sectionHref={href} />}
          <PageFeedback />
        </div>
      </div>
    </div>
  );
}
