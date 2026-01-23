import { useEffect, useState } from "react";
import NavBar from "./Navbar";
import Cookies from "universal-cookie";
import axios from "axios";

export default function Profile() {
  const [userData, setUserData] = useState();
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
      setUserData(response.data);
      setUserDataGotten(true);
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
    <>
      {userDataGotten && (
        <div>
          <NavBar></NavBar>
          <h1>Username: {userData.username}</h1>
          <h1>Level: {userData.level}</h1>
          <h2>
            Exp: {userData.exp} / {userData.exp_to_next_level}
          </h2>
        </div>
      )}
    </>
  );
}
