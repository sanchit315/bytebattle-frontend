import { Button } from "../ui/button";
import Markdown from "react-markdown";
import "@/styles/markdown.css";
import useSWR from "swr";
import { Spinner } from "../ui/loader";

const apiUrl = import.meta.env.VITE_API_URL;

interface ViewDocumentsProps {
  skipQuiz: () => void;
  startQuiz: () => void;
}

const ViewDocuments: React.FC<ViewDocumentsProps> = ({
  skipQuiz,
  startQuiz,
}) => {
  const {
    data: readingMaterialRes,
    error,
    isLoading,
  } = useSWR(`${apiUrl}/reading_material`);

  if (error) return <div>Error Something went wrong</div>;
  if (isLoading) return <Spinner />;

  const readingMaterial = readingMaterialRes.readingMaterial;

  const markdown = readingMaterial;

  return (
    <div className="flex-1 flex flex-col mt-12">
      <div className="flex flex-1 mb-4">
        <Markdown className="markdown-body">{markdown}</Markdown>
      </div>

      <div className="flex align-middle justify-end fixed bottom-0 right-0 left-0 bg-white border border-t-gray-100 py-2">
        <div className="container flex gap-6 justify-end">
          <Button variant="outline" onClick={skipQuiz}>
            Skip Quiz
          </Button>
          <Button variant="default" onClick={startQuiz}>
            Start Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewDocuments;
