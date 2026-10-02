export class FacultiesEntity {
  id!: string;
  name!: string;
  code!: string;
  description?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
