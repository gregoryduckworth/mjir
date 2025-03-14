import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  subText?: string;
  subTextPrefix?: string;
  subTextColor?: string;
  subTextIconName?: "arrow-up" | "arrow-down";
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor,
  subText,
  subTextPrefix,
  subTextColor = "text-gray-500",
  subTextIconName,
}: StatsCardProps) {
  const iconClass = cn(
    "w-10 h-10 rounded-lg flex items-center justify-center",
    bgColor,
    textColor
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-semibold">{value}</h3>
        </div>
        <div className={iconClass}>
          <Icon size={20} />
        </div>
      </div>
      {subText && (
        <div className="mt-4 text-xs text-gray-500">
          {subTextPrefix && (
            <span className={subTextColor}>
              {subTextIconName === "arrow-up" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline-block w-3 h-3 mr-1"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              )}
              {subTextIconName === "arrow-down" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline-block w-3 h-3 mr-1"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
              {subTextPrefix}
            </span>
          )}{" "}
          {subText}
        </div>
      )}
    </div>
  );
}
