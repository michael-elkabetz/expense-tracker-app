import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, ExpenseCategory, CATEGORY_LABELS } from '@/types/expense';
import { formatCurrency } from '@/lib/expense-utils';

interface AnalyticsChartProps {
  expenses: Expense[];
  type: 'pie' | 'bar' | 'line';
  title: string;
  description?: string;
}

// Color palette for charts
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

export const AnalyticsChart = ({ expenses, type, title, description }: AnalyticsChartProps) => {
  // Prepare data for different chart types
  const preparePieData = () => {
    const categoryTotals: Record<ExpenseCategory, number> = {
      food: 0,
      transportation: 0,
      utilities: 0,
      entertainment: 0,
      shopping: 0,
      healthcare: 0,
      education: 0,
      housing: 0,
      travel: 0,
      other: 0
    };

    expenses.forEach(expense => {
      categoryTotals[expense.category] += expense.amount;
    });

    return Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category as ExpenseCategory],
        value: amount,
        percentage: expenses.length > 0 ? (amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  };

  const prepareBarData = () => {
    const monthlyData: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM format
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount
      }));
  };

  const prepareLineData = () => {
    const dailyData: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const dayKey = expense.date.toISOString().substring(0, 10); // YYYY-MM-DD format
      dailyData[dayKey] = (dailyData[dayKey] || 0) + expense.amount;
    });

    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, amount]) => ({
        day: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount
      }));
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        const pieData = preparePieData();
        if (pieData.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No data available
            </div>
          );
        }
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        const barData = prepareBarData();
        if (barData.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No data available
            </div>
          );
        }
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        const lineData = prepareLineData();
        if (lineData.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No data available
            </div>
          );
        }
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};