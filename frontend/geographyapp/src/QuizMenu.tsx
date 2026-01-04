import React from "react";

export default function QuizMenu({ setQuizState, setQuizMode }) {
  return (
    <div>
      <button
        onClick={() => {
          setQuizState(1);
          setQuizMode("new");
        }}
      >
        Learn
      </button>
      <button
        onClick={() => {
          setQuizState(1);
          setQuizMode("known");
        }}
      >
        Review
      </button>
    </div>
  );
}
