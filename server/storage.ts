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
  
  private userIdCounter: number;
  private holidayRequestIdCounter: number;
  private policyIdCounter: number;
  private courseIdCounter: number;
  private moduleIdCounter: number;
  private progressIdCounter: number;
  private departmentIdCounter: number;
  private activityIdCounter: number;
  
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
    
    this.userIdCounter = 1;
    this.holidayRequestIdCounter = 1;
    this.policyIdCounter = 1;
    this.courseIdCounter = 1;
    this.moduleIdCounter = 1;
    this.progressIdCounter = 1;
    this.departmentIdCounter = 1;
    this.activityIdCounter = 1;
    
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
      position: "HR Manager",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      managerId: undefined
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
      managerId: adminUser.id
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
      managerId: adminUser.id
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
