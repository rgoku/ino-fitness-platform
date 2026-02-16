'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ComplianceChartProps {
  data: { week: string; compliance: number }[];
}

export function ComplianceChart({ data }: ComplianceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Compliance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <YAxis
                domain={[60, 100]}
                tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Compliance']}
              />
              <Line
                type="monotone"
                dataKey="compliance"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
