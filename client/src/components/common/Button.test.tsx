import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn');
    expect(button).toHaveStyle('background-color: #4361ee');
    expect(button).toHaveStyle('color: white');
    expect(button).toHaveStyle('padding: 0.5rem 1rem');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with loading state', () => {
    render(<Button isLoading>Loading</Button>);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Loading')).toHaveStyle('opacity: 0');
  });

  it('renders with custom loading text', () => {
    render(<Button isLoading loadingText="Processing...">Submit</Button>);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  it('renders with right icon when loading and spinnerPlacement is right', () => {
    render(
      <Button isLoading spinnerPlacement="right">
        Submit
      </Button>
    );
    
    const button = screen.getByRole('button');
    const spinner = button.querySelector('[role="status"]');
    
    expect(button).toContainElement(spinner);
    expect(button.firstChild).toHaveStyle('opacity: 0');
    expect(button.lastChild).toBe(spinner);
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Submit</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders as a link when href is provided', () => {
    render(<Button href="/test">Link</Button>);
    
    const link = screen.getByRole('link', { name: /link/i });
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders with full width when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('width: 100%');
  });
});
