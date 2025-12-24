import type React from 'react';
import { colors, inlineStyles } from '../styles';

type TextVariant = 'default' | 'small' | 'muted' | 'strong';

interface EmailTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}

const variantStyles: Record<
  TextVariant,
  {
    fontSize: string;
    lineHeight: string;
    color: string;
    fontWeight?: string;
  }
> = {
  default: {
    fontSize: '14px',
    lineHeight: '24px',
    color: colors.textDefault,
  },
  small: {
    fontSize: '12px',
    lineHeight: '18px',
    color: colors.textLight,
  },
  muted: {
    fontSize: '14px',
    lineHeight: '24px',
    color: colors.textMuted,
  },
  strong: {
    fontSize: '14px',
    lineHeight: '24px',
    color: colors.textDefault,
    fontWeight: 'bold',
  },
};

export function EmailText({
  children,
  variant = 'default',
  align = 'left',
  style,
}: EmailTextProps) {
  const variantStyle = variantStyles[variant];

  const content = variant === 'strong' ? <strong>{children}</strong> : children;

  return (
    <p
      className="darkmode"
      style={{
        margin: '0 0 16px 0',
        padding: 0,
        fontFamily: inlineStyles.fontFamily,
        fontSize: variantStyle.fontSize,
        lineHeight: variantStyle.lineHeight,
        color: variantStyle.color,
        textAlign: align,
        ...style,
      }}
    >
      <span style={{ fontFamily: inlineStyles.fontFamily }}>{content}</span>
    </p>
  );
}

export function EmailLink({
  children,
  href,
  style,
}: {
  children: React.ReactNode;
  href: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="link"
      style={{
        color: colors.primary,
        textDecoration: 'underline',
        fontFamily: inlineStyles.fontFamily,
        ...style,
      }}
    >
      {children}
    </a>
  );
}

export default EmailText;
