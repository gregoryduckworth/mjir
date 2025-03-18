import { Router } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  next();
};

// Get all users
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Create new user
router.post("/users", isAdmin, async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const newUser = await storage.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid user data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Update user
router.put("/users/:id", isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userData = insertUserSchema.partial().parse(req.body);
    const updatedUser = await storage.updateUser(userId, userData);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid user data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete user
router.delete("/users/:id", isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { newManagerId } = req.body;

    // If newManagerId is provided, reassign employees before deleting
    if (newManagerId !== undefined) {
      // Get all users who have the deleted user as their manager
      const allUsers = await storage.getAllUsers();
      const subordinates = allUsers.filter((user) => user.managerId === userId);

      // Update each subordinate's managerId
      for (const subordinate of subordinates) {
        await storage.updateUser(subordinate.id, { managerId: newManagerId });
      }
    }

    await storage.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
