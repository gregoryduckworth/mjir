import { User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Calendar, 
  User as UserIcon,
} from "lucide-react";
import { format } from "date-fns";

interface EmployeeCardProps {
  employee: User | null;
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  currentUser: User;
}

export function EmployeeCard({ employee, isOpen, onClose, allUsers, currentUser }: EmployeeCardProps) {
  if (!employee) return null;

  const manager = employee.managerId 
    ? allUsers.find(user => user.id === employee.managerId)
    : null;

  const directReports = allUsers.filter(user => user.managerId === employee.id);
  
  // Permission checks
  const isAdmin = currentUser.role === 'admin';
  const isManager = directReports.length > 0;
  const isSelf = currentUser.id === employee.id;
  const isEmployeeManager = employee.managerId === currentUser.id;
  
  // Access control based on roles
  const canViewPersonalDetails = isAdmin || isSelf || isEmployeeManager;
  const canViewEmploymentDetails = isAdmin || isSelf || isEmployeeManager || isManager;
  const canViewCompensation = isAdmin || isSelf;
  const canViewSkills = isAdmin || isSelf || isEmployeeManager;

  // Format currency for better display
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date for better display
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMMM d, yyyy");
    } catch {
      return "N/A";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Profile</DialogTitle>
          <DialogDescription>
            Comprehensive employee information
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex flex-col items-center">
              <Avatar className="h-28 w-28 mb-3">
                <AvatarImage src={employee.profileImage || ''} alt={`${employee.firstName} ${employee.lastName}`} />
                <AvatarFallback className="text-2xl">{employee.firstName.charAt(0)}{employee.lastName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold text-center">{employee.firstName} {employee.lastName}</h2>
              <p className="text-gray-500 text-center mb-2">{employee.position}</p>
              <Badge variant="outline">{employee.department}</Badge>
              {employee.role && (
                <Badge variant={employee.role === 'admin' ? "default" : "secondary"} className="mt-2">
                  {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                </Badge>
              )}
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{employee.phoneNumber || 'Phone number not available'}</span>
                </div>
                {employee.employeeId && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">ID: {employee.employeeId}</span>
                  </div>
                )}
                {employee.hireDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Hired: {formatDate(employee.hireDate)}</span>
                  </div>
                )}
              </div>
              
              {manager && (
                <div className="bg-gray-50 p-3 rounded-md mt-4">
                  <p className="text-xs text-gray-500 mb-2">Reports to</p>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={manager.profileImage || ''} alt={`${manager.firstName} ${manager.lastName}`} />
                      <AvatarFallback>{manager.firstName.charAt(0)}{manager.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{manager.firstName} {manager.lastName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <Tabs defaultValue={canViewPersonalDetails ? "personal" : "employment"} className="w-full">
            <TabsList className={`grid ${canViewPersonalDetails && canViewEmploymentDetails && canViewCompensation && canViewSkills ? 'grid-cols-4' : canViewPersonalDetails && canViewEmploymentDetails && (canViewCompensation || canViewSkills) ? 'grid-cols-3' : 'grid-cols-2'} mb-4`}>
              {canViewPersonalDetails && <TabsTrigger value="personal">Personal</TabsTrigger>}
              <TabsTrigger value="employment">Employment</TabsTrigger>
              {canViewCompensation && <TabsTrigger value="compensation">Compensation</TabsTrigger>}
              {canViewSkills && <TabsTrigger value="skills">Skills</TabsTrigger>}
            </TabsList>
            
            {canViewPersonalDetails && (
              <TabsContent value="personal" className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm">{formatDate(employee.dateOfBirth)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Nationality</p>
                    <p className="text-sm">{employee.nationality || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Marital Status</p>
                    <p className="text-sm">{employee.maritalStatus || 'N/A'}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mt-6">Contact Information</h3>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm">
                    {employee.address 
                      ? `${employee.address}, ${employee.city || ''}, ${employee.state || ''} ${employee.zipCode || ''}`
                      : 'Address not available'
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm">{employee.country || 'N/A'}</p>
                </div>
                
                <h3 className="text-lg font-medium mt-6">Emergency Contact</h3>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Name & Relationship</p>
                  <p className="text-sm">
                    {employee.emergencyContactName 
                      ? `${employee.emergencyContactName} (${employee.emergencyContactRelation || 'Relation not specified'})`
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm">{employee.emergencyContactPhone || 'Not provided'}</p>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="employment" className="space-y-4">
              <h3 className="text-lg font-medium">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Contract Type</p>
                  <p className="text-sm">{employee.contractType || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Work Schedule</p>
                  <p className="text-sm">{employee.workSchedule || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Work Location</p>
                  <p className="text-sm">{employee.workLocation || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm">{employee.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Position</p>
                  <p className="text-sm">{employee.position}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Hire Date</p>
                  <p className="text-sm">{formatDate(employee.hireDate)}</p>
                </div>
              </div>
              
              {directReports.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-6">Direct Reports ({directReports.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {directReports.map(report => (
                      <div key={report.id} className="flex items-center p-2 border rounded">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={report.profileImage || ''} alt={`${report.firstName} ${report.lastName}`} />
                          <AvatarFallback>{report.firstName.charAt(0)}{report.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{report.firstName} {report.lastName}</p>
                          <p className="text-xs text-gray-500">{report.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            
            {canViewCompensation && (
              <TabsContent value="compensation" className="space-y-4">
                <h3 className="text-lg font-medium">Salary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Salary</p>
                    <p className="text-sm font-semibold">
                      {employee.salary ? formatCurrency(employee.salary) : 'N/A'} 
                      <span className="font-normal text-gray-500 text-xs ml-1">
                        ({employee.salaryFrequency || 'frequency not specified'})
                      </span>
                    </p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mt-6">Banking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Bank</p>
                    <p className="text-sm">{employee.bankName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Tax ID</p>
                    <p className="text-sm">{employee.taxId || 'N/A'}</p>
                  </div>
                </div>
                
                {employee.benefits && (
                  <>
                    <h3 className="text-lg font-medium mt-6">Benefits</h3>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">
                        {typeof employee.benefits === 'object' 
                          ? JSON.stringify(employee.benefits, null, 2) 
                          : String(employee.benefits)
                        }
                      </pre>
                    </div>
                  </>
                )}
              </TabsContent>
            )}
            
            {canViewSkills && (
              <TabsContent value="skills" className="space-y-4">
                <h3 className="text-lg font-medium">Skills & Qualifications</h3>
                
                {employee.skills && employee.skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {employee.languages && employee.languages.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.languages.map((language, index) => (
                        <Badge key={index} variant="outline">{language}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {employee.certifications && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium">Certifications</p>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">
                        {typeof employee.certifications === 'object' 
                          ? JSON.stringify(employee.certifications, null, 2) 
                          : String(employee.certifications)
                        }
                      </pre>
                    </div>
                  </div>
                )}
                
                {employee.educationHistory && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium">Education</p>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">
                        {typeof employee.educationHistory === 'object' 
                          ? JSON.stringify(employee.educationHistory, null, 2) 
                          : String(employee.educationHistory)
                        }
                      </pre>
                    </div>
                  </div>
                )}
                
                {isAdmin && employee.performanceRatings && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium">Performance Ratings</p>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">
                        {typeof employee.performanceRatings === 'object' 
                          ? JSON.stringify(employee.performanceRatings, null, 2) 
                          : String(employee.performanceRatings)
                        }
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        <DialogFooter className="flex gap-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
