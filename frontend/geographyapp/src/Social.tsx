import React from "react";
import AddFriend from "./AddFriend";
import NavBar from "./Navbar";
import Cookies from "universal-cookie";
import axios from "axios";
import { data } from "react-router-dom";

export default function Social() {
  const cookies = new Cookies();

  const [friendRequests, setFriendRequests] = React.useState([]);
  const [dataGotten, setDataGotten] = React.useState(false);

  const getFriendRequests = async () => {
    const jwt_authorization = cookies.get("jwt_authorization");
    const auth_header = "Bearer " + jwt_authorization;
    try {
      const response = await axios({
        method: "GET",
        url: `http://127.0.0.1:5000/friends/requests`,
        headers: {
          Authorization: auth_header,
        },
      });
      setFriendRequests(response.data);
      console.log("Friend requests fetched:", response.data);
      setDataGotten(true);
      return response.data;
    } catch (error) {
      console.error("Error fetching data from backend:", error);
    }
  };

  React.useEffect(() => {
    if (!dataGotten) {
      console.log("Fetching friend requests...");
      getFriendRequests();
    }
  }, [dataGotten]);

  return (
    <div>
      <NavBar></NavBar>
      <AddFriend />
      {dataGotten && friendRequests.length === 0 && (
        <p>No pending friend requests.</p>
      )}
      {dataGotten && friendRequests.length > 0 && (
        <div>
          <h3>Pending Friend Requests:</h3>
          <ul>
            {friendRequests.map((request, index) => (
              <li key={index}>{request.sender}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
