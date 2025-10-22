import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudentApi,
  deleteStudentApi,
  getStudentsApi,
} from "@/api/studentsApi";
import StudentInterface from "@/types/StudentInterface";
import CreateStudentDto from "@/dto/CreateStudentDto";

interface StudentsHookInterface {
  students: StudentInterface[];
  deleteStudentMutate: (studentId: number) => void;
  createStudentMutate: (dto: CreateStudentDto) => void;
}

const useStudents = (): StudentsHookInterface => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudentsApi(),
    enabled: false,
  });

  /**
   * Мутация удаления студента
   */
  const deleteStudentMutate = useMutation({
    // вызов API delete
    mutationFn: async (studentId: number) => deleteStudentApi(studentId),
    // оптимистичная мутация (обновляем данные на клиенте до API запроса delete)
    onMutate: async (studentId: number) => {
      await queryClient.cancelQueries({ queryKey: ["students"] });
      // получаем данные из TanStackQuery
      const previousStudents = queryClient.getQueryData<StudentInterface[]>([
        "students",
      ]);
      let updatedStudents = [...(previousStudents ?? [])];

      if (!updatedStudents) return;

      // помечаем удаляемую запись
      updatedStudents = updatedStudents.map((student: StudentInterface) => ({
        ...student,
        ...(student.id === studentId ? { isDeleted: true } : {}),
      }));
      // обновляем данные в TanStackQuery
      queryClient.setQueryData<StudentInterface[]>(
        ["students"],
        updatedStudents
      );

      return { previousStudents, updatedStudents };
    },
    onError: (err, variables, context) => {
      console.log(">>> deleteStudentMutate  err", err);
      queryClient.setQueryData<StudentInterface[]>(
        ["students"],
        context?.previousStudents
      );
    },
    // обновляем данные в случаи успешного выполнения mutationFn: async (studentId: number) => deleteStudentApi(studentId),
    onSuccess: async (studentId, variables, { previousStudents }) => {
      await queryClient.cancelQueries({ queryKey: ["students"] });
      // вариант 1 - запрос всех записей
      // refetch();

      // вариант 2 - удаление конкретной записи
      if (!previousStudents) {
        return;
      }
      const updatedStudents = previousStudents.filter(
        (student: StudentInterface) => student.id !== studentId
      );
      queryClient.setQueryData<StudentInterface[]>(
        ["students"],
        updatedStudents
      );
    },
    // onSettled: (data, error, variables, context) => {
    //   // вызывается после выполнения запроса в случаи удачи или ошибке
    //   console.log('>> deleteStudentMutate onSettled', data, error, variables, context);
    // },
  });

  /**
   * Мутация создания студента
   */
  const createStudentMutate = useMutation({
    mutationFn: async (dto: CreateStudentDto) => await createStudentApi(dto),
    onMutate: async (newStudentDto: CreateStudentDto) => {
      await queryClient.cancelQueries({ queryKey: ["students"] });
      const previousStudents = queryClient.getQueryData<StudentInterface[]>([
        "students",
      ]);
      const tempId = Date.now() * -1;
      const optimisticStudent: StudentInterface = {
        id: tempId,
        isCreating: true,
        ...newStudentDto,
      };

      queryClient.setQueryData<StudentInterface[]>(
        ["students"],
        (oldStudents) => [...(oldStudents ?? []), optimisticStudent]
      );
      return { previousStudents, optimisticStudent };
    },
    onError: (err, variables, context) => {
      console.log(">>> createStudentMutate onError", err);
      queryClient.setQueryData<StudentInterface[]>(
        ["students"],
        context?.previousStudents
      );
    },
    onSuccess: async (createdStudent, variables, context) => {
      if (!createdStudent) {
        queryClient.setQueryData<StudentInterface[]>(
          ["students"],
          (oldStudents) =>
            oldStudents?.filter(
              (student) => student.id !== context?.optimisticStudent.id
            )
        );
        return;
      }
      await queryClient.cancelQueries({ queryKey: ["students"] });
      queryClient.setQueryData<StudentInterface[]>(
        ["students"],
        (oldStudents) =>
          oldStudents?.map((student) =>
            student.id === context?.optimisticStudent.id
              ? createdStudent
              : student
          )
      );
    },
  });

  return {
    students: data ?? [],
    deleteStudentMutate: deleteStudentMutate.mutate,
    createStudentMutate: createStudentMutate.mutate,
  };
};
export default useStudents;
