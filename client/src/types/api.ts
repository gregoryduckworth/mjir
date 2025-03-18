import {
  User,
  HolidayRequest,
  Course,
  CourseModule,
  UserCourseProgress,
  Department,
  Policy,
  Activity,
  Notification,
} from "@shared/types";

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalEmployees: number;
  pendingHolidays: number;
  upcomingBirthdays: number;
  activeCourses: number;
}

// Holiday related types
export interface HolidayBalance {
  total: number;
  used: number;
  remaining: number;
  pending: number;
}

// Learning related types
export interface LearningStats {
  completedCourses: number;
  inProgressCourses: number;
  totalHoursLearning: number;
  certificationsEarned: number;
}

// Re-export the shared types for convenience
export type {
  User,
  HolidayRequest,
  Course,
  CourseModule,
  UserCourseProgress,
  Department,
  Policy,
  Activity,
  Notification,
};
