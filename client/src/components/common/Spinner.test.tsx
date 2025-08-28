import React from 'react';
import { render, screen } from '../../test-utils';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveStyle('width: 1.5rem');
    expect(spinner).toHaveStyle('height: 1.5rem');
    expect(spinner).toHaveStyle('border-width: 2px');
    expect(spinner).toHaveStyle('border-top-color: #4361ee');
  });

  it('renders with custom size', () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByRole('status');
    
    expect(spinner).toHaveStyle('width: 1rem');
    expect(spinner).toHaveStyle('height: 1rem');
  });

  it('renders with custom color', () => {
    render(<Spinner color="danger" />);
    const spinner = screen.getByRole('status');
    
    expect(spinner).toHaveStyle('border-top-color: #f44336');
  });

  it('renders with custom thickness', () => {
    render(<Spinner thickness="4px" />);
    const spinner = screen.getByRole('status');
    
    expect(spinner).toHaveStyle('border-width: 4px');
  });

  it('renders with custom speed', () => {
    render(<Spinner speed={1.5} />);
    const spinner = screen.getByRole('status');
    
    expect(spinner).toHaveStyle('animation: spin 1.5s linear infinite');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-spinner" />);
    const spinner = screen.getByRole('status');
    
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('has proper accessibility attributes', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    const hiddenText = screen.getByText('Loading...');
    
    expect(hiddenText).toHaveClass('visually-hidden');
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });
});
