import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Profile from "./Profile";
import Quiz from "./Quiz";
import { useState } from "react";

function App() {
  const [quizState, setQuizState] = useState(0); // 0 = menu, 1 = quiz, 2 = results
  const [quizMode, setQuizMode] = useState("learn"); // "learn" or "review"

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/quiz"
          element={
            <Quiz
              quizState={quizState}
              setQuizState={setQuizState}
              quizMode={quizMode}
              setQuizMode={setQuizMode}
            />
          }
        />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
