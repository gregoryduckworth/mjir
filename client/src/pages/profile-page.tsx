import { useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { ContentLoader } from "@/components/ui/loading";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUsers } from "@/hooks/use-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { User } from "@/types";

export default function ProfilePage() {
  // Update the route pattern to use a slug format
  const [_, params] = useRoute("/profile/:slug");
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: users, isLoading: isLoadingUsers } = useUsers();

  // Parse the slug to extract the user ID
  const getUserFromSlug = (
    slug: string | undefined,
    users: User[] | undefined
  ) => {
    if (!slug || !users) return null;

    // Otherwise, parse the slug format: "firstname-lastname-id"
    const idMatch = slug.match(/-(\d+)$/);
    if (idMatch && idMatch[1]) {
      const userId = parseInt(idMatch[1]);
      return users.find((user) => user.id === userId);
    }

    return null;
  };

  const profileUser = getUserFromSlug(params?.slug, users as User[]);

  if (isLoadingUsers) {
    return <ContentLoader text="Loading profile information..." />;
  }

  if (!profileUser || !currentUser) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold mb-2">
                Employee Not Found
              </h2>
              <p className="text-gray-500 mb-6">
                The requested employee profile could not be found.
              </p>
              <Link href="/organization">
                <Button>Go to Organization</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find manager and direct reports
  const manager = profileUser.managerId
    ? (users as User[]).find((user) => user.id === profileUser.managerId)
    : null;

  const directReports = (users as User[]).filter(
    (user) => user.managerId === profileUser.id
  );

  // Permission checks
  const isAdmin = currentUser.role === "admin";
  const isManager = directReports.length > 0;
  const isSelf = currentUser.id === profileUser.id;
  const isEmployeeManager = profileUser.managerId === currentUser.id;

  // Access control based on roles
  const canViewPersonalDetails = isAdmin || isSelf || isEmployeeManager;
  const canViewEmploymentDetails =
    isAdmin || isSelf || isEmployeeManager || isManager;
  const canViewCompensation = isAdmin || isSelf;
  const canViewSkills = isAdmin || isSelf || isEmployeeManager;

  // Format currency for better display
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
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
    <div className="p-6">
      <div className="mb-6">
        <Link href="/organization">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organization
          </Button>
        </Link>

        <h1 className="text-2xl font-semibold">Employee Profile</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card className="md:w-1/3">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-28 w-28 mb-3">
                <AvatarImage
                  src={profileUser.profileImage || ""}
                  alt={`${profileUser.firstName} ${profileUser.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {profileUser.firstName.charAt(0)}
                  {profileUser.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold text-center">
                {profileUser.firstName} {profileUser.lastName}
              </h2>
              <p className="text-gray-500 text-center mb-2">
                {profileUser.position}
              </p>
              <Badge variant="outline" className="mb-2">
                {profileUser.department}
              </Badge>
              {profileUser.role && (
                <Badge
                  variant={
                    profileUser.role === "admin" ? "default" : "secondary"
                  }
                  className="mb-4"
                >
                  {profileUser.role.charAt(0).toUpperCase() +
                    profileUser.role.slice(1)}
                </Badge>
              )}

              <div className="w-full space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profileUser.email}</span>
                </div>
                {profileUser.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{profileUser.phoneNumber}</span>
                  </div>
                )}
                {manager && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Reports to: {manager.firstName} {manager.lastName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:w-2/3">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {canViewPersonalDetails && (
                  <TabsTrigger value="personal">Personal Details</TabsTrigger>
                )}
                {canViewEmploymentDetails && (
                  <TabsTrigger value="employment">Employment</TabsTrigger>
                )}
                {canViewCompensation && (
                  <TabsTrigger value="compensation">Compensation</TabsTrigger>
                )}
                {canViewSkills && (
                  <TabsTrigger value="skills">
                    Skills & Qualifications
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <p className="text-gray-600">
                    {profileUser.bio || "No bio information available."}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{profileUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{profileUser.phoneNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {manager && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-2">Manager</h3>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={manager.profileImage || ""}
                            alt={`${manager.firstName} ${manager.lastName}`}
                          />
                          <AvatarFallback>
                            {manager.firstName.charAt(0)}
                            {manager.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/profile/${manager.firstName.toLowerCase()}-${manager.lastName.toLowerCase()}-${
                              manager.id
                            }`}
                          >
                            <p className="font-medium hover:text-blue-600 cursor-pointer">
                              {manager.firstName} {manager.lastName}
                            </p>
                          </Link>
                          <p className="text-sm text-gray-500">
                            {manager.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {directReports.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Direct Reports
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {directReports.map((report) => (
                          <div
                            key={report.id}
                            className="flex items-center gap-3"
                          >
                            <Avatar>
                              <AvatarImage
                                src={report.profileImage || ""}
                                alt={`${report.firstName} ${report.lastName}`}
                              />
                              <AvatarFallback>
                                {report.firstName.charAt(0)}
                                {report.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/profile/${report.firstName.toLowerCase()}-${report.lastName.toLowerCase()}-${
                                  report.id
                                }`}
                              >
                                <p className="font-medium hover:text-blue-600 cursor-pointer">
                                  {report.firstName} {report.lastName}
                                </p>
                              </Link>
                              <p className="text-sm text-gray-500">
                                {report.position}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {canViewPersonalDetails && (
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Date of Birth
                      </h3>
                      <p>{formatDate(profileUser.dateOfBirth)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Nationality
                      </h3>
                      <p>{profileUser.nationality || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Marital Status
                      </h3>
                      <p>{profileUser.maritalStatus || "N/A"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Address</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p>{profileUser.address || "N/A"}</p>
                        {profileUser.city && profileUser.zipCode && (
                          <p>
                            {profileUser.city}, {profileUser.state}{" "}
                            {profileUser.zipCode}
                          </p>
                        )}
                        <p>{profileUser.country}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Emergency Contact
                    </h3>
                    <div className="space-y-2">
                      {profileUser.emergencyContactName ? (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p>{profileUser.emergencyContactName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p>{profileUser.emergencyContactPhone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Relationship
                            </p>
                            <p>{profileUser.emergencyContactRelation}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500">
                          No emergency contact information available.
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}

              {canViewEmploymentDetails && (
                <TabsContent value="employment" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Employee ID
                      </h3>
                      <p>{profileUser.employeeId || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Hire Date
                      </h3>
                      <p>{formatDate(profileUser.hireDate)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Department
                      </h3>
                      <p>{profileUser.department}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Position
                      </h3>
                      <p>{profileUser.position}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Contract Type
                      </h3>
                      <p>{profileUser.contractType || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Work Schedule
                      </h3>
                      <p>{profileUser.workSchedule || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Work Location
                      </h3>
                      <p>{profileUser.workLocation || "N/A"}</p>
                    </div>
                  </div>
                </TabsContent>
              )}

              {canViewCompensation && (
                <TabsContent value="compensation" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Salary
                      </h3>
                      <p className="text-lg font-semibold">
                        {formatCurrency(profileUser.salary)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {profileUser.salaryFrequency || "Annual"}
                      </p>
                    </div>

                    {profileUser.benefits && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Benefits
                        </h3>
                        <div className="space-y-1">
                          {Object.entries(
                            profileUser.benefits as Record<string, any>
                          ).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Bank Information
                      </h3>
                      <p>{profileUser.bankName || "N/A"}</p>
                      {profileUser.bankAccountNumber && (
                        <p className="text-sm text-gray-500">
                          Account: ••••{profileUser.bankAccountNumber.slice(-4)}
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Tax ID
                      </h3>
                      <p>{profileUser.taxId || "N/A"}</p>
                    </div>
                  </div>
                </TabsContent>
              )}

              {canViewSkills && (
                <TabsContent value="skills" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.skills && profileUser.skills.length > 0
                        ? profileUser.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        : "No skills listed"}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Education</h3>
                    <div className="space-y-3">
                      {profileUser.educationHistory &&
                      Array.isArray(profileUser.educationHistory) &&
                      profileUser.educationHistory.length > 0
                        ? profileUser.educationHistory.map(
                            (edu: any, index: number) => (
                              <div key={index}>
                                <p className="font-medium">{edu.degree}</p>
                                <p className="text-sm text-gray-500">
                                  {edu.institution}, {edu.year}
                                </p>
                              </div>
                            )
                          )
                        : "No education history listed"}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Certifications</h3>
                    <div className="space-y-3">
                      {profileUser.certifications &&
                      Array.isArray(profileUser.certifications) &&
                      profileUser.certifications.length > 0
                        ? profileUser.certifications.map(
                            (cert: any, index: number) => (
                              <div key={index}>
                                <p className="font-medium">{cert.name}</p>
                                <p className="text-sm text-gray-500">
                                  Issued: {formatDate(cert.issueDate)},
                                  {cert.expiryDate &&
                                    ` Expires: ${formatDate(cert.expiryDate)}`}
                                </p>
                              </div>
                            )
                          )
                        : "No certifications listed"}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.languages && profileUser.languages.length > 0
                        ? profileUser.languages.map((lang, index) => (
                            <Badge key={index} variant="outline">
                              {lang}
                            </Badge>
                          ))
                        : "No languages listed"}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
