import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"),
  department: text("department").notNull(),
  position: text("position").notNull(),
  profileImage: text("profile_image"),
  managerId: integer("manager_id"),
  
  // Personal details
  dateOfBirth: date("date_of_birth"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  nationality: text("nationality"),
  maritalStatus: text("marital_status"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
  
  // Employment details
  employeeId: text("employee_id"),
  hireDate: date("hire_date"),
  contractType: text("contract_type"), // full-time, part-time, contractor
  workSchedule: text("work_schedule"), // e.g., "9-5, Mon-Fri", "Flexible", etc.
  workLocation: text("work_location"), // office, remote, hybrid
  
  // Salary and benefits
  salary: integer("salary"),
  salaryFrequency: text("salary_frequency"), // annual, monthly, hourly
  benefits: json("benefits"), // health insurance, retirement plans, etc.
  bankAccountNumber: text("bank_account_number"),
  bankName: text("bank_name"),
  taxId: text("tax_id"),
  
  // Skills and attributes
  skills: text("skills").array(),
  languages: text("languages").array(),
  certifications: json("certifications"),
  educationHistory: json("education_history"),
  performanceRatings: json("performance_ratings"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  department: true,
  position: true,
  profileImage: true,
  managerId: true,
  // Personal details
  dateOfBirth: true,
  phoneNumber: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  nationality: true,
  maritalStatus: true,
  // Employment details
  employeeId: true,
  hireDate: true,
  contractType: true,
  workSchedule: true,
  workLocation: true,
  // Salary information
  salary: true,
  salaryFrequency: true,
});

// Holiday request schema
export const holidayRequests = pgTable("holiday_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("pending"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  approvedById: integer("approved_by_id"),
});

export const insertHolidayRequestSchema = createInsertSchema(holidayRequests).pick({
  userId: true,
  startDate: true,
  endDate: true,
  duration: true,
  reason: true,
});

// Policies schema
export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policies).pick({
  title: true,
  category: true,
  content: true,
});

// Learning courses schema
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  totalModules: integer("total_modules").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  category: true,
  totalModules: true,
  imageUrl: true,
});

// Course modules schema
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).pick({
  courseId: true,
  title: true,
  content: true,
  order: true,
});

// User course progress schema
export const userCourseProgress = pgTable("user_course_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  completedModules: integer("completed_modules").notNull().default(0),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  isCompleted: boolean("is_completed").default(false),
});

export const insertUserCourseProgressSchema = createInsertSchema(userCourseProgress).pick({
  userId: true,
  courseId: true,
  completedModules: true,
  isCompleted: true,
});

// Department schema
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  headId: integer("head_id"),
});

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  description: true,
  headId: true,
});

// Activities schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true,
  metadata: true,
});

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, success, warning, error, holiday, etc.
  isRead: boolean("is_read").default(false),
  link: text("link"), // Optional link to navigate when clicking the notification
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata"), // Optional additional data
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  link: true,
  metadata: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type HolidayRequest = typeof holidayRequests.$inferSelect;
export type InsertHolidayRequest = z.infer<typeof insertHolidayRequestSchema>;

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;

export type UserCourseProgress = typeof userCourseProgress.$inferSelect;
export type InsertUserCourseProgress = z.infer<typeof insertUserCourseProgressSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
