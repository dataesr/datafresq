import { Highcharts, setHighcharts } from '@highcharts/react';
import 'highcharts/esm/highcharts-more.src.js';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/offline-exporting.src.js';
import 'highcharts/esm/modules/export-data.src.js';
import 'highcharts/esm/modules/map.src.js';

import { colorFamily } from './colors';
import { dark, light } from './themes';
import './highcharts.css';

// Set the Highcharts instance for @highcharts/react
setHighcharts(Highcharts);

const theme =
  document.getElementsByTagName('html')?.[0]?.getAttribute('data-fr-theme') === 'dark'
    ? dark
    : light;

// Apply theme to the Highcharts instance
Highcharts.setOptions(theme as Highcharts.Options);

export const getChartColor = (colorName: (typeof colorFamily)[number]) => {
  const index = colorFamily.indexOf(colorName);
  return theme.colors[index];
};

const colorsForSeries = {
  hommes: 'yellow-tournesol',
  femmes: 'pink-macaron',
  total: 'green-archipel',
} as const;

export const getColorForSeries = (seriesName: keyof typeof colorsForSeries) => {
  return getChartColor(colorsForSeries[seriesName]);
};
