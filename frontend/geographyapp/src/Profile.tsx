import { useEffect, useState } from "react";
import NavBar from "./Navbar";
import Cookies from "universal-cookie";
import axios from "axios";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [userDataGotten, setUserDataGotten] = useState(false);

  const cookies = new Cookies();

  const getUserData = async () => {
    const token = cookies.get("jwt_authorization");
    const auth = "Bearer " + token;
    try {
      const response = await axios({
        method: "GET",
        url: `http://127.0.0.1:5000/users`,
        headers: { Authorization: auth },
      });
      setUsername(response.data["username"]);
    } catch (error) {
      console.log("Error fetching user data from backend:", error.response);
    }
  };

  useEffect(() => {
    if (!userDataGotten) {
      getUserData();
    }
  }, [userDataGotten]);

  return (
    <div>
      <NavBar></NavBar>
      <h1>Username: {username}</h1>
    </div>
  );
}
