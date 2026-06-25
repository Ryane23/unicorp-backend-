import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap((result) => {
          this.eventEmitter.emit('audit.log', {
            userId: req.user?.sub,
            tenantId: req.tenantId,
            action: method,
            entity: context.getClass().name,
            path: req.url,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            result,
          });
        }),
      );
    }

    return next.handle();
  }
}
