"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface Props {
  pieData: { name: string; value: number }[];
  total: number;
}

const COLORS = ["#FF9F43", "#10B981", "#F59E0B", "#EF4444"];

export default function PieGiziChart({ pieData, total }: Props) {
  return (
    <div className="col-span-1 max-w-lg bg-white p-4 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-rose-500" />
          <h3 className="font-semibold">Distribusi Kategori Gizi</h3>
        </div>
        <div className="text-xs text-gray-500">Total: {total}</div>
      </div>

      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              label={(entry) =>
                entry.value > 0 ? `${entry.name} (${entry.value})` : ""
              }
            >
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        {pieData.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                style={{ background: COLORS[i] }}
                className="w-3 h-3 rounded-full inline-block"
              />
              {p.name}
            </div>
            <div className="font-medium">{p.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
