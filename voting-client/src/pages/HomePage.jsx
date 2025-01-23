// src/pages/HomePage.jsx

import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import "./Home.css";

function HomePage({ currentAccount, connectWallet, isAdmin }) {
  const navigate = useNavigate();

 // Once the user is connected, redirect them to /admin or /voter depending on their role

  async function handleConnect() {
    await connectWallet();
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/voter");
    }
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Voting Application</h1>
      <p className="home-subtitle">
        <span className="welcome-message">
          Welcome to the <strong>Blockchain Voting Application</strong>!
        </span>
        <br />
        <span className="highlight">Let’s make every vote count!</span>
      </p>

      {!currentAccount && (
        <button className="connect-btn" onClick={handleConnect}>
          Connect to your account
        </button>
      )}

      {currentAccount && (
        <div style={{ color: "#fff" }}>
          <p>You are already connected with: <b>{currentAccount}</b></p>
          <button className="connect-btn" onClick={() => navigate(isAdmin ? "/admin" : "/voter")}>
            To access the {isAdmin ? "Admin" : "Voter"} Page
          </button>
        </div>
      )}
    </div>
  );
}

HomePage.propTypes = {
  currentAccount: PropTypes.string,  
  connectWallet: PropTypes.func,
  isAdmin: PropTypes.bool, 
};

export default HomePage;
