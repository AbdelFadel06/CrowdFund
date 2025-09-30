// src/hooks/useCrowdFunding.js
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contractConfig";

export const useCrowdFunding = () => {
  // connecter au contrat
  const getContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask non installé");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  // créer une campagne avec le champ image
  const createCampaign = async (goal, deadline, title, description, image) => {
    const contract = await getContract();

    // si goal et deadline sont en string, les convertir en nombres
    const goalNumber = ethers.parseUnits(goal.toString(), "wei"); // wei
    const deadlineNumber = Number(deadline);

    const tx = await contract.createCampaign(
      goalNumber,
      deadlineNumber,
      title,
      description,
      image
    );

    await tx.wait();
    return tx.hash;
  };

  // contribuer à une campagne
  const contribute = async (campaignId, amountEth) => {
    const contract = await getContract();
    const tx = await contract.contribute(campaignId, {
      value: ethers.parseEther(amountEth), // montant en ETH
    });
    await tx.wait();
    return tx.hash;
  };

  // récupérer infos d'une campagne
  const getCampaignInfo = async (campaignId) => {
    const contract = await getContract();
    return await contract.getCampaignInfo(campaignId);
  };

  // 🔹 NOUVELLE FONCTION: Récupérer les infos étendues d'une campagne
  const getCampaignInfoExtended = async (campaignId) => {
    const contract = await getContract();
    return await contract.getCampaignInfoExtended(campaignId);
  };

  // 🔹 NOUVELLE FONCTION: Récupérer le nombre de contributeurs d'une campagne
  const getContributorCount = async (campaignId) => {
    const contract = await getContract();
    const count = await contract.getContributorCount(campaignId);
    return Number(count);
  };

  // 🔹 NOUVELLE FONCTION: Récupérer la liste des contributeurs d'une campagne
  const getCampaignContributors = async (campaignId) => {
    const contract = await getContract();
    return await contract.getCampaignContributors(campaignId);
  };

  // 🔹 NOUVELLE FONCTION: Récupérer le montant contribué par un address spécifique
  const getContributionAmount = async (campaignId, contributorAddress) => {
    const contract = await getContract();
    const amount = await contract.getContributionAmount(campaignId, contributorAddress);
    return ethers.formatEther(amount);
  };

  // 🔹 NOUVELLE FONCTION: Récupérer toutes les contributions d'une campagne
  const getCampaignContributions = async (campaignId) => {
    const contract = await getContract();
    const [contributors, amounts] = await contract.getCampaignContributions(campaignId);

    // Formater les données pour le frontend
    const contributions = contributors.map((contributor, index) => ({
      address: contributor,
      amount: ethers.formatEther(amounts[index]),
      amountWei: amounts[index].toString()
    }));

    return contributions;
  };

  // 🔹 NOUVELLE FONCTION: Récupérer les campagnes de l'utilisateur connecté
  const getMyCampaigns = async () => {
    const contract = await getContract();
    return await contract.getMyCampaigns();
  };

  // 🔹 NOUVELLE FONCTION: Récupérer les contributions de l'utilisateur connecté
  const getMyContributions = async () => {
    const contract = await getContract();
    return await contract.getMyContributions();
  };

  // retirer les fonds
  const withdrawFunds = async (campaignId) => {
    const contract = await getContract();
    const tx = await contract.withdrawFunds(campaignId);
    await tx.wait();
    return tx.hash;
  };

  // demander un remboursement
  const getRefund = async (campaignId) => {
    const contract = await getContract();
    const tx = await contract.getRefund(campaignId);
    await tx.wait();
    return tx.hash;
  };

  return {
    createCampaign,
    contribute,
    getCampaignInfo,
    getCampaignInfoExtended,
    getContributorCount,
    getCampaignContributors,
    getContributionAmount,
    getCampaignContributions,
    getMyCampaigns,
    getMyContributions,
    withdrawFunds,
    getRefund,
  };
};
