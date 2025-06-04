import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChartToggleButtons from '../ChartToggleButtons';

describe('ChartToggleButtons', () => {
  it('renders both buttons', () => {
    render(<ChartToggleButtons current="bar" onChange={() => {}} />);
    expect(screen.getByText('Bar Chart')).toBeInTheDocument();
    expect(screen.getByText('Pie Chart')).toBeInTheDocument();
  });

  it('applies active style to the current chart type button', () => {
    const { rerender } = render(<ChartToggleButtons current="bar" onChange={() => {}} />);
    const barBtn = screen.getByText('Bar Chart');
    const pieBtn = screen.getByText('Pie Chart');

    expect(barBtn.className).toContain('slds-button_brand');
    expect(pieBtn.className).not.toContain('slds-button_brand');

    rerender(<ChartToggleButtons current="pie" onChange={() => {}} />);
    expect(pieBtn.className).toContain('slds-button_brand');
    expect(barBtn.className).not.toContain('slds-button_brand');
  });

  it('calls onChange with correct value when buttons are clicked', () => {
    const onChange = vi.fn();
    render(<ChartToggleButtons current="bar" onChange={onChange} />);

    fireEvent.click(screen.getByText('Pie Chart'));
    expect(onChange).toHaveBeenCalledWith('pie');

    fireEvent.click(screen.getByText('Bar Chart'));
    expect(onChange).toHaveBeenCalledWith('bar');
  });
});
