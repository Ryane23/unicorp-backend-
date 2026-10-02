import {
  AttendanceStatus,
  EnrollmentStatus,
  Gender,
  GradeStatus,
  PrismaClient,
  SemesterStatus,
  StudentStatus,
  UserStatus,
  UserType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const roleDefinitions = [
  ['SUPER_ADMIN', 'Super Administrator'],
  ['ADMIN', 'Administrator'],
  ['REGISTRAR', 'Registrar'],
  ['HOD', 'Head of Department'],
  ['LECTURER', 'Lecturer'],
  ['STUDENT', 'Student'],
  ['STAFF', 'Staff'],
] as const;

const permissionDefinitions = [
  ['*', 'system', 'all'],
  ['dashboard.admin.read', 'dashboard', 'read'],
  ['dashboard.registrar.read', 'dashboard', 'read'],
  ['dashboard.hod.read', 'dashboard', 'read'],
  ['dashboard.lecturer.read', 'dashboard', 'read'],
  ['dashboard.student.read', 'dashboard', 'read'],
  ['dashboard.staff.read', 'dashboard', 'read'],
  ['users.read', 'users', 'read'],
  ['users.create', 'users', 'create'],
  ['users.update', 'users', 'update'],
  ['users.delete', 'users', 'delete'],
  ['students.read', 'students', 'read'],
  ['students.create', 'students', 'create'],
  ['students.update', 'students', 'update'],
  ['students.delete', 'students', 'delete'],
  ['academic.read', 'academic', 'read'],
  ['academic.manage', 'academic', 'manage'],
  ['courses.read', 'courses', 'read'],
  ['courses.create', 'courses', 'create'],
  ['courses.update', 'courses', 'update'],
  ['attendance.read', 'attendance', 'read'],
  ['attendance.mark', 'attendance', 'mark'],
  ['grades.read', 'grades', 'read'],
  ['grades.create', 'grades', 'create'],
  ['grades.update', 'grades', 'update'],
  ['grades.approve', 'grades', 'approve'],
  ['timetable.read', 'timetable', 'read'],
  ['timetable.manage', 'timetable', 'manage'],
  ['reports.read', 'reports', 'read'],
  ['notifications.read', 'notifications', 'read'],
  ['notifications.manage', 'notifications', 'manage'],
  ['roles.manage', 'roles', 'manage'],
  ['permissions.manage', 'permissions', 'manage'],
] as const;

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: permissionDefinitions.filter(([slug]) => slug !== '*').map(([slug]) => slug),
  REGISTRAR: [
    'dashboard.registrar.read', 'students.read', 'students.create', 'students.update',
    'academic.read', 'academic.manage', 'courses.read', 'timetable.read', 'reports.read',
    'notifications.read',
  ],
  HOD: [
    'dashboard.hod.read', 'students.read', 'academic.read', 'courses.read', 'courses.update',
    'attendance.read', 'grades.read', 'grades.approve', 'timetable.read', 'reports.read',
    'notifications.read',
  ],
  LECTURER: [
    'dashboard.lecturer.read', 'students.read', 'courses.read', 'attendance.read',
    'attendance.mark', 'grades.read', 'grades.create', 'grades.update', 'timetable.read',
    'notifications.read',
  ],
  STUDENT: [
    'dashboard.student.read', 'courses.read', 'attendance.read', 'grades.read',
    'timetable.read', 'notifications.read',
  ],
  STAFF: ['dashboard.staff.read', 'notifications.read'],
};

