import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router } from "@inertiajs/react";

import {
  Activity,
  Calendar,
  // Edit,
  Eye,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Admin",
    href: "/admin",
  },
  {
    title: "Dashboard",
    href: "/admin",
  },
];

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: string;
}

interface AdminDashboardProps {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    // User statistics
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    recentUsers: number;
    userGrowthRate: number;

    // Role statistics
    adminUsers: number;
    instructorUsers: number;
    studentUsers: number;
    unassignedUsers: number;

    // Room statistics
    totalRooms: number;
    activeRooms: number;
    roomsThisWeek: number;

    // Session statistics
    totalSessions: number;
    completedSessions: number;
    activeSessions: number;
    sessionsThisWeek: number;
    sessionGrowthRate: number;

    // AI Chat statistics
    totalAIMessages: number;
    aiMessagesThisWeek: number;

    // Verification rate
    verificationRate: number;
  };
}

interface Props {
  flash?: {
    success?: string;
    error?: string;
  };
}
export default function AdminDashboard({ users, stats, flash }: AdminDashboardProps & Props) {
  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  const recentUsers = users.data.slice(0, 5);

  const getStatusBadge = (user: User) => {
    if (user.email_verified_at) {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        >
          <UserCheck className="mr-1 h-3 w-3" />
          Verified
        </Badge>
      );
    }

    return (
      <Badge
        variant="secondary"
        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      >
        <UserX className="mr-1 h-3 w-3" />
        Unverified
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and system settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                View All Users
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recentUsers} new this week
                {stats.userGrowthRate !== 0 && (
                  <span
                    className={`ml-1 ${stats.userGrowthRate > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ({stats.userGrowthRate > 0 ? "+" : ""}
                    {stats.userGrowthRate}%)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.verificationRate}% verification rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRooms}</div>
              <p className="text-xs text-muted-foreground">{stats.totalRooms} total rooms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.sessionsThisWeek} this week
                {stats.sessionGrowthRate !== 0 && (
                  <span
                    className={`ml-1 ${stats.sessionGrowthRate > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ({stats.sessionGrowthRate > 0 ? "+" : ""}
                    {stats.sessionGrowthRate}%)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers}</div>
              <p className="text-xs text-muted-foreground">System administrators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instructors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.instructorUsers}</div>
              <p className="text-xs text-muted-foreground">Interview instructors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studentUsers}</div>
              <p className="text-xs text-muted-foreground">Interview candidates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unassignedUsers}</div>
              <p className="text-xs text-muted-foreground">Pending role assignment</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        {/* Recent Users */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest user registrations and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{user.name}</h4>
                      {getStatusBadge(user)}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(user.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users/${user.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {/* <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button> */}

                    {/* Role dropdown */}
                    <select
                      defaultValue={user.role ?? "null"}
                      onChange={(e) =>
                        router.patch(`/admin/users/${user.id}`, {
                          role: e.target.value,
                        })
                      }
                      className="w-full rounded-md border p-2 capitalize"
                    >
                      <option value="null" className="text-gray-800">
                        Unassigned
                      </option>
                      <option value="admin" className="text-gray-800">
                        Admin
                      </option>
                      <option value="student" className="text-gray-800">
                        Student
                      </option>
                      <option value="instructor" className="text-gray-800">
                        Instructor
                      </option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/users">View All Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card> */}

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Platform activity and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-2xl font-bold">{stats.activeSessions}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">New Rooms</p>
                  <p className="text-2xl font-bold">{stats.roomsThisWeek}</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Messages</p>
                  <p className="text-2xl font-bold">{stats.totalAIMessages}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.aiMessagesThisWeek} this week
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                  <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Session Completion</p>
                  <p className="text-2xl font-bold">
                    {stats.totalSessions > 0
                      ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedSessions} of {stats.totalSessions}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
