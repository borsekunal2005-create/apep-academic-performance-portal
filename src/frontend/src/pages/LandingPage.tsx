import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useStudentNotices } from "../hooks/useQueries";

const roleCards = [
  {
    role: "student",
    label: "Student Login",
    icon: GraduationCap,
    description:
      "View attendance, marks, assignments, and notices for your enrolled subjects",
    color: "oklch(0.5 0.15 240)",
    bgColor: "oklch(0.5 0.15 240 / 0.08)",
    borderColor: "oklch(0.5 0.15 240 / 0.25)",
    hoverBg: "oklch(0.5 0.15 240 / 0.12)",
  },
  {
    role: "teacher",
    label: "Teacher Login",
    icon: BookOpen,
    description:
      "Manage attendance, marks, assignments, and communicate with your students",
    color: "oklch(0.45 0.14 155)",
    bgColor: "oklch(0.45 0.14 155 / 0.08)",
    borderColor: "oklch(0.45 0.14 155 / 0.25)",
    hoverBg: "oklch(0.45 0.14 155 / 0.12)",
  },
  {
    role: "hod",
    label: "HOD Login",
    icon: Users,
    description:
      "Monitor department performance, attendance reports, and post official notices",
    color: "oklch(0.42 0.16 295)",
    bgColor: "oklch(0.42 0.16 295 / 0.08)",
    borderColor: "oklch(0.42 0.16 295 / 0.25)",
    hoverBg: "oklch(0.42 0.16 295 / 0.12)",
  },
  {
    role: "admin",
    label: "Admin Login",
    icon: Shield,
    description:
      "Manage all user accounts, subjects, system configuration, and data backups",
    color: "oklch(0.55 0.19 45)",
    bgColor: "oklch(0.55 0.19 45 / 0.08)",
    borderColor: "oklch(0.55 0.19 45 / 0.25)",
    hoverBg: "oklch(0.55 0.19 45 / 0.12)",
  },
];

const features = [
  {
    icon: BarChart3,
    label: "Performance Analytics",
    desc: "Real-time subject-wise performance statistics",
  },
  {
    icon: Bell,
    label: "Smart Notifications",
    desc: "Instant alerts for marks, attendance, and notices",
  },
  {
    icon: CheckCircle2,
    label: "Digital Evaluation",
    desc: "Paperless answer sheets and recheck requests",
  },
  {
    icon: Shield,
    label: "Role-Based Access",
    desc: "Strict data privacy with role-level permissions",
  },
];

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LandingPage() {
  const [initLoading, setInitLoading] = useState(false);
  const { data: notices, isLoading: noticesLoading } = useStudentNotices();
  const { actor } = useActor();

  const handleInitialize = async () => {
    if (!actor) {
      toast.error("Please connect your identity first to initialize demo data");
      return;
    }
    setInitLoading(true);
    try {
      await actor.initializeSampleData();
      toast.success(
        "Demo data initialized! You can now log in with your Internet Identity.",
      );
    } catch {
      toast.error(
        "Failed to initialize demo data. You may need to log in first.",
      );
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/apep-logo-transparent.dim_200x200.png"
              alt="APEP"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="font-display font-bold text-navy-800 text-lg leading-none">
                APEP
              </h1>
              <p className="text-muted-foreground text-xs">Academic Portal</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </a>
            <a
              href="#notices"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Notices
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleInitialize}
              disabled={initLoading}
              className="gap-1.5 text-xs"
            >
              {initLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <BarChart3 size={14} />
              )}
              {initLoading ? "Initializing..." : "Load Demo Data"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-hero-gradient bg-pattern relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full border border-gold/30" />
          <div className="absolute top-32 right-40 w-40 h-40 rounded-full border border-gold/20" />
          <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full border border-white/10" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 bg-gold/15 text-gold border-gold/30 font-semibold">
              Digital Academic Platform
            </Badge>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Academic Performance <span className="text-gold">Evaluation</span>{" "}
              Portal
            </h1>
            <p className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
              A centralized academic management system for students, teachers,
              HOD, and administrators. Transparent. Organized. Paperless.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#login">
                <Button
                  size="lg"
                  className="bg-gold text-navy-900 hover:bg-gold/90 font-semibold gap-2"
                >
                  Get Started <ArrowRight size={18} />
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                onClick={handleInitialize}
                disabled={initLoading}
              >
                {initLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                Load Demo Data
              </Button>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex flex-wrap gap-8"
          >
            {[
              { label: "Student Profiles", value: "500+" },
              { label: "Subject Tracking", value: "Real-time" },
              { label: "Role Access Levels", value: "4" },
              { label: "Data Privacy", value: "100%" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-gold font-display font-bold text-2xl">
                  {stat.value}
                </p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-foreground mb-3">
              Everything in One Place
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Replace registers, notice boards, and scattered communication with
              a single organized portal
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 border-border">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-2">
                        {f.label}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {f.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Login Cards */}
      <section id="login" className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-foreground mb-3">
              Choose Your Role
            </h2>
            <p className="text-muted-foreground text-lg">
              Select your role to access your personalized dashboard
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.role}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to="/login/$role" params={{ role: card.role }}>
                    <Card
                      className="cursor-pointer transition-all duration-200 hover:shadow-card-hover border-2 h-full"
                      style={{
                        background: card.bgColor,
                        borderColor: card.borderColor,
                      }}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{
                            background: `${card.color}20`,
                            border: `2px solid ${card.color}30`,
                          }}
                        >
                          <Icon
                            className="w-8 h-8"
                            style={{ color: card.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-foreground mb-2">
                            {card.label}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                        <Button
                          className="w-full mt-auto font-semibold"
                          style={{ background: card.color, color: "white" }}
                        >
                          Login <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notices */}
      <section id="notices" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground">
                Recent Announcements
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Latest notices from the department
              </p>
            </div>
            <Bell className="text-muted-foreground" size={20} />
          </div>

          {noticesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : notices && notices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notices.slice(0, 6).map((notice) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="shadow-card border-border h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell size={14} className="text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground text-sm mb-1 truncate">
                            {notice.title}
                          </h3>
                          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                            {notice.content}
                          </p>
                          <p className="text-muted-foreground/60 text-xs mt-2">
                            {formatDate(notice.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border">
              <CardContent className="py-12 text-center">
                <Bell
                  size={32}
                  className="text-muted-foreground/30 mx-auto mb-3"
                />
                <p className="text-muted-foreground text-sm">
                  No announcements yet.
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Click "Load Demo Data" to populate with sample notices.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/assets/generated/apep-logo-transparent.dim_200x200.png"
                  alt="APEP"
                  className="w-8 h-8 object-contain"
                />
                <span className="font-display font-bold text-white text-lg">
                  APEP
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Academic Performance Evaluation Portal — a centralized platform
                for digital academic management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Department</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Building size={14} />
                  <span>Computer Science Department</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Mail size={14} />
                  <span>academics@college.edu</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Phone size={14} />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Quick Access</h4>
              <div className="space-y-2">
                {roleCards.map((card) => (
                  <Link
                    key={card.role}
                    to="/login/$role"
                    params={{ role: card.role }}
                    className="block text-white/50 hover:text-white text-sm transition-colors capitalize"
                  >
                    {card.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
            <p className="text-white/20 text-xs">Academic Portal v1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
