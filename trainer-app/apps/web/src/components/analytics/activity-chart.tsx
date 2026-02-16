'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ActivityChartProps {
  data: { week: string; sets: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Weekly Sets Logged</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [value, 'Sets']}
              />
              <defs>
                <linearGradient id="setGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="sets"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#setGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
