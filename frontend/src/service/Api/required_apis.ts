import { apiRequest, ApiMethod, ApiResponse } from "./index";
type LoginEmailPayload = { email: string; password: string };
type LoginPhonePayload = { phone: string; password: string };
type SignupEmailPayload = { name: string; email: string; password: string };
type SignupPhonePayload = { name: string; phone: string; password: string };
type MeetingsListPayload = { page?: number; pageSize?: number; status?: "upcoming" | "completed"; q?: string };
type MeetingsListResponse = { items: Array<{ id: string; title: string; attendee: string; email: string; date: string; time: string; status: "upcoming" | "completed" }>; total: number };
type AvailabilityCreatePayload = { date: string; startTime: string; endTime: string };
type AvailabilityDeletePayload = { id: string };
type LinkGenerateResponse = { link: string };
type BookingCreatePayload = { linkId: string; date: string; time: string; name: string; email: string };
type DashboardStatsResponse = { upcomingMeetings: number; totalBookings: number; hoursScheduled: string; activeLinks: number };
type UserProfileResponse = { id: string; name: string; email: string; phone?: string; address?: string; bio?: string };
type UserProfileUpdatePayload = { name?: string; phone?: string; address?: string; bio?: string };
type ApiSpec<P = unknown, R = unknown> = { key: string; route: string; method: ApiMethod; requiresAuth: boolean };
const specs = {
  loginEmail: { key: "loginEmail", route: "/auth/login-email", method: "POST", requiresAuth: false } as ApiSpec<LoginEmailPayload, { token: string }>,
  loginPhone: { key: "loginPhone", route: "/auth/login-phone", method: "POST", requiresAuth: false } as ApiSpec<LoginPhonePayload, { token: string }>,
  signupEmail: { key: "signupEmail", route: "/auth/signup-email", method: "POST", requiresAuth: false } as ApiSpec<SignupEmailPayload, { token: string }>,
  signupPhone: { key: "signupPhone", route: "/auth/signup-phone", method: "POST", requiresAuth: false } as ApiSpec<SignupPhonePayload, { token: string }>,
  getProfile: { key: "getProfile", route: "/auth/me", method: "GET", requiresAuth: true } as ApiSpec<unknown, UserProfileResponse>,
  updateProfile: { key: "updateProfile", route: "/auth/me", method: "PATCH", requiresAuth: true } as ApiSpec<UserProfileUpdatePayload, UserProfileResponse>,
  meetingsList: { key: "meetingsList", route: "/meetings", method: "GET", requiresAuth: true } as ApiSpec<MeetingsListPayload, MeetingsListResponse>,
  meetingDelete: { key: "meetingDelete", route: "/meetings/:id", method: "DELETE", requiresAuth: true } as ApiSpec<{ id: string }, { id: string }>,
  availabilityCreate: { key: "availabilityCreate", route: "/availability", method: "POST", requiresAuth: true } as ApiSpec<AvailabilityCreatePayload, { id: string }>,
  availabilityList: { key: "availabilityList", route: "/availability", method: "GET", requiresAuth: true } as ApiSpec<unknown, { id: string; date: string; start_time: string; end_time: string }[]>,
  availabilityDelete: { key: "availabilityDelete", route: "/availability/:id", method: "DELETE", requiresAuth: true } as ApiSpec<AvailabilityDeletePayload, { id: string }>,
  linkGenerate: { key: "linkGenerate", route: "/links/generate", method: "POST", requiresAuth: true } as ApiSpec<unknown, LinkGenerateResponse>,
  linksList: { key: "linksList", route: "/links", method: "GET", requiresAuth: true } as ApiSpec<unknown, { id: string; link_id: string; link: string }[]>,
  bookingCreate: { key: "bookingCreate", route: "/bookings", method: "POST", requiresAuth: false } as ApiSpec<BookingCreatePayload, { id: string }>,
  availableSlots: { key: "availableSlots", route: "/bookings/available/:id", method: "GET", requiresAuth: false } as ApiSpec<{ id: string; date: string }, string[]>,
  linkDelete: { key: "linkDelete", route: "/links/:id", method: "DELETE", requiresAuth: true } as ApiSpec<{ id: string }, { id: string }>,
  dashboardStats: { key: "dashboardStats", route: "/dashboard/stats", method: "GET", requiresAuth: true } as ApiSpec<unknown, DashboardStatsResponse>,
};
function withAuth(init?: RequestInit): RequestInit {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(init?.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}
export async function callRequiredApi<K extends keyof typeof specs, P = unknown, R = unknown>(
  key: K,
  payload?: P,
): Promise<ApiResponse<R>> {
  const spec = specs[key] as ApiSpec<P, R>;
  const route = spec.route.includes(":id") && payload && typeof payload === "object"
    ? spec.route.replace(":id", String((payload as Record<string, unknown>).id))
    : spec.route;
  const init = spec.requiresAuth ? withAuth() : undefined;
  return apiRequest<R>(route, spec.method, payload, init);
}
export { specs as requiredApisSpecs };
