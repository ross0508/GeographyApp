import React from "react";
import AddFriend from "./AddFriend";
import NavBar from "./Navbar";
import Cookies from "universal-cookie";
import axios from "axios";

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
      console.error("Error fetching data from backend:", error.response);
    }
  };

  const respondFriendRequest = async (accept, request_id) => {
    setFriendRequests((prevRequests) =>
      prevRequests.filter((req) => req.request_id !== request_id)
    );
    const jwt_authorization = cookies.get("jwt_authorization");
    const auth_header = "Bearer " + jwt_authorization;
    try {
      const response = await axios({
        method: "PUT",
        url: `http://127.0.0.1:5000/friends/requests/${request_id}`,
        headers: {
          Authorization: auth_header,
        },
        data: {
          accept: accept,
        },
      });
      console.log("Friend request response:", response.data);
    } catch (error) {
      console.error("Error responding to friend request:", error.response);
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
              <div key={index}>
                <li>{request.sender_name}</li>
                <button
                  onClick={() => respondFriendRequest(true, request.request_id)}
                >
                  ✓
                </button>
                <button
                  onClick={() =>
                    respondFriendRequest(false, request.request_id)
                  }
                >
                  ✗
                </button>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
