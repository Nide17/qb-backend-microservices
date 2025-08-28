import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * If true, the button will take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  /**
   * If true, the button will show a loading spinner
   * @default false
   */
  isLoading?: boolean;
  /**
   * The text to show when the button is in a loading state
   */
  loadingText?: string;
  /**
   * The position of the loading spinner
   * @default 'left'
   */
  spinnerPlacement?: 'left' | 'right';
  /**
   * If true, the button will be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * If true, the button will have rounded corners
   * @default false
   */
  rounded?: boolean;
  /**
   * If true, the button will have a shadow
   * @default false
   */
  shadow?: boolean;
  /**
   * If true, the button will have a transparent background with a border
   * @default false
   */
  outline?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * The type of the button
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
}

const StyledButton = styled.button<Omit<ButtonProps, 'children'>>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  transition: ${({ theme }) => theme.transitions.DEFAULT};
  cursor: pointer;
  line-height: 1.5;
  border-radius: ${({ theme, rounded }) => (rounded ? theme.borderRadius.full : theme.borderRadius.DEFAULT)};
  box-shadow: ${({ theme, shadow }) => (shadow ? theme.shadows.md : 'none')};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  /* Size variants */
  ${({ size = 'md' }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
        `;
      case 'lg':
        return css`
          padding: 0.75rem 1.5rem;
          font-size: 1.125rem;
        `;
      case 'md':
      default:
        return css`
          padding: 0.5rem 1rem;
          font-size: 1rem;
        `;
    }
  }}

  /* Color variants */
  ${({ theme, variant = 'primary', outline }) => {
    if (outline) {
      return css`
        background-color: transparent;
        color: ${theme.colors[variant === 'light' ? 'dark' : variant]};
        border-color: ${theme.colors[variant === 'light' ? 'gray' : variant][300]};

        &:hover:not(:disabled) {
          background-color: ${theme.colors[variant === 'light' ? 'gray' : variant][100]};
          border-color: ${theme.colors[variant === 'light' ? 'gray' : variant][400]};
        }

        &:focus {
          box-shadow: 0 0 0 0.2rem ${theme.colors[variant === 'light' ? 'gray' : variant][200]};
        }
      `;
    }

    return css`
      background-color: ${theme.colors[variant === 'light' ? 'gray' : variant][500]};
      color: ${variant === 'light' ? theme.colors.dark : theme.colors.white};
      border-color: ${theme.colors[variant === 'light' ? 'gray' : variant][500]};

      &:hover:not(:disabled) {
        background-color: ${theme.colors[variant === 'light' ? 'gray' : variant][600]};
        border-color: ${theme.colors[variant === 'light' ? 'gray' : variant][600]};
      }

      &:focus {
        box-shadow: 0 0 0 0.2rem ${theme.colors[variant === 'light' ? 'gray' : variant][200]};
      }
    `;
  }}

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const SpinnerWrapper = styled.span<{ placement: 'left' | 'right' }>`
  display: inline-flex;
  margin-right: ${({ placement }) => (placement === 'left' ? '0.5rem' : '0')};
  margin-left: ${({ placement }) => (placement === 'right' ? '0.5rem' : '0')};
`;

const ButtonContent = styled.span<{ isLoading?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
`;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      loadingText,
      spinnerPlacement = 'left',
      disabled = false,
      rounded = false,
      shadow = false,
      outline = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const spinner = <Spinner size={size === 'lg' ? 'sm' : 'xs'} color={outline ? variant : 'white'} />;

    return (
      <StyledButton
        ref={ref}
        type={type}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled || isLoading}
        rounded={rounded}
        shadow={shadow}
        outline={outline}
        className={`btn ${className}`}
        {...props}
      >
        {isLoading && spinnerPlacement === 'left' && (
          <SpinnerWrapper placement="left">
            {spinner}
          </SpinnerWrapper>
        )}
        
        <ButtonContent isLoading={isLoading}>
          {isLoading && loadingText ? loadingText : children}
        </ButtonContent>
        
        {isLoading && spinnerPlacement === 'right' && (
          <SpinnerWrapper placement="right">
            {spinner}
          </SpinnerWrapper>
        )}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
