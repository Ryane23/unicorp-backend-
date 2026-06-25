/**
 * Scaffolds NestJS modules with Clean Architecture structure.
 * Run: node scripts/sc2-module-scaffold.js
 */
const fs = require('fs');
const path = require('path');

const MODULES = [
  'auth', 'authorization', 'users', 'roles', 'permissions',
  'institutions', 'campuses', 'faculties', 'departments', 'programmes',
  'academic-years', 'semesters', 'notifications', 'audit-logs', 'reports', 'system-settings',
  'admissions', 'students', 'course-registration', 'attendance', 'timetable',
  'examination', 'results', 'transcripts', 'finance', 'hr', 'payroll',
  'library', 'hostel', 'lms', 'communication', 'courses',
];

const API_PREFIX = {
  auth: 'auth',
  authorization: 'authorization',
  users: 'users',
  roles: 'roles',
  permissions: 'permissions',
  institutions: 'institutions',
  campuses: 'campuses',
  faculties: 'faculties',
  departments: 'departments',
  programmes: 'programmes',
  'academic-years': 'academic-years',
  semesters: 'semesters',
  notifications: 'notifications',
  'audit-logs': 'audit-logs',
  reports: 'reports',
  'system-settings': 'settings',
  admissions: 'admissions',
  students: 'students',
  'course-registration': 'registrations',
  attendance: 'attendance',
  timetable: 'timetable',
  examination: 'examinations',
  results: 'results',
  transcripts: 'transcripts',
  finance: 'finance',
  hr: 'hr',
  payroll: 'payroll',
  library: 'library',
  hostel: 'hostel',
  lms: 'lms',
  communication: 'communication',
  courses: 'courses',
};

function toPascalCase(s) {
  return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function toCamelCase(s) {
  const p = toPascalCase(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
}

const srcRoot = path.join(__dirname, '..', 'src', 'modules');

for (const mod of MODULES) {
  const name = toPascalCase(mod);
  const camel = toCamelCase(mod);
  const base = path.join(srcRoot, mod);
  const dirs = ['controllers', 'services', 'repositories', 'dto', 'entities', 'interfaces', 'events', 'listeners'];
  dirs.forEach((d) => ensureDir(path.join(base, d)));

  const route = API_PREFIX[mod] || mod;

  writeIfNotExists(
    path.join(base, `${mod}.module.ts`),
    `import { Module } from '@nestjs/common';
import { ${name}Controller } from './controllers/${mod}.controller';
import { ${name}Service } from './services/${mod}.service';
import { ${name}Repository } from './repositories/${mod}.repository';

@Module({
  controllers: [${name}Controller],
  providers: [${name}Service, ${name}Repository],
  exports: [${name}Service, ${name}Repository],
})
export class ${name}Module {}
`,
  );

  writeIfNotExists(
    path.join(base, 'controllers', `${mod}.controller.ts`),
    `import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ${name}Service } from '../services/${mod}.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('${name}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('${route}')
export class ${name}Controller {
  constructor(private readonly ${camel}Service: ${name}Service) {}

  @Get()
  @ApiOperation({ summary: 'List all ${mod.replace(/-/g, ' ')}' })
  @RequirePermissions('${mod}:read')
  findAll(@Query() query: PaginationDto) {
    return this.${camel}Service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${mod.replace(/-/g, ' ')} by ID' })
  @RequirePermissions('${mod}:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.${camel}Service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create ${mod.replace(/-/g, ' ')}' })
  @RequirePermissions('${mod}:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.${camel}Service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ${mod.replace(/-/g, ' ')}' })
  @RequirePermissions('${mod}:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.${camel}Service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ${mod.replace(/-/g, ' ')}' })
  @RequirePermissions('${mod}:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.${camel}Service.remove(id);
  }
}
`,
  );

  writeIfNotExists(
    path.join(base, 'services', `${mod}.service.ts`),
    `import { Injectable, NotFoundException } from '@nestjs/common';
import { ${name}Repository } from '../repositories/${mod}.repository';
import { PaginationDto, PaginatedResult } from '@/shared/dto/pagination.dto';
import { TenantContext } from '@/common/context/tenant.context';

@Injectable()
export class ${name}Service {
  constructor(
    private readonly repository: ${name}Repository,
    private readonly tenantContext: TenantContext,
  ) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    return this.repository.findAll(this.tenantContext.tenantId, query);
  }

  async findOne(id: string) {
    const item = await this.repository.findById(this.tenantContext.tenantId, id);
    if (!item) throw new NotFoundException('${name} not found');
    return item;
  }

  async create(dto: Record<string, unknown>) {
    return this.repository.create(this.tenantContext.tenantId, dto);
  }

  async update(id: string, dto: Record<string, unknown>) {
    await this.findOne(id);
    return this.repository.update(this.tenantContext.tenantId, id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.softDelete(this.tenantContext.tenantId, id);
  }
}
`,
  );

  writeIfNotExists(
    path.join(base, 'repositories', `${mod}.repository.ts`),
    `import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto, PaginatedResult, buildPaginationMeta } from '@/shared/dto/pagination.dto';

@Injectable()
export class ${name}Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    // Override in module-specific repository with actual Prisma model
    return { data: [], meta: buildPaginationMeta(0, page, limit) };
  }

  async findById(tenantId: string, id: string) {
    return null;
  }

  async create(tenantId: string, data: Record<string, unknown>) {
    return { id, tenantId, ...data };
  }

  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    return { id, tenantId, ...data };
  }

  async softDelete(tenantId: string, id: string) {
    return { id, deleted: true };
  }
}
`,
  );

  writeIfNotExists(
    path.join(base, 'interfaces', `${mod}.interface.ts`),
    `export interface I${name} {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}
`,
  );

  writeIfNotExists(
    path.join(base, 'entities', `${mod}.entity.ts`),
    `export class ${name}Entity {
  id!: string;
  tenantId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
`,
  );

  writeIfNotExists(
    path.join(base, 'dto', `create-${mod}.dto.ts`),
    `import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create${name}Dto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
`,
  );
}

console.log(`Scaffolded ${MODULES.length} modules`);
