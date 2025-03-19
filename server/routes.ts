import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  isAuthenticated,
  isAdminOrHrManagerOrManager,
} from "./middleware/auth";
import { insertHolidayRequestSchema, insertPolicySchema } from "@shared/schema";
import adminRouter from "./routes/admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Setup admin routes
  app.use("/api/admin", adminRouter);

  // Get users
  app.get("/api/users", isAuthenticated, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    const user = req.user;

    // Get holiday stats
    const holidayRequests = await storage.getHolidayRequestsByUserId(user.id);
    const pendingRequests = holidayRequests.filter(
      (r) => r.status === "pending"
    ).length;
    const holidayBalance = 25; // This would come from a more complex calculation in a real system
    const accrued = 2; // Monthly accrual example
    const awaitingApproval = 1;

    // Get learning stats
    const userProgress = await storage.getUserCourseProgressByUserId(user.id);
    const courses = await storage.getAllCourses();
    const completedCount = userProgress.filter((p) => p.isCompleted).length;
    const inProgressCount = userProgress.filter((p) => !p.isCompleted).length;
    const learningCompletion =
      courses.length > 0
        ? Math.round((completedCount / courses.length) * 100)
        : 0;
    const learningImprovement = 12; // Example improvement rate

    // Get team availability
    const allUsers = await storage.getAllUsers();
    const departmentUsers = allUsers.filter(
      (u) => u.department === user.department
    );
    const departmentHolidays = await Promise.all(
      departmentUsers.map((u) => storage.getHolidayRequestsByUserId(u.id))
    );
    const onHoliday = departmentHolidays
      .flat()
      .filter(
        (h) =>
          h.status === "approved" &&
          new Date(h.startDate) <= new Date() &&
          new Date(h.endDate) >= new Date()
      ).length;

    const teamAvailability =
      departmentUsers.length > 0
        ? Math.round(
            ((departmentUsers.length - onHoliday) / departmentUsers.length) *
              100
          )
        : 100;
    const availabilityChange = -10; // Example availability change

    res.json({
      holidayBalance,
      accrued,
      pendingRequests,
      awaitingApproval,
      learningCompletion,
      learningImprovement,
      teamAvailability,
      availabilityChange,
    });
  });

  // Holiday Requests
  app.get("/api/holiday-requests", isAuthenticated, async (req, res) => {
    // If user is an admin, HR manager, or manager, return all requests
    // Otherwise only return the user's own requests
    const user = req.user;
    let requests;

    if (
      user.role === "admin" ||
      user.role === "hr_manager" ||
      user.role === "manager"
    ) {
      requests = await storage.getAllHolidayRequests();
    } else {
      requests = await storage.getHolidayRequestsByUserId(user.id);
    }

    // Get user information for each request
    const users = await storage.getAllUsers();
    const requestsWithUserInfo = requests.map((request) => {
      const requestUser = users.find((u) => u.id === request.userId);
      return {
        ...request,
        user: requestUser
          ? {
              id: requestUser.id,
              firstName: requestUser.firstName,
              lastName: requestUser.lastName,
              department: requestUser.department,
              position: requestUser.position,
              profileImage: requestUser.profileImage,
            }
          : null,
      };
    });

    res.json(requestsWithUserInfo);
  });

  app.get(
    "/api/holiday-requests/upcoming",
    isAuthenticated,
    async (req, res) => {
      const allRequests = await storage.getAllHolidayRequests();
      const upcomingRequests = allRequests
        .filter(
          (r) => r.status !== "rejected" && new Date(r.startDate) >= new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
        .slice(0, 5);

      res.json(upcomingRequests);
    }
  );

  app.get(
    "/api/holiday-requests/balance",
    isAuthenticated,
    async (req, res) => {
      const user = req.user;
      const requests = await storage.getHolidayRequestsByUserId(user.id);
      const approvedRequests = requests.filter((r) => r.status === "approved");
      const totalUsed = approvedRequests.reduce(
        (acc, req) => acc + req.duration,
        0
      );
      const allowance = 25; // Annual allowance example

      res.json({
        allowance,
        used: totalUsed,
        remaining: allowance - totalUsed,
      });
    }
  );

  app.post("/api/holiday-requests", isAuthenticated, async (req, res) => {
    try {
      let { startDate, endDate, ...rest } = req.body;

      startDate = new Date(startDate);
      endDate = new Date(endDate);

      const data = insertHolidayRequestSchema.parse({
        startDate,
        endDate,
        ...rest,
      });

      const holidayRequest = await storage.createHolidayRequest({
        ...data,
        userId: req.user.id,
      });

      // Create activity for this request
      await storage.createActivity({
        userId: req.user.id,
        type: "holiday_request",
        description: "You submitted a holiday request",
        metadata: { holidayRequestId: holidayRequest.id },
      });

      // Create notifications for managers
      await createHolidayRequestNotification(holidayRequest, req.user.id);

      res.status(201).json(holidayRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create holiday request" });
    }
  });

  // Holiday requests for manager approval
  app.get(
    "/api/holiday-requests/pending",
    isAdminOrHrManagerOrManager,
    async (req, res) => {
      const allRequests = await storage.getAllHolidayRequests();
      const pendingRequests = allRequests.filter((r) => r.status === "pending");

      // Get user information for each request
      const users = await storage.getAllUsers();
      const pendingRequestsWithUserInfo = pendingRequests.map((request) => {
        const requestUser = users.find((u) => u.id === request.userId);
        return {
          ...request,
          user: requestUser
            ? {
                id: requestUser.id,
                firstName: requestUser.firstName,
                lastName: requestUser.lastName,
                department: requestUser.department,
                position: requestUser.position,
                profileImage: requestUser.profileImage,
              }
            : null,
        };
      });

      res.json(pendingRequestsWithUserInfo);
    }
  );

  // Approve or reject holiday request
  app.patch(
    "/api/holiday-requests/:id/status",
    isAuthenticated,
    async (req, res) => {
      const user = req.user;
      // Check if user is authorized to change status (admin, HR manager, or manager)
      if (
        user.role !== "admin" &&
        user.role !== "hr_manager" &&
        user.role !== "manager"
      ) {
        return res
          .status(403)
          .send("Forbidden: Only managers can approve holiday requests");
      }

      const requestId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || (status !== "approved" && status !== "rejected")) {
        return res
          .status(400)
          .json({ error: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      try {
        // Get the original request
        const originalRequest = await storage.getHolidayRequest(requestId);
        if (!originalRequest) {
          return res.status(404).json({ error: "Holiday request not found" });
        }

        // Update the request status
        const updatedRequest = await storage.updateHolidayRequest(
          requestId,
          status,
          user.id
        );

        // Create activity for the employee who requested the holiday
        await storage.createActivity({
          userId: originalRequest.userId,
          type: "holiday_" + status,
          description: `Your holiday request was <span class="font-medium ${
            status === "approved" ? "text-success" : "text-destructive"
          }">${status}</span>`,
          metadata: { holidayRequestId: requestId },
        });

        // Create notification for employee
        await createHolidayStatusNotification(
          updatedRequest,
          status,
          originalRequest.userId,
          user.id
        );

        res.json(updatedRequest);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "Failed to update holiday request status" });
      }
    }
  );

  // Policies
  app.get("/api/policies", isAuthenticated, async (req, res) => {
    const policies = await storage.getAllPolicies();
    res.json(policies);
  });

  app.get("/api/policies/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const policies = await storage.getAllPolicies();
    const categories = [...new Set(policies.map((p) => p.category))];
    res.json(categories);
  });

  app.post("/api/policies", isAuthenticated, async (req, res) => {
    // Check if user is an HR admin or HR manager
    if (
      req.user.role !== "admin" &&
      req.user.role !== "hr_manager" &&
      !(
        req.user.department === "Human Resources" &&
        req.user.position === "HR Manager"
      )
    ) {
      return res
        .status(403)
        .send("Forbidden: Only HR personnel can create policies");
    }

    try {
      const data = insertPolicySchema.parse(req.body);
      const policy = await storage.createPolicy(data);

      // Create activity for this policy update
      await storage.createActivity({
        userId: req.user.id,
        type: "policy_update",
        description: `New policy update: <span class="font-medium">${policy.title}</span>`,
        metadata: { policyId: policy.id },
      });

      res.status(201).json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create policy" });
    }
  });

  // Learning & Development
  app.get("/api/courses", isAuthenticated, async (req, res) => {
    const courses = await storage.getAllCourses();
    res.json(courses);
  });

  app.get("/api/courses/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const courses = await storage.getAllCourses();
    const categories = [...new Set(courses.map((c) => c.category))];
    res.json(categories);
  });

  app.get("/api/courses/:id/modules", isAuthenticated, async (req, res) => {
    const courseId = parseInt(req.params.id);
    const modules = await storage.getCourseModulesByCourseId(courseId);
    res.json(modules);
  });

  app.get("/api/courses/progress", isAuthenticated, async (req, res) => {
    const progress = await storage.getUserCourseProgressByUserId(req.user.id);
    res.json(progress);
  });

  app.get("/api/courses/current", isAuthenticated, async (req, res) => {
    const courses = await storage.getAllCourses();
    const progress = await storage.getUserCourseProgressByUserId(req.user.id);

    const currentCourses = progress
      .filter((p) => !p.isCompleted)
      .slice(0, 3)
      .map((p) => {
        const course = courses.find((c) => c.id === p.courseId);
        return {
          course,
          progress: p,
        };
      });

    res.json(currentCourses);
  });

  app.get("/api/learning/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const courses = await storage.getAllCourses();
    const progress = await storage.getUserCourseProgressByUserId(req.user.id);

    const completedCourses = progress.filter((p) => p.isCompleted).length;
    const inProgressCourses = progress.filter((p) => !p.isCompleted).length;
    const totalCourses = courses.length;
    const totalCompletionRate =
      totalCourses > 0
        ? Math.round((completedCourses / totalCourses) * 100)
        : 0;

    // Calculate completion by category
    const completedByCategory: Record<
      string,
      { completed: number; total: number }
    > = {};

    courses.forEach((course) => {
      if (!completedByCategory[course.category]) {
        completedByCategory[course.category] = { completed: 0, total: 0 };
      }

      completedByCategory[course.category].total += 1;

      const isCompleted = progress.some(
        (p) => p.courseId === course.id && p.isCompleted
      );
      if (isCompleted) {
        completedByCategory[course.category].completed += 1;
      }
    });

    // Find most active category
    let mostActiveCategory = "None";
    let highestActivity = 0;

    Object.entries(completedByCategory).forEach(([category, data]) => {
      const activityRate = data.total > 0 ? data.completed / data.total : 0;
      if (activityRate > highestActivity) {
        highestActivity = activityRate;
        mostActiveCategory = category;
      }
    });

    res.json({
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalCompletionRate,
      completedByCategory,
      mostActiveCategory,
    });
  });

  // Organization
  app.get("/api/departments", isAuthenticated, async (req, res) => {
    const departments = await storage.getAllDepartments();
    res.json(departments);
  });

  // Activities
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    const activities = await storage.getActivitiesByUserId(req.user.id);
    const recentActivities = activities
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 4);

    res.json(recentActivities);
  });

  // Notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    const notifications = await storage.getNotificationsByUserId(req.user.id);
    res.json(notifications);
  });

  app.get("/api/notifications/unread", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const notifications = await storage.getUnreadNotificationsByUserId(
      req.user.id
    );
    res.json(notifications);
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const notificationId = parseInt(req.params.id);

    try {
      const notification = await storage.getNotification(notificationId);

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      // Make sure users can only mark their own notifications as read
      if (notification.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You can only mark your own notifications as read" });
      }

      const updatedNotification = await storage.markNotificationAsRead(
        notificationId
      );
      res.json(updatedNotification);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to mark all notifications as read" });
    }
  });

  // Update the holiday request and approval endpoints to create notifications
  const createHolidayRequestNotification = async (holidayRequest, userId) => {
    const users = await storage.getAllUsers();
    const requester = users.find((u) => u.id === userId);
    const requesterName = requester
      ? `${requester.firstName} ${requester.lastName}`
      : "An employee";
    const managers = users.filter(
      (u) =>
        u.role === "manager" || u.role === "hr_manager" || u.role === "admin"
    );

    // Create notification for each manager
    for (const manager of managers) {
      if (manager.id !== userId) {
        // Don't notify the requester
        await storage.createNotification({
          userId: manager.id,
          title: "New Holiday Request",
          message: `${requesterName} has submitted a holiday request`,
          type: "holiday",
          isRead: false,
          link: "/holiday",
          metadata: { holidayRequestId: holidayRequest.id },
        });
      }
    }
  };

  const createHolidayStatusNotification = async (
    holidayRequest,
    status,
    employeeId,
    approverId
  ) => {
    const users = await storage.getAllUsers();
    const approver = users.find((u) => u.id === approverId);
    const approverName = approver
      ? `${approver.firstName} ${approver.lastName}`
      : "A manager";

    await storage.createNotification({
      userId: employeeId,
      title: "Holiday Request Status",
      message: `Your holiday request has been ${status} by ${approverName}`,
      type: status === "approved" ? "success" : "error",
      isRead: false,
      link: "/holiday",
      metadata: { holidayRequestId: holidayRequest.id },
    });
  };

  const httpServer = createServer(app);
  return httpServer;
}
