import React from "react";
import QuizMenu from "./QuizMenu";
import QuizScreen from "./QuizScreen";
import QuizResults from "./QuizResults";

export default function Quiz({
  quizState,
  setQuizState,
  quizMode,
  setQuizMode,
}) {
  return (
    <>
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
