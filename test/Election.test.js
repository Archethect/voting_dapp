const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require('hardhat');


describe('Election',  () => {

    let electionContract;

    beforeEach(async function () {
        await deployments.fixture(['Election']);
        const { deployer } = await getNamedAccounts();
        electionContract = await ethers.getContract("Election", deployer);
        const tx1 = await electionContract.addCandidate("Candidate 1");
        const tx2 = await electionContract.addCandidate("Candidate 2");
        await tx1.wait();
        await tx2.wait();

    });

    it('initializes with 2 candidates', async function () {
        expect (await electionContract.candidatesCount()).to.equal(2);
    });

    it('initializes the candidates with the correct values', async function () {
        const candidate1 = await electionContract.candidates(1);
        const candidate2 = await electionContract.candidates(2);
        expect (candidate1.id).to.equal(1);
        expect (candidate1.name).to.equal("Candidate 1");
        expect (candidate1.voteCount).to.equal(0);
        expect (candidate2.id).to.equal(2);
        expect (candidate2.name).to.equal("Candidate 2");
        expect (candidate2.voteCount).to.equal(0);
    });

    it('allows a voter to cast a vote', async function() {
       const candidateId = 1;
       [deployer, consumer1] = await ethers.getSigners();
       const vote = await electionContract.connect(consumer1).vote(candidateId);
       await vote.wait();
       const consumerAddress = await consumer1.getAddress();
       const voted = await electionContract.connect(consumer1).voters(consumerAddress);
       expect(voted).to.equal(true);
       const candidate = await electionContract.connect(consumer1).candidates(candidateId);
       var voteCount = candidate[2];
       expect (voteCount).to.equal(1);
    });

    it('throws an error for invalid votes', async function() {
        [deployer, consumer1, consumer2] = await ethers.getSigners();
        const vote1 = await electionContract.connect(consumer1).vote(1);
        await vote1.wait();
        await expect(electionContract.connect(consumer1).vote(2)).to.be.revertedWith("Voters can only vote once.");
        await expect(electionContract.connect(consumer2).vote(99)).to.be.revertedWith("Candidate ID must exist.");
        const candidate1 = await electionContract.connect(deployer).candidates(1);
        expect (candidate1[2]).to.equal(1);
        const candidate2 = await electionContract.connect(deployer).candidates(2);
        expect (candidate2[2]).to.equal(0);

    });

    it('allows a voter to cast a vote', async function() {
        const candidateId = 1;
        [deployer, consumer1] = await ethers.getSigners();
        const voteTx = await electionContract.connect(consumer1).vote(candidateId);
        const voteTxReceipt = await voteTx.wait();
        expect(voteTxReceipt.events.length).to.equal(1);
        expect(voteTxReceipt.events[0].event).to.equal("votedEvent");
        await expect(electionContract.connect(deployer).vote(candidateId))
            .to.emit(electionContract, "votedEvent")
            .withArgs(candidateId);
        await expect(electionContract.voters(deployer.getAddress()))
        expect((await electionContract.candidates(candidateId))[2]).to.equal(2);
    });

    it('prevents consumers to create candidates', async function() {
        [deployer, consumer1] = await ethers.getSigners();
        const tx1 = await electionContract.addCandidate("Candidate 3");
        await tx1.wait();
        const candidate3 = await electionContract.candidates(3);
        expect (candidate3.id).to.equal(3);
        expect (candidate3.name).to.equal("Candidate 3");
        expect (candidate3.voteCount).to.equal(0);
        await expect(electionContract.connect(consumer1).addCandidate("Candidate 4")).to.be.revertedWith("Ownable: caller is not the owner");
    });
});