export class DepartmentsEntity {
  id!: string;
  name!: string;
  code!: string;
  facultyId!: string;
  description?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
