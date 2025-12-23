import type React from 'react';
import { colors, inlineStyles } from '../styles';

interface EmailHeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  align?: 'left' | 'center' | 'right';
  backgroundColor?: string;
}

const headingStyles: Record<1 | 2 | 3, { fontSize: string; lineHeight: string }> = {
  1: { fontSize: '24px', lineHeight: '32px' },
  2: { fontSize: '18px', lineHeight: '24px' },
  3: { fontSize: '16px', lineHeight: '22px' },
};

export function EmailHeading({
  children,
  level = 1,
  align = 'left',
  backgroundColor = colors.primaryBackground,
}: EmailHeadingProps) {
  const style = headingStyles[level];

  return (
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
                  }}
                  className="wlkm-mw darkmode-3"
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
                        className="wlkm-cl darkmode"
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
                            className="darkmode"
                            width={496}
                            align={align}
                            valign="top"
                            style={{
                              padding: '20px 10px',
                              lineHeight: style.lineHeight,
                              fontSize: style.fontSize,
                              color: colors.textDefault,
                              fontFamily: inlineStyles.fontFamily,
                            }}
                          >
                            <span style={{ fontFamily: inlineStyles.fontFamily }}>
                              <strong>{children}</strong>
                            </span>
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

export default EmailHeading;
