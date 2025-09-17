import { useState } from "react";
import { useCrowdFunding } from "../hooks/useCrowdFunding";
import { useParams } from "react-router-dom";


export default function Contribute() {
  const { id } = useParams();
  const { contribute } = useCrowdFunding();
  const [amount, setAmount] = useState("");

  const handleContribute = async () => {
    try {
      if (!amount) return alert("Veuillez entrer un montant");
      const tx = await contribute(id, amount);
      alert(`Contribution réussie ! TX: ${tx}`);
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("Erreur contribution");
    }
  };

  // Fonction pour ajouter un chiffre depuis le clavier numérique
  const addDigit = (digit) => setAmount(prev => prev + digit);

  // Effacer le dernier chiffre
  const backspace = () => setAmount(prev => prev.slice(0, -1));

  // Réinitialiser le montant
  const clear = () => setAmount("");

  const digits = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "⌫"]
  ];

  return (
    <div className="max-w-xs mx-auto bg-white p-6 rounded-2xl shadow-lg">
      {/* Input principal */}
      <input
        type="text"
        placeholder="Montant en ETH"
        value={amount}
        readOnly
        className="w-full text-2xl font-semibold p-3 mb-4 text-center border rounded-lg bg-gray-50 focus:outline-none"
      />

      {/* Clavier numérique */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {digits.flat().map((d) => (
          <button
            key={d}
            onClick={() => {
              if (d === "⌫") backspace();
              else if (d === "." && amount.includes(".")) return;
              else addDigit(d);
            }}
            className="bg-gray-100 p-4 rounded-lg text-xl font-bold hover:bg-gray-200 transition"
          >
            {d}
          </button>
        ))}
      </div>

      {/* Bouton contribuer */}
      <button
        onClick={handleContribute}
        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
      >
        Contribuer
      </button>

      {/* Bouton clear optionnel */}
      {amount && (
        <button
          onClick={clear}
          className="w-full mt-2 text-gray-500 text-sm hover:underline"
        >
          Effacer
        </button>
      )}
    </div>
  );
}
