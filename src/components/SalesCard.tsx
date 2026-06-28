import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";

type SalesCardProps = {
  title: string;
  value: string | number;
};

export const SalesCard: React.FC<SalesCardProps> = ({ title, value }) => {
  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-700 text-white shadow-lg hover:scale-105 transition-transform duration-200">
      <CardHeader>
        <CardTitle className="text-sm opacity-80">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-bold">{value}</CardContent>
    </Card>
  );
};
