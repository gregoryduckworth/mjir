import { Course, UserCourseProgress } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

interface CourseCardProps {
  course: Course;
  progress?: UserCourseProgress;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const percentComplete = progress 
    ? Math.round((progress.completedModules / course.totalModules) * 100)
    : 0;
  
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="h-40 bg-gray-100 relative">
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
              <circle cx="10" cy="10" r="1" />
              <path d="m15 10-3.5 3.5-1.5-1.5" />
            </svg>
          </div>
        )}
        <Badge className="absolute top-2 right-2">{course.category}</Badge>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-lg mb-2">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-1">
          {course.description.length > 100
            ? `${course.description.substring(0, 100)}...`
            : course.description}
        </p>
        
        {progress && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{percentComplete}%</span>
            </div>
            <Progress value={percentComplete} className="h-2" />
            <div className="text-xs text-gray-500">
              {progress.completedModules} of {course.totalModules} modules completed
            </div>
          </div>
        )}
        
        <div className="mt-auto">
          <Link to={`/learning/course/${course.id}`}>
            <Button className="w-full" variant={progress ? "default" : "outline"}>
              {progress ? (progress.isCompleted ? "Review Course" : "Continue") : "Start Course"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
