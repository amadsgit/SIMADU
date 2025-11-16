"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart2 } from "lucide-react";

interface Props {
  barData: { name: string; value: number }[];
  z: { bbu: number; tbu: number; bbtb: number };
}

export default function BarZScoreChart({ barData, z }: Props) {
  return (
    <div className="col-span-1 lg:col-span-2 bg-white p-4 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-sky-600" />
          <h4 className="font-semibold">Rata-rata Z-score (BB/U, TB/U, BB/TB)</h4>
        </div>
        <div className="text-xs text-gray-500">
          Rata-rata dihitung dari data status gizi terakhir
        </div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Rata-rata Z" fill="#8CE4FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <div>BB/U: {z.bbu.toFixed(3)}</div>
        <div>TB/U: {z.tbu.toFixed(3)}</div>
        <div>BB/TB: {z.bbtb.toFixed(3)}</div>
      </div>
    </div>
  );
}
