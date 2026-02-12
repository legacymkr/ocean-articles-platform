"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Download,
  Server,
} from "lucide-react";

interface DatabaseStatus {
  languages: number;
  tags: number;
  users: number;
  articles: number;
  translations: number;
}

export function DatabaseSetupDashboard() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/database/setup");
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        setMessage(data.message || "Failed to fetch database status");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to connect to database");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDatabaseAction = async (action: string, includeSampleData = false) => {
    setActionLoading(action);
    setMessage(null);
    
    try {
      const response = await fetch("/api/admin/database/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, includeSampleData }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        setMessageType("success");
        await fetchStatus(); // Refresh status
      } else {
        setMessage(data.message || `Failed to ${action} database`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage(`Failed to ${action} database`);
      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (count: number) => {
    if (count === 0) return "bg-red-100 text-red-800 border-red-200";
    if (count < 5) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const isInitialized = status && Object.values(status).some(count => count > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup & Management
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Message */}
          {message && (
            <div
              className={`p-4 rounded-lg border ${
                messageType === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : messageType === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {messageType === "success" && <CheckCircle className="h-4 w-4" />}
                {messageType === "error" && <AlertTriangle className="h-4 w-4" />}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Database Status */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading database status...</div>
            </div>
          ) : status ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{status.languages}</div>
                <div className="text-sm text-muted-foreground">Languages</div>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${getStatusColor(status.languages)}`}
                >
                  {status.languages === 0 ? "Empty" : "Ready"}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{status.tags}</div>
                <div className="text-sm text-muted-foreground">Tags</div>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${getStatusColor(status.tags)}`}
                >
                  {status.tags === 0 ? "Empty" : "Ready"}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{status.users}</div>
                <div className="text-sm text-muted-foreground">Users</div>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${getStatusColor(status.users)}`}
                >
                  {status.users === 0 ? "Empty" : "Ready"}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{status.articles}</div>
                <div className="text-sm text-muted-foreground">Articles</div>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${getStatusColor(status.articles)}`}
                >
                  {status.articles === 0 ? "Empty" : "Ready"}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{status.translations}</div>
                <div className="text-sm text-muted-foreground">Translations</div>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${getStatusColor(status.translations)}`}
                >
                  {status.translations === 0 ? "None" : "Available"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-destructive">
              <Server className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to connect to database</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {!isInitialized ? (
              <>
                <Button
                  onClick={() => handleDatabaseAction("init")}
                  disabled={!!actionLoading}
                  className="gap-2"
                >
                  {actionLoading === "init" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Initialize Database
                </Button>
                
                <Button
                  onClick={() => handleDatabaseAction("init", true)}
                  disabled={!!actionLoading}
                  variant="outline"
                  className="gap-2"
                >
                  {actionLoading === "init" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Initialize + Sample Data
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleDatabaseAction("seed")}
                  disabled={!!actionLoading}
                  variant="outline"
                  className="gap-2"
                >
                  {actionLoading === "seed" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Add Sample Data
                </Button>
                
                <Button
                  onClick={() => {
                    if (confirm("Are you sure? This will delete ALL data!")) {
                      handleDatabaseAction("reset");
                    }
                  }}
                  disabled={!!actionLoading}
                  variant="destructive"
                  className="gap-2"
                >
                  {actionLoading === "reset" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Reset Database
                </Button>
              </>
            )}
          </div>

          {/* Setup Instructions */}
          {!isInitialized && (
            <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
              <h4 className="font-medium mb-2">Database Setup Instructions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click "Initialize Database" to set up core data (languages, tags, admin user)</li>
                <li>• Choose "Initialize + Sample Data" to include sample articles for testing</li>
                <li>• Make sure your database connection is properly configured</li>
                <li>• The setup process is safe to run multiple times</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
