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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  Clock,
  Download,
  FileText,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import {
  useRecheckRequests,
  useRequestRecheck,
  useStudentAttendance,
  useStudentMarks,
  useStudentNotices,
  useSubjectAssignments,
  useSubmitAssignment,
} from "../../hooks/useQueries";
import { useStudentSubjects } from "../../hooks/useQueries";

function formatDate(ts: bigint | string) {
  if (typeof ts === "string") return ts;
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AttendanceStatus({ status }: { status: string }) {
  if (status === "present")
    return (
      <span className="flex items-center gap-1 text-green-600 text-sm">
        <CheckCircle size={14} /> Present
      </span>
    );
  if (status === "late")
    return (
      <span className="flex items-center gap-1 text-amber-600 text-sm">
        <AlertCircle size={14} /> Late
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-red-600 text-sm">
      <XCircle size={14} /> Absent
    </span>
  );
}

export default function StudentSubjectDetail() {
  const params = useParams({ from: "/student/subject/$id" });
  const subjectId = params.id;

  const { data: subjects } = useStudentSubjects();
  const subject = subjects?.find((s) => s.id === subjectId);

  const { data: attendance, isLoading: attLoading } =
    useStudentAttendance(subjectId);
  const { data: marks, isLoading: marksLoading } = useStudentMarks(subjectId);
  const { data: assignments, isLoading: assignLoading } =
    useSubjectAssignments(subjectId);
  const { data: notices } = useStudentNotices();
  const { data: recheckRequests } = useRecheckRequests(subjectId);

  const submitAssignment = useSubmitAssignment();
  const requestRecheck = useRequestRecheck();

  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [recheckReason, setRecheckReason] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [selectedAnswerSheetId, setSelectedAnswerSheetId] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalDays = attendance?.length ?? 0;
  const presentDays =
    attendance?.filter((a) => a.status === "present" || a.status === "late")
      .length ?? 0;
  const attendancePct =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const subjectNotices =
    notices?.filter((n) => n.subjectId === subjectId) ?? [];

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submitFile) {
      toast.error("Please select a file to submit");
      return;
    }
    try {
      const bytes = new Uint8Array(await submitFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await submitAssignment.mutateAsync({ assignmentId, file: blob });
      toast.success("Assignment submitted successfully!");
      setSubmitFile(null);
      setSelectedAssignmentId(null);
    } catch {
      toast.error("Failed to submit assignment");
    }
  };

  const handleRequestRecheck = async () => {
    if (!selectedAnswerSheetId || !recheckReason.trim()) {
      toast.error("Please provide a reason for rechecking");
      return;
    }
    try {
      await requestRecheck.mutateAsync({
        answerSheetId: selectedAnswerSheetId,
        reason: recheckReason,
      });
      toast.success("Recheck request submitted!");
      setRecheckReason("");
      setSelectedAnswerSheetId(null);
    } catch {
      toast.error("Failed to submit recheck request");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 h-14 flex items-center gap-4">
        <Link to="/student">
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
            style={{ background: "oklch(0.5 0.15 240 / 0.12)" }}
          >
            <BookOpen
              className="w-4 h-4"
              style={{ color: "oklch(0.5 0.15 240)" }}
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-foreground">
              {subject?.name ?? "Subject Detail"}
            </h1>
            {subject && (
              <p className="text-muted-foreground text-xs font-mono">
                {subject.code}
              </p>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
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
        {/* Attendance overview card */}
        <Card
          className="mb-6 shadow-card border-border"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.5 0.15 240 / 0.05) 0%, oklch(0.98 0.003 240) 100%)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg
                  viewBox="0 0 36 36"
                  className="w-20 h-20 -rotate-90"
                  aria-label="Attendance percentage circle"
                >
                  <title>Attendance percentage</title>
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="oklch(0.5 0.15 240 / 0.15)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={
                      attendancePct >= 75
                        ? "oklch(0.45 0.14 155)"
                        : "oklch(0.55 0.22 27)"
                    }
                    strokeWidth="3"
                    strokeDasharray={`${(attendancePct / 100) * 100} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display font-bold text-lg">
                    {attendancePct}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  Attendance Overview
                </h3>
                <p className="text-muted-foreground text-sm">
                  {presentDays} present out of {totalDays} classes
                </p>
                {attendancePct < 75 && (
                  <Badge className="mt-2 bg-red-100 text-red-700 border-red-200 text-xs">
                    ⚠ Below 75% — at risk
                  </Badge>
                )}
                {attendancePct >= 75 && (
                  <Badge className="mt-2 bg-green-100 text-green-700 border-green-200 text-xs">
                    ✓ Good attendance
                  </Badge>
                )}
              </div>
              {marks && marks.length > 0 && (
                <div className="ml-auto hidden sm:grid grid-cols-2 gap-4">
                  {marks.slice(0, 2).map((m) => (
                    <div key={m.examType} className="text-center">
                      <p className="font-display font-bold text-xl text-foreground">
                        {m.obtainedMarks.toString()}/{m.maxMarks.toString()}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {m.examType}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="attendance">
          <TabsList className="w-full mb-6 flex-wrap h-auto gap-1">
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
              <Upload size={14} /> Assignments
            </TabsTrigger>
            <TabsTrigger
              value="answer-sheets"
              className="gap-1.5 text-xs sm:text-sm"
            >
              <FileText size={14} /> Answer Sheets
            </TabsTrigger>
            <TabsTrigger value="notices" className="gap-1.5 text-xs sm:text-sm">
              <Bell size={14} /> Notices
            </TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Attendance Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : attendance && attendance.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((rec) => (
                        <TableRow
                          key={`${rec.date}-${rec.studentId.toString()}`}
                        >
                          <TableCell className="text-sm">{rec.date}</TableCell>
                          <TableCell>
                            <AttendanceStatus status={rec.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No attendance records found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marks Tab */}
          <TabsContent value="marks">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Internal Marks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marksLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : marks && marks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Type</TableHead>
                        <TableHead>Obtained</TableHead>
                        <TableHead>Maximum</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marks.map((mark) => {
                        const pct =
                          Number(mark.maxMarks) > 0
                            ? Math.round(
                                (Number(mark.obtainedMarks) /
                                  Number(mark.maxMarks)) *
                                  100,
                              )
                            : 0;
                        return (
                          <TableRow key={`${mark.examType}-${mark.subjectId}`}>
                            <TableCell className="font-medium">
                              {mark.examType}
                            </TableCell>
                            <TableCell>
                              {mark.obtainedMarks.toString()}
                            </TableCell>
                            <TableCell>{mark.maxMarks.toString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="w-20 h-2" />
                                <span
                                  className={`text-sm font-semibold ${pct >= 60 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No marks uploaded yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <div className="space-y-4">
              {assignLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                  ))}
                </div>
              ) : assignments && assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <Card
                    key={assignment.id}
                    className="shadow-card border-border"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">
                            {assignment.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                            {assignment.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock size={12} />
                            <span>Due: {formatDate(assignment.dueDate)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() =>
                              window.open(
                                assignment.file.getDirectURL(),
                                "_blank",
                              )
                            }
                          >
                            <Download size={14} /> Download
                          </Button>
                          <Dialog
                            open={selectedAssignmentId === assignment.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setSelectedAssignmentId(null);
                                setSubmitFile(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="gap-1.5"
                                onClick={() =>
                                  setSelectedAssignmentId(assignment.id)
                                }
                              >
                                <Upload size={14} /> Submit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submit Assignment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground">
                                  {assignment.title}
                                </p>
                                <div>
                                  <Label className="mb-2 block">
                                    Upload your work
                                  </Label>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) =>
                                      setSubmitFile(e.target.files?.[0] || null)
                                    }
                                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                  />
                                </div>
                                {submitFile && (
                                  <p className="text-xs text-muted-foreground">
                                    Selected: {submitFile.name}
                                  </p>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() =>
                                    handleSubmitAssignment(assignment.id)
                                  }
                                  disabled={
                                    submitAssignment.isPending || !submitFile
                                  }
                                >
                                  {submitAssignment.isPending ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin mr-2"
                                    />
                                  ) : null}
                                  Submit Assignment
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-border">
                  <CardContent className="py-10 text-center">
                    <FileText
                      size={28}
                      className="text-muted-foreground/30 mx-auto mb-2"
                    />
                    <p className="text-muted-foreground text-sm">
                      No assignments yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Answer Sheets Tab */}
          <TabsContent value="answer-sheets">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Answer Sheets & Recheck Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recheckRequests && recheckRequests.length > 0 ? (
                  <div className="space-y-3">
                    {recheckRequests.map((req) => (
                      <div
                        key={req.id}
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">
                              Answer Sheet ID: {req.answerSheetId.slice(0, 8)}
                              ...
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">
                              {req.reason}
                            </p>
                            {req.teacherNote && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Teacher note: {req.teacherNote}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={
                              req.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : req.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }
                          >
                            {req.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      No recheck requests found.
                    </p>
                    <Dialog
                      open={selectedAnswerSheetId !== null}
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedAnswerSheetId(null);
                          setRecheckReason("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            setSelectedAnswerSheetId("placeholder")
                          }
                        >
                          <FileText size={14} /> Request Recheck
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Request Answer Sheet Recheck
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label className="mb-2 block">
                              Answer Sheet ID
                            </Label>
                            <input
                              type="text"
                              placeholder="Enter answer sheet ID"
                              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                              onChange={(e) =>
                                setSelectedAnswerSheetId(e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label className="mb-2 block">
                              Reason for Recheck
                            </Label>
                            <Textarea
                              placeholder="Explain why you want a recheck..."
                              value={recheckReason}
                              onChange={(e) => setRecheckReason(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleRequestRecheck}
                            disabled={
                              requestRecheck.isPending || !recheckReason.trim()
                            }
                          >
                            {requestRecheck.isPending ? (
                              <Loader2
                                size={14}
                                className="animate-spin mr-2"
                              />
                            ) : null}
                            Submit Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notices Tab */}
          <TabsContent value="notices">
            <div className="space-y-3">
              {subjectNotices.length > 0 ? (
                subjectNotices.map((notice) => (
                  <Card key={notice.id} className="shadow-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bell size={14} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm mb-1">
                            {notice.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {notice.content}
                          </p>
                          <p className="text-muted-foreground/60 text-xs mt-2">
                            {formatDate(notice.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-border">
                  <CardContent className="py-10 text-center">
                    <Bell
                      size={28}
                      className="text-muted-foreground/30 mx-auto mb-2"
                    />
                    <p className="text-muted-foreground text-sm">
                      No notices for this subject.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
