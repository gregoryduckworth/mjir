import { Course, UserCourseProgress } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

interface LearningCardProps {
  course: Course;
  progress: UserCourseProgress;
}

export function LearningCard({ course, progress }: LearningCardProps) {
  const percentComplete = Math.round((progress.completedModules / course.totalModules) * 100);
  
  return (
    <Card className="overflow-hidden border border-gray-200">
      <div className="h-36 bg-gray-100">
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
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-gray-800">{course.title}</h3>
        <div className="flex items-center mt-3">
          <Progress value={percentComplete} className="h-2 w-full" />
          <span className="ml-2 text-xs font-medium text-gray-600">{percentComplete}%</span>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {progress.completedModules} of {course.totalModules} modules completed
          </span>
          <Link 
            to={`/learning/course/${course.id}`} 
            className="text-primary text-xs font-medium hover:underline"
          >
            Continue
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
