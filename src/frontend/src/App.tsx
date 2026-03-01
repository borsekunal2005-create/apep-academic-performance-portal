import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HODDashboard from "./pages/hod/HODDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSubjectDetail from "./pages/student/StudentSubjectDetail";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherSubjectManagement from "./pages/teacher/TeacherSubjectManagement";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/$role",
  component: LoginPage,
});

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student",
  component: StudentDashboard,
});

const studentSubjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/subject/$id",
  component: StudentSubjectDetail,
});

const teacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teacher",
  component: TeacherDashboard,
});

const teacherSubjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teacher/subject/$id",
  component: TeacherSubjectManagement,
});

const hodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hod",
  component: HODDashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  studentRoute,
  studentSubjectRoute,
  teacherRoute,
  teacherSubjectRoute,
  hodRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
