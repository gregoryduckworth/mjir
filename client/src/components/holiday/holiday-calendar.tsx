import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HolidayRequest } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HolidayCalendarProps {
  holidays: HolidayRequest[];
  usernames: Record<number, string>;
}

export function HolidayCalendar({ holidays, usernames }: HolidayCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const previousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const isHolidayDay = (day: Date) => {
    return holidays.filter(holiday => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);
      return day >= start && day <= end;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Team Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdays.map((day) => (
            <div key={day} className="py-2 text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          {daysInMonth.map((day, i) => {
            const dayHolidays = isHolidayDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "aspect-square flex flex-col items-center justify-start p-1 relative rounded-md text-sm",
                        isWeekend(day) && "bg-gray-50",
                        isToday && "border border-primary",
                        dayHolidays.length > 0 && "bg-primary/5"
                      )}
                    >
                      <span className={cn(
                        "text-xs",
                        isToday && "font-bold text-primary"
                      )}>
                        {format(day, "d")}
                      </span>
                      
                      {dayHolidays.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 justify-center">
                          {dayHolidays.slice(0, 3).map((holiday, idx) => (
                            <div 
                              key={idx} 
                              className="w-2 h-2 rounded-full bg-primary" 
                              title={usernames[holiday.userId]}
                            />
                          ))}
                          {dayHolidays.length > 3 && (
                            <div className="w-2 h-2 rounded-full bg-gray-300" title="More holidays" />
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {dayHolidays.length > 0 && (
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-bold mb-1">{format(day, "EEEE, MMMM do")}</div>
                        <ul>
                          {dayHolidays.map((holiday, idx) => (
                            <li key={idx}>
                              {usernames[holiday.userId]} - {holiday.status}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
