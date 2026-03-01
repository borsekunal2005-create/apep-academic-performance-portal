import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Include blob storage system
  include MixinStorage();

  // Include authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Custom role type for APEP
  type APEPRole = {
    #student;
    #teacher;
    #hod;
    #admin;
  };

  // Entity types
  type UserProfile = {
    userId : Principal;
    role : APEPRole;
    name : Text;
    email : Text;
    createdAt : Int;
  };

  type StudentProfile = {
    rollNumber : Text;
    course : Text;
    semester : Nat;
    section : Text;
    userId : Principal;
  };

  type TeacherProfile = {
    teacherCode : Text;
    subjectIds : [Text];
    userId : Principal;
  };

  type Subject = {
    id : Text;
    name : Text;
    code : Text;
    teacherId : Principal;
    semester : Nat;
    section : Text;
  };

  type AttendanceRecord = {
    subjectId : Text;
    studentId : Principal;
    date : Text;
    status : { #present; #absent; #late };
  };

  type InternalMark = {
    subjectId : Text;
    studentId : Principal;
    examType : Text;
    maxMarks : Nat;
    obtainedMarks : Nat;
  };

  type Assignment = {
    id : Text;
    subjectId : Text;
    title : Text;
    description : Text;
    file : Storage.ExternalBlob;
    dueDate : Text;
    createdAt : Int;
    postedBy : Principal;
  };

  type AssignmentSubmission = {
    id : Text;
    assignmentId : Text;
    studentId : Principal;
    file : Storage.ExternalBlob;
    submittedAt : Int;
  };

  type AnswerSheet = {
    id : Text;
    subjectId : Text;
    examType : Text;
    studentId : Principal;
    file : Storage.ExternalBlob;
    uploadedAt : Int;
  };

  type RecheckRequest = {
    id : Text;
    answerSheetId : Text;
    studentId : Principal;
    reason : Text;
    status : { #pending; #approved; #rejected };
    teacherNote : ?Text;
    createdAt : Int;
  };

  type Notice = {
    id : Text;
    postedBy : Principal;
    title : Text;
    content : Text;
    subjectId : ?Text;
    targetRole : { #all; #student; #teacher };
    createdAt : Int;
  };

  type TimetableEntry = {
    subjectId : Text;
    day : Text;
    startTime : Text;
    endTime : Text;
    room : Text;
  };

  // Data stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let studentProfiles = Map.empty<Principal, StudentProfile>();
  let teacherProfiles = Map.empty<Principal, TeacherProfile>();
  let subjects = Map.empty<Text, Subject>();
  let attendanceRecords = Map.empty<Text, AttendanceRecord>();
  let internalMarks = Map.empty<Text, InternalMark>();
  let assignments = Map.empty<Text, Assignment>();
  let assignmentSubmissions = Map.empty<Text, AssignmentSubmission>();
  let answerSheets = Map.empty<Text, AnswerSheet>();
  let recheckRequests = Map.empty<Text, RecheckRequest>();
  let notices = Map.empty<Text, Notice>();
  let timetableEntries = Map.empty<Text, TimetableEntry>();
  let studentSubjects = Map.empty<Principal, [Text]>();

  var nextId : Nat = 0;

  // Helper functions
  func ensureAdmin(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#admin) {};
          case (_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
    };
  };

  func ensureHOD(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#hod) {};
          case (#admin) {};
          case (_) { Runtime.trap("Unauthorized: Only HODs can perform this action") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
    };
  };

  func ensureTeacher(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#teacher) {};
          case (#admin) {};
          case (_) { Runtime.trap("Unauthorized: Only teachers can perform this action") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
    };
  };

  func ensureStudent(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#student) {};
          case (_) { Runtime.trap("Unauthorized: Only students can perform this action") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
    };
  };

  func isTeacherOfSubject(teacherId : Principal, subjectId : Text) : Bool {
    switch (subjects.get(subjectId)) {
      case (?subject) { subject.teacherId == teacherId };
      case (null) { false };
    };
  };

  func isStudentEnrolledInSubject(studentId : Principal, subjectId : Text) : Bool {
    switch (studentSubjects.get(studentId)) {
      case (?subjectIds) {
        subjectIds.find<Text>(func(id) { id == subjectId }) != null;
      };
      case (null) { false };
    };
  };

  func generateId(prefix : Text) : Text {
    let id = prefix # nextId.toText();
    nextId += 1;
    id;
  };

  // Required frontend integration functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (caller != profile.userId) {
      Runtime.trap("Unauthorized: Cannot save profile for another user");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Admin operations
  public shared ({ caller }) func createUserProfile(userId : Principal, role : APEPRole, name : Text, email : Text) : async () {
    ensureAdmin(caller);
    let profile = {
      userId;
      role;
      name;
      email;
      createdAt = Time.now();
    };
    userProfiles.add(userId, profile);
  };

  public shared ({ caller }) func updateUserProfile(userId : Principal, role : APEPRole, name : Text, email : Text) : async () {
    ensureAdmin(caller);
    switch (userProfiles.get(userId)) {
      case (?existing) {
        let profile = {
          userId;
          role;
          name;
          email;
          createdAt = existing.createdAt;
        };
        userProfiles.add(userId, profile);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func deleteUserProfile(userId : Principal) : async () {
    ensureAdmin(caller);
    userProfiles.remove(userId);
    studentProfiles.remove(userId);
    teacherProfiles.remove(userId);
  };

  public shared ({ caller }) func createStudentProfile(userId : Principal, rollNumber : Text, course : Text, semester : Nat, section : Text) : async () {
    ensureAdmin(caller);
    let profile = {
      rollNumber;
      course;
      semester;
      section;
      userId;
    };
    studentProfiles.add(userId, profile);
  };

  public shared ({ caller }) func createTeacherProfile(userId : Principal, teacherCode : Text, subjectIds : [Text]) : async () {
    ensureAdmin(caller);
    let profile = {
      teacherCode;
      subjectIds;
      userId;
    };
    teacherProfiles.add(userId, profile);
  };

  public shared ({ caller }) func createSubject(name : Text, code : Text, teacherId : Principal, semester : Nat, section : Text) : async Text {
    ensureAdmin(caller);
    let id = generateId("SUB");
    let subject = {
      id;
      name;
      code;
      teacherId;
      semester;
      section;
    };
    subjects.add(id, subject);
    id;
  };

  public shared ({ caller }) func assignStudentToSubject(studentId : Principal, subjectId : Text) : async () {
    ensureAdmin(caller);
    switch (studentSubjects.get(studentId)) {
      case (?existing) {
        let updated = existing.concat([subjectId]);
        studentSubjects.add(studentId, updated);
      };
      case (null) {
        studentSubjects.add(studentId, [subjectId]);
      };
    };
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    ensureAdmin(caller);
    userProfiles.values().toArray();
  };

  public query ({ caller }) func getSystemStats() : async { userCount : Nat; studentCount : Nat; teacherCount : Nat; subjectCount : Nat } {
    ensureAdmin(caller);
    {
      userCount = userProfiles.size();
      studentCount = studentProfiles.size();
      teacherCount = teacherProfiles.size();
      subjectCount = subjects.size();
    };
  };

  // Teacher operations
  public query ({ caller }) func getTeacherSubjects() : async [Subject] {
    ensureTeacher(caller);
    let allSubjects = subjects.values().toArray();
    allSubjects.filter<Subject>(func(s) { s.teacherId == caller });
  };

  public shared ({ caller }) func markAttendance(subjectId : Text, studentId : Principal, date : Text, status : { #present; #absent; #late }) : async () {
    ensureTeacher(caller);
    if (not isTeacherOfSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not the teacher of this subject");
    };
    let id = generateId("ATT");
    let record = {
      subjectId;
      studentId;
      date;
      status;
    };
    attendanceRecords.add(id, record);
  };

  public shared ({ caller }) func uploadInternalMarks(subjectId : Text, studentId : Principal, examType : Text, maxMarks : Nat, obtainedMarks : Nat) : async () {
    ensureTeacher(caller);
    if (not isTeacherOfSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not the teacher of this subject");
    };
    let id = generateId("MARK");
    let mark = {
      subjectId;
      studentId;
      examType;
      maxMarks;
      obtainedMarks;
    };
    internalMarks.add(id, mark);
  };

  public shared ({ caller }) func createAssignment(subjectId : Text, title : Text, description : Text, file : Storage.ExternalBlob, dueDate : Text) : async Text {
    ensureTeacher(caller);
    if (not isTeacherOfSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not the teacher of this subject");
    };
    let id = generateId("ASG");
    let assignment = {
      id;
      subjectId;
      title;
      description;
      file;
      dueDate;
      createdAt = Time.now();
      postedBy = caller;
    };
    assignments.add(id, assignment);
    id;
  };

  public query ({ caller }) func getAssignmentSubmissions(assignmentId : Text) : async [AssignmentSubmission] {
    ensureTeacher(caller);
    switch (assignments.get(assignmentId)) {
      case (?assignment) {
        if (not isTeacherOfSubject(caller, assignment.subjectId)) {
          Runtime.trap("Unauthorized: You are not the teacher of this subject");
        };
        let allSubmissions = assignmentSubmissions.values().toArray();
        allSubmissions.filter<AssignmentSubmission>(func(s) { s.assignmentId == assignmentId });
      };
      case (null) { Runtime.trap("Assignment not found") };
    };
  };

  public shared ({ caller }) func uploadAnswerSheet(subjectId : Text, examType : Text, studentId : Principal, file : Storage.ExternalBlob) : async Text {
    ensureTeacher(caller);
    if (not isTeacherOfSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not the teacher of this subject");
    };
    let id = generateId("ANS");
    let answerSheet = {
      id;
      subjectId;
      examType;
      studentId;
      file;
      uploadedAt = Time.now();
    };
    answerSheets.add(id, answerSheet);
    id;
  };

  public query ({ caller }) func getRecheckRequests(subjectId : Text) : async [RecheckRequest] {
    ensureTeacher(caller);
    if (not isTeacherOfSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not the teacher of this subject");
    };
    let allRequests = recheckRequests.values().toArray();
    allRequests.filter<RecheckRequest>(
      func(r) {
        switch (answerSheets.get(r.answerSheetId)) {
          case (?sheet) { sheet.subjectId == subjectId };
          case (null) { false };
        };
      },
    );
  };

  public shared ({ caller }) func respondToRecheckRequest(requestId : Text, status : { #approved; #rejected }, teacherNote : Text) : async () {
    ensureTeacher(caller);
    switch (recheckRequests.get(requestId)) {
      case (?request) {
        switch (answerSheets.get(request.answerSheetId)) {
          case (?sheet) {
            if (not isTeacherOfSubject(caller, sheet.subjectId)) {
              Runtime.trap("Unauthorized: You are not the teacher of this subject");
            };
            let updated = {
              id = request.id;
              answerSheetId = request.answerSheetId;
              studentId = request.studentId;
              reason = request.reason;
              status;
              teacherNote = ?teacherNote;
              createdAt = request.createdAt;
            };
            recheckRequests.add(requestId, updated);
          };
          case (null) { Runtime.trap("Answer sheet not found") };
        };
      };
      case (null) { Runtime.trap("Recheck request not found") };
    };
  };

  public shared ({ caller }) func postSubjectNotice(subjectId : Text, title : Text, content : Text, targetRole : { #all; #student; #teacher }) : async Text {
    ensureTeacher(caller);
    if (not isTeacherOfSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not the teacher of this subject");
    };
    let id = generateId("NOT");
    let notice = {
      id;
      postedBy = caller;
      title;
      content;
      subjectId = ?subjectId;
      targetRole;
      createdAt = Time.now();
    };
    notices.add(id, notice);
    id;
  };

  // Student operations
  public query ({ caller }) func getStudentSubjects() : async [Subject] {
    ensureStudent(caller);
    switch (studentSubjects.get(caller)) {
      case (?subjectIds) {
        let mapped = subjectIds.map(
          func(id) {
            switch (subjects.get(id)) {
              case (?subject) { ?subject };
              case (null) { null };
            };
          }
        );
        let filtered = mapped.filter(
          func(s) {
            switch (s) { case (?_) { true }; case (null) { false } };
          }
        );
        filtered.map(func(s) { switch (s) { case (?subject) { subject }; case (null) { Runtime.trap("Unexpected null subject") } } });
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getStudentAttendance(subjectId : Text) : async [AttendanceRecord] {
    ensureStudent(caller);
    if (not isStudentEnrolledInSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not enrolled in this subject");
    };
    let allRecords = attendanceRecords.values().toArray();
    allRecords.filter<AttendanceRecord>(
      func(r) { r.subjectId == subjectId and r.studentId == caller },
    );
  };

  public query ({ caller }) func getStudentMarks(subjectId : Text) : async [InternalMark] {
    ensureStudent(caller);
    if (not isStudentEnrolledInSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not enrolled in this subject");
    };
    let allMarks = internalMarks.values().toArray();
    allMarks.filter<InternalMark>(
      func(m) { m.subjectId == subjectId and m.studentId == caller },
    );
  };

  public query ({ caller }) func getSubjectAssignments(subjectId : Text) : async [Assignment] {
    ensureStudent(caller);
    if (not isStudentEnrolledInSubject(caller, subjectId)) {
      Runtime.trap("Unauthorized: You are not enrolled in this subject");
    };
    let allAssignments = assignments.values().toArray();
    allAssignments.filter<Assignment>(func(a) { a.subjectId == subjectId });
  };

  public shared ({ caller }) func submitAssignment(assignmentId : Text, file : Storage.ExternalBlob) : async Text {
    ensureStudent(caller);
    switch (assignments.get(assignmentId)) {
      case (?assignment) {
        if (not isStudentEnrolledInSubject(caller, assignment.subjectId)) {
          Runtime.trap("Unauthorized: You are not enrolled in this subject");
        };
        let id = generateId("SUB");
        let submission = {
          id;
          assignmentId;
          studentId = caller;
          file;
          submittedAt = Time.now();
        };
        assignmentSubmissions.add(id, submission);
        id;
      };
      case (null) { Runtime.trap("Assignment not found") };
    };
  };

  public shared ({ caller }) func requestRecheck(answerSheetId : Text, reason : Text) : async Text {
    ensureStudent(caller);
    switch (answerSheets.get(answerSheetId)) {
      case (?sheet) {
        if (sheet.studentId != caller) {
          Runtime.trap("Unauthorized: This is not your answer sheet");
        };
        let id = generateId("REQ");
        let request = {
          id;
          answerSheetId;
          studentId = caller;
          reason;
          status = #pending;
          teacherNote = null;
          createdAt = Time.now();
        };
        recheckRequests.add(id, request);
        id;
      };
      case (null) { Runtime.trap("Answer sheet not found") };
    };
  };

  public query ({ caller }) func getStudentNotices() : async [Notice] {
    ensureStudent(caller);
    let allNotices = notices.values().toArray();
    allNotices.filter<Notice>(
      func(n) {
        switch (n.targetRole) {
          case (#all) { true };
          case (#student) { true };
          case (#teacher) { false };
        };
      },
    );
  };

  // HOD operations
  public query ({ caller }) func getAllTeachers() : async [UserProfile] {
    ensureHOD(caller);
    let allProfiles = userProfiles.values().toArray();
    allProfiles.filter<UserProfile>(
      func(p) {
        switch (p.role) {
          case (#teacher) { true };
          case (_) { false };
        };
      },
    );
  };

  public query ({ caller }) func getAllStudents() : async [UserProfile] {
    ensureHOD(caller);
    let allProfiles = userProfiles.values().toArray();
    allProfiles.filter<UserProfile>(
      func(p) {
        switch (p.role) {
          case (#student) { true };
          case (_) { false };
        };
      },
    );
  };

  public query ({ caller }) func getAttendanceShortageReport(threshold : Nat) : async [(Principal, Text, Nat)] {
    ensureHOD(caller);
    // Returns (studentId, subjectId, attendancePercentage) for students below threshold
    let allRecords = attendanceRecords.values().toArray();
    let studentSubjectMap = Map.empty<Text, { total : Nat; present : Nat }>();

    for (record in allRecords.vals()) {
      let key = record.studentId.toText() # ":" # record.subjectId;
      switch (studentSubjectMap.get(key)) {
        case (?stats) {
          let presentCount = stats.present + (if (record.status == #present) { 1 } else { 0 });
          studentSubjectMap.add(key, { total = stats.total + 1; present = presentCount });
        };
        case (null) {
          let presentCount = if (record.status == #present) { 1 } else { 0 };
          studentSubjectMap.add(key, { total = 1; present = presentCount });
        };
      };
    };

    let mapped = studentSubjectMap.entries().toArray().map(
      func((key, stats)) {
        let parts = key.split(#char ':');
        let studentIdText = switch (parts.next()) { case (?t) { t }; case (null) { "" } };
        let subjectId = switch (parts.next()) { case (?t) { t }; case (null) { "" } };
        let percentage = if (stats.total > 0) { (stats.present * 100) / stats.total } else { 0 };
        if (percentage < threshold) {
          switch (Principal.fromText(studentIdText)) {
            case (studentId) { ?(studentId, subjectId, percentage) };
          };
        } else {
          null;
        };
      }
    );

    let filtered = mapped.filter(
      func(x) {
        switch (x) { case (?_) { true }; case (null) { false } };
      }
    );

    filtered.map(func(x) { switch (x) { case (?val) { val }; case (null) { Runtime.trap("Unexpected null value") } } });
  };

  public query ({ caller }) func getSubjectPerformanceStats() : async [(Text, Nat)] {
    ensureHOD(caller);
    let allMarks = internalMarks.values().toArray();
    let subjectStats = Map.empty<Text, { total : Nat; count : Nat }>();

    for (mark in allMarks.vals()) {
      switch (subjectStats.get(mark.subjectId)) {
        case (?stats) {
          subjectStats.add(mark.subjectId, { total = stats.total + mark.obtainedMarks; count = stats.count + 1 });
        };
        case (null) {
          subjectStats.add(mark.subjectId, { total = mark.obtainedMarks; count = 1 });
        };
      };
    };

    subjectStats.entries().toArray().map<(Text, { total : Nat; count : Nat }), (Text, Nat)>(
      func((subjectId, stats)) {
        let avg = if (stats.count > 0) { stats.total / stats.count } else { 0 };
        (subjectId, avg);
      },
    );
  };

  public shared ({ caller }) func postDepartmentNotice(title : Text, content : Text, targetRole : { #all; #student; #teacher }) : async Text {
    ensureHOD(caller);
    let id = generateId("NOT");
    let notice = {
      id;
      postedBy = caller;
      title;
      content;
      subjectId = null;
      targetRole;
      createdAt = Time.now();
    };
    notices.add(id, notice);
    id;
  };

  // Sample data initialization
  public shared ({ caller }) func initializeSampleData() : async () {
    let admin1Id = Principal.fromText("aaaaa-aa");
    let hod1Id = Principal.fromText("2vxsx-fae");
    let teacher1Id = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
    let student1Id = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

    let admin1 : UserProfile = {
      userId = admin1Id;
      role = #admin;
      name = "Admin User";
      email = "admin@apep.edu";
      createdAt = Time.now();
    };

    let hod1 : UserProfile = {
      userId = hod1Id;
      role = #hod;
      name = "HOD Computer Science";
      email = "hod.cs@apep.edu";
      createdAt = Time.now();
    };

    let teacher1 : UserProfile = {
      userId = teacher1Id;
      role = #teacher;
      name = "Prof. John Smith";
      email = "john.smith@apep.edu";
      createdAt = Time.now();
    };

    let student1 : UserProfile = {
      userId = student1Id;
      role = #student;
      name = "Alice Johnson";
      email = "alice.j@student.apep.edu";
      createdAt = Time.now();
    };

    userProfiles.add(admin1Id, admin1);
    userProfiles.add(hod1Id, hod1);
    userProfiles.add(teacher1Id, teacher1);
    userProfiles.add(student1Id, student1);

    let studentProfile1 : StudentProfile = {
      rollNumber = "CS2024001";
      course = "B.Tech Computer Science";
      semester = 3;
      section = "A";
      userId = student1Id;
    };
    studentProfiles.add(student1Id, studentProfile1);

    let teacherProfile1 : TeacherProfile = {
      teacherCode = "T001";
      subjectIds = ["SUB0"];
      userId = teacher1Id;
    };
    teacherProfiles.add(teacher1Id, teacherProfile1);

    let subject1 : Subject = {
      id = "SUB0";
      name = "Data Structures";
      code = "CS301";
      teacherId = teacher1Id;
      semester = 3;
      section = "A";
    };
    subjects.add("SUB0", subject1);

    studentSubjects.add(student1Id, ["SUB0"]);
  };
};
