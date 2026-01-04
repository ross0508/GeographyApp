import React from "react";

export default function QuizMenu({ setQuizState, setQuizMode }) {
  return (
    <div>
      <button
        onClick={() => {
          setQuizState(1);
          setQuizMode("learn");
        }}
      >
        Learn
      </button>
      <button
        onClick={() => {
          setQuizState(1);
          setQuizMode("review");
        }}
      >
        Review
      </button>
    </div>
  );
}
