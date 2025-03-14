import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HolidayRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, ContentLoader } from "@/components/ui/loading";
import { Check, X, Calendar, Clock } from "lucide-react";

// Extended holiday request with user info
interface HolidayRequestWithUser extends HolidayRequest {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    department: string;
    position: string;
    profileImage: string | null;
  } | null;
}

export function HolidayApproval() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  
  // Get all holiday requests
  const { data: holidayRequests, isLoading } = useQuery<HolidayRequestWithUser[]>({
    queryKey: ["/api/holiday-requests"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Get pending requests for manager approval
  const { data: pendingRequests, isLoading: isPendingLoading } = useQuery<HolidayRequestWithUser[]>({
    queryKey: ["/api/holiday-requests/pending"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update holiday request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/holiday-requests/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holiday-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holiday-requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating request",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleApprove = (id: number) => {
    updateStatusMutation.mutate(
      { id, status: "approved" },
      {
        onSuccess: () => {
          toast({
            title: "Request approved",
            description: "Holiday request has been approved successfully",
          });
        },
      }
    );
  };
  
  const handleReject = (id: number) => {
    updateStatusMutation.mutate(
      { id, status: "rejected" },
      {
        onSuccess: () => {
          toast({
            title: "Request rejected",
            description: "Holiday request has been rejected",
          });
        },
      }
    );
  };
  
  if (isLoading || isPendingLoading) {
    return <ContentLoader text="Loading holiday requests..." />;
  }
  
  const allRequests = holidayRequests || [];
  const pending = pendingRequests || [];
  const approved = allRequests.filter(r => r.status === "approved");
  const rejected = allRequests.filter(r => r.status === "rejected");
  
  const renderRequestCard = (request: HolidayRequestWithUser) => {
    const user = request.user;
    const name = user ? `${user.firstName} ${user.lastName}` : "Unknown";
    const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "??";
    const isPending = request.status === "pending";
    
    return (
      <Card key={request.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar>
                {user?.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={name} />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-lg">{name}</CardTitle>
                <CardDescription>
                  {user?.position} in {user?.department}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={
                request.status === "approved" 
                  ? "success" 
                  : request.status === "rejected" 
                    ? "destructive" 
                    : "outline"
              }
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(request.startDate), "MMM d, yyyy")} - {format(new Date(request.endDate), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{request.duration} days</span>
            </div>
          </div>
          <p className="mt-3 text-sm">{request.reason}</p>
        </CardContent>
        {isPending && (
          <CardFooter className="flex justify-end gap-2 pt-0">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleReject(request.id)}
              disabled={updateStatusMutation.isPending}
            >
              <X className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button 
              size="sm"
              onClick={() => handleApprove(request.id)}
              disabled={updateStatusMutation.isPending}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Holiday Approval</h2>
      <p className="text-muted-foreground">
        Review and manage holiday requests from your team members
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejected.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({allRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          {updateStatusMutation.isPending && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
          
          {!updateStatusMutation.isPending && pending.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No pending holiday requests to review
            </p>
          )}
          
          {!updateStatusMutation.isPending && 
            pending.map(request => renderRequestCard(request))}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-4">
          {approved.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No approved holiday requests
            </p>
          ) : (
            approved.map(request => renderRequestCard(request))
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          {rejected.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No rejected holiday requests
            </p>
          ) : (
            rejected.map(request => renderRequestCard(request))
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          {allRequests.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No holiday requests found
            </p>
          ) : (
            allRequests.map(request => renderRequestCard(request))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}