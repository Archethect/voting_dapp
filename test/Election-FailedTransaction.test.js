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

    it('prevents consumers to create candidates', async function() {
        [deployer, consumer1] = await ethers.getSigners();
        const tx1 = await electionContract.addCandidate("Candidate 3");
        await tx1.wait();
        const candidate3 = await electionContract.candidates(3);
        expect (candidate3.id).to.equal(3);
        expect (candidate3.name).to.equal("Candidate 3");
        expect (candidate3.voteCount).to.equal(0);
        const tx2 = await electionContract.connect(consumer1).addCandidate("Candidate 4");
        console.log(await tx2.wait());
        await expect(electionContract.connect(consumer1).addCandidate("Candidate 4")).to.be.revertedWith("Ownable: caller is not the owner");
    });
});