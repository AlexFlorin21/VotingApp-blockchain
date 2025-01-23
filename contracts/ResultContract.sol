// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

contract ResultContract {
    
    mapping(uint256 => uint256) private results;

    
    event VoteRecorded(uint256 indexed candidateId, uint256 totalVotes);

    // Function to record a vote
    function recordVote(uint256 _candidateId) external {
        results[_candidateId] += 1;
        emit VoteRecorded(_candidateId, results[_candidateId]);
    }

    // Function to get the result of a candidate
    function getResult(uint256 _candidateId) external view returns (uint256) {
        return results[_candidateId];
    }

    // Function to get all winners (in case of a tie)
    function getWinners(uint256[] memory candidateIds) external view returns (uint256[] memory) {
        uint256 maxVotes = 0;
        // Determinăm numărul maxim de voturi
        for (uint256 i = 0; i < candidateIds.length; i++) {
            uint256 voteCount = results[candidateIds[i]];
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
            }
        }

        
        uint256 winnerCount = 0;
        for (uint256 i = 0; i < candidateIds.length; i++) {
            if (results[candidateIds[i]] == maxVotes) {
                winnerCount++;
            }
        }

        uint256[] memory winners = new uint256[](winnerCount);
        uint256 index = 0;
        for (uint256 i = 0; i < candidateIds.length; i++) {
            if (results[candidateIds[i]] == maxVotes) {
                winners[index] = candidateIds[i];
                index++;
            }
        }

        return winners;
    }
}
