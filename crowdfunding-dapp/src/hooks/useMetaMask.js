import { useEffect, useState } from "react";
import { ethers } from "ethers";

const useMetaMask = () => {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (err) {
        console.error("Erreur connexion MetaMask:", err);
      }
    } else {
      alert("MetaMask n'est pas installé !");
    }
  };

  // Mise à jour si l'utilisateur change de compte
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  return { account, connectWallet };
};

export default useMetaMask;
