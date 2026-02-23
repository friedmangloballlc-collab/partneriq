import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Bell, Filter, Archive, Check, Trash2, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NotificationCard from "@/components/notifications/NotificationCard";
import NotificationFilters from "@/components/notifications/NotificationFilters";

export default function NotificationsPage() {
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(["unread"]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 100),
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create") {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } else if (event.type === "update") {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.Notification.update(id, {
        status: "read",
        read_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.Notification.update(id, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(
        (n) => n.status === "unread"
      );
      await Promise.all(
        unreadNotifications.map((n) =>
          base44.entities.Notification.update(n.id, {
            status: "read",
            read_at: new Date().toISOString(),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const filteredNotifications = notifications.filter((n) => {
    const priorityMatch =
      selectedPriorities.length === 0 ||
      selectedPriorities.includes(n.priority);
    const statusMatch =
      selectedStatuses.length === 0 || selectedStatuses.includes(n.status);
    return priorityMatch && statusMatch;
  });

  const unreadCount = notifications.filter(
    (n) => n.status === "unread"
  ).length;
  const crisisCount = notifications.filter(
    (n) => n.priority === "p0_crisis" && n.status === "unread"
  ).length;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 rounded-full bg-indigo-100 animate-pulse mb-4" />
        <p className="text-slate-500">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-indigo-600" /> Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge className="bg-indigo-600 text-white animate-pulse">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Real-time alerts for partnerships, opportunities, and events
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <Check className="w-4 h-4" /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Crisis Alert */}
      {crisisCount > 0 && (
        <Card className="border-red-200 bg-red-50 border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 text-sm">
                {crisisCount} Crisis Alert{crisisCount > 1 ? "s" : ""} Requires Immediate Action
              </p>
              <p className="text-xs text-red-700 mt-1">
                Priority P0 incidents need urgent attention
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="w-full gap-1.5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" /> Filters
            </Button>

            {showFilters && (
              <Card className="border-slate-200/60 p-4">
                <NotificationFilters
                  selectedPriorities={selectedPriorities}
                  selectedStatuses={selectedStatuses}
                  onPriorityChange={(priority) => {
                    setSelectedPriorities((prev) =>
                      prev.includes(priority)
                        ? prev.filter((p) => p !== priority)
                        : [...prev, priority]
                    );
                  }}
                  onStatusChange={(status) => {
                    setSelectedStatuses((prev) =>
                      prev.includes(status)
                        ? prev.filter((s) => s !== status)
                        : [...prev, status]
                    );
                  }}
                  onClearAll={() => {
                    setSelectedPriorities([]);
                    setSelectedStatuses(["unread"]);
                  }}
                />
              </Card>
            )}

            {/* Stats */}
            <Card className="border-slate-200/60">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {notifications.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Unread
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {unreadCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Crises
                  </p>
                  <p className={`text-2xl font-bold ${
                    crisisCount > 0 ? "text-red-600" : "text-slate-400"
                  }`}>
                    {crisisCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="border-slate-200/60">
              <CardContent className="p-12 text-center">
                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No notifications</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedPriorities.length > 0 || selectedStatuses.length > 0
                    ? "Try adjusting your filters"
                    : "New alerts will appear here in real-time"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={markReadMutation.mutate}
                onArchive={archiveMutation.mutate}
                onNavigate={(url) => navigate(url)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}