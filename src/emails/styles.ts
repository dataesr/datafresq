/**
 * DSFR Email Styles
 *
 * These styles follow the DSFR (Design System de l'État français) guidelines
 * for email templates with dark mode support.
 */

export const emailStyles = `
/* Hide/show classes for dark mode logo switching */
.hide-white {
  display: none !important;
}

.hide-black {
  display: block !important;
}

/********* DARK MODE ************/
:root {
  color-scheme: light dark;
  supported-color-schemes: light dark;
}

@media (prefers-color-scheme: dark) {
  body {
    background: #161616 !important;
    font-color: #ffffff !important;
  }

  svg {
    fill: white;
    filter: invert(1);
  }

  .white {
    fill: #ffffff !important;
    filter: invert(1);
  }

  .hide-black {
    display: none !important;
  }

  .hide-white {
    display: block !important;
  }

  .darkmode {
    background-color: #161616 !important;
    font-color: #ffffff !important;
    color: #ffffff !important;
    background: none !important;
    border-color: #2A2A2A !important;
  }

  .darkmode-1 {
    background-color: #161616 !important;
    font-color: #CECECE !important;
    color: #CECECE !important;
    background: none !important;
  }

  .darkmode-2 {
    background-color: #242424 !important;
    font-color: #ffffff !important;
    color: #ffffff !important;
    border-color: #2A2A2A !important;
  }

  .darkmode-3 {
    background-color: #1E1E1E !important;
    font-color: #ffffff !important;
    color: #ffffff !important;
    border-color: #2A2A2A !important;
  }

  .darkmode-4 {
    background-color: #1B1B35 !important;
    font-color: #CECECE !important;
    color: #CECECE !important;
    border-color: #2A2A2A !important;
  }

  .darkmode-5 {
    background-color: #1A1A3D !important;
    font-color: #ffffff !important;
    color: #ffffff !important;
    border-color: #2A2A2A !important;
  }

  .darkmode-6 {
    background-color: #1F1F4A !important;
    font-color: #ffffff !important;
    color: #ffffff !important;
    border-color: #2A2A2A !important;
  }

  a[href] {
    color: #8585F6 !important;
  }

  a.darkmode-button-color-primary[href] {
    font-color: #000091 !important;
    color: #000091 !important;
  }

  .darkmode-button-primary {
    background-color: #8585F6 !important;
    font-color: #000091 !important;
    color: #000091 !important;
    border: solid 1px #8585F6 !important;
  }

  .darkmode-button-secondary {
    background-color: #1E1E1E !important;
    font-color: #8585F6 !important;
    color: #8585F6 !important;
    border: solid 1px #8585F6 !important;
  }

  .darkmode-button-tertiary {
    background-color: transparent !important;
    font-color: #8585F6 !important;
    color: #8585F6 !important;
    border: solid 1px #353535 !important;
  }

  .darkmode-button-color-primary {
    font-color: #000091 !important;
    color: #000091 !important;
  }

  .darkmode-button-color-secondary {
    font-color: #8585F6 !important;
    color: #8585F6 !important;
  }

  .darkmode-button-color-tertiary {
    font-color: #8585F6 !important;
    color: #8585F6 !important;
  }

  .darkmode-img img {
    display: none !important;
  }

  .invert-img img {
    -webkit-filter: invert(100%);
    filter: invert(100%);
  }

  .link {
    color: #8585F6 !important;
  }

  [data-ogsc] .darkmode {
    background-color: #161616 !important;
  }

  [data-ogsc] h1,
  [data-ogsc] h2,
  [data-ogsc] p,
  [data-ogsc] span,
  [data-ogsc] a,
  [data-ogsc] b {
    color: #ffffff !important;
  }

  [data-ogsc] .link {
    color: #7C7CFF !important;
  }
}

body {
  width: 100%;
  background-color: #ffffff;
  margin: 0;
  padding: 0;
  -webkit-text-size-adjust: none;
  -webkit-font-smoothing: antialiased;
  -ms-text-size-adjust: none;
  mso-margin-top-alt: 0px;
  mso-margin-bottom-alt: 0px;
  mso-padding-alt: 0px 0px 0px 0px;
}

svg {
  fill: #000000;
}

.white {
  fill: #000000 !important;
}

html {
  width: 100%;
}

a[href] {
  color: #000091;
}

table {
  border-collapse: collapse;
}

table, td {
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  border-collapse: collapse;
}

table.wlkm-mw {
  min-width: 100% !important;
}

@media only screen and (max-width: 600px) {
  .wlkm-mw {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 600px !important;
  }

  .wlkm-cl {
    width: 90% !important;
  }

  .wlkm-hAuto {
    height: auto !important;
  }

  .wlkm-mw {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 600px !important;
  }

  .wlkm-resp {
    display: table !important;
    width: 100% !important;
  }

  .wlkm-resp2 {
    display: block !important;
    width: 100% !important;
  }

  .wlkm-hide {
    display: none !important;
  }

  .wlkm-alignCenter {
    text-align: center !important;
    margin: 0 auto !important;
  }

  .wlkm-alignCenter img {
    text-align: center !important;
  }

  .wlkm-pLeft {
    padding-left: 0px !important;
  }

  .wlkm-pRight {
    padding-right: 0px !important;
  }

  .wlkm-demicl {
    width: 45% !important;
  }

  .wlkm-demiResp {
    display: block !important;
    width: 45% !important;
  }

  .img-max {
    max-width: 80% !important;
  }
}

@media only screen and (max-width: 480px) {
  .wlkm-cl {
    width: 94% !important;
    max-width: 400px !important;
  }

  .wlkm-resp {
    width: 100% !important;
  }

  .img-max {
    max-width: 80% !important;
    width: 80% !important;
  }

  .wlkm-resp2 {
    width: 100% !important;
  }

  .wlkm-mw {
    width: 100% !important;
    min-width: auto !important;
  }

  .wlkm-demicl {
    width: 100% !important;
  }

  .wlkm-demiResp {
    width: 100% !important;
  }
}
`;

