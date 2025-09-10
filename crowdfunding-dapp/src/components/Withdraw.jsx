import { useCrowdFunding } from "../hooks/useCrowdFunding";

export default function Withdraw({ campaignId }) {
  const { withdrawFunds } = useCrowdFunding();

  const handleWithdraw = async () => {
    try {
      const tx = await withdrawFunds(campaignId);
      alert(`Fonds retirés ! TX: ${tx}`);
    } catch (err) {
      console.error(err);
      alert("Erreur retrait");
    }
  };

  return (
    <button
      onClick={handleWithdraw}
      className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
    >
      Retirer les fonds
    </button>
  );
}
