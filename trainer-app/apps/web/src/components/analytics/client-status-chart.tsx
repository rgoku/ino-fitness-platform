'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ClientStatusChartProps {
  data: { name: string; value: number; color: string }[];
}

export function ClientStatusChart({ data }: ClientStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Client Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
