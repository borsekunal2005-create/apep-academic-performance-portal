import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Principal } from "@icp-sdk/core/principal";
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Database,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Plus,
  Settings,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/shared/DashboardLayout";
import { useActor } from "../../hooks/useActor";
import {
  APEPRole,
  useAllTeachers,
  useAllUsers,
  useAssignStudentToSubject,
  useCreateSubject,
  useCreateUser,
  useDeleteUser,
  useInitializeSampleData,
  useSystemStats,
} from "../../hooks/useQueries";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", tab: "overview" },
  { icon: Users, label: "Users", tab: "users" },
  { icon: BookOpen, label: "Subjects", tab: "subjects" },
  { icon: GraduationCap, label: "Student Profiles", tab: "student-profiles" },
  { icon: Settings, label: "System Logs", tab: "logs" },
];

const systemLogs = [
  {
    time: "2024-01-15 09:23:45",
    level: "INFO",
    message: "System started successfully",
  },
  {
    time: "2024-01-15 09:24:02",
    level: "INFO",
    message: "Database connection established",
  },
  {
    time: "2024-01-15 09:25:10",
    level: "INFO",
    message: "Authentication service ready",
  },
  {
    time: "2024-01-15 10:02:33",
    level: "INFO",
    message: "User profile created: student_001",
  },
  {
    time: "2024-01-15 10:15:22",
    level: "INFO",
    message: "Attendance marked for CS-101",
  },
  {
    time: "2024-01-15 11:00:00",
    level: "INFO",
    message: "System health check: All services operational",
  },
  {
    time: "2024-01-15 12:30:15",
    level: "INFO",
    message: "Marks uploaded for subject: Data Structures",
  },
  {
    time: "2024-01-15 14:45:20",
    level: "WARNING",
    message: "High memory usage detected (78%)",
  },
  {
    time: "2024-01-15 15:00:00",
    level: "INFO",
    message: "Automatic backup completed",
  },
  {
    time: "2024-01-15 16:30:00",
    level: "INFO",
    message: "Notice posted to all students",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useSystemStats();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: teachers } = useAllTeachers();

  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const createSubject = useCreateSubject();
  const assignStudent = useAssignStudentToSubject();
  const initSampleData = useInitializeSampleData();

  const { actor } = useActor();

  const [userForm, setUserForm] = useState({
    principalId: "",
    name: "",
    email: "",
    role: APEPRole.student,
  });

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    teacherId: "",
    semester: "1",
    section: "A",
  });

  const [assignForm, setAssignForm] = useState({
    studentId: "",
    subjectId: "",
  });

  const [subjectsList] = useState([
    { id: "subj-1", name: "Data Structures", code: "CS-201" },
    { id: "subj-2", name: "Database Management", code: "CS-301" },
    { id: "subj-3", name: "Computer Networks", code: "CS-302" },
  ]);

  const handleCreateUser = async () => {
    if (!userForm.principalId || !userForm.name || !userForm.email) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const principal = Principal.fromText(userForm.principalId);
      await createUser.mutateAsync({
        userId: principal,
        role: userForm.role,
        name: userForm.name,
        email: userForm.email,
      });
      toast.success(`User created: ${userForm.name}`);
      setUserForm({
        principalId: "",
        name: "",
        email: "",
        role: APEPRole.student,
      });
    } catch {
      toast.error("Failed to create user. Check the Principal ID format.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const principal = Principal.fromText(userId);
      await deleteUser.mutateAsync(principal);
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleCreateSubject = async () => {
    if (!subjectForm.name || !subjectForm.code || !subjectForm.teacherId) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const teacherPrincipal = Principal.fromText(subjectForm.teacherId);
      await createSubject.mutateAsync({
        name: subjectForm.name,
        code: subjectForm.code,
        teacherId: teacherPrincipal,
        semester: Number.parseInt(subjectForm.semester),
        section: subjectForm.section,
      });
      toast.success(`Subject created: ${subjectForm.name}`);
      setSubjectForm({
        name: "",
        code: "",
        teacherId: "",
        semester: "1",
        section: "A",
      });
    } catch {
      toast.error("Failed to create subject. Check Teacher Principal ID.");
    }
  };

  const handleAssignStudent = async () => {
    if (!assignForm.studentId || !assignForm.subjectId) {
      toast.error("Please select both student and subject");
      return;
    }
    try {
      const studentPrincipal = Principal.fromText(assignForm.studentId);
      await assignStudent.mutateAsync({
        studentId: studentPrincipal,
        subjectId: assignForm.subjectId,
      });
      toast.success("Student assigned to subject successfully!");
      setAssignForm({ studentId: "", subjectId: "" });
    } catch {
      toast.error("Failed to assign student");
    }
  };

  const handleInitialize = async () => {
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    try {
      await initSampleData.mutateAsync();
      toast.success("Demo data initialized! Refresh to see changes.");
    } catch {
      toast.error("Failed to initialize demo data");
    }
  };

  const students = users?.filter((u) => u.role === APEPRole.student) ?? [];

  return (
    <DashboardLayout
      title="Admin Panel"
      roleColor="oklch(0.55 0.19 45)"
      roleBadge="Administrator"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))
            ) : (
              <>
                {[
                  {
                    icon: Users,
                    label: "Total Users",
                    value: stats?.userCount?.toString() ?? "—",
                    color: "oklch(0.5 0.15 240)",
                  },
                  {
                    icon: GraduationCap,
                    label: "Students",
                    value: stats?.studentCount?.toString() ?? "—",
                    color: "oklch(0.5 0.15 240)",
                  },
                  {
                    icon: BookOpen,
                    label: "Teachers",
                    value: stats?.teacherCount?.toString() ?? "—",
                    color: "oklch(0.45 0.14 155)",
                  },
                  {
                    icon: BarChart3,
                    label: "Subjects",
                    value: stats?.subjectCount?.toString() ?? "—",
                    color: "oklch(0.55 0.19 45)",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card
                      key={stat.label}
                      className="shadow-card border-border"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `${stat.color} / 0.12`,
                              border: `1px solid ${stat.color} / 0.2`,
                            }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ color: stat.color }}
                            />
                          </div>
                          <div>
                            <p className="font-display font-bold text-2xl text-foreground">
                              {stat.value}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {stat.label}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </div>

          {/* Initialize data */}
          <Card
            className="shadow-card border-border"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.19 45 / 0.05) 0%, oklch(0.98 0.003 240) 100%)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.55 0.19 45 / 0.12)" }}
                >
                  <Database
                    size={24}
                    style={{ color: "oklch(0.55 0.19 45)" }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    Initialize Demo Data
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Populate the system with sample students, teachers,
                    subjects, attendance records, and notices for testing and
                    demonstration.
                  </p>
                  <Button
                    onClick={handleInitialize}
                    disabled={initSampleData.isPending}
                    style={{ background: "oklch(0.55 0.19 45)" }}
                    className="gap-2"
                  >
                    {initSampleData.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Database size={16} />
                    )}
                    {initSampleData.isPending
                      ? "Initializing..."
                      : "Initialize Sample Data"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System status */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Shield size={16} /> System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Authentication", status: "operational" },
                  { label: "Database", status: "operational" },
                  { label: "Storage", status: "operational" },
                  { label: "Notifications", status: "operational" },
                ].map((service) => (
                  <div key={service.label} className="flex items-center gap-2">
                    <CheckCircle
                      size={14}
                      className="text-green-500 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium">{service.label}</p>
                      <p className="text-xs text-green-600 capitalize">
                        {service.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Create user form */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Plus size={16} /> Create User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="mb-2 block">Principal ID *</Label>
                  <Input
                    placeholder="aaaaa-bbbbb-..."
                    value={userForm.principalId}
                    onChange={(e) =>
                      setUserForm((p) => ({
                        ...p,
                        principalId: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Role *</Label>
                  <Select
                    value={userForm.role}
                    onValueChange={(v) =>
                      setUserForm((p) => ({ ...p, role: v as APEPRole }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={APEPRole.student}>Student</SelectItem>
                      <SelectItem value={APEPRole.teacher}>Teacher</SelectItem>
                      <SelectItem value={APEPRole.hod}>HOD</SelectItem>
                      <SelectItem value={APEPRole.admin}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Full Name *</Label>
                  <Input
                    placeholder="John Doe"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Email *</Label>
                  <Input
                    type="email"
                    placeholder="student@college.edu"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={createUser.isPending}
                className="gap-2"
                style={{ background: "oklch(0.55 0.19 45)" }}
              >
                {createUser.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Create User
              </Button>
            </CardContent>
          </Card>

          {/* User list */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center justify-between">
                <span>All Users</span>
                <Badge variant="secondary">{users?.length ?? 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.userId.toString()}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {user.userId.toString().slice(0, 10)}...
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  <strong>{user.name}</strong>? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() =>
                                    handleDeleteUser(user.userId.toString())
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No users found. Initialize sample data to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subjects */}
      {activeTab === "subjects" && (
        <div className="space-y-6">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Plus size={16} /> Create Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="mb-2 block">Subject Name *</Label>
                  <Input
                    placeholder="e.g., Data Structures"
                    value={subjectForm.name}
                    onChange={(e) =>
                      setSubjectForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Subject Code *</Label>
                  <Input
                    placeholder="e.g., CS-201"
                    value={subjectForm.code}
                    onChange={(e) =>
                      setSubjectForm((p) => ({ ...p, code: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Teacher *</Label>
                  <Select
                    value={subjectForm.teacherId}
                    onValueChange={(v) =>
                      setSubjectForm((p) => ({ ...p, teacherId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers?.map((t) => (
                        <SelectItem
                          key={t.userId.toString()}
                          value={t.userId.toString()}
                        >
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block">Semester</Label>
                    <Select
                      value={subjectForm.semester}
                      onValueChange={(v) =>
                        setSubjectForm((p) => ({ ...p, semester: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            Sem {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block">Section</Label>
                    <Select
                      value={subjectForm.section}
                      onValueChange={(v) =>
                        setSubjectForm((p) => ({ ...p, section: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D"].map((s) => (
                          <SelectItem key={s} value={s}>
                            Section {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCreateSubject}
                disabled={createSubject.isPending}
                className="gap-2"
                style={{ background: "oklch(0.55 0.19 45)" }}
              >
                {createSubject.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Create Subject
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Profiles */}
      {activeTab === "student-profiles" && (
        <div className="space-y-6">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Assign Student to Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="mb-2 block">Student *</Label>
                  <Select
                    value={assignForm.studentId}
                    onValueChange={(v) =>
                      setAssignForm((p) => ({ ...p, studentId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem
                          key={s.userId.toString()}
                          value={s.userId.toString()}
                        >
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Subject *</Label>
                  <Select
                    value={assignForm.subjectId}
                    onValueChange={(v) =>
                      setAssignForm((p) => ({ ...p, subjectId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsList.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleAssignStudent}
                disabled={assignStudent.isPending}
                className="gap-2"
                style={{ background: "oklch(0.55 0.19 45)" }}
              >
                {assignStudent.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Assign Student
              </Button>
            </CardContent>
          </Card>

          {/* Student list */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center justify-between">
                <span>All Students</span>
                <Badge variant="secondary">{students.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Principal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, i) => (
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
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {student.userId.toString().slice(0, 12)}...
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No students found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Logs */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-muted-foreground" />
              <h2 className="font-display font-semibold text-foreground">
                System Logs
              </h2>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle size={12} className="mr-1" /> All Systems Operational
            </Badge>
          </div>
          <Card className="shadow-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemLogs.map((log, i) => (
                    <motion.tr
                      key={log.time}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border last:border-0"
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.time}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.level === "INFO"
                              ? "bg-blue-100 text-blue-700 border-blue-200 text-xs"
                              : "bg-amber-100 text-amber-700 border-amber-200 text-xs"
                          }
                        >
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {log.message}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function RoleBadge({ role }: { role: APEPRole }) {
  const config = {
    [APEPRole.student]: {
      bg: "oklch(0.5 0.15 240 / 0.1)",
      text: "oklch(0.5 0.15 240)",
      label: "Student",
    },
    [APEPRole.teacher]: {
      bg: "oklch(0.45 0.14 155 / 0.1)",
      text: "oklch(0.45 0.14 155)",
      label: "Teacher",
    },
    [APEPRole.hod]: {
      bg: "oklch(0.42 0.16 295 / 0.1)",
      text: "oklch(0.42 0.16 295)",
      label: "HOD",
    },
    [APEPRole.admin]: {
      bg: "oklch(0.55 0.19 45 / 0.1)",
      text: "oklch(0.55 0.19 45)",
      label: "Admin",
    },
  };
  const c = config[role] ?? config[APEPRole.student];
  return (
    <Badge
      className="text-xs capitalize"
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.text}40`,
      }}
    >
      {c.label}
    </Badge>
  );
}
