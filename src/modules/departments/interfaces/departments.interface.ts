export interface IDepartments {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
