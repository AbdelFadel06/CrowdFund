import { useState, useEffect } from "react";
import { useCrowdFunding } from "../hooks/useCrowdFunding";
import { useParams, useNavigate } from "react-router-dom";
import CampaignContributors from "./CampaignContributors";
import { ethers } from "ethers";

export default function Contribute() {
  const { id } = useParams();
  const { contribute, getCampaignInfo } = useCrowdFunding();
  const [amount, setAmount] = useState("");
  const [campaignInfo, setCampaignInfo] = useState(null);
  const navigate = useNavigate();

  // Charger les infos de la campagne
  useEffect(() => {
    const loadCampaignInfo = async () => {
      try {
        const info = await getCampaignInfo(id);
        setCampaignInfo(info);
      } catch (error) {
        console.error("Erreur chargement campagne:", error);
      }
    };
    loadCampaignInfo();
  }, [id]);

  const handleContribute = async () => {
    try {
      if (!amount) return alert("Veuillez entrer un montant");
      if (parseFloat(amount) <= 0) return alert("Le montant doit être supérieur à 0");

      const tx = await contribute(id, amount);
      alert(`🎉 Contribution réussie ! TX: ${tx}`);
      setAmount("");

      // Recharger la page après 2 secondes pour voir la mise à jour
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la contribution");
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

  // Calcul du pourcentage de progression
  const progress = campaignInfo ?
    (Number(campaignInfo.amountRaised) / Number(campaignInfo.goal)) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 🔹 Colonne gauche : Résumé de la campagne */}
        <div className="space-y-6">
          {/* Bouton retour */}
          <button
            onClick={() => navigate(`/`)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Retour à la campagne
          </button>

          {/* Carte résumé campagne */}
          {campaignInfo && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Contribuer à : {campaignInfo.title}
              </h1>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {campaignInfo.description}
              </p>

              {/* Image */}
              <div className="mb-4">
                <img
                  src={campaignInfo.image}
                  alt={campaignInfo.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/default-campaign.jpg';
                  }}
                />
              </div>

              {/* Progression */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{progress.toFixed(1)}% atteint</span>
                  <span>
                    {ethers.formatEther(campaignInfo.amountRaised)} ETH / {ethers.formatEther(campaignInfo.goal)} ETH
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Infos supplémentaires */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Créateur</p>
                  <p className="font-medium truncate">
                    {campaignInfo.campaignOwner.substring(0, 8)}...
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Objectif</p>
                  <p className="font-medium">
                    {ethers.formatEther(campaignInfo.goal)} ETH
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 🔹 Section contributeurs (version compacte) */}
          <CampaignContributors campaignId={id} variant="preview" />
        </div>

        {/* 🔹 Colonne droite : Formulaire de contribution */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            💰 Faire une contribution
          </h2>

          {/* Input principal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant en ETH
            </label>
            <input
              type="text"
              placeholder="0.00"
              value={amount}
              readOnly
              className="w-full text-3xl font-bold p-4 text-center border-2 border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Clavier numérique */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {digits.flat().map((d) => (
              <button
                key={d}
                onClick={() => {
                  if (d === "⌫") backspace();
                  else if (d === "." && amount.includes(".")) return;
                  else addDigit(d);
                }}
                className="bg-gray-100 p-4 rounded-lg text-xl font-bold hover:bg-gray-200 transition active:scale-95"
              >
                {d}
              </button>
            ))}
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={handleContribute}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-green-500 text-white py-4 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
            >
              🚀 Contribuer {amount ? `${amount} ETH` : ''}
            </button>

            {amount && (
              <button
                onClick={clear}
                className="w-full text-gray-500 py-2 text-sm hover:underline"
              >
                Effacer le montant
              </button>
            )}
          </div>

          {/* Message d'information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              💡 Votre contribution sera envoyée directement à la campagne et apparaîtra dans la liste des contributeurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
