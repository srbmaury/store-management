import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChartContainer from '../ChartContainer';

describe('ChartContainer', () => {
  it('renders children correctly', () => {
    render(
      <ChartContainer>
        <div data-testid="child">Hello</div>
      </ChartContainer>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('applies correct styles', () => {
    const { container } = render(<ChartContainer>Content</ChartContainer>);
    const div = container.firstChild;

    expect(div).toHaveStyle({
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '1rem',
      backgroundColor: '#fff',
      boxShadow: '0 0 5px rgba(0,0,0,0.05)',
    });
  });
});
