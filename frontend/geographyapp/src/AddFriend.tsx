import axios from "axios";
import React from "react";
import Cookies from "universal-cookie";

export default function AddFriend() {
  const cookies = new Cookies();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [friendName, setFriendName] = React.useState("");

  const sendFriendRequest = async () => {
    event.preventDefault();
    const jwt_authorization = cookies.get("jwt_authorization");
    const auth_header = "Bearer " + jwt_authorization;
    try {
      const response = await axios({
        method: "POST",
        url: `http://127.0.0.1:5000/friends/requests/${friendName}`,
        headers: {
          Authorization: auth_header,
        },
      });
      setFriendName("");
      setMenuOpen(false);
      return response.data;
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <div>
      {!menuOpen && (
        <button onClick={() => setMenuOpen(true)}>Add Friend</button>
      )}
      {menuOpen && (
        <div>
          <button onClick={() => setMenuOpen(false)}>x</button>
          <form className="login-form">
            <div className="form-group">
              <label htmlFor="friendname">Name </label>
              <input
                type="friendname"
                id="friendname"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="Enter your friend's username"
              />
            </div>
            <button
              onClick={() => sendFriendRequest()}
              className="login-button"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
