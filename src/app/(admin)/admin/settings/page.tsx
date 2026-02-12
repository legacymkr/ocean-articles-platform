"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Save, Globe, Mail, Shield, Palette, Bell } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Galatide",
    siteDescription: "Exploring the mysteries of the deep ocean",
    siteUrl: "https://galatide.com",
    adminEmail: "admin@galatide.com",

    // Appearance Settings
    primaryColor: "#3CA8C1",
    secondaryColor: "#1F5C73",
    accentColor: "#00E5FF",

    // Email Settings
    emailProvider: "resend",
    emailFrom: "noreply@galatide.com",
    emailReplyTo: "contact@galatide.com",

    // Database Settings
    databaseUrl: "postgresql://...",
    backupFrequency: "daily",

    // Security Settings
    sessionTimeout: "24",
    requireTwoFactor: false,
    allowRegistration: false,

    // Notification Settings
    emailNotifications: true,
    articlePublished: true,
    newComment: true,
    systemAlerts: true,
  });

  const handleSettingChange = (key: string, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    // In a real app, you'd save to the database
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-glow-primary">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your Galatide admin dashboard and website settings
        </p>
      </div>

      {/* General Settings */}
      <ScrollReveal delay={100}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic website information and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange("siteName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => handleSettingChange("siteUrl", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange("adminEmail", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Appearance Settings */}
      <ScrollReveal delay={200}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the visual appearance of your website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    value={settings.primaryColor}
                    onChange={(e) => handleSettingChange("primaryColor", e.target.value)}
                    className="flex-1"
                  />
                  <div
                    className="w-10 h-10 rounded border border-border"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={(e) => handleSettingChange("secondaryColor", e.target.value)}
                    className="flex-1"
                  />
                  <div
                    className="w-10 h-10 rounded border border-border"
                    style={{ backgroundColor: settings.secondaryColor }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    value={settings.accentColor}
                    onChange={(e) => handleSettingChange("accentColor", e.target.value)}
                    className="flex-1"
                  />
                  <div
                    className="w-10 h-10 rounded border border-border"
                    style={{ backgroundColor: settings.accentColor }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Email Settings */}
      <ScrollReveal delay={300}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure email settings for notifications and communications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Input
                  id="emailProvider"
                  value={settings.emailProvider}
                  onChange={(e) => handleSettingChange("emailProvider", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailFrom">From Email</Label>
                <Input
                  id="emailFrom"
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => handleSettingChange("emailFrom", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailReplyTo">Reply-To Email</Label>
              <Input
                id="emailReplyTo"
                type="email"
                value={settings.emailReplyTo}
                onChange={(e) => handleSettingChange("emailReplyTo", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Security Settings */}
      <ScrollReveal delay={400}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Configure security settings and access controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireTwoFactor"
                    checked={settings.requireTwoFactor}
                    onChange={(e) => handleSettingChange("requireTwoFactor", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="requireTwoFactor" className="text-sm">
                    Enable 2FA for admin accounts
                  </Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowRegistration">Allow User Registration</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowRegistration"
                  checked={settings.allowRegistration}
                  onChange={(e) => handleSettingChange("allowRegistration", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="allowRegistration" className="text-sm">
                  Allow new users to register accounts
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Notification Settings */}
      <ScrollReveal delay={500}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="articlePublished">Article Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when articles are published
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="articlePublished"
                  checked={settings.articlePublished}
                  onChange={(e) => handleSettingChange("articlePublished", e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newComment">New Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when new comments are posted
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="newComment"
                  checked={settings.newComment}
                  onChange={(e) => handleSettingChange("newComment", e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemAlerts">System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive system maintenance and security alerts
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="systemAlerts"
                  checked={settings.systemAlerts}
                  onChange={(e) => handleSettingChange("systemAlerts", e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Save Button */}
      <ScrollReveal delay={600}>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="ripple-effect">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </ScrollReveal>
    </div>
  );
}
