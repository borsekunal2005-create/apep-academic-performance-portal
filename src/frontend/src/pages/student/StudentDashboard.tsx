import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import DashboardLayout from "../../components/shared/DashboardLayout";
import {
  useCallerProfile,
  useStudentAttendance,
  useStudentNotices,
  useStudentSubjects,
} from "../../hooks/useQueries";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", tab: "overview" },
  { icon: BookOpen, label: "My Subjects", tab: "subjects" },
  { icon: Bell, label: "Notices", tab: "notices" },
];

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AttendanceBadge({ subjectId }: { subjectId: string }) {
  const { data: attendance } = useStudentAttendance(subjectId);
  if (!attendance) return null;
  const total = attendance.length;
  const present = attendance.filter(
    (a) => a.status === "present" || a.status === "late",
  ).length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        pct >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {pct}% Attendance
    </span>
  );
}

function SubjectCard({
  subject,
}: {
  subject: {
    id: string;
    name: string;
    code: string;
    semester: bigint;
    section: string;
  };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to="/student/subject/$id" params={{ id: subject.id }}>
        <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 border-border cursor-pointer group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "oklch(0.5 0.15 240 / 0.12)",
                  border: "1px solid oklch(0.5 0.15 240 / 0.25)",
                }}
              >
                <BookOpen
                  className="w-5 h-5"
                  style={{ color: "oklch(0.5 0.15 240)" }}
                />
              </div>
              <ChevronRight
                size={16}
                className="text-muted-foreground group-hover:text-foreground transition-colors mt-1"
              />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-2">
              {subject.name}
            </h3>
            <p className="text-muted-foreground text-xs mb-3 font-mono">
              {subject.code}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Sem {subject.semester.toString()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Sec {subject.section}
                </Badge>
              </div>
              <AttendanceBadge subjectId={subject.id} />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: subjects, isLoading: subjectsLoading } = useStudentSubjects();
  const { data: notices, isLoading: noticesLoading } = useStudentNotices();
  const { data: profile } = useCallerProfile();

  return (
    <DashboardLayout
      title="Student Dashboard"
      roleColor="oklch(0.5 0.15 240)"
      roleBadge="Student"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Profile card */}
          <Card
            className="shadow-card border-border"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.5 0.15 240 / 0.06) 0%, oklch(0.96 0.01 240) 100%)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl"
                  style={{ background: "oklch(0.5 0.15 240)" }}
                >
                  {(profile?.name || "S").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">
                    {profile?.name || "Loading..."}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {profile?.email || "—"}
                  </p>
                </div>
                <div className="ml-auto hidden sm:flex gap-4">
                  <div className="text-center">
                    <p
                      className="font-display font-bold text-2xl"
                      style={{ color: "oklch(0.5 0.15 240)" }}
                    >
                      {subjects?.length || 0}
                    </p>
                    <p className="text-muted-foreground text-xs">Subjects</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                label: "Enrolled Subjects",
                value: subjects?.length ?? "—",
                color: "oklch(0.5 0.15 240)",
              },
              {
                icon: Bell,
                label: "Notices",
                value: notices?.length ?? "—",
                color: "oklch(0.42 0.16 295)",
              },
              {
                icon: TrendingUp,
                label: "Academic Year",
                value: "2024-25",
                color: "oklch(0.45 0.14 155)",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="shadow-card border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${stat.color} / 0.1` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-xl text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Subjects grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground">
                My Subjects
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab("subjects")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>
            {subjectsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
              </div>
            ) : subjects && subjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((s) => (
                  <SubjectCard key={s.id} subject={s} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-border">
                <CardContent className="py-10 text-center">
                  <BookOpen
                    size={32}
                    className="text-muted-foreground/30 mx-auto mb-2"
                  />
                  <p className="text-muted-foreground text-sm">
                    No subjects enrolled yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-muted-foreground" />
            <h2 className="font-display font-semibold text-foreground">
              All Enrolled Subjects
            </h2>
          </div>
          {subjectsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((s) => (
                <SubjectCard key={s.id} subject={s} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border">
              <CardContent className="py-10 text-center">
                <BookOpen
                  size={32}
                  className="text-muted-foreground/30 mx-auto mb-2"
                />
                <p className="text-muted-foreground text-sm">
                  No subjects enrolled yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "notices" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={20} className="text-muted-foreground" />
            <h2 className="font-display font-semibold text-foreground">
              Department Notices
            </h2>
          </div>
          {noticesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : notices && notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map((notice) => (
                <Card key={notice.id} className="shadow-card border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">
                            {notice.title}
                          </h3>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs flex-shrink-0">
                            <Clock size={11} />
                            <span>{formatDate(notice.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {notice.content}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {notice.targetRole}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border">
              <CardContent className="py-10 text-center">
                <Bell
                  size={32}
                  className="text-muted-foreground/30 mx-auto mb-2"
                />
                <p className="text-muted-foreground text-sm">No notices yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
