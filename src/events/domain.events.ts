export class StudentCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly studentId: string,
    public readonly userId: string,
    public readonly studentNo: string,
  ) {}
}

export class AdmissionApprovedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly applicationId: string,
    public readonly applicantId: string,
    public readonly programmeId: string,
  ) {}
}

export class CourseRegisteredEvent {
  constructor(
    public readonly tenantId: string,
    public readonly studentId: string,
    public readonly registrationId: string,
    public readonly courseIds: string[],
  ) {}
}

export class ResultPublishedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly semesterId: string,
    public readonly studentIds: string[],
  ) {}
}

export class PaymentCompletedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly paymentId: string,
    public readonly studentId: string,
    public readonly amount: number,
    public readonly reference: string,
  ) {}
}

export class TranscriptGeneratedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly transcriptId: string,
    public readonly studentId: string,
  ) {}
}

export class PayrollProcessedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly payrollRunId: string,
    public readonly employeeCount: number,
  ) {}
}

export const EVENT_NAMES = {
  STUDENT_CREATED: 'student.created',
  ADMISSION_APPROVED: 'admission.approved',
  COURSE_REGISTERED: 'course.registered',
  RESULT_PUBLISHED: 'result.published',
  PAYMENT_COMPLETED: 'payment.completed',
  TRANSCRIPT_GENERATED: 'transcript.generated',
  PAYROLL_PROCESSED: 'payroll.processed',
  AUDIT_LOG: 'audit.log',
} as const;
