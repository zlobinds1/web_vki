interface StudentInterface {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  groupId: number;
  contacts?: string;
  isDeleted?: boolean;
  isCreating?: boolean;
}

export default StudentInterface;
