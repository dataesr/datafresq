import { minorColors } from './colors';

const defaultTheme = {
  chart: {
    backgroundColor: 'transparent',
    style: {
      fontFamily: 'Marianne',
      color: 'var(--text-default-grey)',
    },
  },
  credits: {
    enabled: false,
  },
  legend: {
    enabled: true,
    align: 'center',
    verticalAlign: 'bottom',
    itemStyle: {
      fontFamily: 'Marianne',
      color: 'var(--text-default-grey)',
    },
    itemHoverStyle: {
      color: 'var(--text-mention-grey)',
    },
  },
  title: {
    align: 'left',
    text: '',
    style: {
      fontFamily: 'Marianne',
      color: 'var(--text-default-grey)',
    },
  },
  subtitle: {
    align: 'left',
    text: '',
    style: {
      fontFamily: 'Marianne',
      color: 'var(--text-default-grey)',
    },
  },
  tooltip: {
    backgroundColor: 'var(--background-contrast-grey)',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    style: {
      color: 'var(--text-contrast-grey)',
    },
  },
  xAxis: {
    gridLineColor: 'var(--border-alt-grey)',
    gridLineWidth: 1,
    labels: {
      style: {
        color: 'var(--text-default-grey)',
      },
    },
    lineColor: 'var(--border-contrast-grey)',
    tickColor: 'var(--border-contrast-grey)',
    title: {
      style: {
        color: 'var(--text-default-grey)',
      },
      text: '',
    },
  },
  yAxis: {
    gridLineColor: 'var(--border-alt-grey)',
    gridLineWidth: 1,
    labels: {
      style: {
        color: 'var(--text-default-grey)',
      },
    },
    lineColor: 'var(--border-contrast-grey)',
    tickColor: 'var(--border-contrast-grey)',
    title: {
      style: {
        color: 'var(--text-default-grey)',
      },
      text: '',
    },
    stackLabels: {
      style: {
        color: 'var(--text-title-grey)',
        textOutline: 'none',
      },
    },
  },
  plotOptions: {
    pie: {
      borderWidth: 0,
      dataLabels: {
        color: 'var(--text-title-grey)',
        shadow: false,
        style: {
          textOutline: 'none',
        },
      },
    },
    column: {
      borderWidth: 0,
      dataLabels: {
        color: 'var(--text-title-grey)',
        shadow: false,
        style: {
          textOutline: 'none',
        },
      },
    },
    bar: {
      borderWidth: 0,
      dataLabels: {
        color: 'var(--text-title-grey)',
        shadow: false,
        style: {
          textOutline: 'none',
        },
      },
    },
    series: {
      dataLabels: {
        shadow: false,
        style: {
          textOutline: 'none',
        },
      },
    },
  },
  exporting: {
    enabled: false,
    chartOptions: {
      chart: {
        backgroundColor: 'var(--background-default-grey)',
      },
      credits: {
        enabled: true,
        text: 'fresq/visualisations',
      },
    },
  },
} as const;

export const light = {
  colors: minorColors,
  ...defaultTheme,
};
export const dark = {
  colors: minorColors,
  ...defaultTheme,
} as const;
