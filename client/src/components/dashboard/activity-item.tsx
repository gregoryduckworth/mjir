import { 
  FileText, 
  GraduationCap, 
  Check, 
  Calendar
} from "lucide-react";
import { Activity } from "@shared/schema";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getIconAndColor = (type: string) => {
    switch (type) {
      case "course_completion":
        return {
          icon: <GraduationCap size={16} />,
          bgColor: "bg-info/10",
          textColor: "text-info"
        };
      case "holiday_approved":
        return {
          icon: <Check size={16} />,
          bgColor: "bg-success/10",
          textColor: "text-success"
        };
      case "policy_update":
        return {
          icon: <FileText size={16} />,
          bgColor: "bg-warning/10",
          textColor: "text-warning"
        };
      case "holiday_request":
        return {
          icon: <Calendar size={16} />,
          bgColor: "bg-primary/10",
          textColor: "text-primary"
        };
      default:
        return {
          icon: <FileText size={16} />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-500"
        };
    }
  };

  const { icon, bgColor, textColor } = getIconAndColor(activity.type);
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0">
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center",
          bgColor,
          textColor
        )}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: activity.description }} />
        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}
