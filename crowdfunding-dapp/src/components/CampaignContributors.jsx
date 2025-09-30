import { useEffect, useState } from 'react';
import { useCrowdFunding } from '../hooks/useCrowdFunding';

export default function CampaignContributors({ campaignId, variant = "full" }) {
  const { getCampaignContributions } = useCrowdFunding();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContributions = async () => {
      setLoading(true);
      const data = await getCampaignContributions(campaignId);
      setContributions(data);
      setLoading(false);
    };
    loadContributions();
  }, [campaignId]);

  if (loading) {
    return <div className="text-center py-4">Chargement des contributeurs...</div>;
  }

  if (variant === "preview") {
    // Version compacte pour la page de contribution
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-bold text-blue-800 mb-2">
          🎯 {contributions.length} contributeur(s)
        </h4>
        {contributions.length > 0 && (
          <div className="space-y-1 text-sm">
            {contributions.slice(-3).reverse().map((contribution, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-blue-700">
                  {contribution.address.substring(0, 6)}...
                </span>
                <span className="font-medium text-green-600">
                  {contribution.amount} ETH
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Version complète pour la page détails
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-4">
        🎯 Contributeurs ({contributions.length})
      </h3>

      {contributions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucun contributeur pour le moment. Soyez le premier !
        </p>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <div className="space-y-2">
            {contributions.map((contribution, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <span className="font-mono text-sm block">
                    {contribution.address.substring(0, 8)}...{contribution.address.substring(38)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Contribution #{index + 1}
                  </span>
                </div>
                <span className="font-bold text-green-600">
                  {contribution.amount} ETH
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
