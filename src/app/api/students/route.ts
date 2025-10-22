import { getStudentsDb, addStudentDb } from "@/db/studentDb";
import CreateStudentDto from "@/dto/CreateStudentDto";

export async function GET(): Promise<Response> {
  const students = await getStudentsDb();

  return new Response(JSON.stringify(students), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const dto: CreateStudentDto = await request.json();
  const student = await addStudentDb(dto);

  return new Response(JSON.stringify(student), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
