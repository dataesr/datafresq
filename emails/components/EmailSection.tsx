import type React from 'react';
import { colors, inlineStyles } from '../styles';

interface EmailSectionProps {
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: string;
  darkModeClass?: 'darkmode' | 'darkmode-1' | 'darkmode-2' | 'darkmode-3';
}

export function EmailSection({
  children,
  backgroundColor = colors.backgroundDefault,
  padding = '20px 10px',
  darkModeClass = 'darkmode',
}: EmailSectionProps) {
  return (
    <table
      width="100%"
      border={0}
      align="center"
      cellPadding={0}
      cellSpacing={0}
      className={darkModeClass}
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
                  }}
                  className={`wlkm-mw ${darkModeClass}`}
                  width={600}
                  cellSpacing={0}
                  cellPadding={0}
                  role="presentation"
                  border={0}
                  bgcolor={backgroundColor}
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
                        className={`wlkm-cl ${darkModeClass}`}
                        width={496}
                        cellSpacing={0}
                        cellPadding={0}
                        role="presentation"
                        border={0}
                        bgcolor={backgroundColor}
                        align="center"
                      >
                        <tr>
                          <td
                            className={darkModeClass}
                            width={496}
                            align="left"
                            valign="top"
                            style={{
                              padding,
                              fontFamily: inlineStyles.fontFamily,
                            }}
                          >
                            {children}
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
  );
}

export default EmailSection;
