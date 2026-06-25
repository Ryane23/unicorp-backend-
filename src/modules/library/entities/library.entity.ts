export class LibraryEntity {
  id!: string;
  tenantId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
