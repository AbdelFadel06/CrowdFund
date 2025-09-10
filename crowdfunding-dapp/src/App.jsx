import CreateCampaign from "./components/CreateCampaign";
import CampaignList from "./components/CampaignList";
import CampaignDetails from "./components/CampaignDetails";
import Contribute from "./components/Contribute";
import Withdraw from "./components/Withdraw";
import Refund from "./components/Refund";

function App() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">DApp CrowdFunding</h1>
      <CreateCampaign />
      <hr className="my-6" />
      <CampaignList />
      {/* Exemple : détails d'une campagne */}
      {/* <CampaignDetails campaignId={0} />
      <Contribute campaignId={0} />
      <Withdraw campaignId={0} />
      <Refund campaignId={0} /> */}
    </div>
  );
}

export default App;
