import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";

export default function QuizScreen({ setQuizState, quizMode }) {
  const cookies = new Cookies();

  const [dataGotten, setDataGotten] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [images, setImages] = useState({});

  const getQuizData = async () => {
    const jwt_authorization = cookies.get("jwt_authorization");
    const auth_header = "Bearer " + jwt_authorization;
    try {
      const response = await axios({
        method: "GET",
        url: `http://127.0.0.1:5000/facts/${quizMode}/10`,
        headers: {
          Authorization: auth_header,
        },
      });
      setQuizData(response.data);
      setDataGotten(true);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching data from backend:", error);
    }
  };

  const getImages = async () => {
    const jwt_authorization = cookies.get("jwt_authorization");
    const auth_header = "Bearer " + jwt_authorization;
    for (const item of quizData) {
      try {
        const response = await axios({
          method: "GET",
          url: `http://127.0.0.1:5000/img/${item.image_name}.jpg`,
          headers: {
            Authorization: auth_header,
          },
        });
        setImages((prevImages) => ({
          ...prevImages,
          [item.image_name]: response.data,
        }));
      } catch (error) {
        console.error("Error fetching image from backend:", error);
      }
      console.log(response.data);
    }
  };

  useEffect(() => {
    if (!dataGotten) {
      getQuizData();
    }
  }, [dataGotten]);

  useEffect(() => {
    if (dataGotten === false) {
      return;
    }
    if (currentQuestionIndex >= quizData.length - 1) {
      setQuizState(2);
    }
    const correctAnswer = quizData[currentQuestionIndex].answer;
    const wrongAnswers = quizData
      .filter((_, index) => index !== currentQuestionIndex)
      .map((item) => item.answer);
    const shuffledAnswers = [
      correctAnswer,
      ...wrongAnswers.sort(() => 0.5 - Math.random()).slice(0, 3),
    ].sort(() => 0.5 - Math.random());
    setAnswers(shuffledAnswers);
  }, [currentQuestionIndex, dataGotten]);

  const handleAnswer = (selectedAnswer) => {
    const correctAnswer = quizData[currentQuestionIndex].answer;
    if (selectedAnswer === correctAnswer) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      window.alert("Incorrect");
    }
  };

  return (
    <div>
      {dataGotten && (
        <div>
          {quizData[currentQuestionIndex].category == "Capital" && (
            <div>
              <img
                src={`http://127.0.0.1:5000/img/${quizData[currentQuestionIndex].img_url}.jpg`}
              />
              What is the capital of{" "}
              {quizData[currentQuestionIndex].country_name}?
              {answers.map((answer, index) => (
                <button key={index} onClick={() => handleAnswer(answer)}>
                  {answer}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
