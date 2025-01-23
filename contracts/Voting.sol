// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

interface IResultContract {
    function recordVote(uint256 _candidateId) external;
}

contract Election {

    enum State {
        NotStarted,
        InProgress,
        Ended
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public owner;
    State public electionState;
    uint256 public candidatesCount;

    mapping(uint256 => Candidate) private candidates;
    mapping(address => bool) private voted;
    mapping(address => bool) private isVoter;

    IResultContract public resultContract;

    event Voted(uint256 indexed _candidateId);
    event ElectionStarted();
    event ElectionEnded();

    constructor(address _resultContractAddress) {
        owner = msg.sender;
        candidatesCount = 0;
        electionState = State.NotStarted;
        resultContract = IResultContract(_resultContractAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    modifier inState(State _state) {
        require(electionState == _state, "Invalid election state for this action.");
        _;
    }

    function addCandidate(string memory _name) public onlyOwner inState(State.NotStarted) {
        require(bytes(_name).length > 0, "Candidate name cannot be empty.");
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        candidatesCount++;
    }

    function addVoter(address _voter) public onlyOwner inState(State.NotStarted) {
        require(_voter != address(0), "Invalid address.");
        require(!isVoter[_voter], "Voter already added.");
        isVoter[_voter] = true;
    }

    function startElection() public onlyOwner inState(State.NotStarted) {
        electionState = State.InProgress;
        emit ElectionStarted();
    }

    function endElection() external onlyOwner {
        require(electionState == State.InProgress, "Election is not in progress.");
        electionState = State.Ended;
        emit ElectionEnded();
    }

    function vote(uint256 _candidateId) external inState(State.InProgress) {
        require(isVoter[msg.sender], "You are not authorized to vote.");
        require(!voted[msg.sender], "You have already voted.");
        require(_candidateId < candidatesCount, "Invalid candidate ID.");

        // Update voteCount in the Election contract
        candidates[_candidateId].voteCount++;
        voted[msg.sender] = true;

        // Record the vote in the ResultContract
        resultContract.recordVote(_candidateId);

        emit Voted(_candidateId);
    }

    function getCandidateDetails(uint256 _candidateId)
        external
        view
        returns (string memory, uint256)
    {
        require(_candidateId < candidatesCount, "Invalid candidate ID.");
        Candidate memory c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }

    function getCandidatesCount() public view returns (uint256) {
        return candidatesCount;
    }

    function getWinner() public view inState(State.Ended) returns (string memory winnerName, uint256 winnerVoteCount) {
        uint256 maxVotes = 0;
        uint256 winnerId = 0;
        for (uint256 i = 0; i < candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }
        Candidate memory winner = candidates[winnerId];
        return (winner.name, winner.voteCount);
    }
}