/**
 * DSFR Colors
 */
export const colors = {
  // Primary colors
  primary: '#000091',
  primaryLight: '#8585F6',
  primaryBackground: '#ECECFE',

  // Text colors
  textDefault: '#161616',
  textSecondary: '#3A3A3A',
  textMuted: '#666666',
  textLight: '#6b6b6b',

  // Background colors
  backgroundDefault: '#ffffff',
  backgroundAlt: '#f6f6f6',

  // Border colors
  borderDefault: '#e5e5e5',

  // Dark mode colors
  darkBackground: '#161616',
  darkText: '#ffffff',
  darkTextMuted: '#CECECE',

  // Button colors
  buttonPrimaryBg: '#000091',
  buttonPrimaryText: '#ffffff',
  buttonSecondaryBg: '#F5F5FE',
  buttonSecondaryText: '#000091',
} as const;

/**
 * Common inline styles for email components
 */
export const inlineStyles = {
  // Font family
  fontFamily: "'Marianne', Arial, Helvetica, sans-serif",

  // Text styles
  text: {
    default: {
      fontFamily: "'Marianne', Arial, Helvetica, sans-serif",
      fontSize: '14px',
      lineHeight: '24px',
      color: colors.textDefault,
    },
    small: {
      fontFamily: "'Marianne', Arial, Helvetica, sans-serif",
      fontSize: '12px',
      lineHeight: '18px',
      color: colors.textLight,
    },
    heading: {
      fontFamily: "'Marianne', Arial, Helvetica, sans-serif",
      fontSize: '24px',
      lineHeight: '32px',
      color: colors.textDefault,
    },
    subheading: {
      fontFamily: "'Marianne', Arial, Helvetica, sans-serif",
      fontSize: '18px',
      lineHeight: '24px',
      color: colors.textSecondary,
    },
  },

  // Table reset
  tableReset: {
    borderCollapse: 'collapse' as const,
    msoTableLspace: '0pt',
    msoTableRspace: '0pt',
  },

  // Container widths
  containerWidth: 600,
  contentWidth: 496,
} as const;
