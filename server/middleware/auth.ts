import { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface User extends User {}
  }
}

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

/**
 * Middleware factory to check if user has required role(s)
 * @param roles A single role or array of roles that are authorized
 * @returns Express middleware function
 */
export const hasRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

// Pre-defined role middleware for common use cases

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = hasRole("admin");

/**
 * Middleware to check if user has HR manager role
 */
export const isHrManager = hasRole("hr_manager");

/**
 * Middleware to check if user has manager role
 */
export const isManager = hasRole("manager");

/**
 * Middleware to check if user has admin or HR manager role
 */
export const isAdminOrHrManager = hasRole(["admin", "hr_manager"]);

/**
 * Middleware to check if user has admin, HR manager, or manager role
 */
export const isAdminOrHrManagerOrManager = hasRole([
  "admin",
  "hr_manager",
  "manager",
]);
