import { useState } from "react";
import SingleQuestion from "./single-question";
import MultiSelectQuestion from "./multi-select-question";
import { Button } from "../ui/button";
import { Spinner } from "../ui/loader";
import useSWR, { mutate } from "swr";
import { QuestionType } from "@/enums/questions.enum";
import DragAndDropQuestion from "./drag-and-drop-question";

const apiUrl = import.meta.env.VITE_API_URL;

const uploadAnswers = async (url: string, data: object) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to post data");
  }

  return response.json();
};

interface QuestionsProps {
  moveNext: () => void;
}

const Questions: React.FC<QuestionsProps> = ({ moveNext }) => {
  const questionIndexArray = [10, 7, 16, 17, 15];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const {
    data: questionRes,
    error,
    isLoading,
  } = useSWR(`${apiUrl}/question/${questionIndexArray[currentQuestionIndex]}`, {
    revalidateOnFocus: false,
  });

  if (error) {
    return <p>Error loading data</p>;
  }
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col mt-12">
        <Spinner />
      </div>
    );
  }

  const question = questionRes.question;
  const totalCount = 5;

  const handleNextQuestion = async () => {
    if (currentQuestionIndex === totalCount - 1) {
      mutate(
        `${apiUrl}/answers`,
        uploadAnswers(`${apiUrl}/answers`, {
          answers: Object.entries(answers).reduce(
            (acc, curr) => [...acc, { index: curr[0], answer: curr[1] }],
            [] as { index: string; answer: string[] }[]
          ),
        })
      );
      moveNext();
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleOptionsChange = (answer: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndexArray[currentQuestionIndex]]: answer,
    }));
  };

  const renderQuestion = () => {
    switch (question.type) {
      case QuestionType.SINGLE_SELECT:
      case QuestionType.TRUE_FALSE:
        return (
          <SingleQuestion
            questionNumber={currentQuestionIndex + 1}
            question={question.question}
            questionType={question.type}
            options={question.options}
            optionChange={handleOptionsChange}
          />
        );
      case QuestionType.MULTI_SELECT:
        return (
          <MultiSelectQuestion
            questionNumber={currentQuestionIndex + 1}
            question={question.question}
            options={question.options}
            questionType={question.type}
            optionChange={handleOptionsChange}
          />
        );
      case QuestionType.ORDERING:
        return (
          <DragAndDropQuestion
            questionNumber={currentQuestionIndex + 1}
            question={question.question}
            options={question.options}
            questionType={question.type}
            optionChange={handleOptionsChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col mt-12">
      <div className="flex-1 mb-4"> {renderQuestion()}</div>

      <div className="flex align-middle justify-end fixed bottom-0 right-0 left-0 bg-white border border-t-gray-100 py-2">
        <div className="container flex gap-6 justify-end">
          <Button variant="default" onClick={handleNextQuestion}>
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Questions;
