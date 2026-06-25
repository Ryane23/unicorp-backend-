export class SystemSettingsEntity {
  id!: string;
  tenantId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
