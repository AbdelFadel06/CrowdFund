import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useCrowdFunding } from "../hooks/useCrowdFunding";

export default function CampaignDetails({ campaignId }) {
  const { getCampaignInfo } = useCrowdFunding();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getCampaignInfo(campaignId);
      setInfo(data);
    };
    load();
  }, [campaignId]);

  if (!info) return <p>Chargement...</p>;

  return (
    <div className="p-4 border rounded shadow mt-4">
      <h3 className="font-bold">Détails de la campagne #{campaignId}</h3>
      <p>Owner: {info.campaignOwner}</p>
      <p>Objectif: {ethers.formatEther(info.goal)} ETH</p>
      <p>Levés: {ethers.formatEther(info.amountRaised)} ETH</p>
      <p>Deadline: {new Date(Number(info.deadline) * 1000).toLocaleString()}</p>
      <p>Retiré ? {info.fundsWithdrawn ? "Oui" : "Non"}</p>
    </div>
  );
}

