import { useState } from "react";
import { useCrowdFunding } from "../hooks/useCrowdFunding";

export default function Contribute({ campaignId }) {
  const { contribute } = useCrowdFunding();
  const [amount, setAmount] = useState("");

  const handleContribute = async () => {
    try {
      const tx = await contribute(campaignId, amount);
      alert(`Contribution réussie ! TX: ${tx}`);
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("Erreur contribution");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Montant en ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 border rounded"
      />
      <button
        onClick={handleContribute}
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Contribuer
      </button>
    </div>
  );
}
