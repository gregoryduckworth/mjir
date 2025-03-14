import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HolidayRequest, User } from "@shared/schema";
import { format } from "date-fns";

interface HolidayTableProps {
  holidays: HolidayRequest[];
  users: User[];
}

export function HolidayTable({ holidays, users }: HolidayTableProps) {
  const getUser = (userId: number) => {
    return users.find((user) => user.id === userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-warning/10 text-warning";
      case "rejected":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Period
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {holidays.map((holiday) => {
            const user = getUser(holiday.userId);
            if (!user) return null;

            return (
              <TableRow key={holiday.id} className="hover:bg-gray-50">
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.department}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                  {format(new Date(holiday.startDate), "MMM d, yyyy")} - {format(new Date(holiday.endDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                  {holiday.duration} {holiday.duration === 1 ? "day" : "days"}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Badge variant="outline" className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(holiday.status)}`}>
                    {holiday.status.charAt(0).toUpperCase() + holiday.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
