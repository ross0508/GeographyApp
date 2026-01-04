import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Profile from "./Profile";
import Quiz from "./Quiz";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
