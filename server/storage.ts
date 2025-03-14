import { users, type User, type InsertUser, holidayRequests, type HolidayRequest, type InsertHolidayRequest, policies, type Policy, type InsertPolicy, courses, type Course, type InsertCourse, courseModules, type CourseModule, type InsertCourseModule, userCourseProgress, type UserCourseProgress, type InsertUserCourseProgress, departments, type Department, type InsertDepartment, activities, type Activity, type InsertActivity } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Holiday requests
  getAllHolidayRequests(): Promise<HolidayRequest[]>;
  getHolidayRequestsByUserId(userId: number): Promise<HolidayRequest[]>;
  getHolidayRequest(id: number): Promise<HolidayRequest | undefined>;
  createHolidayRequest(request: InsertHolidayRequest): Promise<HolidayRequest>;
  updateHolidayRequest(id: number, status: string, approvedById?: number): Promise<HolidayRequest>;
  
  // Policies
  getAllPolicies(): Promise<Policy[]>;
  getPolicy(id: number): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  
  // Courses and Learning
  getAllCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  getAllCourseModules(): Promise<CourseModule[]>;
  getCourseModulesByCourseId(courseId: number): Promise<CourseModule[]>;
  getCourseModule(id: number): Promise<CourseModule | undefined>;
  createCourseModule(module: InsertCourseModule): Promise<CourseModule>;
  
  getUserCourseProgressByUserId(userId: number): Promise<UserCourseProgress[]>;
  getUserCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined>;
  createUserCourseProgress(progress: InsertUserCourseProgress): Promise<UserCourseProgress>;
  updateUserCourseProgress(id: number, completedModules: number, isCompleted: boolean): Promise<UserCourseProgress>;
  
  // Departments and Organization
  getAllDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // Activities
  getAllActivities(): Promise<Activity[]>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Notifications
  getAllNotifications(): Promise<Notification[]>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getUnreadNotificationsByUserId(userId: number): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private holidayRequests: Map<number, HolidayRequest>;
  private policies: Map<number, Policy>;
  private courses: Map<number, Course>;
  private courseModules: Map<number, CourseModule>;
  private userCourseProgress: Map<number, UserCourseProgress>;
  private departments: Map<number, Department>;
  private activities: Map<number, Activity>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private holidayRequestIdCounter: number;
  private policyIdCounter: number;
  private courseIdCounter: number;
  private moduleIdCounter: number;
  private progressIdCounter: number;
  private departmentIdCounter: number;
  private activityIdCounter: number;
  private notificationIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.holidayRequests = new Map();
    this.policies = new Map();
    this.courses = new Map();
    this.courseModules = new Map();
    this.userCourseProgress = new Map();
    this.departments = new Map();
    this.activities = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.holidayRequestIdCounter = 1;
    this.policyIdCounter = 1;
    this.courseIdCounter = 1;
    this.moduleIdCounter = 1;
    this.progressIdCounter = 1;
    this.departmentIdCounter = 1;
    this.activityIdCounter = 1;
    this.notificationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.seedData();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Holiday Requests
  async getAllHolidayRequests(): Promise<HolidayRequest[]> {
    return Array.from(this.holidayRequests.values());
  }
  
  async getHolidayRequestsByUserId(userId: number): Promise<HolidayRequest[]> {
    return Array.from(this.holidayRequests.values()).filter(
      request => request.userId === userId
    );
  }
  
  async getHolidayRequest(id: number): Promise<HolidayRequest | undefined> {
    return this.holidayRequests.get(id);
  }
  
  async createHolidayRequest(insertRequest: InsertHolidayRequest): Promise<HolidayRequest> {
    const id = this.holidayRequestIdCounter++;
    const now = new Date();
    const request: HolidayRequest = { 
      ...insertRequest, 
      id, 
      status: "pending", 
      createdAt: now.toISOString(),
      approvedById: undefined
    };
    this.holidayRequests.set(id, request);
    return request;
  }
  
  async updateHolidayRequest(id: number, status: string, approvedById?: number): Promise<HolidayRequest> {
    const request = this.holidayRequests.get(id);
    if (!request) {
      throw new Error(`Holiday request with id ${id} not found`);
    }
    
    const updated: HolidayRequest = {
      ...request,
      status,
      approvedById
    };
    
    this.holidayRequests.set(id, updated);
    return updated;
  }
  
  // Policies
  async getAllPolicies(): Promise<Policy[]> {
    return Array.from(this.policies.values());
  }
  
  async getPolicy(id: number): Promise<Policy | undefined> {
    return this.policies.get(id);
  }
  
  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const id = this.policyIdCounter++;
    const now = new Date().toISOString();
    const policy: Policy = {
      ...insertPolicy,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.policies.set(id, policy);
    return policy;
  }
  
  // Courses
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const now = new Date().toISOString();
    const course: Course = {
      ...insertCourse,
      id,
      createdAt: now
    };
    this.courses.set(id, course);
    return course;
  }
  
  // Course Modules
  async getAllCourseModules(): Promise<CourseModule[]> {
    return Array.from(this.courseModules.values());
  }
  
  async getCourseModulesByCourseId(courseId: number): Promise<CourseModule[]> {
    return Array.from(this.courseModules.values())
      .filter(module => module.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getCourseModule(id: number): Promise<CourseModule | undefined> {
    return this.courseModules.get(id);
  }
  
  async createCourseModule(insertModule: InsertCourseModule): Promise<CourseModule> {
    const id = this.moduleIdCounter++;
    const module: CourseModule = {
      ...insertModule,
      id
    };
    this.courseModules.set(id, module);
    return module;
  }
  
  // User Course Progress
  async getUserCourseProgressByUserId(userId: number): Promise<UserCourseProgress[]> {
    return Array.from(this.userCourseProgress.values())
      .filter(progress => progress.userId === userId);
  }
  
  async getUserCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined> {
    return Array.from(this.userCourseProgress.values())
      .find(progress => progress.userId === userId && progress.courseId === courseId);
  }
  
  async createUserCourseProgress(insertProgress: InsertUserCourseProgress): Promise<UserCourseProgress> {
    const id = this.progressIdCounter++;
    const now = new Date().toISOString();
    const progress: UserCourseProgress = {
      ...insertProgress,
      id,
      lastAccessedAt: now,
      isCompleted: false
    };
    this.userCourseProgress.set(id, progress);
    return progress;
  }
  
  async updateUserCourseProgress(id: number, completedModules: number, isCompleted: boolean): Promise<UserCourseProgress> {
    const progress = this.userCourseProgress.get(id);
    if (!progress) {
      throw new Error(`User course progress with id ${id} not found`);
    }
    
    const now = new Date().toISOString();
    const updated: UserCourseProgress = {
      ...progress,
      completedModules,
      isCompleted,
      lastAccessedAt: now
    };
    
    this.userCourseProgress.set(id, updated);
    return updated;
  }
  
  // Departments
  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }
  
  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }
  
  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = this.departmentIdCounter++;
    const department: Department = {
      ...insertDepartment,
      id
    };
    this.departments.set(id, department);
    return department;
  }
  
  // Activities
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId);
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date().toISOString();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Seed initial data
  private async seedData() {
    // Create users
    const adminUser = await this.createUser({
      username: "admin",
      password: "$2b$10$BhXjpqXKgsk7XTgBDsO2MuALgXeIj5qqm0BcO7w1d/5FbRhLqBy8y", // "password"
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      role: "admin",
      department: "Human Resources",
      position: "HR Director",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      managerId: undefined,
      // Personal details
      dateOfBirth: new Date("1985-04-12"),
      phoneNumber: "555-123-4567",
      address: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
      nationality: "American",
      maritalStatus: "Married",
      emergencyContactName: "Michael Johnson",
      emergencyContactPhone: "555-987-6543",
      emergencyContactRelation: "Spouse",
      // Employment details
      employeeId: "EMP001",
      hireDate: new Date("2015-06-01"),
      contractType: "Full-time",
      workSchedule: "9am-5pm, Mon-Fri",
      workLocation: "Office",
      // Salary and benefits
      salary: 125000,
      salaryFrequency: "Annual",
      benefits: {
        healthInsurance: "Premium Plan",
        retirement: "401k with 6% match",
        paidTimeOff: "25 days per year",
        parentalLeave: "16 weeks"
      },
      bankName: "First National Bank",
      bankAccountNumber: "XXXX-XXXX-7890",
      taxId: "XXX-XX-1234",
      // Skills and attributes
      skills: ["Leadership", "HR Management", "Conflict Resolution", "Recruitment", "Employee Relations"],
      languages: ["English", "Spanish"],
      certifications: [
        {
          name: "PHR (Professional in Human Resources)",
          issuedBy: "HRCI",
          year: 2017,
          expiryDate: "2023-05-15"
        },
        {
          name: "SHRM-SCP",
          issuedBy: "Society for Human Resource Management",
          year: 2019
        }
      ],
      educationHistory: [
        {
          institution: "University of California, Berkeley",
          degree: "Master of Human Resource Management",
          graduationYear: 2010
        },
        {
          institution: "UCLA",
          degree: "Bachelor of Business Administration",
          graduationYear: 2008
        }
      ],
      performanceRatings: {
        "2022": {
          overall: 4.8,
          leadership: 4.9,
          communication: 4.7,
          technical: 4.5,
          comments: "Exceptional leader who has transformed our HR department"
        },
        "2021": {
          overall: 4.7,
          leadership: 4.8,
          communication: 4.6,
          technical: 4.5,
          comments: "Continues to excel in all areas"
        }
      }
    });
    
    const userMark = await this.createUser({
      username: "mark",
      password: "$2b$10$BhXjpqXKgsk7XTgBDsO2MuALgXeIj5qqm0BcO7w1d/5FbRhLqBy8y",
      firstName: "Mark",
      lastName: "Wilson",
      email: "mark.wilson@example.com",
      role: "employee",
      department: "Design",
      position: "Lead Designer",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      managerId: adminUser.id,
      // Personal details
      dateOfBirth: new Date("1988-09-22"),
      phoneNumber: "555-987-1234",
      address: "456 Market Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      country: "United States",
      nationality: "British",
      maritalStatus: "Single",
      emergencyContactName: "James Wilson",
      emergencyContactPhone: "555-345-6789",
      emergencyContactRelation: "Brother",
      // Employment details
      employeeId: "EMP002",
      hireDate: new Date("2017-03-15"),
      contractType: "Full-time",
      workSchedule: "10am-6pm, Mon-Fri",
      workLocation: "Hybrid",
      // Salary and benefits
      salary: 95000,
      salaryFrequency: "Annual",
      benefits: {
        healthInsurance: "Standard Plan",
        retirement: "401k with 4% match",
        paidTimeOff: "20 days per year"
      },
      bankName: "Chase Bank",
      bankAccountNumber: "XXXX-XXXX-4321",
      taxId: "XXX-XX-5678",
      // Skills and attributes
      skills: ["UI/UX Design", "Figma", "Adobe Creative Suite", "Design Systems", "Wireframing", "Prototyping"],
      languages: ["English", "French"],
      certifications: [
        {
          name: "Adobe Certified Expert",
          issuedBy: "Adobe",
          year: 2019
        },
        {
          name: "UX Design Certification",
          issuedBy: "Nielsen Norman Group",
          year: 2020
        }
      ],
      educationHistory: [
        {
          institution: "Royal College of Art",
          degree: "Master of Arts in Design",
          graduationYear: 2013
        },
        {
          institution: "University of London",
          degree: "Bachelor of Arts in Graphic Design",
          graduationYear: 2011
        }
      ],
      performanceRatings: {
        "2022": {
          overall: 4.5,
          leadership: 4.3,
          communication: 4.4,
          technical: 4.9,
          comments: "Mark continues to deliver outstanding design work and has grown as a team leader."
        },
        "2021": {
          overall: 4.4,
          leadership: 4.0,
          communication: 4.2,
          technical: 4.8,
          comments: "Excellent technical skills and creative vision. Can improve on team communication."
        }
      }
    });
    
    const userEmma = await this.createUser({
      username: "emma",
      password: "$2b$10$BhXjpqXKgsk7XTgBDsO2MuALgXeIj5qqm0BcO7w1d/5FbRhLqBy8y",
      firstName: "Emma",
      lastName: "Davis",
      email: "emma.davis@example.com",
      role: "employee",
      department: "Product",
      position: "Product Manager",
      profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      managerId: adminUser.id,
      // Personal details
      dateOfBirth: new Date("1990-05-15"),
      phoneNumber: "555-456-7890",
      address: "789 Pine Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94108",
      country: "United States",
      nationality: "American",
      maritalStatus: "Married",
      emergencyContactName: "Robert Davis",
      emergencyContactPhone: "555-789-0123",
      emergencyContactRelation: "Spouse",
      // Employment details
      employeeId: "EMP003",
      hireDate: new Date("2018-09-10"),
      contractType: "Full-time",
      workSchedule: "9am-5pm, Mon-Fri",
      workLocation: "Remote",
      // Salary and benefits
      salary: 105000,
      salaryFrequency: "Annual",
      benefits: {
        healthInsurance: "Premium Plan",
        retirement: "401k with 5% match",
        paidTimeOff: "22 days per year",
        wellnessProgram: "Gym membership allowance"
      },
      bankName: "Bank of America",
      bankAccountNumber: "XXXX-XXXX-9876",
      taxId: "XXX-XX-9012",
      // Skills and attributes
      skills: ["Product Strategy", "Agile Methodologies", "User Research", "Roadmapping", "Stakeholder Management", "Data Analysis"],
      languages: ["English", "Mandarin"],
      certifications: [
        {
          name: "Certified Scrum Product Owner (CSPO)",
          issuedBy: "Scrum Alliance",
          year: 2019
        },
        {
          name: "Product Management Certification",
          issuedBy: "Product School",
          year: 2020
        }
      ],
      educationHistory: [
        {
          institution: "Stanford University",
          degree: "MBA",
          graduationYear: 2016
        },
        {
          institution: "University of California, San Diego",
          degree: "Bachelor of Science in Business Information Systems",
          graduationYear: 2012
        }
      ],
      performanceRatings: {
        "2022": {
          overall: 4.7,
          leadership: 4.6,
          communication: 4.8,
          technical: 4.5,
          comments: "Emma consistently delivers high-quality product strategies and has excellent communication with stakeholders."
        },
        "2021": {
          overall: 4.5,
          leadership: 4.3,
          communication: 4.7,
          technical: 4.4,
          comments: "Strong leadership in product development and excellent stakeholder management."
        }
      }
    });
    
    const userJennifer = await this.createUser({
      username: "jennifer",
      password: "$2b$10$BhXjpqXKgsk7XTgBDsO2MuALgXeIj5qqm0BcO7w1d/5FbRhLqBy8y", // "password"
      firstName: "Jennifer",
      lastName: "Thompson",
      email: "jennifer.thompson@example.com",
      role: "hr_manager",
      department: "Human Resources",
      position: "HR Manager",
      profileImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      managerId: adminUser.id,
      // Personal details
      dateOfBirth: new Date("1987-11-23"),
      phoneNumber: "555-234-5678",
      address: "456 Cedar Avenue",
      city: "San Francisco",
      state: "CA",
      zipCode: "94110",
      country: "United States",
      nationality: "American",
      maritalStatus: "Single",
      emergencyContactName: "Elizabeth Thompson",
      emergencyContactPhone: "555-876-5432",
      emergencyContactRelation: "Mother",
      // Employment details
      employeeId: "EMP004",
      hireDate: new Date("2017-05-20"),
      contractType: "Full-time",
      workSchedule: "9am-5pm, Mon-Fri",
      workLocation: "Hybrid",
      // Salary and benefits
      salary: 98000,
      salaryFrequency: "Annual",
      benefits: {
        healthInsurance: "Premium Plan",
        retirement: "401k with 5% match",
        paidTimeOff: "22 days per year"
      },
      bankName: "Wells Fargo",
      bankAccountNumber: "XXXX-XXXX-5432",
      taxId: "XXX-XX-8765",
      // Skills and attributes
      skills: ["HR Management", "Talent Acquisition", "Employee Relations", "Policy Development", "Conflict Resolution", "Benefits Administration"],
      languages: ["English", "Spanish"],
      certifications: [
        {
          name: "SHRM-CP",
          issuedBy: "Society for Human Resource Management",
          year: 2018
        },
        {
          name: "Certified Mediator",
          issuedBy: "National Conflict Resolution Center",
          year: 2019
        }
      ],
      educationHistory: [
        {
          institution: "New York University",
          degree: "Master of Science in Human Resource Management",
          graduationYear: 2012
        },
        {
          institution: "University of Michigan",
          degree: "Bachelor of Arts in Psychology",
          graduationYear: 2010
        }
      ],
      performanceRatings: {
        "2022": {
          overall: 4.6,
          leadership: 4.4,
          communication: 4.8,
          technical: 4.5,
          comments: "Jennifer has exceptional communication skills and has greatly improved our HR policies and procedures."
        },
        "2021": {
          overall: 4.4,
          leadership: 4.2,
          communication: 4.7,
          technical: 4.3,
          comments: "Strong performance in employee relations and policy implementation."
        }
      }
    });
    
    const userDavid = await this.createUser({
      username: "david",
      password: "$2b$10$BhXjpqXKgsk7XTgBDsO2MuALgXeIj5qqm0BcO7w1d/5FbRhLqBy8y", // "password"
      firstName: "David",
      lastName: "Chen",
      email: "david.chen@example.com",
      role: "manager",
      department: "Engineering",
      position: "Engineering Manager",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      managerId: adminUser.id,
      // Personal details
      dateOfBirth: new Date("1984-03-18"),
      phoneNumber: "555-876-2345",
      address: "789 Oak Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94107",
      country: "United States",
      nationality: "American",
      maritalStatus: "Married",
      emergencyContactName: "Lisa Chen",
      emergencyContactPhone: "555-456-7891",
      emergencyContactRelation: "Spouse",
      // Employment details
      employeeId: "EMP005",
      hireDate: new Date("2016-11-15"),
      contractType: "Full-time",
      workSchedule: "9am-5pm, Mon-Fri",
      workLocation: "Office",
      // Salary and benefits
      salary: 135000,
      salaryFrequency: "Annual",
      benefits: {
        healthInsurance: "Premium Plan",
        retirement: "401k with 6% match",
        paidTimeOff: "23 days per year"
      },
      bankName: "Chase Bank",
      bankAccountNumber: "XXXX-XXXX-3456",
      taxId: "XXX-XX-6543",
      // Skills and attributes
      skills: ["Software Development", "Team Leadership", "Agile Methodologies", "System Architecture", "Code Reviews", "Technical Mentoring"],
      languages: ["English", "Mandarin"],
      certifications: [
        {
          name: "AWS Certified Solutions Architect",
          issuedBy: "Amazon Web Services",
          year: 2020
        },
        {
          name: "Certified Scrum Master",
          issuedBy: "Scrum Alliance",
          year: 2018
        }
      ],
      educationHistory: [
        {
          institution: "MIT",
          degree: "Master of Science in Computer Science",
          graduationYear: 2009
        },
        {
          institution: "UC Berkeley",
          degree: "Bachelor of Science in Computer Engineering",
          graduationYear: 2007
        }
      ],
      performanceRatings: {
        "2022": {
          overall: 4.8,
          leadership: 4.7,
          communication: 4.6,
          technical: 4.9,
          comments: "David is an exceptional technical leader who consistently delivers high-quality solutions and mentors his team effectively."
        },
        "2021": {
          overall: 4.7,
          leadership: 4.6,
          communication: 4.5,
          technical: 4.9,
          comments: "Outstanding technical expertise and strong team leadership."
        }
      }
    });
    
    // Create departments
    const hrDept = await this.createDepartment({
      name: "Human Resources",
      description: "Responsible for all employee-related matters",
      headId: adminUser.id
    });
    
    const designDept = await this.createDepartment({
      name: "Design",
      description: "Handles all design and branding for the company",
      headId: userMark.id
    });
    
    const productDept = await this.createDepartment({
      name: "Product",
      description: "Oversees product development and roadmap",
      headId: userEmma.id
    });
    
    const engineeringDept = await this.createDepartment({
      name: "Engineering",
      description: "Develops and maintains all software and technical infrastructure",
      headId: userDavid.id
    });
    
    // Create holiday requests
    const holidayMark = await this.createHolidayRequest({
      userId: userMark.id,
      startDate: new Date("2023-07-15").toISOString(),
      endDate: new Date("2023-07-28").toISOString(),
      duration: 10,
      reason: "Summer vacation with family"
    });
    await this.updateHolidayRequest(holidayMark.id, "approved", adminUser.id);
    
    const holidaySarah = await this.createHolidayRequest({
      userId: adminUser.id,
      startDate: new Date("2023-08-02").toISOString(),
      endDate: new Date("2023-08-09").toISOString(),
      duration: 5,
      reason: "Personal time off"
    });
    await this.updateHolidayRequest(holidaySarah.id, "approved", adminUser.id);
    
    const holidayEmma = await this.createHolidayRequest({
      userId: userEmma.id,
      startDate: new Date("2023-07-20").toISOString(),
      endDate: new Date("2023-07-21").toISOString(),
      duration: 2,
      reason: "Medical appointment"
    });
    
    // Future holiday requests
    await this.createHolidayRequest({
      userId: adminUser.id,
      startDate: new Date("2023-12-20").toISOString(),
      endDate: new Date("2023-12-31").toISOString(),
      duration: 8,
      reason: "Christmas holiday"
    });
    
    // Pending holiday requests for manager approval
    await this.createHolidayRequest({
      userId: userMark.id,
      startDate: new Date("2023-09-15").toISOString(),
      endDate: new Date("2023-09-22").toISOString(),
      duration: 6,
      reason: "Family wedding"
    });
    
    await this.createHolidayRequest({
      userId: userDavid.id,
      startDate: new Date("2023-10-05").toISOString(),
      endDate: new Date("2023-10-13").toISOString(),
      duration: 7,
      reason: "Annual vacation"
    });
    
    await this.createHolidayRequest({
      userId: userJennifer.id,
      startDate: new Date("2023-09-25").toISOString(),
      endDate: new Date("2023-09-29").toISOString(),
      duration: 5,
      reason: "Conference attendance"
    });
    
    // Create policies
    await this.createPolicy({
      title: "Remote Work Guidelines",
      category: "HR & Employment",
      content: `
        <h2>Remote Work Policy</h2>
        <p>This policy outlines the company's guidelines for remote work arrangements.</p>
        
        <h3>Eligibility</h3>
        <p>Remote work arrangements are available to employees whose job responsibilities can be performed remotely without diminishing individual or team performance.</p>
        
        <h3>Work Hours and Availability</h3>
        <p>Remote employees are expected to be available during standard business hours, generally 9:00 AM to 5:00 PM, Monday through Friday. Any variations must be approved by the employee's manager.</p>
        
        <h3>Communication</h3>
        <p>Employees working remotely must maintain regular communication with their team members and supervisor. They should be reachable via email, phone, or instant messaging during work hours.</p>
        
        <h3>Equipment and Resources</h3>
        <p>The company will provide necessary equipment for remote work, including a laptop computer and necessary software. Employees are responsible for securing a reliable internet connection.</p>
        
        <h3>Security</h3>
        <p>Remote workers must adhere to the company's information security policies. This includes using VPN when accessing company resources, securing their workstation, and safeguarding company data.</p>
      `
    });
    
    await this.createPolicy({
      title: "Anti-Harassment Policy",
      category: "HR & Employment",
      content: `
        <h2>Anti-Harassment Policy</h2>
        <p>The company is committed to providing a work environment free from harassment and discrimination.</p>
        
        <h3>Definition</h3>
        <p>Harassment includes unwelcome conduct based on race, color, religion, sex, national origin, age, disability, or genetic information.</p>
        
        <h3>Reporting</h3>
        <p>Employees who experience or witness harassment should report it immediately to their supervisor, department head, or HR representative.</p>
        
        <h3>Investigation</h3>
        <p>All reports of harassment will be investigated promptly and thoroughly. Confidentiality will be maintained to the extent possible.</p>
        
        <h3>Consequences</h3>
        <p>Employees found to have engaged in harassment will be subject to disciplinary action, up to and including termination of employment.</p>
      `
    });
    
    await this.createPolicy({
      title: "Data Protection Policy",
      category: "IT & Data",
      content: `
        <h2>Data Protection Policy</h2>
        <p>This policy outlines the company's commitment to protecting personal and confidential data.</p>
        
        <h3>Data Collection</h3>
        <p>The company collects only necessary data and informs individuals about the purpose of collection.</p>
        
        <h3>Data Storage</h3>
        <p>Personal data must be stored securely, with appropriate controls to prevent unauthorized access.</p>
        
        <h3>Data Sharing</h3>
        <p>Personal data should not be shared with third parties without explicit consent, unless required by law.</p>
        
        <h3>Data Retention</h3>
        <p>Personal data should be retained only as long as necessary for the purpose it was collected.</p>
        
        <h3>Data Subject Rights</h3>
        <p>Individuals have the right to access, correct, and request deletion of their personal data.</p>
      `
    });
    
    await this.createPolicy({
      title: "Health and Safety Guidelines",
      category: "Health & Safety",
      content: `
        <h2>Health and Safety Guidelines</h2>
        <p>The company is committed to providing a safe and healthy work environment for all employees.</p>
        
        <h3>General Safety</h3>
        <p>Employees must follow all safety procedures and report any unsafe conditions or practices to their supervisor.</p>
        
        <h3>Emergency Procedures</h3>
        <p>Familiarize yourself with emergency exits, assembly points, and procedures for fires, medical emergencies, and other incidents.</p>
        
        <h3>Workplace Ergonomics</h3>
        <p>Employees should maintain proper posture and take regular breaks to prevent repetitive strain injuries.</p>
        
        <h3>Incident Reporting</h3>
        <p>All workplace accidents, injuries, or near misses must be reported immediately to a supervisor or HR representative.</p>
      `
    });
    
    // Create courses
    const securityCourse = await this.createCourse({
      title: "Data Security Basics",
      description: "Learn the fundamentals of data security and protection in a corporate environment",
      category: "IT Security",
      totalModules: 5,
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    });
    
    const leadershipCourse = await this.createCourse({
      title: "Leadership Fundamentals",
      description: "Develop essential leadership skills to effectively manage teams and drive results",
      category: "Leadership",
      totalModules: 8,
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    });
    
    const communicationCourse = await this.createCourse({
      title: "Effective Communication",
      description: "Improve your communication skills to better collaborate with colleagues and clients",
      category: "Soft Skills",
      totalModules: 5,
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    });
    
    // Create modules for courses
    for (let i = 1; i <= 5; i++) {
      await this.createCourseModule({
        courseId: securityCourse.id,
        title: `Module ${i}: ${['Introduction to Data Security', 'Password Management', 'Phishing Awareness', 'Mobile Device Security', 'Data Encryption'][i-1]}`,
        content: `<p>Content for module ${i} of Data Security Basics</p>`,
        order: i
      });
    }
    
    for (let i = 1; i <= 8; i++) {
      await this.createCourseModule({
        courseId: leadershipCourse.id,
        title: `Module ${i}: ${['Leadership Styles', 'Building Effective Teams', 'Conflict Resolution', 'Delegation Skills', 'Performance Management', 'Motivating Your Team', 'Strategic Planning', 'Leading Change'][i-1]}`,
        content: `<p>Content for module ${i} of Leadership Fundamentals</p>`,
        order: i
      });
    }
    
    for (let i = 1; i <= 5; i++) {
      await this.createCourseModule({
        courseId: communicationCourse.id,
        title: `Module ${i}: ${['Fundamentals of Communication', 'Active Listening', 'Non-Verbal Communication', 'Written Communication', 'Presentation Skills'][i-1]}`,
        content: `<p>Content for module ${i} of Effective Communication</p>`,
        order: i
      });
    }
    
    // Create user progress
    // Sarah's progress
    await this.createUserCourseProgress({
      userId: adminUser.id,
      courseId: securityCourse.id,
      completedModules: 5,
      isCompleted: true
    });
    
    await this.createUserCourseProgress({
      userId: adminUser.id,
      courseId: leadershipCourse.id,
      completedModules: 8,
      isCompleted: true
    });
    
    await this.createUserCourseProgress({
      userId: adminUser.id,
      courseId: communicationCourse.id,
      completedModules: 3,
      isCompleted: false
    });
    
    // Mark's progress
    await this.createUserCourseProgress({
      userId: userMark.id,
      courseId: securityCourse.id,
      completedModules: 4,
      isCompleted: false
    });
    
    await this.createUserCourseProgress({
      userId: userMark.id,
      courseId: communicationCourse.id,
      completedModules: 5,
      isCompleted: true
    });
    
    // Emma's progress
    await this.createUserCourseProgress({
      userId: userEmma.id,
      courseId: securityCourse.id,
      completedModules: 5,
      isCompleted: true
    });
    
    await this.createUserCourseProgress({
      userId: userEmma.id,
      courseId: leadershipCourse.id,
      completedModules: 3,
      isCompleted: false
    });
    
    // Create activities
    await this.createActivity({
      userId: adminUser.id,
      type: "course_completion",
      description: "You completed <span class=\"font-medium\">Data Security Basics</span> course",
      metadata: { courseId: securityCourse.id },
      createdAt: new Date("2023-06-21T12:30:00").toISOString()
    });
    
    await this.createActivity({
      userId: adminUser.id,
      type: "holiday_approved",
      description: "Your holiday request was <span class=\"font-medium text-success\">approved</span>",
      metadata: { holidayRequestId: holidaySarah.id },
      createdAt: new Date("2023-06-20T10:15:00").toISOString()
    });
    
    await this.createActivity({
      userId: adminUser.id,
      type: "policy_update",
      description: "New policy update: <span class=\"font-medium\">Remote Work Guidelines</span>",
      metadata: { policyId: 1 },
      createdAt: new Date("2023-06-19T14:45:00").toISOString()
    });
    
    await this.createActivity({
      userId: adminUser.id,
      type: "holiday_request",
      description: "You submitted a holiday request",
      metadata: { holidayRequestId: holidaySarah.id },
      createdAt: new Date("2023-06-18T09:20:00").toISOString()
    });
  }
}

export const storage = new MemStorage();
