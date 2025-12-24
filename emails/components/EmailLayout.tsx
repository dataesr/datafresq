import type React from 'react';
import { emailAssets } from '../assets';
import { colors, emailStyles, inlineStyles } from '../styles';

interface EmailLayoutProps {
  preheader?: string;
  title?: string;
  children: React.ReactNode;
  marianneLogoLightUrl?: string;
  marianneLogoDarkUrl?: string;
  footer?: React.ReactNode;
}

export function EmailLayout({
  preheader,
  title = 'Email',
  children,
  marianneLogoLightUrl = emailAssets.marianneLogoLight,
  marianneLogoDarkUrl = emailAssets.marianneLogoDark,
  footer,
}: EmailLayoutProps) {
  return (
    <html lang="fr">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
        <title>{title}</title>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Email CSS must be inlined in style tag */}
        <style type="text/css" dangerouslySetInnerHTML={{ __html: emailStyles }} />
      </head>
      <body style={{ fontFamily: inlineStyles.fontFamily }}>
        {preheader && (
          <table
            style={{ minWidth: '100%', width: '100%' }}
            width="100%"
            cellSpacing={0}
            cellPadding={0}
            role="presentation"
            border={0}
            className="wlkm-mw darkmode"
          >
            <tr>
              <td align="center" className="darkmode">
                <table
                  style={{
                    minWidth: 600,
                    margin: '0 auto',
                    borderCollapse: 'collapse',
                    width: 600,
                  }}
                  className="wlkm-mw darkmode"
                  width={600}
                  cellSpacing={0}
                  cellPadding={0}
                  role="presentation"
                  border={0}
                  align="center"
                >
                  <tr>
                    <td className="darkmode">
                      <table
                        style={{
                          margin: '0 auto',
                          borderCollapse: 'collapse',
                          width: 496,
                        }}
                        className="wlkm-cl darkmode"
                        width={496}
                        cellSpacing={0}
                        cellPadding={0}
                        role="presentation"
                        border={0}
                        align="center"
                      >
                        <tr>
                          <td style={{ height: 12, lineHeight: '12px', fontSize: '12px' }}>
                            &nbsp;
                          </td>
                        </tr>
                      </table>
                      <table
                        style={{
                          margin: '0 auto',
                          borderCollapse: 'collapse',
                          width: 496,
                        }}
                        className="wlkm-cl darkmode"
                        width={496}
                        cellSpacing={0}
                        cellPadding={0}
                        role="presentation"
                        border={0}
                        align="center"
                      >
                        <tr>
                          <td
                            className="darkmode-1"
                            width={496}
                            align="left"
                            valign="top"
                            style={{
                              padding: '4px 0px 0px 0px',
                              lineHeight: '18px',
                              fontSize: '12px',
                              color: colors.textLight,
                              fontFamily: inlineStyles.fontFamily,
                            }}
                          >
                            <span style={{ fontFamily: inlineStyles.fontFamily }}>{preheader}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        )}

        <table
          width="100%"
          border={0}
          align="center"
          cellPadding={0}
          cellSpacing={0}
          className="darkmode"
          style={{ minWidth: '100%', width: '100%' }}
          role="presentation"
        >
          <tr>
            <td align="center">
              <table
                style={{
                  minWidth: 620,
                  margin: '0 auto',
                  borderCollapse: 'collapse',
                }}
                width={620}
                cellSpacing={0}
                cellPadding={0}
                role="presentation"
                border={0}
                align="center"
                className="wlkm-mw darkmode"
              >
                <tr>
                  <td align="center">
                    <table
                      style={{
                        minWidth: 600,
                        margin: '0 auto',
                        borderCollapse: 'collapse',
                        width: 600,
                        borderLeft: `1px ${colors.borderDefault} solid`,
                        borderRight: `1px ${colors.borderDefault} solid`,
                        borderTop: `1px ${colors.borderDefault} solid`,
                      }}
                      className="wlkm-mw darkmode"
                      width={600}
                      cellSpacing={0}
                      cellPadding={0}
                      role="presentation"
                      border={0}
                      align="center"
                    >
                      <tr>
                        <td>
                          <table
                            style={{
                              margin: '0 auto',
                              borderCollapse: 'collapse',
                              width: 496,
                            }}
                            className="wlkm-cl darkmode"
                            width={496}
                            cellSpacing={0}
                            cellPadding={0}
                            role="presentation"
                            border={0}
                            align="center"
                          >
                            <tr>
                              <td
                                style={{
                                  height: 12,
                                  lineHeight: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                &nbsp;
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table
                      style={{
                        minWidth: 600,
                        margin: '0 auto',
                        borderCollapse: 'collapse',
                        width: 600,
                        borderLeft: `1px ${colors.borderDefault} solid`,
                        borderRight: `1px ${colors.borderDefault} solid`,
                      }}
                      className="wlkm-mw darkmode"
                      width={600}
                      cellSpacing={0}
                      cellPadding={0}
                      role="presentation"
                      border={0}
                      align="center"
                    >
                      <tr>
                        <td style={{ padding: '0px 0px 20px 0px' }}>
                          <table
                            style={{
                              margin: '0 auto',
                              borderCollapse: 'collapse',
                              width: 496,
                            }}
                            className="wlkm-cl darkmode"
                            width={496}
                            cellSpacing={0}
                            cellPadding={0}
                            role="presentation"
                            border={0}
                            align="center"
                          >
                            <tr>
                              <td
                                style={{ width: '100%' }}
                                width="100%"
                                valign="top"
                                align="center"
                              >
                                {/* Marianne Logo - Left */}
                                <table
                                  style={{ borderCollapse: 'collapse' }}
                                  width={200}
                                  cellSpacing={0}
                                  cellPadding={0}
                                  role="presentation"
                                  border={0}
                                  align="left"
                                  className="darkmode"
                                >
                                  <tr>
                                    <td align="center">
                                      <table
                                        style={{ borderCollapse: 'collapse' }}
                                        width="100%"
                                        cellSpacing={0}
                                        cellPadding={0}
                                        role="presentation"
                                        border={0}
                                        align="left"
                                        className="darkmode"
                                      >
                                        <tr>
                                          <td
                                            style={{
                                              height: 12,
                                              lineHeight: '12px',
                                              fontSize: '12px',
                                            }}
                                          >
                                            &nbsp;
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className="hide-black" align="left">
                                            <img
                                              src={marianneLogoLightUrl}
                                              alt="Ministère de l'enseignement supérieur, de la recherche et de l'espace"
                                              style={{
                                                display: 'block',
                                                height: 'auto',
                                                width: 160,
                                              }}
                                              width={160}
                                            />
                                          </td>
                                        </tr>
                                        {marianneLogoDarkUrl && (
                                          <tr>
                                            <td className="hide-white" align="left" valign="bottom">
                                              <img
                                                src={marianneLogoDarkUrl}
                                                alt="Ministère de l'enseignement supérieur, de la recherche et de l'espace"
                                                width={160}
                                                className="hide-white"
                                                style={{
                                                  display: 'block',
                                                  height: 'auto',
                                                  width: 160,
                                                }}
                                              />
                                            </td>
                                          </tr>
                                        )}
                                        <tr>
                                          <td
                                            style={{
                                              height: 12,
                                              lineHeight: '12px',
                                              fontSize: '12px',
                                            }}
                                          >
                                            &nbsp;
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        {children}

        {footer && (
          <table
            width="100%"
            border={0}
            align="center"
            cellPadding={0}
            cellSpacing={0}
            className="darkmode"
            style={{ minWidth: '100%', width: '100%' }}
            role="presentation"
          >
            <tr>
              <td align="center">
                <table
                  style={{
                    minWidth: 620,
                    margin: '0 auto',
                    borderCollapse: 'collapse',
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(234,234,234,1) 5%, rgba(234,234,234,1) 95%, rgba(255,255,255,1) 100%)',
                  }}
                  width={620}
                  cellSpacing={0}
                  cellPadding={0}
                  role="presentation"
                  border={0}
                  align="center"
                  className="wlkm-mw darkmode"
                >
                  <tr>
                    <td align="center">
                      <table
                        style={{
                          minWidth: 600,
                          margin: '0 auto',
                          borderCollapse: 'collapse',
                          width: 600,
                          borderLeft: `1px ${colors.borderDefault} solid`,
                          borderRight: `1px ${colors.borderDefault} solid`,
                          borderBottom: `1px ${colors.borderDefault} solid`,
                        }}
                        className="wlkm-mw darkmode"
                        width={600}
                        cellSpacing={0}
                        cellPadding={0}
                        role="presentation"
                        border={0}
                        align="center"
                      >
                        <tr>
                          <td>
                            <table
                              style={{
                                margin: '0 auto',
                                borderCollapse: 'collapse',
                                width: 496,
                              }}
                              className="wlkm-cl darkmode"
                              width={496}
                              cellSpacing={0}
                              cellPadding={0}
                              role="presentation"
                              border={0}
                              align="center"
                            >
                              <tr>
                                <td
                                  className="darkmode-1"
                                  style={{
                                    padding: '20px 10px',
                                    lineHeight: '18px',
                                    fontSize: '12px',
                                    color: colors.textLight,
                                    fontFamily: inlineStyles.fontFamily,
                                  }}
                                >
                                  {footer}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        )}
      </body>
    </html>
  );
}

export default EmailLayout;
