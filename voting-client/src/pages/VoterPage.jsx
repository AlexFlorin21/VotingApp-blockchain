import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./VoterPage.css";
function VoterPage({ electionContract,currentAccount }) {
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [electionState, setElectionState] = useState(null);
  const [message, setMessage] = useState("");

  // Function to fetch the state of the election
  const fetchElectionState = async () => {
    if (!electionContract) return;

    try {
      const state = await electionContract.electionState();
      setElectionState(state);
    } catch (err) {
      console.error("Error fetching election state:", err);
    }
  };

  // Function to fetch the list of candidates
  const fetchCandidates = async () => {
    if (!electionContract) {
      setMessage("Contract is not loaded.");
      return;
    }

    try {
      const count = await electionContract.getCandidatesCount();
      const candidateList = [];
      for (let i = 0; i < count; i++) {
        const candidate = await electionContract.getCandidateDetails(i);
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

  // Function to check if the user has already voted
  const checkIfVoted = async () => {
    if (!electionContract || !currentAccount) return;

    try {
      const votedStatus = await electionContract.hasVoted(currentAccount);
      setHasVoted(votedStatus);
    } catch (err) {
      console.error("Error checking voted status:", err);
    }
  };

  // Function to vote for a candidate
  const handleVote = async (candidateId) => {
    if (!electionContract) {
      alert("Contract is not loaded.");
      return;
    }

    if (electionState !== 1) { 
      alert("Election is not in progress.");
      return;
    }

    try {
      const tx = await electionContract.vote(candidateId);
      setMessage("Voting in progress...");
      await tx.wait(); 
      setMessage("You have successfully voted!");
      setHasVoted(true);
      fetchCandidates(); // Update the list of votes
    } catch (err) {
      console.error("Error voting:", err);
      alert("Error voting: " + (err.reason || err.message));
    }
  };

  useEffect(() => {
    fetchElectionState();
    fetchCandidates();
    checkIfVoted();
  });

  return (
    <div className="voter-container">
      <h1 className="voter-title">Lista candidaților</h1>

      {message && <p className="message">{message}</p>}

      {electionState === 1 ? ( 
        !hasVoted ? (
          <div className="candidate-list">
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
                <div key={candidate.id} className="candidate-item">
                  <p>Name: {candidate.name}</p>
                  <p>Number of votes: {candidate.voteCount}</p>
                  <button
                    className="vote-button"
                    onClick={() => handleVote(candidate.id)}
                  >
                    Vote
                  </button>
                </div>
              ))
            ) : (
              <p>There are no candidates available.</p>
            )}
          </div>
        ) : (
          <p>You have already voted.</p>
        )
      ) : electionState === 2 ? ( // Ended state
        <div className="results">
          <h2>Election Results</h2>
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <div key={candidate.id} className="candidate-item">
                <p>Name: {candidate.name}</p>
                <p>Number of votes: {candidate.voteCount}</p>
              </div>
            ))
          ) : (
            <p>There are no candidates available.</p>
          )}
        </div>
      ) : ( 
        <p>Loading election state...</p>
      )}
    </div>
  );
}

VoterPage.propTypes = {
  electionContract: PropTypes.object.isRequired,
  resultContract: PropTypes.object.isRequired,
  currentAccount: PropTypes.string.isRequired,
};

export default VoterPage;
