import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Calendar,
  Clock,
  GraduationCap,
  Users,
  Search,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentLoader } from "@/components/ui/loading";
import { StatsCard } from "@/components/dashboard/stats-card";
import { HolidayTable } from "@/components/dashboard/holiday-table";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { LearningCard } from "@/components/dashboard/learning-card";
import { HolidayForm } from "@/components/holiday/holiday-form";
import {
  useActivities,
  useCoursesCurrent,
  useDashboardStats,
  useHolidaysUpcoming,
  useUsers,
} from "@/hooks/use-api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isHolidayFormOpen, setIsHolidayFormOpen] = useState(false);
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const { data: holidays, isLoading: isLoadingHolidays } =
    useHolidaysUpcoming();
  const { data: activities, isLoading: isLoadingActivities } = useActivities();
  const { data: courses, isLoading: isLoadingCourses } = useCoursesCurrent();

  const isLoading =
    isLoadingStats ||
    isLoadingHolidays ||
    isLoadingActivities ||
    isLoadingCourses ||
    isLoadingUsers;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2"
            />
            <Search className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
          </div>
          <Button onClick={() => setIsHolidayFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ContentLoader text="Loading dashboard data..." />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Holiday Balance"
              value={`${stats?.holidayBalance} days`}
              icon={Calendar}
              bgColor="bg-primary/10"
              textColor="text-primary"
              subText="this month"
              subTextPrefix={`${stats?.accrued} accrued`}
              subTextColor="text-success"
              subTextIconName="arrow-up"
            />

            <StatsCard
              title="Pending Requests"
              value={stats?.pendingRequests}
              icon={Clock}
              bgColor="bg-warning/10"
              textColor="text-warning"
              subText="from your manager"
              subTextPrefix={`${stats?.awaitingApproval} awaiting approval`}
              subTextColor="text-warning"
            />

            <StatsCard
              title="Learning Completion"
              value={`${stats?.learningCompletion}%`}
              icon={GraduationCap}
              bgColor="bg-success/10"
              textColor="text-success"
              subText="since last month"
              subTextPrefix={`${stats?.learningImprovement}%`}
              subTextColor="text-success"
              subTextIconName="arrow-up"
            />

            <StatsCard
              title="Team Availability"
              value={`${stats?.teamAvailability}%`}
              icon={Users}
              bgColor="bg-info/10"
              textColor="text-info"
              subText="due to summer holidays"
              subTextPrefix={`${stats?.availabilityChange}%`}
              subTextColor="text-error"
              subTextIconName="arrow-down"
            />
          </div>

          {/* Upcoming & Recent Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Holidays */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">
                  Upcoming Team Holidays
                </h2>
              </div>
              <div className="p-6">
                <HolidayTable holidays={holidays} users={users} />
                <div className="mt-4 text-center">
                  <Link
                    to="/holiday"
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    View all holiday requests
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {activities.map((activity: any) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    to="/activity"
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    View all activity
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Progress */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Current Learning Progress
              </h2>
              <Link
                to="/learning"
                className="text-primary text-sm font-medium hover:underline"
              >
                View all courses
              </Link>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((item: any) => (
                  <LearningCard
                    key={item.course.id}
                    course={item.course}
                    progress={item.progress}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <HolidayForm
        isOpen={isHolidayFormOpen}
        onClose={() => setIsHolidayFormOpen(false)}
      />
    </div>
  );
}
