import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Mail, Shield, User, UserCheck } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface EditUserProps {
  user: User;
  roles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Admin", href: "/admin" },
  { title: "Users", href: "/admin/users" },
  { title: "Edit User", href: "#" },
];

export default function EditUser({ user, roles }: EditUserProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/users/${user.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit User - ${user.name}`} />
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
              <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
              <p className="text-muted-foreground">Update user profile and account settings</p>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Update user name and email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Name
                </Label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="w-full rounded-md border p-2"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  className="w-full rounded-md border p-2"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage user role and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <UserCheck className="h-4 w-4" />
                  Role
                </Label>
                <select
                  value={data.role}
                  onChange={(e) => setData("role", e.target.value)}
                  className="w-full rounded-md border p-2 capitalize"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Save Changes</CardTitle>
              <CardDescription>Confirm updates to this user</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="submit" disabled={processing} className="w-full">
                Save User
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}

// Helper Label
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
