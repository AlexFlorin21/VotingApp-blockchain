// src/pages/AdminPage.jsx

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./AdminPage.css";
import { ethers } from "ethers";

function AdminPage({ currentAccount, electionContract}) {
  const [voterAddress, setVoterAddress] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [electionEnded, setElectionEnded] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (electionContract && electionEnded) {
      fetchCandidates();
    }
  });

  const handleAddVoter = async () => {
    if (!electionContract) {
      alert("Contract is not loaded.");
      return;
    }

    if (!ethers.utils.isAddress(voterAddress)) {
      alert("Invalid Ethereum address.");
      return;
    }

    if (voterAddress.toLowerCase() === currentAccount.toLowerCase()) {
      alert("You cannot add the owner as a voter.");
      return;
    }

    try {
      const tx = await electionContract.addVoter(voterAddress);
      setStatus("Adding voter in progress...");
      await tx.wait();
      setStatus("Voter added successfully!");
      setVoterAddress("");
    } catch (err) {
      console.error("Error adding voter:", err);
      alert("Error adding voter: " + (err.reason || err.message));
    }
  };

  const handleAddCandidate = async () => {
    if (!electionContract) {
      alert("Contract is not loaded.");
      return;
    }

    if (candidateName.trim() === "") {
      alert("Candidate name cannot be empty.");
      return;
    }

    try {
      const tx = await electionContract.addCandidate(candidateName);
      setStatus("Adding candidate in progress...");
      await tx.wait();
      setStatus("Candidate added successfully!");
      setCandidateName("");
    } catch (err) {
      console.error("Error adding candidate:", err);
      alert("Error adding candidate: " + (err.reason || err.message));
    }
  };

  const handleStartElection = async () => {
    if (!electionContract) {
      alert("Contract is not loaded.");
      return;
    }

    try {
      const tx = await electionContract.startElection();
      setStatus("Starting election...");
      await tx.wait();
      setStatus("Election started successfully!");
    } catch (err) {
      console.error("Error starting election:", err);
      alert("Error starting election: " + (err.reason || err.message));
    }
  };

  const handleEndElection = async () => {
    if (!electionContract) {
      alert("Contract is not loaded.");
      return;
    }

    try {
      const tx = await electionContract.endElection();
      setStatus("Ending election...");
      await tx.wait();
      setStatus("Election ended successfully!");
      setElectionEnded(true); // Set election state to ended
      // fetchCandidates(); // Will trigger via useEffect
    } catch (err) {
      console.error("Error ending election:", err);
      alert("Error ending election: " + (err.reason || err.message));
    }
  };

  const fetchCandidates = async () => {
    if (!electionContract) {
      alert("Contract is not loaded.");
      return;
    }

    try {
      const count = await electionContract.getCandidatesCount();
      const candidateList = [];
      for (let i = 0; i < count; i++) {
        const candidate = await electionContract.getCandidateDetails(i);
        // Optionally, fetch vote count from ResultContract as well
        // const voteCountFromResult = await resultContract.getResult(i);
        candidateList.push({
          id: i,
          name: candidate[0],
          voteCount: parseInt(candidate[1].toString(), 10),
          
        });
      }
      setCandidates(candidateList);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      <p className="admin-subtitle">You are connected with: {currentAccount}</p>

      {!electionEnded ? (
        <>
          {/* Adding elector section */}
          <div className="admin-section">
            <h2>Add a Voter</h2>
            <input
              type="text"
              className="admin-input"
              placeholder="MetaMask address"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
            />
            <button className="admin-button" onClick={handleAddVoter}>
              Add Voter
            </button>
          </div>

          {/* Adding candidates section */}
          <div className="admin-section">
            <h2>Add a Candidate</h2>
            <input
              type="text"
              className="admin-input"
              placeholder="Candidate name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
            <button className="admin-button" onClick={handleAddCandidate}>
              Add Candidate
            </button>
          </div>

          {}
          <div className="admin-section">
            <button className="admin-button" onClick={handleStartElection}>
              Start Election
            </button>
            <button className="admin-button" onClick={handleEndElection}>
              End Election
            </button>
          </div>
        </>
      ) : (
        <div className="admin-section">
          <h2>Results of the Election</h2>
          <div className="candidate-list">
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
                <div key={candidate.id} className="candidate-item">
                  <p>Name: {candidate.name}</p>
                  <p>Number of votes: {candidate.voteCount}</p>
                  {/* Optionally display vote counts from ResultContract */}
                  {}
                </div>
              ))
            ) : (
              <p>There are no candidates available.</p>
            )}
          </div>
        </div>
      )}

      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

// Define proprieties types
AdminPage.propTypes = {
  currentAccount: PropTypes.string.isRequired,
  electionContract: PropTypes.object.isRequired,
  resultContract: PropTypes.object, // Optional if used
};

export default AdminPage;
