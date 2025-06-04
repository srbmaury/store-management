import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Chart from '../Chart';

// Mock ResizeObserver globally
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

describe('Chart', () => {
    it('renders without crashing for bar chart', () => {
        render(
            <Chart
                title="Test Chart"
                chartType="bar"
                setChartType={() => { }}
                chartData={[{ name: 'Item 1', value: 10 }]}
                names="name"
                chartMetric="value"
            />
        );
    });

    it('renders without crashing for line chart', () => {
        render(
            <Chart
                title="Test Chart"
                chartType="line"
                setChartType={() => { }}
                chartData={[{ name: 'Item 1', value: 10 }]}
                names="name"
                chartMetric="value"
            />
        );
    });

    it('renders without crashing for pie chart', () => {
        render(
            <Chart
                title="Test Chart"
                chartType="pie"
                setChartType={() => { }}
                chartData={[{ name: 'Item 1', value: 10 }]}
                names="name"
                chartMetric="value"
            />
        );
    });
});
