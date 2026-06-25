/**
 * Generates complete Prisma schema (250+ tables) from tables.json definitions.
 */
import * as fs from 'fs';
import * as path from 'path';

const BASE = `  id        String    @id @default(uuid()) @db.Uuid
  tenantId  String    @map("tenant_id") @db.Uuid
  createdBy String?   @map("created_by") @db.Uuid
  updatedBy String?   @map("updated_by") @db.Uuid
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")`;

const ENUMS = `
enum UserStatus { ACTIVE INACTIVE SUSPENDED PENDING_VERIFICATION }
enum Gender { MALE FEMALE OTHER PREFER_NOT_TO_SAY }
enum ApplicationStatus { DRAFT SUBMITTED UNDER_REVIEW APPROVED REJECTED WAITLISTED }
enum StudentStatus { ACTIVE INACTIVE GRADUATED WITHDRAWN SUSPENDED DEFERRED }
enum RegistrationStatus { PENDING APPROVED REJECTED DROPPED }
enum PaymentStatus { PENDING COMPLETED FAILED REFUNDED PARTIAL }
enum ExamType { MIDTERM FINAL SUPPLEMENTARY QUIZ PRACTICAL }
enum ResultStatus { DRAFT SUBMITTED MODERATED APPROVED PUBLISHED }
enum EmploymentType { FULL_TIME PART_TIME CONTRACT INTERN ADJUNCT }
enum LeaveStatus { PENDING APPROVED REJECTED CANCELLED }
enum BorrowingStatus { ACTIVE RETURNED OVERDUE LOST }
enum AllocationStatus { PENDING ALLOCATED CHECKED_IN CHECKED_OUT }
enum NotificationChannel { EMAIL SMS PUSH IN_APP }
enum AuditAction { CREATE UPDATE DELETE LOGIN LOGOUT EXPORT IMPORT }
enum TenantStatus { ACTIVE SUSPENDED TRIAL EXPIRED }
enum SemesterType { FIRST SECOND THIRD SUMMER }
enum AttendanceStatus { PRESENT ABSENT LATE EXCUSED }
enum TranscriptStatus { REQUESTED PROCESSING READY DELIVERED VERIFIED }
`;

