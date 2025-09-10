// // src/components/Campaigns.js
// import React, { useState } from "react";
// import { useCrowdFunding } from "../hooks/useCrowdFunding";
// import { ethers } from "ethers";

// const Campaigns = () => {
//   const { createCampaign, contribute, getCampaignInfo } = useCrowdFunding();
//   const [campaignId, setCampaignId] = useState(0);
//   const [campaign, setCampaign] = useState(null);

//   const handleCreate = async () => {
//     await createCampaign(ethers.parseUnits("1", "ether"), 3600, "Test", "Description de test");
//     alert("Campagne créée !");
//   };

//   const handleContribute = async () => {
//     await contribute(campaignId, "0.01");
//     alert("Contribution envoyée !");
//   };

//   const handleGetInfo = async () => {
//     const info = await getCampaignInfo(campaignId);
//     setCampaign(info);
//   };

//   return (
//     <div>
//       <h2 className="text-red-700">Campagnes</h2>
//       <button onClick={handleCreate}>Créer une campagne</button>
//       <br /><br />
//       <input
//         type="number"
//         value={campaignId}
//         onChange={(e) => setCampaignId(e.target.value)}
//         placeholder="ID campagne"
//       />
//       <button onClick={handleContribute}>Contribuer 0.01 ETH</button>
//       <button onClick={handleGetInfo}>Voir Infos</button>

//       {campaign && (
//         <div>
//           <p>Owner: {campaign[0]}</p>
//           <p>Goal: {campaign[1].toString()} wei</p>
//           <p>Deadline: {new Date(Number(campaign[2]) * 1000).toLocaleString()}</p>
//           <p>Amount Raised: {campaign[3].toString()} wei</p>
//           <p>Funds Withdrawn: {campaign[4] ? "Oui" : "Non"}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Campaigns;
