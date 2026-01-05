import { useState } from "react";
import QuizMenu from "./QuizMenu";
import QuizScreen from "./QuizScreen";
import QuizResults from "./QuizResults";
import Navbar from "./Navbar";

export default function Quiz() {
  const [quizState, setQuizState] = useState(0); // 0 = menu, 1 = quiz, 2 = results
  const [quizMode, setQuizMode] = useState("learn"); // "new" or "known"

  return (
    <>
      <Navbar></Navbar>
      {quizState === 0 && (
        <QuizMenu setQuizState={setQuizState} setQuizMode={setQuizMode} />
      )}
      {quizState === 1 && (
        <QuizScreen setQuizState={setQuizState} quizMode={quizMode} />
      )}
      {quizState === 2 && <QuizResults />}
    </>
  );
}