function toPascalCase(s: string): string {
  return s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function extraFields(table: string): string {
  const map: Record<string, string> = {
    tenants: `  name String @db.VarChar(255)
  slug String @unique @db.VarChar(100)
  domain String? @unique @db.VarChar(255)
  status TenantStatus @default(TRIAL)
  settings Json @default("{}")
  maxUsers Int @default(1000) @map("max_users")
  maxStudents Int @default(50000) @map("max_students")
  plan String @default("standard") @db.VarChar(50)
  expiresAt DateTime? @map("expires_at")`,
    users: `  email String @db.VarChar(255)
  username String? @db.VarChar(100)
  passwordHash String @map("password_hash") @db.VarChar(255)
  firstName String @map("first_name") @db.VarChar(100)
  lastName String @map("last_name") @db.VarChar(100)
  phone String? @db.VarChar(50)
  status UserStatus @default(PENDING_VERIFICATION)
  emailVerified Boolean @default(false) @map("email_verified")
  twoFactorEnabled Boolean @default(false) @map("two_factor_enabled")
  twoFactorSecret String? @map("two_factor_secret") @db.VarChar(255)
  lastLoginAt DateTime? @map("last_login_at")
  lastLoginIp String? @map("last_login_ip") @db.VarChar(45)
  institutionId String? @map("institution_id") @db.Uuid
  campusId String? @map("campus_id") @db.Uuid`,
    refresh_tokens: `  userId String @map("user_id") @db.Uuid
  token String @unique @db.VarChar(500)
  expiresAt DateTime @map("expires_at")
  revoked Boolean @default(false)
  revokedAt DateTime? @map("revoked_at")
  ipAddress String? @map("ip_address") @db.VarChar(45)
  userAgent String? @map("user_agent") @db.Text`,
    login_history: `  userId String @map("user_id") @db.Uuid
  ipAddress String @map("ip_address") @db.VarChar(45)
  userAgent String? @map("user_agent") @db.Text
  device String? @db.VarChar(100)
  location String? @db.VarChar(255)
  success Boolean @default(true)
  failReason String? @map("fail_reason") @db.VarChar(255)
  loggedAt DateTime @default(now()) @map("logged_at")`,
    sessions: `  userId String @map("user_id") @db.Uuid
  sessionId String @unique @map("session_id") @db.VarChar(255)
  ipAddress String? @map("ip_address") @db.VarChar(45)
  userAgent String? @map("user_agent") @db.Text
  device String? @db.VarChar(100)
  expiresAt DateTime @map("expires_at")
  lastActivity DateTime @default(now()) @map("last_activity")
  isActive Boolean @default(true) @map("is_active")`,
    password_resets: `  userId String @map("user_id") @db.Uuid
  token String @unique @db.VarChar(255)
  expiresAt DateTime @map("expires_at")
  usedAt DateTime? @map("used_at")`,
    user_roles: `  userId String @map("user_id") @db.Uuid
  roleId String @map("role_id") @db.Uuid
  assignedBy String? @map("assigned_by") @db.Uuid
  expiresAt DateTime? @map("expires_at")`,
    role_permissions: `  roleId String @map("role_id") @db.Uuid
  permissionId String @map("permission_id") @db.Uuid`,
    user_permissions: `  userId String @map("user_id") @db.Uuid
  permissionId String @map("permission_id") @db.Uuid
  granted Boolean @default(true)
  assignedBy String? @map("assigned_by") @db.Uuid
  expiresAt DateTime? @map("expires_at")`,
    students: `  userId String @map("user_id") @db.Uuid
  studentNo String @map("student_no") @db.VarChar(50)
  programmeId String @map("programme_id") @db.Uuid
  campusId String @map("campus_id") @db.Uuid
  status StudentStatus @default(ACTIVE)
  admissionDate DateTime @map("admission_date") @db.Date
  cgpa Decimal? @db.Decimal(4,2)`,
    courses: `  departmentId String @map("department_id") @db.Uuid
  code String @db.VarChar(20)
  title String @db.VarChar(255)
  credits Int
  level Int @default(100)
  isActive Boolean @default(true) @map("is_active")`,
    roles: `  name String @db.VarChar(100)
  slug String @db.VarChar(100)
  description String? @db.Text
  isSystem Boolean @default(false) @map("is_system")
  parentId String? @map("parent_id") @db.Uuid`,
    permissions: `  name String @db.VarChar(100)
  slug String @db.VarChar(100)
  module String @db.VarChar(50)
  action String @db.VarChar(50)
  isSystem Boolean @default(false) @map("is_system")`,
    audit_logs: `  userId String? @map("user_id") @db.Uuid
  action AuditAction
  entityType String @map("entity_type") @db.VarChar(100)
  entityId String? @map("entity_id") @db.Uuid
  oldValue Json? @map("old_value")
  newValue Json? @map("new_value")
  ipAddress String? @map("ip_address") @db.VarChar(45)
  userAgent String? @map("user_agent") @db.Text
  device String? @db.VarChar(100)`,
    payments: `  studentId String? @map("student_id") @db.Uuid
  invoiceId String? @map("invoice_id") @db.Uuid
  amount Decimal @db.Decimal(12,2)
  currency String @default("USD") @db.VarChar(3)
  status PaymentStatus @default(PENDING)
  gateway String? @db.VarChar(50)
  reference String? @db.VarChar(100)
  paidAt DateTime? @map("paid_at")`,
    applications: `  applicantId String @map("applicant_id") @db.Uuid
  programmeId String @map("programme_id") @db.Uuid
  applicationNo String @map("application_no") @db.VarChar(50)
  status ApplicationStatus @default(DRAFT)
  submittedAt DateTime? @map("submitted_at")`,
    results: `  studentId String @map("student_id") @db.Uuid
  courseId String @map("course_id") @db.Uuid
  semesterId String @map("semester_id") @db.Uuid
  grade String? @db.VarChar(5)
  gradePoint Decimal? @map("grade_point") @db.Decimal(3,2)
  status ResultStatus @default(DRAFT)`,
  };
  if (map[table]) return map[table];
  return `  name String @db.VarChar(255)
  code String? @db.VarChar(50)
  description String? @db.Text
  status String @default("active") @db.VarChar(50)
  metadata Json @default("{}")`;
}

function generateModel(table: string): string {
  const model = toPascalCase(table);
  const fields = extraFields(table);
  const indexes = table === 'tenants'
    ? '  @@index([slug])'
    : '  @@index([tenantId])\n  @@index([tenantId, createdAt])';
  return `
model ${model} {
${BASE}
${fields}
${indexes}
  @@map("${table}")
}`;
}

const tablesPath = path.join(__dirname, 'tables.json');
const data = JSON.parse(fs.readFileSync(tablesPath, 'utf-8'));
const allTables: string[] = Object.values(data.modules).flat() as string[];

const schemasDir = path.join(__dirname, '..', 'prisma', 'schemas');
fs.mkdirSync(schemasDir, { recursive: true });

// Write single merged schema file
const mergedPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const header = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

let allContent = header + ENUMS.trim();
let totalModels = 0;
for (const tables of Object.values(data.modules) as string[][]) {
  allContent += tables.map(generateModel).join('\n');
  totalModels += tables.length;
}

fs.writeFileSync(mergedPath, allContent);
console.log(`Generated ${totalModels} models -> prisma/schema.prisma`);
