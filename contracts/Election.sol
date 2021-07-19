// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Election {

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping (uint => Candidate) public candidates;
    mapping (address => bool) public voters;

    uint public candidatesCount;

    event votedEvent (
        uint indexed _candidateId
    );
    
    constructor() {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint _candidateId) public {
        require(!voters[msg.sender], "Voters can only vote once.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Candidate ID must exist.");
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount ++;
        emit votedEvent(_candidateId);
    }
}
