import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CrowdFundingABI from "../CrowdFundingABI.json";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function MyCampaigns() {
  const [account, setAccount] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  // 🔹 Connexion MetaMask
  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) return alert("Installe MetaMask !");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    };
    connectWallet();
  }, []);

  // 🔹 Récupération des campagnes créées
  useEffect(() => {
    if (!account) return;

    const fetchCampaigns = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CrowdFundingABI, signer);

        // IDs des campagnes créées par l'utilisateur
        const campaignIds = await contract.getMyCampaigns();

        const detailed = await Promise.all(
          campaignIds.map(async (id) => {
            const [title, description, image, , goal, deadline, amountRaised, fundsWithdrawn] =
              await contract.getCampaignInfo(id);

            const now = Math.floor(Date.now() / 1000);
            const deadlineNumber = Number(deadline);
            const daysLeft = deadlineNumber > now ? Math.ceil((deadlineNumber - now) / (60 * 60 * 24)) : 0;
            const status = fundsWithdrawn ? "Funds retirés" : daysLeft > 0 ? `${daysLeft} jours restants` : "Déjà terminé";

            return {
              campaignId: id.toString(),
              title,
              description,
              image,
              goal: ethers.formatEther(goal),
              amountRaised: ethers.formatEther(amountRaised),
              status,
            };
          })
        );

        setCampaigns(detailed);
      } catch (err) {
        console.error("Erreur fetch campaigns:", err);
      }
    };

    fetchCampaigns();
  }, [account]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Mes Campagnes</h1>
      {!account ? (
        <p>Connectez MetaMask pour voir vos campagnes.</p>
      ) : campaigns.length === 0 ? (
        <p>Aucune campagne créée pour le moment.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c, idx) => (
            <div key={idx} className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <img src={c.image} alt={c.title} className="w-full h-56 object-cover" />
              <div className="p-4 flex flex-col justify-between h-64">
                <h2 className="text-lg font-bold mb-2">{c.title}</h2>
                <p className="text-gray-700 text-sm mb-2">{c.description}</p>
                <p className="text-gray-600 text-sm">
                  Levés: <span className="font-semibold">{c.amountRaised} ETH</span> / Objectif: {c.goal} ETH
                </p>
                <p className="mt-2 text-sm font-medium text-gray-500">{c.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
