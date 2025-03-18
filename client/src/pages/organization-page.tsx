import { useState, useEffect } from "react";
import { User } from "@shared/schema";
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
import { OrgChart } from "@/components/organization/org-chart";
import { EmployeeCard } from "@/components/organization/employee-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useDepartments, useUsers } from "@/hooks/use-api";

export default function OrganizationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const { data: departments = [], isLoading: isLoadingDepartments } =
    useDepartments();

  const isLoading = isLoadingUsers || isLoadingDepartments;

  // Filter users based on search and department
  const filteredUsers = users
    ? users.filter((user: User) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const matchesSearch =
          fullName.includes(searchQuery.toLowerCase()) ||
          user.position.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment =
          departmentFilter === "all" || user.department === departmentFilter;

        return matchesSearch && matchesDepartment;
      })
    : [];

  useEffect(() => {
    const handleOpenEmployeeProfile = (event: any) => {
      setSelectedEmployee(event.detail.employee);
    };

    document.addEventListener("openEmployeeProfile", handleOpenEmployeeProfile);

    return () => {
      document.removeEventListener(
        "openEmployeeProfile",
        handleOpenEmployeeProfile
      );
    };
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            Organization Structure
          </h1>
          <p className="text-gray-500 text-sm">
            View and navigate your company's organizational structure
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search employees"
            className="pl-10 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
        </div>
      </div>

      {isLoading ? (
        <ContentLoader text="Loading organization data..." />
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Company Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <OrgChart
                departments={departments}
                users={users}
                onUserClick={(user) => setSelectedEmployee(user)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between sm:items-center">
              <CardTitle className="text-lg mb-4 sm:mb-0">
                Department Directory
              </CardTitle>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No employees found matching your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredUsers.map((user: User) => (
                    <div
                      key={user.id}
                      className="p-4 border rounded-lg hover:shadow-md hover:border-primary/40 cursor-pointer transition-all bg-white"
                      onClick={() => setSelectedEmployee(user)}
                    >
                      <div className="flex items-center space-x-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg border border-primary/10">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user.position}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary/70 mr-1"></span>
                            <p className="text-xs text-gray-400">
                              {user.department}
                            </p>
                          </div>
                          {user.managerId &&
                            (() => {
                              // Find manager once
                              const manager = users.find(
                                (u: User) => u.id === user.managerId
                              );
                              return (
                                <div className="text-xs text-gray-400 mt-1 italic">
                                  Reports to:{" "}
                                  <button
                                    className="text-gray-500 hover:text-primary hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (manager) {
                                        setSelectedEmployee(manager);
                                      }
                                    }}
                                  >
                                    {manager?.firstName || ""}{" "}
                                    {manager?.lastName || ""}
                                  </button>
                                </div>
                              );
                            })()}
                          <button
                            className="text-xs font-medium text-primary hover:underline mt-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(user);
                            }}
                          >
                            View Profile →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {currentUser && (
            <EmployeeCard
              employee={selectedEmployee}
              isOpen={!!selectedEmployee}
              onClose={() => setSelectedEmployee(null)}
              allUsers={users}
              currentUser={currentUser}
            />
          )}
        </>
      )}
    </div>
  );
}
