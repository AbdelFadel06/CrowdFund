import { useCrowdFunding } from "../hooks/useCrowdFunding";

export default function Refund({ campaignId }) {
  const { getRefund } = useCrowdFunding();

  const handleRefund = async () => {
    try {
      const tx = await getRefund(campaignId);
      alert(`Remboursement effectué ! TX: ${tx}`);
    } catch (err) {
      console.error(err);
      alert("Erreur remboursement");
    }
  };

  return (
    <button
      onClick={handleRefund}
      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
    >
      Demander un remboursement
    </button>
  );
}
