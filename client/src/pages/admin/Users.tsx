import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/use-api";

type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  managerId?: number | null;
};

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch all users for manager dropdown
  const { data: allUsers = [] } = useUsers();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: Omit<User, "id">) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateDialogOpen(false);
      toast({ title: "User created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...userData }: User) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "User updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [subordinates, setSubordinates] = useState<User[]>([]);
  const [newManagerId, setNewManagerId] = useState<string>("");

  const deleteUser = useMutation({
    mutationFn: async ({
      userId,
      newManagerId,
    }: {
      userId: number;
      newManagerId?: number;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newManagerId }),
      });
      if (!response.ok) throw new Error("Failed to delete user");
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate both the admin users query and the general users query
      // This ensures all components using useUsers() will refresh their data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted successfully" });
      setIsReassignDialogOpen(false);
      setUserToDelete(null);
      setSubordinates([]);
      setNewManagerId("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkAndDeleteUser = (userId: number) => {
    // Find subordinates (employees who have this user as their manager)
    const userSubordinates = users.filter((u) => u.managerId === userId);

    if (userSubordinates.length > 0) {
      // If user has subordinates, open reassign dialog
      setUserToDelete(userId);
      setSubordinates(userSubordinates);
      setIsReassignDialogOpen(true);
    } else {
      // If no subordinates, proceed with deletion
      if (window.confirm("Are you sure you want to delete this user?")) {
        deleteUser.mutate({ userId, newManagerId: undefined });
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const managerId = formData.get("managerId") as string;
                createUser.mutate({
                  username: formData.get("username") as string,
                  firstName: formData.get("firstName") as string,
                  lastName: formData.get("lastName") as string,
                  email: formData.get("email") as string,
                  role: formData.get("role") as string,
                  department: formData.get("department") as string,
                  position: formData.get("position") as string,
                  managerId:
                    managerId && managerId !== "none"
                      ? parseInt(managerId)
                      : null,
                });
              }}
              className="space-y-4"
            >
              <div className="grid w-full gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input required id="username" name="username" />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input required id="firstName" name="firstName" />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input required id="lastName" name="lastName" />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input required type="email" id="email" name="email" />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="employee">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="department">Department</Label>
                <Input required id="department" name="department" />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="position">Position</Label>
                <Input required id="position" name="position" />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="manager">Manager</Label>
                <Select name="managerId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager (leave blank for CEO)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (CEO/Top Level)</SelectItem>
                    {allUsers.map((user: User) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName} ({user.department},{" "}
                        {user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Create User</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.position}</TableCell>
              <TableCell>
                {user.managerId
                  ? allUsers.find((u) => u.id === user.managerId)
                    ? `${
                        allUsers.find((u) => u.id === user.managerId)?.firstName
                      } ${
                        allUsers.find((u) => u.id === user.managerId)?.lastName
                      }`
                    : "Unknown"
                  : "None (CEO/Top Level)"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => checkAndDeleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const managerId = formData.get("managerId") as string;
                updateUser.mutate({
                  id: selectedUser.id,
                  username: formData.get("username") as string,
                  firstName: formData.get("firstName") as string,
                  lastName: formData.get("lastName") as string,
                  email: formData.get("email") as string,
                  role: formData.get("role") as string,
                  department: formData.get("department") as string,
                  position: formData.get("position") as string,
                  managerId:
                    managerId && managerId !== "none"
                      ? parseInt(managerId)
                      : null,
                });
              }}
              className="space-y-4"
            >
              <div className="grid w-full gap-1.5">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  required
                  id="edit-username"
                  name="username"
                  defaultValue={selectedUser.username}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  required
                  id="edit-firstName"
                  name="firstName"
                  defaultValue={selectedUser.firstName}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  required
                  id="edit-lastName"
                  name="lastName"
                  defaultValue={selectedUser.lastName}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  required
                  type="email"
                  id="edit-email"
                  name="email"
                  defaultValue={selectedUser.email}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  required
                  id="edit-department"
                  name="department"
                  defaultValue={selectedUser.department}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  required
                  id="edit-position"
                  name="position"
                  defaultValue={selectedUser.position}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="edit-manager">Manager</Label>
                <Select
                  name="managerId"
                  defaultValue={selectedUser.managerId?.toString() || "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager (leave blank for CEO)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (CEO/Top Level)</SelectItem>
                    {allUsers
                      .filter((u) => u.id !== selectedUser?.id)
                      .map((user: User) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName} {user.lastName} ({user.department},{" "}
                          {user.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Update User</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog
        open={isReassignDialogOpen}
        onOpenChange={setIsReassignDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Employees</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              This user is a manager for {subordinates.length} employee
              {subordinates.length !== 1 ? "s" : ""}. Please select a new
              manager for these employees before deleting this user.
            </p>

            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              <h3 className="font-medium mb-2">Affected employees:</h3>
              <ul className="space-y-1">
                {subordinates.map((employee) => (
                  <li key={employee.id} className="text-sm">
                    {employee.firstName} {employee.lastName} (
                    {employee.position})
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="new-manager">New Manager</Label>
              <Select value={newManagerId} onValueChange={setNewManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a new manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {allUsers
                    .filter((u) =>
                      userToDelete ? u.id !== userToDelete : true
                    )
                    .map((user: User) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName} ({user.department},{" "}
                        {user.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReassignDialogOpen(false);
                  setUserToDelete(null);
                  setSubordinates([]);
                  setNewManagerId("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (userToDelete) {
                    deleteUser.mutate({
                      userId: userToDelete,
                      newManagerId:
                        newManagerId === "none"
                          ? undefined
                          : parseInt(newManagerId),
                    });
                  }
                }}
                disabled={!newManagerId}
              >
                Reassign & Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
