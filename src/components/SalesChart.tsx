import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import React from "react";

type ChartData = { name: string; sales: number }[];

type SalesChartProps = {
  data: ChartData;
  title?: string;
};

export const SalesChart: React.FC<SalesChartProps> = ({ data, title = "Sales Over Time" }) => {
  return (
    <Card className="h-64 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
