import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

// Fetch function (optional)
const fetchData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

export function useUsers() {
  return useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetchData("/api/users"),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => fetchData("/api/dashboard/stats"),
  });
}

export function useHolidaysUpcoming() {
  return useQuery({
    queryKey: ["/api/holiday-requests/upcoming"],
    queryFn: () => fetchData("/api/holiday-requests/upcoming"),
  });
}

export function useHolidayBalance() {
  return useQuery({
    queryKey: ["/api/holiday-requests/balance"],
    queryFn: () => fetchData("/api/holiday-requests/balance"),
  });
}

export function useHolidayRequests() {
  return useQuery({
    queryKey: ["/api/holiday-requests"],
    queryFn: () => fetchData("/api/holiday-requests"),
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ["/api/activities"],
    queryFn: () => fetchData("/api/activities"),
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ["/api/courses"],
    queryFn: () => fetchData("/api/courses"),
  });
}

export function useCoursesCurrent() {
  return useQuery({
    queryKey: ["/api/courses/current"],
    queryFn: () => fetchData("/api/courses/current"),
  });
}

export function useCoursesProgress() {
  return useQuery({
    queryKey: ["/api/courses/progress"],
    queryFn: () => fetchData("/api/courses/progress"),
  });
}

export function useCoursesCategories() {
  return useQuery({
    queryKey: ["/api/courses/categories"],
    queryFn: () => fetchData("/api/courses/categories"),
  });
}

export function useLearningStats() {
  return useQuery({
    queryKey: ["/api/learning/stats"],
    queryFn: () => fetchData("/api/learning/stats"),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["/api/departments"],
    queryFn: () => fetchData("/api/departments"),
  });
}

export function usePolicies() {
  return useQuery({
    queryKey: ["/api/policies"],
    queryFn: () => fetchData("/api/policies"),
  });
}

export function usePolicyCategories() {
  return useQuery({
    queryKey: ["/api/policies/categories"],
    queryFn: () => fetchData("/api/policies/categories"),
  });
}

// If you need user-specific queries
export function useUserData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["/api/users", user?.id],
    queryFn: () => fetchData(`/api/users/${user?.id}`),
    enabled: !!user?.id, // Only fetch if user ID is available
  });
}
