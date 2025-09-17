import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CrowdFundingABI from "../CrowdFundingABI.json";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function MyContributions() {
  const [account, setAccount] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) return alert("Installe MetaMask !");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    };
    connectWallet();
  }, []);

  useEffect(() => {
    if (!account) return;

    const fetchContributions = async () => {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CrowdFundingABI, signer);

        // IDs des campagnes auxquelles l'utilisateur a contribué
        const campaignIds = await contract.getMyContributions();

        const detailed = await Promise.all(
  campaignIds.map(async (id) => {
    const [title, , image, , , deadline] = await contract.getCampaignInfo(id);
    const amount = await contract.contributions(id, account);

    const now = Math.floor(Date.now() / 1000);
    const deadlineNumber = Number(deadline); // conversion BigInt -> Number
    const daysLeft = deadlineNumber > now ? Math.ceil((deadlineNumber - now) / (60 * 60 * 24)) : 0;
    const status = daysLeft > 0 ? `${daysLeft} jours restants` : "Déjà terminé";

    return {
      campaignId: id.toString(),
      title,
      image,
      amount: ethers.formatEther(amount),
      status,
    };
  })
);


        setContributions(detailed);
      } catch (err) {
        console.error("Erreur fetch contributions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [account]);

  if (!account) return <p className="p-6">Connectez MetaMask pour voir vos contributions</p>;
  if (loading) return <p className="p-6">Chargement des contributions...</p>;
  if (contributions.length === 0) return <p className="p-6">Aucune contribution trouvée.</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Mes Contributions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contributions.map((c) => (
          <div key={c.campaignId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-48 w-full overflow-hidden">
              <img
                src={c.image || "https://via.placeholder.com/400x300"}
                alt={c.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h2 className="font-bold text-lg">{c.title}</h2>
              <p className="text-gray-600">Votre contribution: <span className="font-semibold">{c.amount} ETH</span></p>
              <p className={`font-medium ${c.status === "Déjà terminé" ? "text-red-500" : "text-green-500"}`}>
                {c.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
