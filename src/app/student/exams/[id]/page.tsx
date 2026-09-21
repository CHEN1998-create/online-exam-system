import { ExamPlayer } from "@/components/student/exam-player";

export default async function ExamAnswerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExamPlayer examId={id} />;
}

