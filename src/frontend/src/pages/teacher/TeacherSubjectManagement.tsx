import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle,
  ClipboardList,
  FileText,
  Loader2,
  Plus,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import type { UserProfile } from "../../backend.d";
import {
  Variant_all_teacher_student,
  Variant_approved_rejected,
  Variant_present_late_absent,
  useAllStudents,
  useAssignmentSubmissions,
  useCreateAssignment,
  useMarkAttendance,
  usePostSubjectNotice,
  useRecheckRequests,
  useRespondToRecheck,
  useSubjectAssignments,
  useTeacherSubjects,
  useUploadAnswerSheet,
  useUploadMarks,
} from "../../hooks/useQueries";

function AttendanceToggle({
  value,
  onChange,
}: {
  value: Variant_present_late_absent;
  onChange: (v: Variant_present_late_absent) => void;
}) {
  return (
    <div className="flex gap-1">
      {(["present", "late", "absent"] as const).map((status) => (
        <button
          type="button"
          key={status}
          onClick={() => onChange(status as Variant_present_late_absent)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            value === status
              ? status === "present"
                ? "bg-green-100 text-green-700 border border-green-300"
                : status === "late"
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          }`}
        >
          {status === "present" ? (
            <CheckCircle size={12} className="inline mr-1" />
          ) : null}
          {status === "late" ? (
            <AlertCircle size={12} className="inline mr-1" />
          ) : null}
          {status === "absent" ? (
            <XCircle size={12} className="inline mr-1" />
          ) : null}
          {status}
        </button>
      ))}
    </div>
  );
}

function SubmissionsViewer({ assignmentId }: { assignmentId: string }) {
  const { data: submissions, isLoading } =
    useAssignmentSubmissions(assignmentId);
  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-2">No submissions yet.</p>
    );
  }
  return (
    <div className="space-y-2 mt-2">
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
        >
          <div>
            <p className="text-sm font-medium">
              Student: {sub.studentId.toString().slice(0, 8)}...
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(Number(sub.submittedAt) / 1_000_000).toLocaleDateString(
                "en-IN",
              )}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => window.open(sub.file.getDirectURL(), "_blank")}
          >
            Download
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function TeacherSubjectManagement() {
  const params = useParams({ from: "/teacher/subject/$id" });
  const subjectId = params.id;

  const { data: subjects } = useTeacherSubjects();
  const subject = subjects?.find((s) => s.id === subjectId);

  const { data: allStudents, isLoading: studentsLoading } = useAllStudents();
  const { data: assignments, isLoading: assignLoading } =
    useSubjectAssignments(subjectId);
  const { data: recheckRequests, isLoading: recheckLoading } =
    useRecheckRequests(subjectId);

  const markAttendance = useMarkAttendance();
  const uploadMarks = useUploadMarks();
  const createAssignment = useCreateAssignment();
  const respondRecheck = useRespondToRecheck();
  const uploadAnswerSheet = useUploadAnswerSheet();
  const postNotice = usePostSubjectNotice();

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, Variant_present_late_absent>
  >({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [marksForm, setMarksForm] = useState<
    Record<string, { examType: string; max: string; obtained: string }>
  >({});
  const [savingMarks, setSavingMarks] = useState(false);

  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [assignFile, setAssignFile] = useState<File | null>(null);

  const [answerForm, setAnswerForm] = useState({ studentId: "", examType: "" });
  const [answerFile, setAnswerFile] = useState<File | null>(null);

  const [recheckNote, setRecheckNote] = useState<Record<string, string>>({});

  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    targetRole: Variant_all_teacher_student.all,
  });

  const assignFileRef = useRef<HTMLInputElement>(null);
  const answerFileRef = useRef<HTMLInputElement>(null);

  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(
    null,
  );

  const handleSaveAttendance = async () => {
    if (!allStudents) return;
    setSavingAttendance(true);
    try {
      await Promise.all(
        allStudents.map((student) => {
          const status =
            attendanceMap[student.userId.toString()] ??
            Variant_present_late_absent.present;
          return markAttendance.mutateAsync({
            subjectId,
            studentId: student.userId,
            date: attendanceDate,
            status,
          });
        }),
      );
      toast.success(`Attendance saved for ${attendanceDate}`);
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleUploadMarks = async () => {
    if (!allStudents) return;
    setSavingMarks(true);
    try {
      const entries = Object.entries(marksForm).filter(
        ([, v]) => v.examType && v.max && v.obtained,
      );
      await Promise.all(
        entries.map(([studentId, { examType, max, obtained }]) => {
          const student = allStudents.find(
            (s) => s.userId.toString() === studentId,
          );
          if (!student) return Promise.resolve();
          return uploadMarks.mutateAsync({
            subjectId,
            studentId: student.userId,
            examType,
            maxMarks: Number.parseInt(max),
            obtainedMarks: Number.parseInt(obtained),
          });
        }),
      );
      toast.success("Marks uploaded successfully!");
      setMarksForm({});
    } catch {
      toast.error("Failed to upload marks");
    } finally {
      setSavingMarks(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignForm.title || !assignForm.dueDate || !assignFile) {
      toast.error("Please fill all fields and select a file");
      return;
    }
    try {
      const bytes = new Uint8Array(await assignFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await createAssignment.mutateAsync({
        subjectId,
        title: assignForm.title,
        description: assignForm.description,
        file: blob,
        dueDate: assignForm.dueDate,
      });
      toast.success("Assignment created!");
      setAssignForm({ title: "", description: "", dueDate: "" });
      setAssignFile(null);
      if (assignFileRef.current) assignFileRef.current.value = "";
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  const handleUploadAnswerSheet = async () => {
    if (!answerForm.studentId || !answerForm.examType || !answerFile) {
      toast.error("Please fill all fields and select a file");
      return;
    }
    const student = allStudents?.find(
      (s) => s.userId.toString() === answerForm.studentId,
    );
    if (!student) {
      toast.error("Student not found");
      return;
    }
    try {
      const bytes = new Uint8Array(await answerFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await uploadAnswerSheet.mutateAsync({
        subjectId,
        examType: answerForm.examType,
        studentId: student.userId,
        file: blob,
      });
      toast.success("Answer sheet uploaded!");
      setAnswerForm({ studentId: "", examType: "" });
      setAnswerFile(null);
    } catch {
      toast.error("Failed to upload answer sheet");
    }
  };

  const handleRespondRecheck = async (
    requestId: string,
    status: Variant_approved_rejected,
  ) => {
    try {
      await respondRecheck.mutateAsync({
        requestId,
        status,
        teacherNote: recheckNote[requestId] || "",
      });
      toast.success(`Request ${status} successfully!`);
    } catch {
      toast.error("Failed to respond to request");
    }
  };

  const handlePostNotice = async () => {
    if (!noticeForm.title || !noticeForm.content) {
      toast.error("Please fill in title and content");
      return;
    }
    try {
      await postNotice.mutateAsync({
        subjectId,
        title: noticeForm.title,
        content: noticeForm.content,
        targetRole: noticeForm.targetRole,
      });
      toast.success("Notice posted!");
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 h-14 flex items-center gap-4">
        <Link to="/teacher">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.45 0.14 155 / 0.12)" }}
          >
            <BookOpen
              className="w-4 h-4"
              style={{ color: "oklch(0.45 0.14 155)" }}
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-foreground">
              {subject?.name ?? "Subject Management"}
            </h1>
            {subject && (
              <p className="text-muted-foreground text-xs font-mono">
                {subject.code}
              </p>
            )}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {subject && (
            <>
              <Badge variant="secondary" className="text-xs">
                Sem {subject.semester.toString()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Sec {subject.section}
              </Badge>
            </>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="students">
          <TabsList className="w-full mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="students"
              className="gap-1.5 text-xs sm:text-sm"
            >
              <Users size={14} /> Students
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="gap-1.5 text-xs sm:text-sm"
            >
              <ClipboardList size={14} /> Attendance
            </TabsTrigger>
            <TabsTrigger value="marks" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 size={14} /> Marks
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="gap-1.5 text-xs sm:text-sm"
            >
              <FileText size={14} /> Assignments
            </TabsTrigger>
            <TabsTrigger
              value="answer-sheets"
              className="gap-1.5 text-xs sm:text-sm"
            >
              <Upload size={14} /> Answer Sheets
            </TabsTrigger>
            <TabsTrigger value="recheck" className="gap-1.5 text-xs sm:text-sm">
              <CheckCircle size={14} /> Recheck
            </TabsTrigger>
            <TabsTrigger value="notices" className="gap-1.5 text-xs sm:text-sm">
              <Bell size={14} /> Notices
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Users size={16} />
                  Student List
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : allStudents && allStudents.length > 0 ? (
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
                      {allStudents.map((student, i) => (
                        <TableRow key={student.userId.toString()}>
                          <TableCell className="text-muted-foreground text-sm">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {student.email}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {student.userId.toString().slice(0, 10)}...
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
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Mark Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Label className="flex-shrink-0">Date:</Label>
                  <Input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-48"
                  />
                </div>
                {studentsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : allStudents && allStudents.length > 0 ? (
                  <>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allStudents.map((student, i) => {
                            const key = student.userId.toString();
                            return (
                              <TableRow key={key}>
                                <TableCell className="text-muted-foreground text-sm">
                                  {i + 1}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {student.name}
                                </TableCell>
                                <TableCell>
                                  <AttendanceToggle
                                    value={
                                      attendanceMap[key] ??
                                      Variant_present_late_absent.present
                                    }
                                    onChange={(v) =>
                                      setAttendanceMap((prev) => ({
                                        ...prev,
                                        [key]: v,
                                      }))
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <Button
                      onClick={handleSaveAttendance}
                      disabled={savingAttendance}
                      className="gap-2"
                      style={{ background: "oklch(0.45 0.14 155)" }}
                    >
                      {savingAttendance ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Save Attendance
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No students to mark attendance for.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marks Tab */}
          <TabsContent value="marks">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Upload Internal Marks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : allStudents && allStudents.length > 0 ? (
                  <>
                    <div className="rounded-lg border border-border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Exam Type</TableHead>
                            <TableHead>Max Marks</TableHead>
                            <TableHead>Obtained</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allStudents.map((student) => {
                            const key = student.userId.toString();
                            const entry = marksForm[key] || {
                              examType: "IA-1",
                              max: "50",
                              obtained: "",
                            };
                            return (
                              <TableRow key={key}>
                                <TableCell className="font-medium text-sm">
                                  {student.name}
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={entry.examType}
                                    onValueChange={(v) =>
                                      setMarksForm((prev) => ({
                                        ...prev,
                                        [key]: { ...entry, examType: v },
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[
                                        "IA-1",
                                        "IA-2",
                                        "IA-3",
                                        "Practical",
                                        "Final",
                                      ].map((t) => (
                                        <SelectItem key={t} value={t}>
                                          {t}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={entry.max}
                                    onChange={(e) =>
                                      setMarksForm((prev) => ({
                                        ...prev,
                                        [key]: {
                                          ...entry,
                                          max: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-20"
                                    min="0"
                                    max="200"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={entry.obtained}
                                    onChange={(e) =>
                                      setMarksForm((prev) => ({
                                        ...prev,
                                        [key]: {
                                          ...entry,
                                          obtained: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-20"
                                    placeholder="—"
                                    min="0"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <Button
                      onClick={handleUploadMarks}
                      disabled={savingMarks}
                      className="gap-2"
                      style={{ background: "oklch(0.45 0.14 155)" }}
                    >
                      {savingMarks ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <BarChart3 size={16} />
                      )}
                      Upload Marks
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No students found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <div className="space-y-6">
              {/* Create assignment form */}
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Plus size={16} /> Create Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Title *</Label>
                      <Input
                        placeholder="Assignment title"
                        value={assignForm.title}
                        onChange={(e) =>
                          setAssignForm((p) => ({
                            ...p,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Due Date *</Label>
                      <Input
                        type="date"
                        value={assignForm.dueDate}
                        onChange={(e) =>
                          setAssignForm((p) => ({
                            ...p,
                            dueDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Description</Label>
                    <Textarea
                      placeholder="Assignment instructions..."
                      value={assignForm.description}
                      onChange={(e) =>
                        setAssignForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Assignment File *</Label>
                    <input
                      ref={assignFileRef}
                      type="file"
                      onChange={(e) =>
                        setAssignFile(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>
                  <Button
                    onClick={handleCreateAssignment}
                    disabled={createAssignment.isPending}
                    className="gap-2"
                    style={{ background: "oklch(0.45 0.14 155)" }}
                  >
                    {createAssignment.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Create Assignment
                  </Button>
                </CardContent>
              </Card>

              {/* Assignment list */}
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-base">
                    Existing Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assignLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : assignments && assignments.length > 0 ? (
                    <div className="space-y-4">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="border border-border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {assignment.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mt-1">
                                {assignment.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Due: {assignment.dueDate}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setExpandedAssignment(
                                  expandedAssignment === assignment.id
                                    ? null
                                    : assignment.id,
                                )
                              }
                            >
                              {expandedAssignment === assignment.id
                                ? "Hide"
                                : "Submissions"}
                            </Button>
                          </div>
                          {expandedAssignment === assignment.id && (
                            <SubmissionsViewer assignmentId={assignment.id} />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      No assignments created yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Answer Sheets Tab */}
          <TabsContent value="answer-sheets">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Upload Answer Sheet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Student *</Label>
                    <Select
                      value={answerForm.studentId}
                      onValueChange={(v) =>
                        setAnswerForm((p) => ({ ...p, studentId: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStudents?.map((s) => (
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
                    <Label className="mb-2 block">Exam Type *</Label>
                    <Select
                      value={answerForm.examType}
                      onValueChange={(v) =>
                        setAnswerForm((p) => ({ ...p, examType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {["IA-1", "IA-2", "IA-3", "Practical", "Final"].map(
                          (t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Answer Sheet PDF *</Label>
                  <input
                    ref={answerFileRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                <Button
                  onClick={handleUploadAnswerSheet}
                  disabled={uploadAnswerSheet.isPending}
                  className="gap-2"
                  style={{ background: "oklch(0.45 0.14 155)" }}
                >
                  {uploadAnswerSheet.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload Answer Sheet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recheck Tab */}
          <TabsContent value="recheck">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Recheck Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recheckLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : recheckRequests && recheckRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recheckRequests
                      .filter((r) => r.status === "pending")
                      .map((req) => (
                        <div
                          key={req.id}
                          className="border border-border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <p className="font-medium text-sm">
                                Student: {req.studentId.toString().slice(0, 10)}
                                ...
                              </p>
                              <p className="text-muted-foreground text-sm mt-1">
                                {req.reason}
                              </p>
                            </div>
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              Pending
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Teacher note (optional)"
                              value={recheckNote[req.id] || ""}
                              onChange={(e) =>
                                setRecheckNote((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value,
                                }))
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  handleRespondRecheck(
                                    req.id,
                                    Variant_approved_rejected.approved,
                                  )
                                }
                                disabled={respondRecheck.isPending}
                              >
                                <CheckCircle size={14} /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1.5"
                                onClick={() =>
                                  handleRespondRecheck(
                                    req.id,
                                    Variant_approved_rejected.rejected,
                                  )
                                }
                                disabled={respondRecheck.isPending}
                              >
                                <XCircle size={14} /> Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {recheckRequests
                      .filter((r) => r.status !== "pending")
                      .map((req) => (
                        <div
                          key={req.id}
                          className="border border-border rounded-lg p-4 opacity-60"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              {req.reason}
                            </p>
                            <Badge
                              className={
                                req.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {req.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No recheck requests.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notices Tab */}
          <TabsContent value="notices">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Post Subject Notice
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
                  <Label className="mb-2 block">Title</Label>
                  <Input
                    placeholder="Notice title"
                    value={noticeForm.title}
                    onChange={(e) =>
                      setNoticeForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Content</Label>
                  <Textarea
                    placeholder="Notice content..."
                    value={noticeForm.content}
                    onChange={(e) =>
                      setNoticeForm((p) => ({ ...p, content: e.target.value }))
                    }
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handlePostNotice}
                  disabled={postNotice.isPending}
                  className="gap-2"
                  style={{ background: "oklch(0.45 0.14 155)" }}
                >
                  {postNotice.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Bell size={16} />
                  )}
                  Post Notice
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
