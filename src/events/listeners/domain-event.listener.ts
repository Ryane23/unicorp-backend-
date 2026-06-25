import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  EVENT_NAMES,
  StudentCreatedEvent,
  AdmissionApprovedEvent,
  CourseRegisteredEvent,
  ResultPublishedEvent,
  PaymentCompletedEvent,
  TranscriptGeneratedEvent,
  PayrollProcessedEvent,
} from '@/events/domain.events';
import { QUEUE_NAMES } from '@/queues/queue.constants';

@Injectable()
export class DomainEventListener {
  private readonly logger = new Logger(DomainEventListener.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notificationsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.AUDIT) private auditQueue: Queue,
    @InjectQueue(QUEUE_NAMES.TRANSCRIPTS) private transcriptsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.PAYROLL) private payrollQueue: Queue,
  ) {}

  @OnEvent(EVENT_NAMES.STUDENT_CREATED)
  async onStudentCreated(event: StudentCreatedEvent) {
    this.logger.log(`Student created: ${event.studentNo}`);
    await this.notificationsQueue.add('student-welcome', {
      tenantId: event.tenantId,
      studentId: event.studentId,
      channel: 'email',
    });
  }

  @OnEvent(EVENT_NAMES.ADMISSION_APPROVED)
  async onAdmissionApproved(event: AdmissionApprovedEvent) {
    await this.notificationsQueue.add('admission-letter', {
      tenantId: event.tenantId,
      applicationId: event.applicationId,
    });
  }

  @OnEvent(EVENT_NAMES.COURSE_REGISTERED)
  async onCourseRegistered(event: CourseRegisteredEvent) {
    await this.auditQueue.add('course-registration', event);
  }

  @OnEvent(EVENT_NAMES.RESULT_PUBLISHED)
  async onResultPublished(event: ResultPublishedEvent) {
    await this.notificationsQueue.add('results-published', event);
  }

  @OnEvent(EVENT_NAMES.PAYMENT_COMPLETED)
  async onPaymentCompleted(event: PaymentCompletedEvent) {
    await this.notificationsQueue.add('payment-receipt', event);
  }

  @OnEvent(EVENT_NAMES.TRANSCRIPT_GENERATED)
  async onTranscriptGenerated(event: TranscriptGeneratedEvent) {
    await this.transcriptsQueue.add('generate-pdf', event);
  }

  @OnEvent(EVENT_NAMES.PAYROLL_PROCESSED)
  async onPayrollProcessed(event: PayrollProcessedEvent) {
    await this.payrollQueue.add('generate-payslips', event);
  }

  @OnEvent(EVENT_NAMES.AUDIT_LOG)
  async onAuditLog(payload: Record<string, unknown>) {
    await this.auditQueue.add('persist', payload);
  }
}
