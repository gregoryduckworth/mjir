import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmployeeCard } from "@/components/organization/employee-card";
import { ContentLoader } from "@/components/ui/loading";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUsers } from "@/hooks/use-api";

export default function ProfilePage() {
  const [_, params] = useRoute("/profile/:id");
  const userId = params?.id ? parseInt(params.id) : null;
  const [showProfile, setShowProfile] = useState(false);
  const { user: currentUser } = useAuth();

  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const profileUser = userId
    ? (users as User[]).find((user) => user.id === userId)
    : null;

  // Show employee card dialog after component mounts
  useEffect(() => {
    if (profileUser) {
      setShowProfile(true);
    }
  }, [profileUser]);

  if (isLoadingUsers) {
    return <ContentLoader text="Loading profile information..." />;
  }

  if (!profileUser) {
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

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-2xl">
              {profileUser.firstName.charAt(0)}
              {profileUser.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {profileUser.firstName} {profileUser.lastName}
              </h2>
              <p className="text-gray-600">{profileUser.position}</p>
              <p className="text-gray-500 text-sm">{profileUser.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
              <p>{profileUser.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Employee ID
              </h3>
              <p>{profileUser.employeeId || "N/A"}</p>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => setShowProfile(true)}
              className="w-full sm:w-auto"
            >
              View Full Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentUser && (
        <EmployeeCard
          employee={profileUser}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          allUsers={users as User[]}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
