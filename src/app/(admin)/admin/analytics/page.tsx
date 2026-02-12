"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  LineChart,
} from "recharts";

const trafficData = [
  { date: "Mon", views: 1200, reads: 320 },
  { date: "Tue", views: 980, reads: 260 },
  { date: "Wed", views: 1420, reads: 410 },
  { date: "Thu", views: 1670, reads: 520 },
  { date: "Fri", views: 1330, reads: 390 },
  { date: "Sat", views: 890, reads: 210 },
  { date: "Sun", views: 1010, reads: 280 },
];

const topArticles = [
  { title: "Abyssal Station Discovery", views: 1240, reads: 540 },
  { title: "Bioluminescent Mysteries", views: 980, reads: 420 },
  { title: "Cosmic Connection", views: 770, reads: 310 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-glow-primary">Analytics</h1>
          <p className="text-muted-foreground mt-2">Traffic and engagement overview</p>
        </div>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Last 7 days
        </Button>
      </div>

      <ScrollReveal delay={100}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
            <CardDescription>Views and reads over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ left: 8, right: 8 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3CA8C1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3CA8C1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0A2C38", border: "1px solid rgba(255,255,255,0.08)" }} />
                <Legend />
                <Area type="monotone" dataKey="views" name="Views" stroke="#3CA8C1" fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="reads" name="Reads" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorReads)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Articles</CardTitle>
            <CardDescription>Most viewed and read articles</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={topArticles} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="title" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={0} angle={-10} height={60} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0A2C38", border: "1px solid rgba(255,255,255,0.08)" }} />
                <Legend />
                <Line type="monotone" dataKey="views" name="Views" stroke="#3CA8C1" strokeWidth={2} />
                <Line type="monotone" dataKey="reads" name="Reads" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}


