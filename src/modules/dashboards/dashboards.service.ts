import { Injectable, NotFoundException } from '@nestjs/common';
import { GradeStatus, SemesterStatus, StudentStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async admin() {
    const [
      students,
      lecturers,
      staff,
      courses,
      faculties,
      departments,
      programs,
      activeAcademicYear,
      attendance,
      gradeAverage,
      announcements,
    ] = await Promise.all([
      this.prisma.students.count({ where: { deletedAt: null } }),
      this.prisma.lecturers.count({ where: { deletedAt: null } }),
      this.prisma.staff.count(),
      this.prisma.courses.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.faculties.count({ where: { deletedAt: null } }),
      this.prisma.departments.count({ where: { deletedAt: null } }),
      this.prisma.programs.count({ where: { deletedAt: null } }),
      this.prisma.academicYears.findFirst({
        where: { isActive: true },
        include: { semesters: { where: { status: SemesterStatus.ACTIVE } } },
      }),
      this.prisma.attendanceRecords.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.grades.aggregate({
        where: { status: { in: [GradeStatus.APPROVED, GradeStatus.PUBLISHED] } },
        _avg: { marksObtained: true },
      }),
      this.recentAnnouncements(),
    ]);

    return {
      role: 'ADMIN',
      metrics: { students, lecturers, staff, courses, faculties, departments, programs },
      academicPeriod: activeAcademicYear
        ? {
            year: activeAcademicYear.name,
            semester: activeAcademicYear.semesters[0]?.name ?? null,
          }
        : null,
      attendance: attendance.map((item) => ({ status: item.status, count: item._count._all })),
      academicPerformance: {
        averageMark: Number(gradeAverage._avg.marksObtained ?? 0),
      },
      announcements,
    };
  }

  async registrar() {
    const [activeStudents, enrollmentStatuses, programs, academicYears, announcements] =
      await Promise.all([
        this.prisma.students.count({
          where: { deletedAt: null, status: StudentStatus.ACTIVE },
        }),
        this.prisma.enrollments.groupBy({ by: ['status'], _count: { _all: true } }),
        this.prisma.programs.count({ where: { deletedAt: null } }),
        this.prisma.academicYears.findMany({
          orderBy: { startDate: 'desc' },
          take: 4,
          include: { semesters: { orderBy: { startDate: 'asc' } } },
        }),
        this.recentAnnouncements(),
      ]);

    return {
      role: 'REGISTRAR',
      metrics: { activeStudents, programs },
      enrollments: enrollmentStatuses.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      academicCalendar: academicYears,
      announcements,
    };
  }

  async hod(userId: string) {
    const profile = await this.prisma.lecturers.findUnique({
      where: { userId },
      include: { user: true, department: true },
    });
    if (!profile) throw new NotFoundException('HOD lecturer profile not found');

    const departmentId = profile.departmentId;
    const [lecturers, courses, students, pendingGrades, gradeAverage, announcements] =
      await Promise.all([
        this.prisma.lecturers.count({ where: { departmentId, deletedAt: null } }),
        this.prisma.courses.count({ where: { departmentId, deletedAt: null } }),
        this.prisma.students.count({
          where: {
            deletedAt: null,
            programs: { some: { program: { departmentId } } },
          },
        }),
        this.prisma.grades.count({
          where: {
            status: GradeStatus.SUBMITTED,
            enrollment: { offering: { course: { departmentId } } },
          },
        }),
        this.prisma.grades.aggregate({
          where: {
            status: { in: [GradeStatus.APPROVED, GradeStatus.PUBLISHED] },
            enrollment: { offering: { course: { departmentId } } },
          },
          _avg: { marksObtained: true },
        }),
        this.recentAnnouncements(),
      ]);

    return {
      role: 'HOD',
      profile: this.person(profile.user),
      department: { id: profile.department.id, name: profile.department.name },
      metrics: {
        lecturers,
        students,
        courses,
        pendingGradeApprovals: pendingGrades,
        averageMark: Number(gradeAverage._avg.marksObtained ?? 0),
      },
      announcements,
    };
  }

  async lecturer(userId: string) {
    const profile = await this.prisma.lecturers.findUnique({
      where: { userId },
      include: { user: true, department: true },
    });
    if (!profile) throw new NotFoundException('Lecturer profile not found');

    const [offerings, enrolledStudents, pendingGrades, timetable, announcements] =
      await Promise.all([
        this.prisma.courseOfferings.findMany({
          where: { lecturerId: profile.id },
          include: { course: true, semester: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.enrollments.count({ where: { offering: { lecturerId: profile.id } } }),
        this.prisma.grades.count({
          where: {
            status: GradeStatus.DRAFT,
            enrollment: { offering: { lecturerId: profile.id } },
          },
        }),
        this.prisma.timetables.findMany({
          where: { class: { offering: { lecturerId: profile.id } } },
          include: {
            room: { include: { building: true } },
            class: { include: { offering: { include: { course: true } } } },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        }),
        this.recentAnnouncements(),
      ]);

    return {
      role: 'LECTURER',
      profile: this.person(profile.user),
      department: profile.department.name,
      metrics: { courses: offerings.length, enrolledStudents, pendingGrades },
      courses: offerings,
      timetable,
      announcements,
    };
  }

  async student(userId: string) {
    const profile = await this.prisma.students.findUnique({
      where: { userId },
      include: {
        user: true,
        level: true,
        programs: { include: { program: { include: { department: true } } } },
      },
    });
    if (!profile) throw new NotFoundException('Student profile not found');

    const [enrollments, attendance, grades, timetable, unreadNotifications, announcements] =
      await Promise.all([
        this.prisma.enrollments.findMany({
          where: { studentId: profile.id },
          include: { offering: { include: { course: true, semester: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.attendanceRecords.groupBy({
          by: ['status'],
          where: { studentId: profile.id },
          _count: { _all: true },
        }),
        this.prisma.grades.findMany({
          where: {
            enrollment: { studentId: profile.id },
            status: { in: [GradeStatus.APPROVED, GradeStatus.PUBLISHED] },
          },
          include: {
            assessment: true,
            enrollment: { include: { offering: { include: { course: true } } } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
        this.prisma.timetables.findMany({
          where: {
            class: { offering: { enrollments: { some: { studentId: profile.id } } } },
          },
          include: {
            room: { include: { building: true } },
            class: { include: { offering: { include: { course: true } } } },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        }),
        this.prisma.notifications.count({ where: { userId, isRead: false } }),
        this.recentAnnouncements(),
      ]);

    const attendanceTotal = attendance.reduce((sum, item) => sum + item._count._all, 0);
    const present = attendance.find((item) => item.status === 'PRESENT')?._count._all ?? 0;

    return {
      role: 'STUDENT',
      profile: {
        ...this.person(profile.user),
        studentNo: profile.studentNo,
        level: profile.level.name,
        program: profile.programs.find((item) => item.isPrimary)?.program ?? null,
      },
      metrics: {
        courses: enrollments.length,
        attendanceRate: attendanceTotal ? Math.round((present / attendanceTotal) * 100) : 0,
        unreadNotifications,
      },
      courses: enrollments,
      grades,
      timetable,
      announcements,
    };
  }

  async staff(userId: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Staff account not found');

    const [unreadNotifications, announcements] = await Promise.all([
      this.prisma.notifications.count({ where: { userId, isRead: false } }),
      this.recentAnnouncements(),
    ]);

    return {
      role: 'STAFF',
      profile: this.person(user),
      metrics: { unreadNotifications },
      announcements,
    };
  }

  private recentAnnouncements() {
    return this.prisma.announcements.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  private person(user: { id: string; firstName: string; lastName: string; email: string }) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }
}
