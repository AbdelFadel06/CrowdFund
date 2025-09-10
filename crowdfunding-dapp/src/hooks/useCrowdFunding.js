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
      image // <-- nouveau paramètre
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

  // récupérer infos d’une campagne
  const getCampaignInfo = async (campaignId) => {
    const contract = await getContract();
    return await contract.getCampaignInfo(campaignId);
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
    withdrawFunds,
    getRefund,
  };
};
