import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import DashboardLayout from "../../components/shared/DashboardLayout";
import { useCallerProfile, useTeacherSubjects } from "../../hooks/useQueries";
import NoticesPanel from "./NoticesPanel";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", tab: "overview" },
  { icon: BookOpen, label: "My Subjects", tab: "subjects" },
  { icon: Bell, label: "Post Notice", tab: "notices" },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: subjects, isLoading: subjectsLoading } = useTeacherSubjects();
  const { data: profile } = useCallerProfile();

  return (
    <DashboardLayout
      title="Teacher Dashboard"
      roleColor="oklch(0.45 0.14 155)"
      roleBadge="Teacher"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Welcome card */}
          <Card
            className="shadow-card border-border"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.14 155 / 0.06) 0%, oklch(0.98 0.003 240) 100%)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl"
                  style={{ background: "oklch(0.45 0.14 155)" }}
                >
                  {(profile?.name || "T").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">
                    Welcome, {profile?.name || "Teacher"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {profile?.email || "—"}
                  </p>
                </div>
                <div className="ml-auto hidden sm:flex gap-6">
                  <div className="text-center">
                    <p
                      className="font-display font-bold text-2xl"
                      style={{ color: "oklch(0.45 0.14 155)" }}
                    >
                      {subjects?.length || 0}
                    </p>
                    <p className="text-muted-foreground text-xs">Subjects</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                label: "My Subjects",
                value: subjects?.length ?? "—",
                color: "oklch(0.45 0.14 155)",
              },
              {
                icon: Users,
                label: "Teaching Role",
                value: "Active",
                color: "oklch(0.5 0.15 240)",
              },
              {
                icon: ClipboardList,
                label: "Responsibilities",
                value: "Full",
                color: "oklch(0.82 0.12 85)",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="shadow-card border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${stat.color} / 0.12`,
                        border: `1px solid ${stat.color} / 0.2`,
                      }}
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

          {/* Subjects preview */}
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
            <SubjectsList
              subjects={subjects ?? []}
              isLoading={subjectsLoading}
            />
          </div>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-muted-foreground" />
            <h2 className="font-display font-semibold text-foreground">
              My Subjects
            </h2>
          </div>
          <SubjectsList
            subjects={subjects ?? []}
            isLoading={subjectsLoading}
            showAll
          />
        </div>
      )}

      {activeTab === "notices" && <NoticesPanel />}
    </DashboardLayout>
  );
}

function SubjectsList({
  subjects,
  isLoading,
  showAll = false,
}: {
  subjects: Array<{
    id: string;
    name: string;
    code: string;
    semester: bigint;
    section: string;
  }>;
  isLoading: boolean;
  showAll?: boolean;
}) {
  const displaySubjects = showAll ? subjects : subjects.slice(0, 6);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="py-10 text-center">
          <BookOpen
            size={32}
            className="text-muted-foreground/30 mx-auto mb-2"
          />
          <p className="text-muted-foreground text-sm">
            No subjects assigned yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displaySubjects.map((subject, i) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
        >
          <Link to="/teacher/subject/$id" params={{ id: subject.id }}>
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 border-border cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "oklch(0.45 0.14 155 / 0.12)",
                      border: "1px solid oklch(0.45 0.14 155 / 0.25)",
                    }}
                  >
                    <BookOpen
                      className="w-5 h-5"
                      style={{ color: "oklch(0.45 0.14 155)" }}
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
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Sem {subject.semester.toString()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Sec {subject.section}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText size={12} />
                  <span>Manage subject →</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
