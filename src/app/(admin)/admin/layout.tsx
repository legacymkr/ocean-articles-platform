import { NavbarProvider } from "@/components/navbar-provider";
import { ConditionalBackground } from "@/components/conditional-background";
import { ArticlesProvider } from "@/contexts/articles-context";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Authentication is handled by middleware, so we don't need to check here

  return (
    <div className="min-h-screen bg-background">
      <ConditionalBackground />
      <NavbarProvider>
        <ArticlesProvider>
          <div className="relative z-10">
            {/* Admin Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-20 bg-card/90 backdrop-blur-md border-b border-border/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Admin Logo */}
                  <div className="flex items-center space-x-4">
                    <h1 className="font-heading text-xl text-glow-primary">🌊 Galatide Admin</h1>
                  </div>

                  {/* Admin Navigation Links */}
                  <div className="flex items-center space-x-6">
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Overview
                    </Link>
                    <Link
                      href="/admin/articles"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Articles
                    </Link>
                    <Link
                      href="/admin/media"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Media
                    </Link>
                    <Link
                      href="/admin/tags"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Tags
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/admin/translations"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Translations
                    </Link>
                    <Link
                      href="/admin/sitemap"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sitemap
                    </Link>
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">Admin User</span>
                    <Link
                      href="/"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View Site
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="pt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
            </main>
          </div>
        </ArticlesProvider>
      </NavbarProvider>
    </div>
  );
}
