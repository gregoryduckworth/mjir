import { User } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle } from "lucide-react";

interface EmployeeCardProps {
  employee: User | null;
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
}

export function EmployeeCard({ employee, isOpen, onClose, allUsers }: EmployeeCardProps) {
  if (!employee) return null;

  const manager = employee.managerId 
    ? allUsers.find(user => user.id === employee.managerId)
    : null;

  const directReports = allUsers.filter(user => user.managerId === employee.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Profile</DialogTitle>
          <DialogDescription>
            Employee details and contact information
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage src={employee.profileImage} alt={`${employee.firstName} ${employee.lastName}`} />
              <AvatarFallback className="text-lg">{employee.firstName.charAt(0)}{employee.lastName.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{employee.firstName} {employee.lastName}</h2>
            <p className="text-gray-500">{employee.position}</p>
            <Badge variant="outline" className="mt-2">{employee.department}</Badge>
          </div>
          
          <div className="space-y-4">
            {manager && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500 mb-2">Reports to</p>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={manager.profileImage} alt={`${manager.firstName} ${manager.lastName}`} />
                    <AvatarFallback>{manager.firstName.charAt(0)}{manager.lastName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{manager.firstName} {manager.lastName}</span>
                </div>
              </div>
            )}
            
            {directReports.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Direct Reports ({directReports.length})</p>
                <div className="space-y-2">
                  {directReports.map(report => (
                    <div key={report.id} className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={report.profileImage} alt={`${report.firstName} ${report.lastName}`} />
                        <AvatarFallback>{report.firstName.charAt(0)}{report.lastName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{report.firstName} {report.lastName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 flex gap-2">
              <Button variant="outline" className="w-full" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
