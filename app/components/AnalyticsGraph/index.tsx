import type { HighchartsReactRefObject } from '@highcharts/react';
import { useId, useState } from 'react';
import Dropdown from '@/components/Dropdown';
import { Modal, useModal } from '@/components/Modal';

interface ChartWithExporting {
  exportChart: (options?: { type?: string }, chartOptions?: object) => void;
  downloadCSV: () => void;
  downloadXLS: () => void;
  getTable: () => string;
  fullscreen: { toggle: () => void };
}

type ChartRef = React.RefObject<HighchartsReactRefObject | null>;

const getChartWithExporting = (
  ref: ChartRef,
): (HighchartsReactRefObject['chart'] & ChartWithExporting) | null => {
  if (!ref.current?.chart) return null;
  return ref.current.chart as HighchartsReactRefObject['chart'] & ChartWithExporting;
};

export interface AnalyticsGraphProps {
  title: string;
  description?: React.ReactNode;
  details?: React.ReactNode;
  source?: React.ReactNode;
  children: React.ReactNode;
  chartRef?: ChartRef;
  hideMenu?: boolean;
}

export function AnalyticsGraph({
  title,
  description,
  details,
  source,
  children,
  chartRef,
  hideMenu = false,
}: AnalyticsGraphProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { modalProps, open, close } = useModal();
  const [tableHtml, setTableHtml] = useState<string | null>(null);

  const showMenu = chartRef && !hideMenu;

  const handleExportPng = () => {
    if (!chartRef) return;
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.exportChart({ type: 'image/png' }, { title: { text: title } });
  };

  const handleExportPdf = () => {
    if (!chartRef) return;
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.exportChart({ type: 'application/pdf' }, { title: { text: title } });
  };

  const handleDownloadCsv = () => {
    if (!chartRef) return;
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.downloadCSV();
  };

  const handleFullscreen = () => {
    if (!chartRef) return;
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.fullscreen.toggle();
  };

  const handleViewTable = () => {
    if (!chartRef) return;
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    const html = chart.getTable();
    setTableHtml(html);
    open();
  };

  return (
    <div className="fr-card fr-card--shadow">
      <div className="fr-card__body">
        <div className="fr-card__content">
          <div style={{ display: 'flex' }}>
            <div className="fr-mb-3w" style={{ flexGrow: 1 }}>
              <h3 id={titleId} className="fr-h6 fr-m-0">
                {title}
              </h3>
              {description && (
                <p id={descriptionId} className="fr-text--sm fr-text-mention--grey fr-mb-0">
                  {description}
                </p>
              )}
            </div>
            {showMenu && (
              <div>
                <Dropdown
                  icon="settings-5-line"
                  size="sm"
                  outline={false}
                  title="Options"
                  aria-label="Options"
                >
                  <div className="fx-dropdown__header">Affichage</div>
                  <button
                    type="button"
                    role="menuitem"
                    className="fx-dropdown__item fr-icon-fullscreen-line"
                    onClick={handleFullscreen}
                  >
                    Plein écran
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="fx-dropdown__item fr-icon-table-line"
                    onClick={handleViewTable}
                  >
                    Voir en tableau
                  </button>
                  <hr />
                  <div className="fx-dropdown__header">Exporter</div>
                  <button
                    type="button"
                    role="menuitem"
                    className="fx-dropdown__item fr-icon-image-line"
                    onClick={handleExportPng}
                  >
                    Export PNG
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="fx-dropdown__item fr-icon-file-pdf-line"
                    onClick={handleExportPdf}
                  >
                    Export PDF
                  </button>
                  <hr />
                  <div className="fx-dropdown__header">Télécharger</div>
                  <button
                    type="button"
                    role="menuitem"
                    className="fx-dropdown__item fr-icon-download-line"
                    onClick={handleDownloadCsv}
                  >
                    Télécharger CSV
                  </button>
                </Dropdown>
              </div>
            )}
          </div>

          <div
            role="img"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
          >
            {children}
          </div>

          {details && (
            <div className="fr-mt-2w fr-p-2w">
              <div className="fr-text--sm" style={{ display: 'flex', gap: '0.5rem' }}>
                <span
                  className="fr-icon-information-line fr-icon--sm"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                />
                <div>{details}</div>
              </div>
            </div>
          )}

          {source && (
            <div
              className="fr-mt-2w fr-pt-2w"
              style={{ borderTop: '1px solid var(--border-default-grey)' }}
            >
              <p
                className="fr-text--xs fr-text-mention--grey fr-mb-0"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span className="fr-icon-database-line fr-icon--sm" aria-hidden="true" />
                <span>Source : {source}</span>
              </p>
            </div>
          )}

          {showMenu && (
            <Modal {...modalProps}>
              <div className="fr-container fr-container--fluid fr-container-md">
                <div className="fr-grid-row fr-grid-row--center">
                  <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
                    <div className="fr-modal__body">
                      <div className="fr-modal__header">
                        <button
                          type="button"
                          className="fr-btn--close fr-btn"
                          title="Fermer"
                          aria-label="Fermer"
                          onClick={close}
                        >
                          Fermer
                        </button>
                      </div>
                      <div className="fr-modal__content">
                        <h1 className="fr-modal__title">{title}</h1>
                        {tableHtml && (
                          <div
                            className="fr-table fr-table--bordered"
                            /* biome-ignore lint/security/noDangerouslySetInnerHtml: HTML comes from Highcharts getTable() */
                            dangerouslySetInnerHTML={{ __html: tableHtml }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}
