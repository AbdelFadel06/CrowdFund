import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();
describe("CrowdFunding", function () {
  async function deployFixture() {
    const [owner, campaignOwner, contributor1, contributor2] = await ethers.getSigners();

    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy(200);
    await crowdFunding.waitForDeployment();

    return { crowdFunding, owner, campaignOwner, contributor1, contributor2 };
  }

  it("should deploy with correct platform fee", async function () {
    const { crowdFunding } = await deployFixture();
    expect(await crowdFunding.platformFeePercentage()).to.equal(200);
  });

  it("should create a campaign", async function () {
    const { crowdFunding, campaignOwner } = await deployFixture();
    const goal = ethers.parseEther("10");
    const duration = 24 * 60 * 60; 

    await expect(
      crowdFunding.connect(campaignOwner).createCampaign(goal, duration, "Titre", "Description")
    ).to.emit(crowdFunding, "CampaignCreated");

    const info = await crowdFunding.getCampaignInfo(0);
    expect(info.campaignOwner).to.equal(campaignOwner.address);
    expect(info.goal).to.equal(goal);
  });

  it("should allow contributions", async function () {
    const { crowdFunding, campaignOwner, contributor1 } = await deployFixture();
    const goal = ethers.parseEther("5");
    const duration = 24 * 60 * 60;

    await crowdFunding.connect(campaignOwner).createCampaign(goal, duration, "Camp1", "Desc");

    await expect(
      crowdFunding.connect(contributor1).contribute(0, { value: ethers.parseEther("1") })
    )
      .to.emit(crowdFunding, "ContributionReceived")
      .withArgs(0, contributor1.address, ethers.parseEther("1"));

    const info = await crowdFunding.getCampaignInfo(0);
    expect(info.amountRaised).to.equal(ethers.parseEther("1"));
  });

  it("should allow withdraw when goal reached", async function () {
    const { crowdFunding, campaignOwner, contributor1 } = await deployFixture();
    const goal = ethers.parseEther("2");
    const duration = 24 * 60 * 60;

    await crowdFunding.connect(campaignOwner).createCampaign(goal, duration, "Camp2", "Desc");

    await crowdFunding.connect(contributor1).contribute(0, { value: ethers.parseEther("2") });

    // avancer le temps pour dépasser la deadline
    await ethers.provider.send("evm_increaseTime", [duration + 1]);
    await ethers.provider.send("evm_mine");

    await expect(crowdFunding.connect(campaignOwner).withdrawFunds(0))
      .to.emit(crowdFunding, "FundsWithdrawn");
  });

  it("should allow refund if goal not reached", async function () {
    const { crowdFunding, campaignOwner, contributor1 } = await deployFixture();
    const goal = ethers.parseEther("5");
    const duration = 24 * 60 * 60;

    await crowdFunding.connect(campaignOwner).createCampaign(goal, duration, "Camp3", "Desc");

    await crowdFunding.connect(contributor1).contribute(0, { value: ethers.parseEther("1") });

    // avancer le temps pour dépasser la deadline
    await ethers.provider.send("evm_increaseTime", [duration + 1]);
    await ethers.provider.send("evm_mine");

    await expect(crowdFunding.connect(contributor1).getRefund(0))
      .to.emit(crowdFunding, "RefundIssued");

    const contribution = await crowdFunding.contributions(0, contributor1.address);
    expect(contribution).to.equal(0n);
  });
});
