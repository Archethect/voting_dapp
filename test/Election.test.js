const { ethers, deployments, getNamedAccounts } = require('hardhat');
const { expect } = require("chai");

describe('Election', () => {

    let electionContract;

    beforeEach(async function () {
        await deployments.fixture(['Election']);
        const { deployer } = await getNamedAccounts();
        electionContract = await ethers.getContract("Election", deployer);
    });

    it('initializes with two candidates', async function () {
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
});