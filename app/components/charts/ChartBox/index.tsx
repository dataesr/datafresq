import { Activity, useId } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { BlurredNoData } from '@/components/charts/BlurredNoData';
import { type SourceRef, renderSources } from '@/components/charts/sources';
import { useChartOptions } from './useChartOptions';
import type { HighchartsReactRefObject } from '@highcharts/react';
import './styles.css';

type ChartRef = React.RefObject<HighchartsReactRefObject | null>;

export interface ChartBoxProps {
  title: string;
  description?: React.ReactNode;
  details?: React.ReactNode;
  source?: SourceRef | SourceRef[];
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  chartRef?: ChartRef;
  hideMenu?: boolean;
  height?: number;
  noData?: {
    message?: string;
    icon?: string;
  };
}

export function ChartBox({
  title,
  description,
  details,
  source,
  children,
  tooltip,
  chartRef,
  hideMenu = false,
  height = 400,
  noData,
}: ChartBoxProps) {
  const titleId = useId();
  const descriptionId = useId();
  const segmentedId = useId();

  const effectiveChartRef = noData ? undefined : chartRef;
  const chartOptions = useChartOptions({ chartRef: effectiveChartRef, hideMenu, title, description });

  return (
    <div className="fx-card fx-card--shadow">
      <div className="fx-height-100 fx-flex fx-flex-col fx-gap-4w">
        <div className="fx-flex fx-gap-6w fx-items-start">
          <div className="fx-flex-grow">
            <h3 id={titleId} className="fr-h6 fr-mb-1v">
              {title}
            </h3>
            {description && (
              <p id={descriptionId} className="fr-text--sm fr-mb-0">
                {description}
              </p>
            )}
          </div>
          <div className="fx-flex fx-flex-wrap-0 fx-gap-1w">
          <Activity mode={tooltip ? 'visible' : 'hidden'}>
            <button aria-describedby={`${titleId}-tooltip`} type="button" className="fr-btn--tooltip fr-btn">infobulle</button>
            <span className="fr-tooltip fr-placement" id={`${titleId}-tooltip`} role="tooltip">{tooltip}</span>
          </Activity>
          <Activity mode={chartOptions.enabled ? 'visible' : 'hidden'}>
            {chartOptions.enabled && (
              <Dropdown
                icon="settings-5-line"
                size="sm"
                outline={false}
                title="Options"
                aria-label="Options"
              >
                <Dropdown.Header>Exporter</Dropdown.Header>
                <Dropdown.Item icon="image-line" onClick={chartOptions.handleExportPng}>
                  Export PNG
                </Dropdown.Item>
                <Dropdown.Item icon="file-pdf-line" onClick={chartOptions.handleExportPdf}>
                  Export PDF
                </Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Header>Télécharger</Dropdown.Header>
                <Dropdown.Item icon="download-line" onClick={chartOptions.handleDownloadCsv}>
                  Télécharger CSV
                </Dropdown.Item>
              </Dropdown>
            )}
          </Activity>
          </div>
        </div>

        <div
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className="fx-width-100"
        >
          <Activity mode={!chartOptions.enabled || chartOptions.view === 'chart' ? 'visible' : 'hidden'}>
            <div role="img" aria-labelledby={titleId} className="chartbox__chart" style={{ height }}>
              {noData ? (
                <BlurredNoData noData icon={noData.icon} message={noData.message}>
                  {children}
                </BlurredNoData>
              ) : (
                children
              )}
            </div>
          </Activity>
          {chartOptions.enabled && (
            <Activity mode={chartOptions.view === 'table' ? 'visible' : 'hidden'}>
              {chartOptions.tableHtml ? (
                <div className="chartbox__chart fr-table fr-m-0 fr-table--no-caption">
                  <div className="fr-table__wrapper">
                    <div className="fr-table__container" style={{ maxHeight: height }}>
                      <div
                        className="fr-table__content"
                        /* biome-ignore lint/security/noDangerouslySetInnerHtml: HTML comes from Highcharts getTable() */
                        dangerouslySetInnerHTML={{ __html: chartOptions.tableHtml }}
                        />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="fr-text--sm fr-text-mention--grey">Aucune donnée tabulaire disponible.</p>
              )}
            </Activity>
          )}
        </div>

        {details && (
          <div className="fr-text--sm fr-mb-0 fx-flex fx-gap-2w">
            <span className="fr-icon-information-line fr-icon--sm" aria-hidden="true" />
            <div>{details}</div>
          </div>
        )}

        {(source || chartOptions.enabled) && (
          <div className="fx-shadow-border-top fr-pt-2w fr-mt-auto fx-flex fx-items-center fx-gap-2w">
            {source && (
              <p className="fr-text--xs fr-mb-0 fx-flex fx-items-start fx-gap-1w fx-flex-grow">
                <span className="fr-icon-database-line fr-icon--sm" aria-hidden="true" />
                <span>Source : {renderSources(source)}</span>
              </p>
            )}
            {chartOptions.enabled && (
              <fieldset className="fr-segmented fr-segmented--sm fr-segmented--no-legend fr-mb-0">
                <legend className="fr-sr-only">Basculer entre graphique et tableau</legend>
                <div className="fr-segmented__elements">
                  <div className="fr-segmented__element">
                    <input
                      type="radio"
                      id={`${segmentedId}-chart`}
                      name={segmentedId}
                      value="chart"
                      checked={chartOptions.view === 'chart'}
                      onChange={() => chartOptions.switchView('chart')}
                    />
                    <label
                      className="fr-label"
                      htmlFor={`${segmentedId}-chart`}
                      title="Graphique"
                    >
                      <span aria-hidden="true" className="fr-icon-pie-chart-2-fill fr-icon--sm" />
                      <span className="fr-sr-only">Vue graphique</span>
                    </label>
                  </div>
                  <div className="fr-segmented__element">
                    <input
                      type="radio"
                      id={`${segmentedId}-table`}
                      name={segmentedId}
                      value="table"
                      checked={chartOptions.view === 'table'}
                      onChange={() => chartOptions.switchView('table')}
                    />
                    <label
                      className="fr-label"
                      htmlFor={`${segmentedId}-table`}
                      title="Tableau"
                    >
                      <span className="fr-icon-table-2 fr-icon fr-icon--sm" aria-hidden="true" />
                      <span className="fr-sr-only">Vue tableau</span>
                    </label>
                  </div>
                </div>
              </fieldset>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
