import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue.constants';

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing notification job ${job.id}: ${job.name}`);
    // Dispatch to email/sms/push based on job.data.channel
  }
}

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Sending email: ${job.data.subject} to ${job.data.to}`);
  }
}

@Processor(QUEUE_NAMES.AUDIT)
export class AuditProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.debug(`Audit log persisted: ${job.data.action} on ${job.data.entity}`);
  }
}

@Processor(QUEUE_NAMES.TRANSCRIPTS)
export class TranscriptProcessor extends WorkerHost {
  private readonly logger = new Logger(TranscriptProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Generating transcript for student ${job.data.studentId}`);
  }
}

@Processor(QUEUE_NAMES.PAYROLL)
export class PayrollProcessor extends WorkerHost {
  private readonly logger = new Logger(PayrollProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing payroll run ${job.data.payrollRunId}`);
  }
}
