import { User as BaseUser } from "@shared/types";

// Extend the base User type with additional properties if needed
export interface User extends BaseUser {
  // Add any client-specific user properties here
}

// User-related types
export interface Education {
  degree: string;
  institution: string;
  year: string | number;
}

export interface Certification {
  name: string;
  issueDate?: Date;
  expiryDate?: Date;
}

// Type for user profile data
export interface UserProfile extends User {
  bio?: string;
  skills?: string[];
  education?: Education[];
  certifications?: Certification[];
  languages?: string[];
  profileImage?: string;
  dateOfBirth?: Date;
  nationality?: string;
  address?: string;
  emergencyContact?: string;
  employeeId?: string;
  startDate?: Date;
  employmentType?: string;
  workLocation?: string;
  salary?: number;
  bonus?: number;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
}