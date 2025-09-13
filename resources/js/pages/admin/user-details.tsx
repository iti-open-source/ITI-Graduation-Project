import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Settings,
  Shield,
  Trash2,
  User,
  UserCheck,
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
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "User Details",
    href: "#",
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

interface UserDetailProps {
  user: User;
}
interface Props {
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function UserDetail({ user, flash }: UserDetailProps & Props) {
  useEffect(() => {
        if (flash?.success) {
          toast.success(flash.success);
        }
        if (flash?.error) {
          toast.error(flash.error);
        }
      }, [flash]);
  const getStatusBadge = () => {
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteUser = () => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      router.delete(`/admin/users/${user.id}`);
    }
  };

  const handleToggleStatus = () => {
    router.patch(`/admin/users/${user.id}/toggle-status`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`User Details - ${user.name}`} />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground">User profile and account details</p>
            </div>
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Basic Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>User account details and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* User Avatar and Name */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl font-bold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <div className="mt-1 flex items-center gap-2">{getStatusBadge()}</div>
                  </div>
                </div>

                {/* User Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Shield className="h-4 w-4" />
                      User ID
                    </Label>
                    <p className="text-sm text-muted-foreground">#{user.id}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Last Updated
                    </Label>
                    <p className="text-sm text-muted-foreground">{formatDate(user.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Account Status
              </CardTitle>
              <CardDescription>Current account state</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
  <span className="text-sm font-medium">Role</span>
  <Badge variant="outline" className="capitalize">
    {user.role ? user.role : "Unassigned"}
  </Badge>
</div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Verified</span>
                  {user.email_verified_at ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Yes
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    >
                      No
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Registration Date</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>User's recent platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Account created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(user.created_at)}</p>
                  </div>
                </div>

                {user.email_verified_at && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Email verified</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(user.email_verified_at)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Last profile update</p>
                    <p className="text-xs text-muted-foreground">{formatDate(user.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
        <Label className="text-sm font-medium">Change Role</Label>
        <select
  defaultValue={user.role ?? "null"}
  onChange={(e) =>
    router.patch(`/admin/users/${user.id}`, {
      role: e.target.value === "null" ? null : e.target.value,
    })
  }
  className="w-full rounded-md border p-2 capitalize"
>
  <option value="null">Unassigned</option>
  <option value="admin">Admin</option>
  <option value="student">Student</option>
  <option value="instructor">Instructor</option>
</select>

      </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleToggleStatus}
                >
                  {user.email_verified_at ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Unverify Account
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Verify Account
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleDeleteUser}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

// Helper component for Label
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
