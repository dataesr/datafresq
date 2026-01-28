import type { HighchartsReactRefObject } from '@highcharts/react';
import { useId, useState } from 'react';
import { Modal, useModal } from '@/components/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import './styles.css';

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
    <div className="fx-card fx-card--shadow">
      <div className="analytics-graph">
        {/* Header with title and menu */}
        <div className="analytics-graph__header">
          <div className="analytics-graph__title">
            <h3 id={titleId} className="fr-h6 fr-mb-1v">
              {title}
            </h3>
            {description && (
              <p id={descriptionId} className="fr-text--sm fr-mb-0">
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
                <Dropdown.Header>Affichage</Dropdown.Header>
                <Dropdown.Item icon="fullscreen-line" onClick={handleFullscreen}>
                  Plein écran
                </Dropdown.Item>
                <Dropdown.Item icon="table-line" onClick={handleViewTable}>
                  Voir en tableau
                </Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Header>Exporter</Dropdown.Header>
                <Dropdown.Item icon="image-line" onClick={handleExportPng}>
                  Export PNG
                </Dropdown.Item>
                <Dropdown.Item icon="file-pdf-line" onClick={handleExportPdf}>
                  Export PDF
                </Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Header>Télécharger</Dropdown.Header>
                <Dropdown.Item icon="download-line" onClick={handleDownloadCsv}>
                  Télécharger CSV
                </Dropdown.Item>
              </Dropdown>
            </div>
          )}
        </div>

        {/* Chart content area - grows to fill available space */}
        <div
          role="img"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className="fx-width-100"
        >
          {children}
        </div>

        {/* Details section (optional) */}
        {details && (
          <div className="fr-text--sm fr-mb-0 analytics-graph__details">
            <span className="fr-icon-information-line fr-icon--sm" aria-hidden="true" />
            <div>{details}</div>
          </div>
        )}

        {/* Source section - pushed to bottom with marginTop: auto */}
        {source && (
          <div className="analytics-graph__source">
            <p className="fr-text--xs fr-mb-0 fx-flex fx-items-start fx-gap-1w">
              <span className="fr-icon-database-line fr-icon--sm" aria-hidden="true" />
              <span>Source : {source}</span>
            </p>
          </div>
        )}

        {/* Modal for table view */}
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
  );
}
