import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentLoader } from "@/components/ui/loading";
import { HolidayForm } from "@/components/holiday/holiday-form";
import { HolidayCalendar } from "@/components/holiday/holiday-calendar";
import { HolidayApproval } from "@/components/holiday/holiday-approval";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HolidayTable } from "@/components/dashboard/holiday-table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HolidayPage() {
  const { user } = useAuth();
  const [isHolidayFormOpen, setIsHolidayFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: holidayBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["/api/holiday-requests/balance"],
  });
  
  const { data: allHolidays, isLoading: isLoadingHolidays } = useQuery({
    queryKey: ["/api/holiday-requests"],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  const isLoading = isLoadingBalance || isLoadingHolidays || isLoadingUsers;

  // Filter holidays based on selected status
  const filteredHolidays = allHolidays?.filter((holiday: any) => {
    if (statusFilter === "all") return true;
    return holiday.status === statusFilter;
  });

  // Create a map of usernames for the calendar component
  const usernameMap = users?.reduce((acc: Record<number, string>, user: any) => {
    acc[user.id] = `${user.firstName} ${user.lastName}`;
    return acc;
  }, {}) || {};

  // Check if the user is a manager (admin, hr_manager, or manager role)
  const isManager = user?.role === 'admin' || user?.role === 'hr_manager' || user?.role === 'manager';
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Holiday Management</h1>
        <Button onClick={() => setIsHolidayFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>
      
      {isLoading ? (
        <ContentLoader text="Loading holiday data..." />
      ) : (
        <>
          {isManager ? (
            <Tabs defaultValue="employee" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">Employee View</TabsTrigger>
                <TabsTrigger value="manager">Manager View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="employee">
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Holiday Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Annual Allowance</p>
                        <h3 className="text-2xl font-semibold">{holidayBalance?.allowance} days</h3>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Used</p>
                        <h3 className="text-2xl font-semibold">{holidayBalance?.used} days</h3>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Remaining</p>
                        <h3 className="text-2xl font-semibold text-primary">{holidayBalance?.remaining} days</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <HolidayCalendar 
                      holidays={allHolidays} 
                      usernames={usernameMap}
                    />
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Upcoming Holidays</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {allHolidays
                          .filter((h: any) => new Date(h.startDate) > new Date())
                          .slice(0, 5)
                          .map((holiday: any) => {
                            const user = users.find((u: any) => u.id === holiday.userId);
                            if (!user) return null;
                            
                            return (
                              <div key={holiday.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                  <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-gray-500 block">
                                    {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
                                  </span>
                                  <Badge variant="outline" className={`text-xs mt-1 ${
                                    holiday.status === 'approved' ? 'bg-success/10 text-success' : 
                                    holiday.status === 'pending' ? 'bg-warning/10 text-warning' : 
                                    'bg-destructive/10 text-destructive'
                                  }`}>
                                    {holiday.status.charAt(0).toUpperCase() + holiday.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between sm:items-center">
                    <CardTitle className="text-lg mb-4 sm:mb-0">Your Requests</CardTitle>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search requests"
                          className="pl-10 pr-4 py-2 h-9"
                        />
                        <Search className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue placeholder="All Requests" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Requests</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <HolidayTable 
                      holidays={filteredHolidays.filter((h: any) => h.userId === user?.id)}
                      users={users} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="manager">
                <HolidayApproval />
              </TabsContent>
            </Tabs>
          ) : (
            // Regular employee view
            <>
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Holiday Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Annual Allowance</p>
                      <h3 className="text-2xl font-semibold">{holidayBalance?.allowance} days</h3>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Used</p>
                      <h3 className="text-2xl font-semibold">{holidayBalance?.used} days</h3>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Remaining</p>
                      <h3 className="text-2xl font-semibold text-primary">{holidayBalance?.remaining} days</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <HolidayCalendar 
                    holidays={allHolidays} 
                    usernames={usernameMap}
                  />
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Upcoming Holidays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allHolidays
                        .filter((h: any) => new Date(h.startDate) > new Date())
                        .slice(0, 5)
                        .map((holiday: any) => {
                          const user = users.find((u: any) => u.id === holiday.userId);
                          if (!user) return null;
                          
                          return (
                            <div key={holiday.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500 block">
                                  {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
                                </span>
                                <Badge variant="outline" className={`text-xs mt-1 ${
                                  holiday.status === 'approved' ? 'bg-success/10 text-success' : 
                                  holiday.status === 'pending' ? 'bg-warning/10 text-warning' : 
                                  'bg-destructive/10 text-destructive'
                                }`}>
                                  {holiday.status.charAt(0).toUpperCase() + holiday.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between sm:items-center">
                  <CardTitle className="text-lg mb-4 sm:mb-0">Your Requests</CardTitle>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search requests"
                        className="pl-10 pr-4 py-2 h-9"
                      />
                      <Search className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="All Requests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <HolidayTable 
                    holidays={filteredHolidays.filter((h: any) => h.userId === user?.id)}
                    users={users} 
                  />
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      <HolidayForm isOpen={isHolidayFormOpen} onClose={() => setIsHolidayFormOpen(false)} />
    </div>
  );
}
