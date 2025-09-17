// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract CrowdFunding is ReentrancyGuard, Ownable {
    struct Campaign {
        string title;
        string description;
        string image;
        address owner;
        uint goal;
        uint deadline;
        uint amountRaised;
        bool fundsWithdrawn;
    }

    uint public campaignCount;
    uint public platformFeePercentage;
    mapping(uint => Campaign) public campaigns;
    mapping(uint => mapping(address => uint)) public contributions;

    mapping(address => uint[]) private userCampaigns;
    mapping(address => uint[]) private userContributions;


    event CampaignCreated(uint indexed campaignId,string title, string description, address owner, uint goal, uint deadline);
    event ContributionReceived(uint indexed campaignId, address contributor, uint amount);
    event FundsWithdrawn(uint indexed campaignId, address owner, uint amount);
    event RefundIssued(uint indexed campaignId, address contributor, uint amount);

    constructor(uint _platformFeePercentage) {
        platformFeePercentage = _platformFeePercentage;
    }

    function createCampaign(
    uint _goal,
    uint _deadline,
    string memory _title,
    string memory _description,
    string memory _image
) public {
    require(_goal > 0, "Goal must be > 0");
    require(_deadline > 0, "Deadline must be > 0");

    campaigns[campaignCount] = Campaign({
        title: _title,
        description: _description,
        image: _image,
        owner: msg.sender,
        goal: _goal,
        deadline: block.timestamp + _deadline,
        amountRaised: 0,
        fundsWithdrawn: false
    });

    // ✅ Sauvegarde de la campagne dans la liste du créateur
    userCampaigns[msg.sender].push(campaignCount);

    campaignCount++;
    emit CampaignCreated(campaignCount - 1, _title, _description , msg.sender, _goal, block.timestamp + _deadline);
}


    function contribute(uint _campaignId) public payable nonReentrant {
    require(_campaignId < campaignCount, "Invalid campaign ID");
    Campaign storage campaign = campaigns[_campaignId];
    require(block.timestamp < campaign.deadline, "Campaign is over");
    require(msg.value > 0, "Contribution must be > 0");

    campaign.amountRaised += msg.value;
    contributions[_campaignId][msg.sender] += msg.value;

    // ✅ Si première contribution à cette campagne, on enregistre l’ID
    if (contributions[_campaignId][msg.sender] == msg.value) {
        userContributions[msg.sender].push(_campaignId);
    }

    emit ContributionReceived(_campaignId, msg.sender, msg.value);
}


    function getMyCampaigns() public view returns (uint[] memory) {
    return userCampaigns[msg.sender];
}



    function getMyContributions() public view returns (uint[] memory) {
    return userContributions[msg.sender];
}


    function withdrawFunds(uint _campaignId) public nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign not finished");
        require(campaign.amountRaised >= campaign.goal, "Goal not reached");
        require(msg.sender == campaign.owner, "Not the owner");
        require(!campaign.fundsWithdrawn, "Funds already withdrawn");

        campaign.fundsWithdrawn = true;

        uint platformFee = (campaign.amountRaised * platformFeePercentage) / 10000;
        uint netAmount = campaign.amountRaised - platformFee;

        (bool successOwner, ) = payable(campaign.owner).call{value: netAmount}("");
        (bool successPlatform, ) = payable(owner()).call{value: platformFee}("");
        require(successOwner && successPlatform, "Transfer failed");

        emit FundsWithdrawn(_campaignId, campaign.owner, netAmount);
    }

    function getRefund(uint _campaignId) public nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign not finished");
        require(campaign.amountRaised < campaign.goal, "Goal was reached");

        uint amountContributed = contributions[_campaignId][msg.sender];
        require(amountContributed > 0, "No contribution to refund");

        contributions[_campaignId][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amountContributed}("");
        require(success, "Refund failed");

        emit RefundIssued(_campaignId, msg.sender, amountContributed);
    }

    function getCampaignInfo(uint _campaignId) public view returns (
    string memory title,
    string memory description,
    string memory image,
    address campaignOwner,
    uint goal,
    uint deadline,
    uint amountRaised,
    bool fundsWithdrawn
) {
    require(_campaignId < campaignCount, "Invalid campaign ID");
    Campaign storage campaign = campaigns[_campaignId];
    return (
        campaign.title,
        campaign.description,
        campaign.image,
        campaign.owner,
        campaign.goal,
        campaign.deadline,
        campaign.amountRaised,
        campaign.fundsWithdrawn
    );
}

}
