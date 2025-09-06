import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, Building2, Calendar, CalendarDays, CheckCircle, Clock, Edit, Eye, FileText, Plus, Star, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    // Intial Mock Data
    const stats = {
        totalInterviews: 24,
        completedInterviews: 18,
        pendingInterviews: 6,
        successRate: 75,
    };

    const upcomingInterviews = [
        {
            id: 1,
            candidate: 'John Smith',
            position: 'Senior Developer',
            company: 'Tech Corp',
            date: '2024-01-15',
            time: '10:00 AM',
            status: 'scheduled',
            type: 'Technical',
        },
        {
            id: 2,
            candidate: 'Sarah Johnson',
            position: 'Product Manager',
            company: 'StartupXYZ',
            date: '2024-01-16',
            time: '2:00 PM',
            status: 'scheduled',
            type: 'Behavioral',
        },
        {
            id: 3,
            candidate: 'Mike Chen',
            position: 'UX Designer',
            company: 'Design Studio',
            date: '2024-01-17',
            time: '11:30 AM',
            status: 'pending',
            type: 'Portfolio Review',
        },
    ];

    const recentActivity = [
        {
            id: 1,
            action: 'Interview completed',
            candidate: 'Alice Brown',
            position: 'Frontend Developer',
            time: '2 hours ago',
            status: 'completed',
        },
        {
            id: 2,
            action: 'Interview scheduled',
            candidate: 'Bob Wilson',
            position: 'Backend Developer',
            time: '4 hours ago',
            status: 'scheduled',
        },
        {
            id: 3,
            action: 'Interview cancelled',
            candidate: 'Carol Davis',
            position: 'DevOps Engineer',
            time: '1 day ago',
            status: 'cancelled',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled':
                return (
                    <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Scheduled
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Pending
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Completed
                    </Badge>
                );
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Interview Platform Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Interview Dashboard</h1>
                        <p className="text-muted-foreground">Manage and track your interview activities</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Schedule Interview
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                            <p className="text-xs text-muted-foreground">+2 from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completedInterviews}</div>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((stats.completedInterviews / stats.totalInterviews) * 100)}% completion rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingInterviews}</div>
                            <p className="text-xs text-muted-foreground">Awaiting scheduling</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.successRate}%</div>
                            <p className="text-xs text-muted-foreground">+5% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Upcoming Interviews */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Upcoming Interviews
                            </CardTitle>
                            <CardDescription>Your scheduled interviews for the next few days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingInterviews.map((interview) => (
                                    <div key={interview.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">{interview.candidate}</h4>
                                                {getStatusBadge(interview.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{interview.position}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {interview.company}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    {interview.date} at {interview.time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {interview.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>Latest interview updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {activity.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                            {activity.status === 'scheduled' && <Calendar className="h-4 w-4 text-blue-600" />}
                                            {activity.status === 'cancelled' && <AlertCircle className="h-4 w-4 text-red-600" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">{activity.action}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {activity.candidate} - {activity.position}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-20 flex-col gap-2">
                                <Plus className="h-6 w-6" />
                                Schedule New Interview
                            </Button>
                            <Button variant="outline" className="h-20 flex-col gap-2">
                                <Users className="h-6 w-6" />
                                Manage Candidates
                            </Button>
                            <Button variant="outline" className="h-20 flex-col gap-2">
                                <FileText className="h-6 w-6" />
                                View Reports
                            </Button>
                            <Button variant="outline" className="h-20 flex-col gap-2">
                                <Star className="h-6 w-6" />
                                Rate Interviews
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
