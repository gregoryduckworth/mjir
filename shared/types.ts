import { z } from "zod";
import { 
  users, insertUserSchema,
  holidayRequests, insertHolidayRequestSchema,
  policies, insertPolicySchema,
  courses, insertCourseSchema,
  courseModules, insertCourseModuleSchema,
  userCourseProgress, insertUserCourseProgressSchema,
  departments, insertDepartmentSchema,
  activities, insertActivitySchema,
  notifications, insertNotificationSchema
} from "./schema";

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