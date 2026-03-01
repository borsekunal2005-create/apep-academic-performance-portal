import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Search,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/shared/DashboardLayout";
import {
  Variant_all_teacher_student,
  useAllStudents,
  useAllTeachers,
  useAttendanceShortageReport,
  usePostDepartmentNotice,
  useStudentNotices,
  useSubjectPerformanceStats,
  useSystemStats,
} from "../../hooks/useQueries";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", tab: "overview" },
  { icon: GraduationCap, label: "Teachers", tab: "teachers" },
  { icon: Users, label: "Students", tab: "students" },
  { icon: AlertTriangle, label: "Attendance Report", tab: "attendance" },
  { icon: BarChart3, label: "Performance", tab: "performance" },
  { icon: Bell, label: "Notices", tab: "notices" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="shadow-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}1a`, border: `1px solid ${color}33` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <p className="font-display font-bold text-2xl text-foreground">
              {value}
            </p>
            <p className="text-muted-foreground text-sm">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HODDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [threshold, setThreshold] = useState(75);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useSystemStats();
  const { data: students, isLoading: studentsLoading } = useAllStudents();
  const { data: teachers, isLoading: teachersLoading } = useAllTeachers();
  const { data: shortageReport, isLoading: shortageLoading } =
    useAttendanceShortageReport(threshold);
  const { data: performanceStats, isLoading: performanceLoading } =
    useSubjectPerformanceStats();
  const { data: notices } = useStudentNotices();

  const postNotice = usePostDepartmentNotice();
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    targetRole: Variant_all_teacher_student.all,
  });

  const filteredStudents = students?.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePostNotice = async () => {
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }
    try {
      await postNotice.mutateAsync(noticeForm);
      toast.success("Department notice posted!");
      setNoticeForm({
        title: "",
        content: "",
        targetRole: Variant_all_teacher_student.all,
      });
    } catch {
      toast.error("Failed to post notice");
    }
  };

  return (
    <DashboardLayout
      title="HOD Dashboard"
      roleColor="oklch(0.42 0.16 295)"
      roleBadge="Head of Department"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))
            ) : (
              <>
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={stats?.userCount?.toString() ?? "—"}
                  color="oklch(0.5 0.15 240)"
                />
                <StatCard
                  icon={GraduationCap}
                  label="Students"
                  value={stats?.studentCount?.toString() ?? "—"}
                  color="oklch(0.5 0.15 240)"
                />
                <StatCard
                  icon={BookOpen}
                  label="Teachers"
                  value={stats?.teacherCount?.toString() ?? "—"}
                  color="oklch(0.45 0.14 155)"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Subjects"
                  value={stats?.subjectCount?.toString() ?? "—"}
                  color="oklch(0.42 0.16 295)"
                />
              </>
            )}
          </div>

          {/* Quick attendance alert */}
          {shortageReport && shortageReport.length > 0 && (
            <Card className="shadow-card border-amber-200 bg-amber-50">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">
                      {shortageReport.length} student
                      {shortageReport.length > 1 ? "s" : ""} below {threshold}%
                      attendance
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Review the Attendance Report tab for details.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => setActiveTab("attendance")}
                  >
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent notices */}
          <div>
            <h2 className="font-display font-semibold text-foreground mb-4">
              Recent Notices
            </h2>
            {notices && notices.slice(0, 3).length > 0 ? (
              <div className="space-y-3">
                {notices.slice(0, 3).map((n) => (
                  <Card key={n.id} className="shadow-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Bell
                          size={16}
                          className="text-muted-foreground mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {n.title}
                          </p>
                          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                            {n.content}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="ml-auto text-xs flex-shrink-0"
                        >
                          {n.targetRole}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  No notices posted yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Teachers */}
      {activeTab === "teachers" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-muted-foreground" />
            <h2 className="font-display font-semibold text-foreground">
              All Teachers
            </h2>
            <Badge variant="secondary" className="ml-auto">
              {teachers?.length ?? 0}
            </Badge>
          </div>
          <Card className="shadow-card border-border">
            <CardContent className="p-0">
              {teachersLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : teachers && teachers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher, i) => (
                      <TableRow key={teacher.userId.toString()}>
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {teacher.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {teacher.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-xs"
                            style={{
                              background: "oklch(0.45 0.14 155 / 0.1)",
                              color: "oklch(0.45 0.14 155)",
                            }}
                          >
                            Teacher
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No teachers found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary">
              {filteredStudents?.length ?? 0} students
            </Badge>
          </div>
          <Card className="shadow-card border-border">
            <CardContent className="p-0">
              {studentsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : filteredStudents && filteredStudents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, i) => (
                      <TableRow key={student.userId.toString()}>
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {student.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(
                            Number(student.createdAt) / 1_000_000,
                          ).toLocaleDateString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  {searchQuery
                    ? "No students match your search."
                    : "No students found."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Report */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <AlertTriangle size={20} className="text-amber-500" />
            <h2 className="font-display font-semibold text-foreground">
              Attendance Shortage Report
            </h2>
          </div>

          <Card className="shadow-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Label className="flex-shrink-0 font-medium">Threshold:</Label>
                <div className="flex items-center gap-3 flex-1">
                  <Input
                    type="number"
                    value={threshold}
                    onChange={(e) =>
                      setThreshold(Number.parseInt(e.target.value) || 75)
                    }
                    className="w-24"
                    min="0"
                    max="100"
                  />
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Showing students below {threshold}% attendance
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-0">
              {shortageLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : shortageReport && shortageReport.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortageReport.map(([principal, name, pct], i) => (
                      <TableRow key={principal.toString()}>
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{name}</p>
                            <p className="text-muted-foreground text-xs font-mono">
                              {principal.toString().slice(0, 12)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Number(pct)}
                              className="w-20 h-2"
                            />
                            <span className="text-sm font-semibold text-red-600">
                              {pct.toString()}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                            ⚠ Shortage
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-green-500 mb-2">✓</div>
                  <p className="text-muted-foreground text-sm">
                    No students below {threshold}% attendance. All good!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-muted-foreground" />
            <h2 className="font-display font-semibold text-foreground">
              Subject Performance Statistics
            </h2>
          </div>
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Average Marks by Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : performanceStats && performanceStats.length > 0 ? (
                <div className="space-y-4">
                  {performanceStats.map(([subjectName, avg]) => {
                    const pct = Math.min(Number(avg), 100);
                    return (
                      <motion.div
                        key={subjectName}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-foreground">
                            {subjectName}
                          </span>
                          <span
                            className="text-sm font-bold"
                            style={{
                              color:
                                pct >= 60
                                  ? "oklch(0.45 0.14 155)"
                                  : "oklch(0.55 0.22 27)",
                            }}
                          >
                            {avg.toString()}%
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No performance data available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notices */}
      {activeTab === "notices" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-muted-foreground" />
            <h2 className="font-display font-semibold text-foreground">
              Department Notices
            </h2>
          </div>

          {/* Post notice form */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Post New Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Target Audience</Label>
                <Select
                  value={noticeForm.targetRole}
                  onValueChange={(v) =>
                    setNoticeForm((p) => ({
                      ...p,
                      targetRole: v as Variant_all_teacher_student,
                    }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Variant_all_teacher_student.all}>
                      All
                    </SelectItem>
                    <SelectItem value={Variant_all_teacher_student.student}>
                      Students Only
                    </SelectItem>
                    <SelectItem value={Variant_all_teacher_student.teacher}>
                      Teachers Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Notice Title</Label>
                <Input
                  placeholder="e.g., End of semester examination schedule"
                  value={noticeForm.title}
                  onChange={(e) =>
                    setNoticeForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">Notice Content</Label>
                <Textarea
                  placeholder="Write the notice content here..."
                  value={noticeForm.content}
                  onChange={(e) =>
                    setNoticeForm((p) => ({ ...p, content: e.target.value }))
                  }
                  rows={5}
                />
              </div>
              <Button
                onClick={handlePostNotice}
                disabled={postNotice.isPending}
                className="gap-2"
                style={{ background: "oklch(0.42 0.16 295)" }}
              >
                {postNotice.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Post Notice
              </Button>
            </CardContent>
          </Card>

          {/* Existing notices */}
          <div>
            <h3 className="font-display font-medium text-foreground mb-3">
              Recent Notices
            </h3>
            {notices && notices.length > 0 ? (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <Card key={notice.id} className="shadow-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bell size={14} className="text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">
                              {notice.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                              {notice.content}
                            </p>
                            <p className="text-muted-foreground/60 text-xs mt-2">
                              {new Date(
                                Number(notice.createdAt) / 1_000_000,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="flex-shrink-0 text-xs"
                        >
                          {notice.targetRole}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  No notices posted yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
