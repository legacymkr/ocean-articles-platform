import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  BookOpen,
  Image,
  Tag,
  Settings,
  Globe,
  TrendingUp,
  FileText,
  Plus,
  Eye,
  Map,
  Languages,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

// Mock data for dashboard stats
const dashboardStats = [
  {
    title: "Total Articles",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
    icon: BookOpen,
    description: "Published articles",
  },
  {
    title: "Media Assets",
    value: "156",
    change: "+8%",
    changeType: "positive" as const,
    icon: Image,
    description: "Images and videos",
  },
  {
    title: "Tags",
    value: "12",
    change: "+2",
    changeType: "positive" as const,
    icon: Tag,
    description: "Content categories",
  },
  {
    title: "Translations",
    value: "48",
    change: "+15%",
    changeType: "positive" as const,
    icon: Globe,
    description: "Multi-language content",
  },
];

const recentArticles = [
  {
    id: "1",
    title: "The Abyssal Station Discovery",
    status: "published",
    publishedAt: "2024-01-15",
    views: 1240,
    language: "en",
  },
  {
    id: "2",
    title: "Bioluminescent Mysteries of the Deep",
    status: "published",
    publishedAt: "2024-01-10",
    views: 892,
    language: "en",
  },
  {
    id: "3",
    title: "The Cosmic Connection: Space and Ocean",
    status: "draft",
    publishedAt: null,
    views: 0,
    language: "en",
  },
];

const quickActions = [
  {
    title: "Create Article",
    description: "Write a new article",
    icon: Plus,
    href: "/admin/articles/new",
    color: "bg-primary",
  },
  {
    title: "Generate Sitemap",
    description: "Create XML sitemaps",
    icon: Map,
    href: "/admin/sitemap",
    color: "bg-green-500",
  },
  {
    title: "Media Library",
    description: "Browse and manage media",
    icon: Image,
    href: "/admin/media",
    color: "bg-blue-500",
  },
  {
    title: "Translations",
    description: "Manage multilingual content",
    icon: Languages,
    href: "/admin/translations",
    color: "bg-purple-500",
  },
  {
    title: "Analytics",
    description: "View site statistics",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "bg-orange-500",
  },
  {
    title: "Upload Media",
    description: "Add images and videos",
    icon: Plus,
    href: "/admin/media/upload",
    color: "bg-secondary",
  },
  {
    title: "Manage Tags",
    description: "Organize content categories",
    icon: Tag,
    href: "/admin/tags",
    color: "bg-accent",
  },
  {
    title: "View Site",
    description: "Preview the website",
    icon: Eye,
    href: "/",
    color: "bg-muted",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-glow-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the Galatide admin dashboard. Manage your ocean exploration content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <ScrollReveal key={stat.title} delay={index * 100}>
            <Card className="glass-card hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-glow-primary">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <div className="flex items-center mt-2">
                  <Badge
                    variant={stat.changeType === "positive" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <ScrollReveal delay={400}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Articles
              </CardTitle>
              <CardDescription>Latest published and draft articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{article.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={article.status === "published" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {article.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.publishedAt || "Draft"}
                        </span>
                        <span className="text-xs text-muted-foreground">{article.views} views</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/admin/articles">
                  <Button variant="outline" className="w-full">
                    View All Articles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Quick Actions */}
        <ScrollReveal delay={500}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.title} href={action.href}>
                    <div className="p-4 rounded-lg border border-border/30 hover:border-primary/50 transition-colors cursor-pointer group">
                      <div
                        className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                      >
                        <action.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      {/* System Status */}
      <ScrollReveal delay={600}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">1.2s</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">2.1GB</div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
