import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";

export default function QuizScreen({ setQuizState, quizMode }) {
  const cookies = new Cookies();

  const [dataGotten, setDataGotten] = useState(false);
  const [quizData, setQuizData] = useState(null);

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
      return response.data;
    } catch (error) {
      console.error("Error fetching data from backend:", error);
    }
  };

  useEffect(() => {
    if (!dataGotten) {
      getQuizData();
    }
    console.log(quizData);
  }, [dataGotten]);

  return <div>Quiz Started</div>;
}
