'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  centerLabel?: {
    value: string | number;
    label: string;
  };
  height?: number;
}

const COLORS = ['#E8B4C8', '#C8B4E8', '#B4D4E8', '#D4E8B4', '#E8D4B4'];

export function DonutChart({
  data,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
  centerLabel,
  height = 300,
}: DonutChartProps) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white rounded-lg shadow-lg border p-3">
                    <p className="text-sm font-medium">{payload[0].name}</p>
                    <p className="text-lg font-bold text-primary">
                      {payload[0].value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-bold text-foreground">
            {centerLabel.value}
          </div>
          <div className="text-sm text-muted-foreground">{centerLabel.label}</div>
        </div>
      )}
    </div>
  );
}
