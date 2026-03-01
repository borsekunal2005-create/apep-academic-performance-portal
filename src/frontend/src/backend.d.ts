import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AssignmentSubmission {
    id: string;
    studentId: Principal;
    file: ExternalBlob;
    submittedAt: bigint;
    assignmentId: string;
}
export interface RecheckRequest {
    id: string;
    status: Variant_pending_approved_rejected;
    studentId: Principal;
    answerSheetId: string;
    createdAt: bigint;
    teacherNote?: string;
    reason: string;
}
export interface Notice {
    id: string;
    title: string;
    postedBy: Principal;
    content: string;
    createdAt: bigint;
    subjectId?: string;
    targetRole: Variant_all_teacher_student;
}
export interface Assignment {
    id: string;
    title: string;
    postedBy: Principal;
    file: ExternalBlob;
    createdAt: bigint;
    dueDate: string;
    description: string;
    subjectId: string;
}
export interface AttendanceRecord {
    status: Variant_present_late_absent;
    studentId: Principal;
    date: string;
    subjectId: string;
}
export interface InternalMark {
    studentId: Principal;
    subjectId: string;
    maxMarks: bigint;
    obtainedMarks: bigint;
    examType: string;
}
export interface Subject {
    id: string;
    semester: bigint;
    code: string;
    name: string;
    section: string;
    teacherId: Principal;
}
export interface UserProfile {
    userId: Principal;
    name: string;
    createdAt: bigint;
    role: APEPRole;
    email: string;
}
export enum APEPRole {
    hod = "hod",
    admin = "admin",
    teacher = "teacher",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_all_teacher_student {
    all = "all",
    teacher = "teacher",
    student = "student"
}
export enum Variant_approved_rejected {
    approved = "approved",
    rejected = "rejected"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Variant_present_late_absent {
    present = "present",
    late = "late",
    absent = "absent"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignStudentToSubject(studentId: Principal, subjectId: string): Promise<void>;
    createAssignment(subjectId: string, title: string, description: string, file: ExternalBlob, dueDate: string): Promise<string>;
    createStudentProfile(userId: Principal, rollNumber: string, course: string, semester: bigint, section: string): Promise<void>;
    createSubject(name: string, code: string, teacherId: Principal, semester: bigint, section: string): Promise<string>;
    createTeacherProfile(userId: Principal, teacherCode: string, subjectIds: Array<string>): Promise<void>;
    createUserProfile(userId: Principal, role: APEPRole, name: string, email: string): Promise<void>;
    deleteUserProfile(userId: Principal): Promise<void>;
    getAllStudents(): Promise<Array<UserProfile>>;
    getAllTeachers(): Promise<Array<UserProfile>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getAssignmentSubmissions(assignmentId: string): Promise<Array<AssignmentSubmission>>;
    getAttendanceShortageReport(threshold: bigint): Promise<Array<[Principal, string, bigint]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRecheckRequests(subjectId: string): Promise<Array<RecheckRequest>>;
    getStudentAttendance(subjectId: string): Promise<Array<AttendanceRecord>>;
    getStudentMarks(subjectId: string): Promise<Array<InternalMark>>;
    getStudentNotices(): Promise<Array<Notice>>;
    getStudentSubjects(): Promise<Array<Subject>>;
    getSubjectAssignments(subjectId: string): Promise<Array<Assignment>>;
    getSubjectPerformanceStats(): Promise<Array<[string, bigint]>>;
    getSystemStats(): Promise<{
        teacherCount: bigint;
        subjectCount: bigint;
        studentCount: bigint;
        userCount: bigint;
    }>;
    getTeacherSubjects(): Promise<Array<Subject>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeSampleData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markAttendance(subjectId: string, studentId: Principal, date: string, status: Variant_present_late_absent): Promise<void>;
    postDepartmentNotice(title: string, content: string, targetRole: Variant_all_teacher_student): Promise<string>;
    postSubjectNotice(subjectId: string, title: string, content: string, targetRole: Variant_all_teacher_student): Promise<string>;
    requestRecheck(answerSheetId: string, reason: string): Promise<string>;
    respondToRecheckRequest(requestId: string, status: Variant_approved_rejected, teacherNote: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAssignment(assignmentId: string, file: ExternalBlob): Promise<string>;
    updateUserProfile(userId: Principal, role: APEPRole, name: string, email: string): Promise<void>;
    uploadAnswerSheet(subjectId: string, examType: string, studentId: Principal, file: ExternalBlob): Promise<string>;
    uploadInternalMarks(subjectId: string, studentId: Principal, examType: string, maxMarks: bigint, obtainedMarks: bigint): Promise<void>;
}
