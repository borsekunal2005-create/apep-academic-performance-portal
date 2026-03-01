import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams, useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Loader2,
  LogIn,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { APEPRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

const roleConfig = {
  student: {
    label: "Student",
    icon: GraduationCap,
    color: "oklch(0.5 0.15 240)",
    bgColor: "oklch(0.5 0.15 240 / 0.08)",
    borderColor: "oklch(0.5 0.15 240 / 0.3)",
    redirectTo: "/student",
    description:
      "Access your academic records, attendance, assignments, and subject materials",
  },
  teacher: {
    label: "Teacher",
    icon: BookOpen,
    color: "oklch(0.45 0.14 155)",
    bgColor: "oklch(0.45 0.14 155 / 0.08)",
    borderColor: "oklch(0.45 0.14 155 / 0.3)",
    redirectTo: "/teacher",
    description:
      "Manage your subjects, students, attendance records, and academic content",
  },
  hod: {
    label: "Head of Department",
    icon: Users,
    color: "oklch(0.42 0.16 295)",
    bgColor: "oklch(0.42 0.16 295 / 0.08)",
    borderColor: "oklch(0.42 0.16 295 / 0.3)",
    redirectTo: "/hod",
    description:
      "Monitor department performance, teachers, students, and post official notices",
  },
  admin: {
    label: "Administrator",
    icon: Shield,
    color: "oklch(0.55 0.19 45)",
    bgColor: "oklch(0.55 0.19 45 / 0.08)",
    borderColor: "oklch(0.55 0.19 45 / 0.3)",
    redirectTo: "/admin",
    description:
      "Full system access — manage accounts, subjects, configurations, and data",
  },
};

export default function LoginPage() {
  const params = useParams({ from: "/login/$role" });
  const role = params.role as keyof typeof roleConfig;
  const router = useRouter();

  const { login, isLoggingIn, isLoginSuccess, identity, isInitializing } =
    useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();

  const config = roleConfig[role] || roleConfig.student;
  const Icon = config.icon;

  useEffect(() => {
    if (isLoginSuccess && profile && !profileLoading) {
      const userRole = profile.role;
      let targetPath = "/";
      if (userRole === APEPRole.student) targetPath = "/student";
      else if (userRole === APEPRole.teacher) targetPath = "/teacher";
      else if (userRole === APEPRole.hod) targetPath = "/hod";
      else if (userRole === APEPRole.admin) targetPath = "/admin";

      if (config.redirectTo !== targetPath && userRole) {
        toast.error(
          `You are registered as a ${userRole}. Redirecting to your dashboard.`,
        );
      }

      void router.navigate({ to: targetPath as "/" });
    }
  }, [isLoginSuccess, profile, profileLoading, config.redirectTo, router]);

  // If already authenticated and profile loaded, redirect
  useEffect(() => {
    if (identity && profile && !profileLoading) {
      const userRole = profile.role;
      let targetPath = "/";
      if (userRole === APEPRole.student) targetPath = "/student";
      else if (userRole === APEPRole.teacher) targetPath = "/teacher";
      else if (userRole === APEPRole.hod) targetPath = "/hod";
      else if (userRole === APEPRole.admin) targetPath = "/admin";
      void router.navigate({ to: targetPath as "/" });
    }
  }, [identity, profile, profileLoading, router]);

  const isLoading =
    isLoggingIn || (isLoginSuccess && profileLoading) || isInitializing;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <img
              src="/assets/generated/apep-logo-transparent.dim_200x200.png"
              alt="APEP"
              className="w-8 h-8 object-contain"
            />
            <span className="font-display font-bold text-foreground">APEP</span>
          </div>
        </div>
      </header>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Role icon */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: config.bgColor,
                border: `2px solid ${config.borderColor}`,
              }}
            >
              <Icon className="w-10 h-10" style={{ color: config.color }} />
            </div>
            <h1 className="font-display font-bold text-3xl text-foreground mb-2">
              {config.label} Login
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              {config.description}
            </p>
          </div>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display">
                Sign in with Internet Identity
              </CardTitle>
              <CardDescription className="text-sm">
                Use your Internet Identity to securely authenticate and access
                your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-secondary/50 border-border">
                <AlertDescription className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> After
                  logging in, you'll be redirected to your dashboard based on
                  your registered role. Use "Load Demo Data" on the home page
                  first to create sample accounts.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full font-semibold gap-2 py-5"
                style={{ background: config.color }}
                onClick={login}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isLoggingIn
                      ? "Opening Internet Identity..."
                      : "Loading profile..."}
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Login as {config.label}
                  </>
                )}
              </Button>

              {isInitializing && (
                <p className="text-xs text-center text-muted-foreground">
                  Initializing authentication...
                </p>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Wrong role?{" "}
            {Object.entries(roleConfig)
              .filter(([r]) => r !== role)
              .map(([r, c], i, arr) => (
                <span key={r}>
                  <Link
                    to="/login/$role"
                    params={{ role: r }}
                    className="underline hover:text-foreground transition-colors"
                  >
                    {c.label}
                  </Link>
                  {i < arr.length - 1 ? " · " : ""}
                </span>
              ))}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
