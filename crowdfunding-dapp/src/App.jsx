import CreateCampaign from "./components/CreateCampaign";
import CampaignList from "./components/CampaignList";
import CampaignDetails from "./components/CampaignDetails";
import Contribute from "./components/Contribute";
import Withdraw from "./components/Withdraw";
import Refund from "./components/Refund";
import Layout from "./components/Layout";
import { Router, Routes, Route } from "react-router-dom";
import MyContributions from "./components/MyContribution";
import MyCampaigns from "./components/MyCampaigns";

function App() {
  return (
   


      <Layout>
        <Routes>
          <Route path="/" element={<CampaignList />} />
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/campaign/:id" element={<CampaignDetails />} />
          <Route path="/campaign/:id/contribute" element={<Contribute />} />
          <Route path="/my-contributions" element={<MyContributions/>} />
          <Route path="/my-campaigns" element={<MyCampaigns/>} />
        </Routes>
      </Layout>


);
}

export default App;
