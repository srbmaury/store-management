import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import ChartToggleButtons from './ChartToggleButtons';
import ChartContainer from './ChartContainer';

// Define color palette
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

export default function Chart({ title, chartType, setChartType, chartData, names, chartMetric }) {
    return (
        <section className="slds-m-bottom_large">
            <h2 className="slds-text-heading_medium slds-m-bottom_small">{title}</h2>
            {chartType !== 'line' && <ChartToggleButtons
                current={chartType}
                onChange={setChartType}
            />}
            <ChartContainer>
                <ChartContainer>
                    {chartType === 'bar' && (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <XAxis dataKey={names} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey={chartMetric} fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {chartType === 'pie' && (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey={chartMetric}
                                    nameKey={names}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}

                    {chartType === 'line' && (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                                <XAxis dataKey={names} />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey={chartMetric} stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </ChartContainer>
            </ChartContainer>
        </section>
    );
}
