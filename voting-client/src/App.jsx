// src/App.jsx

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ethers } from "ethers";


import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import VoterPage from "./pages/VoterPage";


import config from "./config";
import "./pages/Home.css";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [electionContract, setElectionContract] = useState(null);
  const [resultContract, setResultContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const networkId = "5777"; //The network id 
  let electionAddress;
  let resultAddress;

  if (config.Election.networks && config.Election.networks[networkId]) {
    electionAddress = config.Election.networks[networkId].address;
  } else {
    console.error("Election Contract not deployed on network:", networkId);
  }

  if (config.ResultContract.networks && config.ResultContract.networks[networkId]) {
    resultAddress = config.ResultContract.networks[networkId].address;
  } else {
    console.error("ResultContract not deployed on network:", networkId);
  }

  const electionAbi = config.Election.abi;
  const resultAbi = config.ResultContract.abi;

  // Connect Wallet Function
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Metamask not detected. Please install it.");
      return;
    }

    try {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(account);
      console.log("Connected account:", account);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Initialize Election contract
      const election = new ethers.Contract(
        electionAddress,
        electionAbi,
        signer
      );
      setElectionContract(election);

       // Initialize ResultContract
      const result = new ethers.Contract(
        resultAddress,
        resultAbi,
        signer
      );
      setResultContract(result);

      // Check if the user is the admin (owner of the Election contract)
      const ownerAddress = await election.owner();
      console.log("Owner address:", ownerAddress);

      if (account.toLowerCase() === ownerAddress.toLowerCase()) {
        console.log("Current account is the owner.");
        setIsAdmin(true);
      } else {
        console.log("Current account is NOT the owner.");
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  }

  useEffect(() => {
    // Automatically connect the wallet if it's already connected
    async function checkIfWalletIsConnected() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          console.log("Already connected account:", accounts[0]);
        }
      }
    }
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (window.ethereum && currentAccount) {
      connectWallet();
    }
    
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page Route */}
        <Route
          path="/"
          element={
            <HomePage
              currentAccount={currentAccount}
              connectWallet={connectWallet}
              isAdmin={isAdmin} 
              resultContract={resultContract}
              electionContract={electionContract}
            />
          }
        />

        {/* Admin or Voter Route */}
        <Route
          path="/admin"
          element={
            electionContract && resultContract ? (
              isAdmin ? (
                <AdminPage
                  currentAccount={currentAccount}
                  electionContract={electionContract}
                  resultContract={resultContract}
                />
              ) : (
                <Navigate to="/voter" replace />
              )
            ) : (
              <div>Loading Contracts...</div>
            )
          }
        />

        {/* Voter Page Route */}
        <Route
          path="/voter"
          element={
            electionContract && resultContract ? (
              <VoterPage
                electionContract={electionContract}
                resultContract={resultContract}
                currentAccount={currentAccount}
              />
            ) : (
              <div>Loading Contracts...</div>
            )
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
