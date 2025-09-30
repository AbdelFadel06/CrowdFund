import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useCrowdFunding } from "../hooks/useCrowdFunding";
import { useParams, useNavigate } from "react-router-dom";
import CampaignContributors from "./CampaignContributors";

export default function CampaignDetails() {
  const { id } = useParams();
  const { getCampaignInfoExtended, getContributorCount } = useCrowdFunding();
  const [info, setInfo] = useState(null);
  const [contributorCount, setContributorCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        // Utilise getCampaignInfoExtended pour avoir le nombre de contributeurs
        const data = await getCampaignInfoExtended(id);
        setInfo(data);
        setContributorCount(Number(data.contributorCount) || 0);
      } catch (error) {
        console.error("Erreur chargement campagne:", error);
        // Fallback si getCampaignInfoExtended n'existe pas
        const data = await getCampaignInfo(id);
        setInfo(data);

        // Récupère le nombre de contributeurs séparément
        const count = await getContributorCount(id);
        setContributorCount(count);
      }
    };
    load();
  }, [id]);

  if (!info) return <p className="text-center mt-10">Chargement...</p>;

  // Calculs pour stats
  const goal = Number(info.goal);
  const raised = Number(info.amountRaised);
  const contributionPercent = goal > 0 ? (raised / goal) * 100 : 0;
  const daysLeft = Math.max(
    0,
    Math.ceil((Number(info.deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="max-w-6xl mx-auto mt-10">
      {/* Section principale */}
      <div className="p-6 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row gap-6 mb-6">
        {/* Image à gauche - taille fixe pour uniformité */}
        <div className="md:w-3/5 w-full h-132 overflow-hidden rounded-xl">
          <img
            src={info.image}
            alt={info.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/default-campaign.jpg';
            }}
          />
        </div>

        {/* Infos à droite */}
        <div className="md:w-2/5 w-full flex flex-col justify-between">
          <div>
            <span className="text-sm text-gray-500 uppercase tracking-wide">Campaign</span>
            <h2 className="text-2xl font-bold mt-1 mb-3">{info.title}</h2>
            <p className="text-gray-700 mb-4">{info.description}</p>

            <p className="text-sm text-gray-500 mb-4">
              Product Owner: <span className="font-medium">{info.campaignOwner}</span>
            </p>

            {/* Progress Bar */}
            <div className="mt-4 mb-6">
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-4 bg-green-500 rounded-full"
                  style={{ width: `${Math.min(contributionPercent, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Objectif: {ethers.formatEther(info.goal)} ETH</span>
                <span>Levés: {ethers.formatEther(info.amountRaised)} ETH</span>
              </div>
            </div>
          </div>

          {/* Stats en bas */}
          <div className="flex justify-between mt-4 mb-4">
            <div className="flex-1 bg-gray-100 p-3 rounded-lg text-center mr-2">
              <p className="text-sm text-gray-500">Contribution %</p>
              <p className="font-bold">{contributionPercent.toFixed(1)}%</p>
            </div>
            <div className="flex-1 bg-gray-100 p-3 rounded-lg text-center mx-2">
              <p className="text-sm text-gray-500">Contributeurs</p>
              <p className="font-bold">{contributorCount}</p>
            </div>
            <div className="flex-1 bg-gray-100 p-3 rounded-lg text-center ml-2">
              <p className="text-sm text-gray-500">Jours restants</p>
              <p className="font-bold">{daysLeft}</p>
            </div>
          </div>

          {/* Boutons Retour et Contribuer */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              ← Retour
            </button>
            <button
              onClick={() => navigate(`/campaign/${id}/contribute`)}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Contribuer
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 NOUVEAU: Section des contributeurs */}
      <CampaignContributors campaignId={id} variant="full" />
    </div>
  );
}
