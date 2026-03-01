import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  APEPRole,
  type ExternalBlob,
  Variant_all_teacher_student,
  Variant_approved_rejected,
  Variant_present_late_absent,
} from "../backend";
import type {
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  InternalMark,
  Notice,
  RecheckRequest,
  Subject,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// =====================
// User Queries
// =====================
export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allStudents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTeachers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allTeachers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeachers();
    },
    enabled: !!actor && !isFetching,
  });
}

// =====================
// Subject Queries
// =====================
export function useStudentSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["studentSubjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTeacherSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["teacherSubjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTeacherSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

// =====================
// Attendance Queries
// =====================
export function useStudentAttendance(subjectId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", subjectId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentAttendance(subjectId);
    },
    enabled: !!actor && !isFetching && !!subjectId,
  });
}

export function useAttendanceShortageReport(threshold: number) {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<[import("@icp-sdk/core/principal").Principal, string, bigint]>
  >({
    queryKey: ["attendanceShortage", threshold],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAttendanceShortageReport(BigInt(threshold));
    },
    enabled: !!actor && !isFetching,
  });
}

// =====================
// Marks Queries
// =====================
export function useStudentMarks(subjectId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<InternalMark[]>({
    queryKey: ["marks", subjectId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentMarks(subjectId);
    },
    enabled: !!actor && !isFetching && !!subjectId,
  });
}

export function useSubjectPerformanceStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, bigint]>>({
    queryKey: ["performanceStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjectPerformanceStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// =====================
// Assignment Queries
// =====================
export function useSubjectAssignments(subjectId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Assignment[]>({
    queryKey: ["assignments", subjectId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjectAssignments(subjectId);
    },
    enabled: !!actor && !isFetching && !!subjectId,
  });
}

export function useAssignmentSubmissions(assignmentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AssignmentSubmission[]>({
    queryKey: ["submissions", assignmentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssignmentSubmissions(assignmentId);
    },
    enabled: !!actor && !isFetching && !!assignmentId,
  });
}

// =====================
// Recheck Queries
// =====================
export function useRecheckRequests(subjectId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RecheckRequest[]>({
    queryKey: ["recheckRequests", subjectId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecheckRequests(subjectId);
    },
    enabled: !!actor && !isFetching && !!subjectId,
  });
}

// =====================
// Notice Queries
// =====================
export function useStudentNotices() {
  const { actor, isFetching } = useActor();
  return useQuery<Notice[]>({
    queryKey: ["studentNotices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentNotices();
    },
    enabled: !!actor && !isFetching,
  });
}

// =====================
// Stats Queries
// =====================
export function useSystemStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    teacherCount: bigint;
    subjectCount: bigint;
    studentCount: bigint;
    userCount: bigint;
  }>({
    queryKey: ["systemStats"],
    queryFn: async () => {
      if (!actor)
        return {
          teacherCount: 0n,
          subjectCount: 0n,
          studentCount: 0n,
          userCount: 0n,
        };
      return actor.getSystemStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// =====================
// Mutations
// =====================
export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      studentId,
      date,
      status,
    }: {
      subjectId: string;
      studentId: import("@icp-sdk/core/principal").Principal;
      date: string;
      status: Variant_present_late_absent;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.markAttendance(subjectId, studentId, date, status);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", vars.subjectId],
      });
    },
  });
}

export function useUploadMarks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      studentId,
      examType,
      maxMarks,
      obtainedMarks,
    }: {
      subjectId: string;
      studentId: import("@icp-sdk/core/principal").Principal;
      examType: string;
      maxMarks: number;
      obtainedMarks: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.uploadInternalMarks(
        subjectId,
        studentId,
        examType,
        BigInt(maxMarks),
        BigInt(obtainedMarks),
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["marks", vars.subjectId] });
    },
  });
}

export function useCreateAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      title,
      description,
      file,
      dueDate,
    }: {
      subjectId: string;
      title: string;
      description: string;
      file: ExternalBlob;
      dueDate: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createAssignment(
        subjectId,
        title,
        description,
        file,
        dueDate,
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["assignments", vars.subjectId],
      });
    },
  });
}

export function useSubmitAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      file,
    }: {
      assignmentId: string;
      file: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitAssignment(assignmentId, file);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["submissions", vars.assignmentId],
      });
    },
  });
}

export function useRequestRecheck() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      answerSheetId,
      reason,
    }: {
      answerSheetId: string;
      reason: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.requestRecheck(answerSheetId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recheckRequests"] });
    },
  });
}

export function useRespondToRecheck() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      teacherNote,
    }: {
      requestId: string;
      status: Variant_approved_rejected;
      teacherNote: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.respondToRecheckRequest(requestId, status, teacherNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recheckRequests"] });
    },
  });
}

export function usePostDepartmentNotice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      targetRole,
    }: {
      title: string;
      content: string;
      targetRole: Variant_all_teacher_student;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.postDepartmentNotice(title, content, targetRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentNotices"] });
    },
  });
}

export function usePostSubjectNotice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      title,
      content,
      targetRole,
    }: {
      subjectId: string;
      title: string;
      content: string;
      targetRole: Variant_all_teacher_student;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.postSubjectNotice(subjectId, title, content, targetRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentNotices"] });
    },
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role,
      name,
      email,
    }: {
      userId: import("@icp-sdk/core/principal").Principal;
      role: APEPRole;
      name: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createUserProfile(userId, role, name, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["allStudents"] });
      queryClient.invalidateQueries({ queryKey: ["allTeachers"] });
      queryClient.invalidateQueries({ queryKey: ["systemStats"] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: import("@icp-sdk/core/principal").Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteUserProfile(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["systemStats"] });
    },
  });
}

export function useCreateSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      code,
      teacherId,
      semester,
      section,
    }: {
      name: string;
      code: string;
      teacherId: import("@icp-sdk/core/principal").Principal;
      semester: number;
      section: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createSubject(
        name,
        code,
        teacherId,
        BigInt(semester),
        section,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherSubjects"] });
      queryClient.invalidateQueries({ queryKey: ["systemStats"] });
    },
  });
}

export function useAssignStudentToSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      subjectId,
    }: {
      studentId: import("@icp-sdk/core/principal").Principal;
      subjectId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignStudentToSubject(studentId, subjectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentSubjects"] });
    },
  });
}

export function useInitializeSampleData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.initializeSampleData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useUploadAnswerSheet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      examType,
      studentId,
      file,
    }: {
      subjectId: string;
      examType: string;
      studentId: import("@icp-sdk/core/principal").Principal;
      file: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.uploadAnswerSheet(subjectId, examType, studentId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recheckRequests"] });
    },
  });
}

// Re-export enums for convenience
export {
  APEPRole,
  Variant_present_late_absent,
  Variant_approved_rejected,
  Variant_all_teacher_student,
};
