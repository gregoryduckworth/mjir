import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading";
import { Building2, Users, FileText, CalendarClock, GraduationCap } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      position: "",
      profileImage: "",
      managerId: undefined,
    },
  });

  const onLoginSubmit = (data: LoginValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterValues) => {
    // Remove confirmPassword as it's not in the schema
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  const departments = [
    "Human Resources",
    "Engineering",
    "Marketing",
    "Sales",
    "Finance",
    "Operations",
    "Executive",
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center mb-4 space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="font-bold">HR</span>
              </div>
              <CardTitle className="text-2xl">HR Portal</CardTitle>
            </div>
            <CardDescription>
              Access your HR tools and resources from anywhere.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <><LoadingSpinner className="mr-2 h-4 w-4" /> Logging in...</>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="Your job position" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="profileImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="URL to your profile image" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <><LoadingSpinner className="mr-2 h-4 w-4" /> Registering...</>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-xs text-center text-gray-500 mt-4">
              {activeTab === "login" ? (
                <p>Don't have an account? <button type="button" className="text-primary hover:underline" onClick={() => setActiveTab("register")}>Register here</button></p>
              ) : (
                <p>Already have an account? <button type="button" className="text-primary hover:underline" onClick={() => setActiveTab("login")}>Login here</button></p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Hero Section */}
      <div className="w-full md:w-1/2 bg-primary p-6 md:p-12 flex items-center justify-center text-white">
        <div className="max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Manage Your HR Needs with Ease</h1>
          <p className="text-white/80 text-lg mb-8">
            A comprehensive platform for managing holiday requests, accessing company policies, tracking learning progress, and exploring the organization structure.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Holiday Management</h3>
                <p className="text-white/70 text-sm">Request and track your time off with ease</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Company Policies</h3>
                <p className="text-white/70 text-sm">Access all company policies and procedures</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Learning Platform</h3>
                <p className="text-white/70 text-sm">Track your progress and develop your skills</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Organization Chart</h3>
                <p className="text-white/70 text-sm">Explore the company structure and departments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
