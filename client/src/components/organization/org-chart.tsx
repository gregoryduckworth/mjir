import { useState } from "react";
import { User, Department } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Briefcase, 
  Building2
} from "lucide-react";

interface OrgChartProps {
  departments: Department[];
  users: User[];
  onUserClick: (user: User) => void;
}

interface DepartmentNodeProps {
  department: Department;
  users: User[];
  head?: User;
  onUserClick: (user: User) => void;
}

function DepartmentNode({ department, users, head, onUserClick }: DepartmentNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const departmentUsers = users.filter(user => user.department === department.name);
  
  // Group managers and their direct reports
  const reportingStructure: Record<number, User[]> = {};
  
  // First, identify all managers in this department
  const managers = departmentUsers.filter(user => 
    departmentUsers.some(u => u.managerId === user.id)
  );
  
  // For each manager, gather their direct reports
  managers.forEach(manager => {
    reportingStructure[manager.id] = departmentUsers.filter(
      user => user.managerId === manager.id
    );
  });
  
  // Find users who don't report to anyone in this department
  const unassignedUsers = departmentUsers.filter(user => 
    user.id !== department.headId && 
    !managers.some(m => user.managerId === m.id)
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-md mb-4"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Building2 size={18} className="text-primary" />
          <h3 className="font-medium">{department.name}</h3>
          <Badge variant="outline" className="text-xs bg-primary/5">
            {departmentUsers.length} {departmentUsers.length === 1 ? 'member' : 'members'}
          </Badge>
        </div>
        {department.description && (
          <span className="text-xs text-gray-500 hidden md:inline-block">{department.description}</span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 pt-0 space-y-4">
          {/* Department Head */}
          {head && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Badge variant="default" className="mr-2">Department Head</Badge>
              </h4>
              <div 
                className="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-100 shadow-sm"
                onClick={() => onUserClick(head)}
              >
                <Avatar className="h-12 w-12 mr-4 border-2 border-primary/20">
                  <AvatarImage src={head.profileImage} alt={`${head.firstName} ${head.lastName}`} />
                  <AvatarFallback className="bg-primary/10 text-primary">{head.firstName.charAt(0)}{head.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{head.firstName} {head.lastName}</div>
                  <div className="text-sm text-gray-500">{head.position}</div>
                  <div className="text-xs text-gray-400 mt-1">{head.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Teams/Reporting Structure */}
          {managers.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Badge variant="secondary" className="mr-2">Team Managers</Badge>
                <span className="text-gray-400 text-xs">({managers.length})</span>
              </h4>
              
              {managers.map(manager => (
                <div key={manager.id} className="pl-4 border-l-2 border-primary/30 rounded">
                  <div 
                    className="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-100 shadow-sm mb-2"
                    onClick={() => onUserClick(manager)}
                  >
                    <Avatar className="h-10 w-10 mr-3 border border-primary/20">
                      <AvatarImage src={manager.profileImage} alt={`${manager.firstName} ${manager.lastName}`} />
                      <AvatarFallback className="bg-primary/5 text-primary">{manager.firstName.charAt(0)}{manager.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{manager.firstName} {manager.lastName}</div>
                      <div className="text-sm text-gray-500">{manager.position}</div>
                      {reportingStructure[manager.id]?.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Managing {reportingStructure[manager.id].length} {reportingStructure[manager.id].length === 1 ? 'employee' : 'employees'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {reportingStructure[manager.id]?.length > 0 && (
                    <div className="pl-6 space-y-1 mb-3 border-l border-gray-200">
                      {reportingStructure[manager.id].map(report => (
                        <div 
                          key={report.id}
                          className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => onUserClick(report)}
                        >
                          <Avatar className="h-7 w-7 mr-2">
                            <AvatarImage src={report.profileImage} alt={`${report.firstName} ${report.lastName}`} />
                            <AvatarFallback className="text-xs">{report.firstName.charAt(0)}{report.lastName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm">{report.firstName} {report.lastName}</div>
                            <div className="text-xs text-gray-500">{report.position}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Other Department Members */}
          {unassignedUsers.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Badge variant="outline" className="mr-2">Team Members</Badge>
                <span className="text-gray-400 text-xs">({unassignedUsers.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-md">
                {unassignedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="flex items-center p-2 rounded-md hover:bg-white cursor-pointer border border-gray-100 shadow-sm"
                    onClick={() => onUserClick(user)}
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-gray-100">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-gray-500">{user.position}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function OrgChart({ departments, users, onUserClick }: OrgChartProps) {
  if (!departments.length || !users.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium">No organization data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Organization structure has not been configured yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {departments.map(department => {
        const head = department.headId 
          ? users.find(user => user.id === department.headId) 
          : undefined;
        
        return (
          <DepartmentNode 
            key={department.id}
            department={department} 
            users={users}
            head={head}
            onUserClick={onUserClick}
          />
        );
      })}
    </div>
  );
}
