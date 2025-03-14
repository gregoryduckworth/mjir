import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BadgeCheck, Clock } from "lucide-react";

interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalCompletionRate: number;
  completedByCategory: Record<string, { completed: number; total: number }>;
}

interface ProgressChartProps {
  stats: LearningStats;
}

export function ProgressChart({ stats }: ProgressChartProps) {
  const categories = Object.keys(stats.completedByCategory).sort();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Learning Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <BadgeCheck size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-semibold">{stats.completedCourses} courses</p>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-xl font-semibold">{stats.inProgressCourses} courses</p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-xl font-semibold">{stats.totalCompletionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-2">Progress by Category</h3>
          
          {categories.map(category => {
            const { completed, total } = stats.completedByCategory[category];
            const percentage = Math.round((completed / total) * 100);
            
            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{category}</span>
                  <span className="text-gray-500">{completed}/{total}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
