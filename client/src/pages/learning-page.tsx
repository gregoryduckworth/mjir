import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentLoader } from "@/components/ui/loading";
import { CourseCard } from "@/components/learning/course-card";
import { ProgressChart } from "@/components/learning/progress-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCourses,
  useCoursesCategories,
  useCoursesProgress,
  useLearningStats,
} from "@/hooks/use-api";

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("in-progress");

  const { data: courses = [], isLoading: isLoadingCourses } = useCourses();
  const { data: progress = [], isLoading: isLoadingProgress } =
    useCoursesProgress();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCoursesCategories();
  const { data: stats, isLoading: isLoadingStats } = useLearningStats();

  const isLoading =
    isLoadingCourses ||
    isLoadingProgress ||
    isLoadingCategories ||
    isLoadingStats;

  // Filter courses based on search and category
  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Organize courses based on progress
  const getUserProgress = (courseId: number) => {
    return progress.find((p: any) => p.courseId === courseId) || null;
  };

  const inProgressCourses = filteredCourses.filter((course: any) => {
    const userProgress = getUserProgress(course.id);
    return userProgress && !userProgress.isCompleted;
  });

  const completedCourses = filteredCourses.filter((course: any) => {
    const userProgress = getUserProgress(course.id);
    return userProgress && userProgress.isCompleted;
  });

  const availableCourses = filteredCourses.filter((course: any) => {
    const userProgress = getUserProgress(course.id);
    return !userProgress;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Learning & Development</h1>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search courses"
            className="pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
        </div>
      </div>

      {isLoading ? (
        <ContentLoader text="Loading learning data..." />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ProgressChart stats={stats} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">
                    Courses Completed
                  </p>
                  <h3 className="text-2xl font-semibold">
                    {stats.completedCourses} / {stats.totalCourses}
                  </h3>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">
                    Average Completion
                  </p>
                  <h3 className="text-2xl font-semibold">
                    {stats.totalCompletionRate}%
                  </h3>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">
                    Most Active Category
                  </p>
                  <h3 className="text-xl font-semibold">
                    {stats.mostActiveCategory}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center">
              <h2 className="text-lg font-semibold mb-4 sm:mb-0">
                Your Learning
              </h2>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs
              defaultValue="in-progress"
              onValueChange={setCurrentTab}
              value={currentTab}
            >
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="in-progress">
                    In Progress ({inProgressCourses.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedCourses.length})
                  </TabsTrigger>
                  <TabsTrigger value="available">
                    Available ({availableCourses.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="in-progress" className="p-6 pt-4">
                {inProgressCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You don't have any courses in progress.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgressCourses.map((course: any) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        progress={getUserProgress(course.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="p-6 pt-4">
                {completedCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't completed any courses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map((course: any) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        progress={getUserProgress(course.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="available" className="p-6 pt-4">
                {availableCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>There are no new courses available right now.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableCourses.map((course: any) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
