const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Subscription Smart Contract", function () {
  let Subscription, subscription;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    Subscription = await ethers.getContractFactory("Subscription");
    subscription = await Subscription.deploy();
    await subscription.waitForDeployment();
  });

  it("Should deploy and set the owner correctly", async function () {
    expect(await subscription.owner()).to.equal(owner.address);
  });

  it("Should allow users to subscribe to Basic plan", async function () {
    await subscription
      .connect(user1)
      .subscribeBasic({ value: ethers.parseEther("0.001") });

    const [plan, expiry] = await subscription.checkSubscription(user1.address);
    expect(plan).to.equal(1);
    expect(expiry).to.be.gt(0);
  });

  it("Should allow users to subscribe to Standard plan", async function () {
    await subscription
      .connect(user1)
      .subscribeStandard({ value: ethers.parseEther("0.003") });

    const [plan, expiry] = await subscription.checkSubscription(user1.address);
    expect(plan).to.equal(2);
    expect(expiry).to.be.gt(0);
  });

  it("Should allow users to subscribe to Premium plan", async function () {
    await subscription
      .connect(user2)
      .subscribePremium({ value: ethers.parseEther("0.005") });

    const [plan, expiry] = await subscription.checkSubscription(user2.address);
    expect(plan).to.equal(3);
    expect(expiry).to.be.gt(0);
  });

  it("Should reject incorrect payment amounts", async function () {
    await expect(
      subscription
        .connect(user1)
        .subscribeBasic({ value: ethers.parseEther("0.002") })
    ).to.be.revertedWith("Incorrect amount");

    await expect(
      subscription
        .connect(user1)
        .subscribeStandard({ value: ethers.parseEther("0.002") })
    ).to.be.revertedWith("Incorrect amount");

    await expect(
      subscription
        .connect(user1)
        .subscribePremium({ value: ethers.parseEther("0.004") })
    ).to.be.revertedWith("Incorrect amount");
  });

  it("Should allow owner to withdraw funds", async function () {
    await subscription
      .connect(user1)
      .subscribeBasic({ value: ethers.parseEther("0.001") });

    await subscription
      .connect(user2)
      .subscribePremium({ value: ethers.parseEther("0.005") });

    const balanceBefore = await ethers.provider.getBalance(owner.address);
    await subscription.connect(owner).withdraw();
    const balanceAfter = await ethers.provider.getBalance(owner.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  it("Should not allow non-owner to withdraw funds", async function () {
    await subscription
      .connect(user1)
      .subscribeStandard({ value: ethers.parseEther("0.003") });

    await expect(subscription.connect(user1).withdraw()).to.be.revertedWith(
      "Only owner can call this"
    );
  });

  it("Should extend subscription if user re-subscribes before expiry", async function () {
    await subscription
      .connect(user1)
      .subscribeBasic({ value: ethers.parseEther("0.001") });

    const [, firstExpiry] = await subscription.checkSubscription(user1.address);

    await subscription
      .connect(user1)
      .subscribeBasic({ value: ethers.parseEther("0.001") });

    const [, secondExpiry] = await subscription.checkSubscription(
      user1.address
    );

    expect(secondExpiry).to.be.gt(firstExpiry);
  });
});
