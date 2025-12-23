import type React from 'react';
import { colors, inlineStyles } from '../styles';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface EmailButtonProps {
  children: React.ReactNode;
  href: string;
  variant?: ButtonVariant;
  style?: React.CSSProperties;
  center?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    darkModeClass: string;
    darkModeColorClass: string;
  }
> = {
  primary: {
    backgroundColor: colors.buttonPrimaryBg,
    textColor: colors.buttonPrimaryText,
    borderColor: colors.buttonPrimaryBg,
    darkModeClass: 'darkmode-button-primary',
    darkModeColorClass: 'darkmode-button-color-primary',
  },
  secondary: {
    backgroundColor: colors.buttonSecondaryBg,
    textColor: colors.buttonSecondaryText,
    borderColor: colors.buttonSecondaryText,
    darkModeClass: 'darkmode-button-secondary',
    darkModeColorClass: 'darkmode-button-color-secondary',
  },
  tertiary: {
    backgroundColor: 'transparent',
    textColor: colors.primary,
    borderColor: colors.borderDefault,
    darkModeClass: 'darkmode-button-tertiary',
    darkModeColorClass: 'darkmode-button-color-tertiary',
  },
};

export function EmailButton({
  children,
  href,
  variant = 'primary',
  style,
  center = true,
}: EmailButtonProps) {
  const variantStyle = variantStyles[variant];

  return (
    <table
      style={{
        borderCollapse: 'initial',
        border: `solid 1px ${variantStyle.borderColor}`,
        backgroundColor: variantStyle.backgroundColor,
        ...style,
      }}
      align={center ? 'center' : 'left'}
      cellPadding={0}
      role="presentation"
      cellSpacing={0}
      border={0}
      className="darkmode"
    >
      <tbody>
        <tr>
          <td
            style={{
              fontSize: '14px',
              lineHeight: '24px',
              fontFamily: inlineStyles.fontFamily,
              height: 32,
              padding: '0px 16px',
            }}
            align="center"
            className={variantStyle.darkModeClass}
          >
            <a
              className={variantStyle.darkModeColorClass}
              href={href}
              style={{
                color: variantStyle.textColor,
                textDecoration: 'none',
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span style={{ fontFamily: inlineStyles.fontFamily }}>{children}</span>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default EmailButton;
