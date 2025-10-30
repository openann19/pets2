import React from 'react';

type LinearGradientProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
} & Record<string, unknown>;

export const LinearGradient: React.FC<LinearGradientProps> = ({ children, style, ...rest }) => (
  <div style={{ display: 'inline-flex', width: '100%', ...style }} {...rest}>
    {children}
  </div>
);

export default LinearGradient;

