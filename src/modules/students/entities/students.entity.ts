export class StudentsEntity {
  id!: string;
  userId!: string;
  studentNo!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
