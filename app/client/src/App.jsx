import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Subscription from "./Plan/Subscription";

const contractAddress = "0xc39955DE7CB0860584107719Fd2c80014c769a17";
const subscriptionAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FundsWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum Subscription.Plan",
        name: "plan",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "string",
        name: "movie",
        type: "string",
      },
    ],
    name: "MovieAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum Subscription.Plan",
        name: "plan",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
    ],
    name: "Subscribed",
    type: "event",
  },
  {
    inputs: [],
    name: "BASIC_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PREMIUM_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STANDARD_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum Subscription.Plan",
        name: "plan",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "movie",
        type: "string",
      },
    ],
    name: "addMovie",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "checkSubscription",
    outputs: [
      {
        internalType: "enum Subscription.Plan",
        name: "",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "expiration",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getAvailableMovies",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "subscribeBasic",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "subscribePremium",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "subscribeStandard",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "subscriptions",
    outputs: [
      {
        internalType: "enum Subscription.Plan",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const App = () => {
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const subscriptionContract = new ethers.Contract(
            contractAddress,
            subscriptionAbi,
            signer
          );
          setContract(subscriptionContract);
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
          setError(
            "Failed to connect to MetaMask. Please check your connection and try again."
          );
        }
      } else {
        console.error("MetaMask is not installed");
        setError(
          "MetaMask is not installed. Please install MetaMask to use this application."
        );
      }
    };

    initializeContract();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : contract ? (
        <Subscription contract={contract} />
      ) : (
        <p>Loading contract...</p>
      )}
    </div>
  );
};

export default App;