async function seedAuthorization() {
  const roles = new Map<string, string>();
  const permissions = new Map<string, string>();

  for (const [slug, name] of roleDefinitions) {
    const role = await prisma.roles.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
    roles.set(slug, role.id);
  }

  for (const [slug, module, action] of permissionDefinitions) {
    const permission = await prisma.permissions.upsert({
      where: { slug },
      update: { name: slug, module, action },
      create: { slug, name: slug, module, action },
    });
    permissions.set(slug, permission.id);
  }

  for (const [roleSlug, slugs] of Object.entries(rolePermissions)) {
    for (const permissionSlug of slugs) {
      await prisma.rolePermissions.upsert({
        where: {
          roleId_permissionId: {
            roleId: roles.get(roleSlug)!,
            permissionId: permissions.get(permissionSlug)!,
          },
        },
        update: {},
        create: {
          roleId: roles.get(roleSlug)!,
          permissionId: permissions.get(permissionSlug)!,
        },
      });
    }
  }

  return roles;
}

async function upsertUser(
  roles: Map<string, string>,
  passwordHash: string,
  input: {
    role: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    userType: UserType;
  },
) {
  const user = await prisma.users.upsert({
    where: { email: input.email },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      userType: input.userType,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: input.email,
      username: input.username,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      userType: input.userType,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRoles.upsert({
    where: { userId_roleId: { userId: user.id, roleId: roles.get(input.role)! } },
    update: {},
    create: { userId: user.id, roleId: roles.get(input.role)! },
  });

  return user;
}

async function main() {
  console.log('Seeding UniCore ERP single-university development data...');

  const roles = await seedAuthorization();
  const passwordHash = await bcrypt.hash(process.env.DEMO_PASSWORD || 'ChangeMe123!', 12);

  const faculty = await prisma.faculties.upsert({
    where: { code: 'FET' },
    update: { name: 'Faculty of Engineering and Technology' },
    create: { code: 'FET', name: 'Faculty of Engineering and Technology' },
  });
  const department = await prisma.departments.upsert({
    where: { code: 'CSC' },
    update: { name: 'Computer Science', facultyId: faculty.id },
    create: { code: 'CSC', name: 'Computer Science', facultyId: faculty.id },
  });
  const program = await prisma.programs.upsert({
    where: { code: 'BSC-CS' },
    update: { name: 'BSc Computer Science', departmentId: department.id },
    create: {
      code: 'BSC-CS', name: 'BSc Computer Science', departmentId: department.id,
      durationYears: 4,
    },
  });
  const level = await prisma.levels.upsert({
    where: { code: 100 },
    update: { name: 'Level 100' },
    create: { code: 100, name: 'Level 100' },
  });
  const academicYear = await prisma.academicYears.upsert({
    where: { name: '2026/2027' },
    update: { isActive: true },
    create: {
      name: '2026/2027', startDate: new Date('2026-09-01'),
      endDate: new Date('2027-07-31'), isActive: true,
    },
  });
  const semester = await prisma.semesters.upsert({
    where: { name_academicYearId: { name: 'First Semester', academicYearId: academicYear.id } },
    update: { status: SemesterStatus.ACTIVE },
    create: {
      name: 'First Semester', academicYearId: academicYear.id,
      startDate: new Date('2026-09-01'), endDate: new Date('2027-01-31'),
      status: SemesterStatus.ACTIVE,
    },
  });

  const superAdmin = await upsertUser(roles, passwordHash, {
    role: 'SUPER_ADMIN', email: 'superadmin@unicore.edu', username: 'superadmin',
    firstName: 'System', lastName: 'Owner', userType: UserType.ADMINISTRATOR,
  });
  const admin = await upsertUser(roles, passwordHash, {
    role: 'ADMIN', email: 'admin@unicore.edu', username: 'admin',
    firstName: 'Amelia', lastName: 'Stone', userType: UserType.ADMINISTRATOR,
  });
  const registrar = await upsertUser(roles, passwordHash, {
    role: 'REGISTRAR', email: 'registrar@unicore.edu', username: 'registrar',
    firstName: 'Daniel', lastName: 'Mbah', userType: UserType.STAFF,
  });
  const hodUser = await upsertUser(roles, passwordHash, {
    role: 'HOD', email: 'hod@unicore.edu', username: 'hod.csc',
    firstName: 'Nadia', lastName: 'Fomba', userType: UserType.LECTURER,
  });
  const lecturerUser = await upsertUser(roles, passwordHash, {
    role: 'LECTURER', email: 'lecturer@unicore.edu', username: 'lecturer.csc',
    firstName: 'Edwin', lastName: 'Adenike', userType: UserType.LECTURER,
  });
  const studentUser = await upsertUser(roles, passwordHash, {
    role: 'STUDENT', email: 'student@unicore.edu', username: 'student.demo',
    firstName: 'Amina', lastName: 'Bello', userType: UserType.STUDENT,
  });
  const staffUser = await upsertUser(roles, passwordHash, {
    role: 'STAFF', email: 'staff@unicore.edu', username: 'staff.demo',
    firstName: 'Brian', lastName: 'Fon', userType: UserType.STAFF,
  });

  await prisma.administrators.upsert({
    where: { userId: superAdmin.id }, update: {},
    create: { userId: superAdmin.id, staffNo: 'ADM-0001', department: 'Administration' },
  });
  await prisma.administrators.upsert({
    where: { userId: admin.id }, update: {},
    create: { userId: admin.id, staffNo: 'ADM-0002', department: 'Administration' },
  });
  await prisma.staff.upsert({
    where: { userId: registrar.id }, update: {},
    create: { userId: registrar.id, staffNo: 'REG-0001', jobTitle: 'Registrar' },
  });
  await prisma.staff.upsert({
    where: { userId: staffUser.id }, update: {},
    create: { userId: staffUser.id, staffNo: 'STF-0001', jobTitle: 'Administrative Officer' },
  });
  const hod = await prisma.lecturers.upsert({
    where: { userId: hodUser.id }, update: { departmentId: department.id },
    create: {
      userId: hodUser.id, staffNo: 'LEC-0001', departmentId: department.id,
      designation: 'Head of Department',
    },
  });
  const lecturer = await prisma.lecturers.upsert({
    where: { userId: lecturerUser.id }, update: { departmentId: department.id },
    create: {
      userId: lecturerUser.id, staffNo: 'LEC-0002', departmentId: department.id,
      designation: 'Senior Lecturer', specialization: 'Software Engineering',
    },
  });
  const student = await prisma.students.upsert({
    where: { userId: studentUser.id }, update: { levelId: level.id, status: StudentStatus.ACTIVE },
    create: {
      userId: studentUser.id, studentNo: 'UNI-2026-0001', gender: Gender.FEMALE,
      dateOfBirth: new Date('2006-04-12'), levelId: level.id,
      status: StudentStatus.ACTIVE, admissionDate: new Date('2026-09-01'),
    },
  });
  await prisma.studentPrograms.upsert({
    where: { studentId_programId: { studentId: student.id, programId: program.id } },
    update: { isPrimary: true },
    create: { studentId: student.id, programId: program.id, isPrimary: true },
  });

  const course = await prisma.courses.upsert({
    where: { code: 'CSC101' },
    update: { title: 'Introduction to Computer Science', departmentId: department.id },
    create: {
      code: 'CSC101', title: 'Introduction to Computer Science', credits: 3,
      departmentId: department.id, levelId: level.id,
    },
  });
  const offering = await prisma.courseOfferings.upsert({
    where: { courseId_semesterId: { courseId: course.id, semesterId: semester.id } },
    update: { lecturerId: lecturer.id, capacity: 120 },
    create: {
      courseId: course.id, semesterId: semester.id, lecturerId: lecturer.id, capacity: 120,
    },
  });
  for (const lecturerId of [lecturer.id, hod.id]) {
    await prisma.courseAssignments.upsert({
      where: { lecturerId_courseId: { lecturerId, courseId: course.id } },
      update: {}, create: { lecturerId, courseId: course.id },
    });
  }
  const classRecord = await prisma.classes.upsert({
    where: { offeringId_name: { offeringId: offering.id, name: 'Group A' } },
    update: {}, create: { offeringId: offering.id, name: 'Group A' },
  });
  const enrollment = await prisma.enrollments.upsert({
    where: { studentId_offeringId: { studentId: student.id, offeringId: offering.id } },
    update: { status: EnrollmentStatus.ACTIVE },
    create: { studentId: student.id, offeringId: offering.id, status: EnrollmentStatus.ACTIVE },
  });

  const attendanceDate = new Date('2026-10-01');
  let attendanceSession = await prisma.attendanceSessions.findFirst({
    where: { offeringId: offering.id, sessionDate: attendanceDate },
  });
  attendanceSession ??= await prisma.attendanceSessions.create({
    data: {
      offeringId: offering.id, sessionDate: attendanceDate,
      startTime: new Date('1970-01-01T08:00:00.000Z'),
      endTime: new Date('1970-01-01T10:00:00.000Z'),
      description: 'Introduction and course orientation',
    },
  });
  await prisma.attendanceRecords.upsert({
    where: { sessionId_studentId: { sessionId: attendanceSession.id, studentId: student.id } },
    update: { status: AttendanceStatus.PRESENT },
    create: {
      sessionId: attendanceSession.id, studentId: student.id, status: AttendanceStatus.PRESENT,
    },
  });

  const assessmentType = await prisma.assessmentTypes.upsert({
    where: { name: 'Continuous Assessment' }, update: { weightage: 40 },
    create: { name: 'Continuous Assessment', weightage: 40 },
  });
  let assessment = await prisma.assessments.findFirst({
    where: { assessmentTypeId: assessmentType.id, title: 'Foundations Quiz' },
  });
  assessment ??= await prisma.assessments.create({
    data: { assessmentTypeId: assessmentType.id, title: 'Foundations Quiz', maxMarks: 100 },
  });
  await prisma.grades.upsert({
    where: { enrollmentId_assessmentId: { enrollmentId: enrollment.id, assessmentId: assessment.id } },
    update: { marksObtained: 82, status: GradeStatus.PUBLISHED },
    create: {
      enrollmentId: enrollment.id, assessmentId: assessment.id, semesterId: semester.id,
      marksObtained: 82, status: GradeStatus.PUBLISHED,
    },
  });

  const building = await prisma.buildings.upsert({
    where: { code: 'SCI' }, update: { name: 'Science Block' },
    create: { code: 'SCI', name: 'Science Block' },
  });
  const room = await prisma.rooms.upsert({
    where: { code: 'SCI-101' }, update: { capacity: 120, buildingId: building.id },
    create: {
      code: 'SCI-101', name: 'Lecture Hall 101', capacity: 120, buildingId: building.id,
    },
  });
  const existingTimetable = await prisma.timetables.findFirst({
    where: { classId: classRecord.id, dayOfWeek: 1 },
  });
  if (!existingTimetable) {
    await prisma.timetables.create({
      data: {
        classId: classRecord.id, roomId: room.id, dayOfWeek: 1,
        startTime: new Date('1970-01-01T08:00:00.000Z'),
        endTime: new Date('1970-01-01T10:00:00.000Z'),
      },
    });
  }

  const announcementTitle = 'Welcome to the 2026/2027 academic year';
  const announcement = await prisma.announcements.findFirst({ where: { title: announcementTitle } });
  if (!announcement) {
    await prisma.announcements.create({
      data: {
        title: announcementTitle,
        content: 'Classes have commenced. Please review your timetable and registered courses.',
        isPublic: true,
      },
    });
  }
  const notification = await prisma.notifications.findFirst({
    where: { userId: studentUser.id, title: 'Course registration confirmed' },
  });
  if (!notification) {
    await prisma.notifications.create({
      data: {
        userId: studentUser.id, title: 'Course registration confirmed',
        message: 'CSC101 has been added to your registered courses.',
      },
    });
  }

  console.log('Seed complete. DEMO_PASSWORD defaults to ChangeMe123! for development only.');
  console.log('Demo accounts: superadmin, admin, registrar, hod, lecturer, student, staff @unicore.edu');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
