import React from 'react';
import styled, { keyframes } from 'styled-components';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
type SpinnerVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

interface SpinnerProps {
  /**
   * The size of the spinner
   * @default 'md'
   */
  size?: SpinnerSize;
  /**
   * The color variant of the spinner
   * @default 'primary'
   */
  color?: SpinnerVariant | string;
  /**
   * The thickness of the spinner border
   * @default '2px'
   */
  thickness?: string;
  /**
   * The speed of the spinner animation in seconds
   * @default 0.8
   */
  speed?: number;
  /**
   * Additional class name
   */
  className?: string;
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div<SpinnerProps>`
  display: inline-block;
  border: ${({ thickness = '2px' }) => thickness} solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${({ theme, color = 'primary' }) => 
    theme.colors[color]?.[500] || color || theme.colors.primary};
  animation: ${spin} ${({ speed = 0.8 }) => speed}s linear infinite;
  
  ${({ size = 'md' }) => {
    switch (size) {
      case 'xs':
        return 'width: 0.75rem; height: 0.75rem;';
      case 'sm':
        return 'width: 1rem; height: 1rem;';
      case 'lg':
        return 'width: 2rem; height: 2rem;';
      case 'md':
      default:
        return 'width: 1.5rem; height: 1.5rem;';
    }
  }}
`;

/**
 * A customizable loading spinner component
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  thickness = '2px',
  speed = 0.8,
  className = '',
  ...props
}) => {
  return (
    <SpinnerContainer 
      size={size}
      color={color}
      thickness={thickness}
      speed={speed}
      className={`spinner ${className}`}
      role="status"
      aria-label="Loading..."
      {...props}
    >
      <span className="visually-hidden">Loading...</span>
    </SpinnerContainer>
  );
};

export { Spinner };
export type { SpinnerProps, SpinnerSize, SpinnerVariant };
