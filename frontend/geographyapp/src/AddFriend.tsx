import React from "react";

export default function AddFriend() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [friendName, setFriendName] = React.useState("");

  const sendFriendRequest = async () => {
    event?.preventDefault();
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
              Register
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
