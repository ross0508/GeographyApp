import { useState, useEffect } from "react";
import AddFriend from "./AddFriend";
import NavBar from "./Navbar";
import Cookies from "universal-cookie";
import axios from "axios";

export default function Social() {
  const cookies = new Cookies();

  const [friendRequests, setFriendRequests] = useState([]);
  const [requestDataGotten, setRequestDataGotten] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendDataGotten, setFriendDataGotten] = useState(false);

  const getFriends = async () => {
    const jwt_authorization = cookies.get("jwt_authorization");
    const auth_header = "Bearer " + jwt_authorization;
    try {
      const response = await axios({
        method: "GET",
        url: `http://127.0.0.1:5000/friends`,
        headers: {
          Authorization: auth_header,
        },
      });
      setFriends(response.data);
      console.log("Friends fetched:", response.data);
      setFriendDataGotten(true);
      return response.data;
    } catch (error) {
      console.error("Error fetching friends from backend:", error.response);
    }
  };

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
      setRequestDataGotten(true);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching friend requests from backend:",
        error.response
      );
    }
  };

  const respondFriendRequest = async (accept, request_id) => {
    setFriendRequests((prevRequests) =>
      prevRequests.filter((req) => req.request_id !== request_id)
    );
    if (accept) {
      setFriends((prevFriends) => prevFriends.filter((friend) => friend));
    }
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

  useEffect(() => {
    if (!requestDataGotten) {
      getFriendRequests();
    }
  }, [requestDataGotten]);

  useEffect(() => {
    if (!friendDataGotten) {
      getFriends();
    }
  }, [friendDataGotten]);

  return (
    <div>
      <NavBar></NavBar>
      <AddFriend />
      {requestDataGotten && friendRequests.length === 0 && (
        <p>No pending friend requests.</p>
      )}
      {requestDataGotten && friendRequests.length > 0 && (
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
      {friendDataGotten && friends.length > 0 && (
        <div>
          <h3>Friends:</h3>
          <ul>
            {friends.map((friend, index) => (
              <div key={index}>
                <li>{friend}</li>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
