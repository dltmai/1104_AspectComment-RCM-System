import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const SubscriptionPlans = ({ contract, contractABI, contractAddress }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [remainingTime, setRemainingTime] = useState("");
  const [availableMovies, setAvailableMovies] = useState("");

  useEffect(() => {
    if (!contract) {
      console.error("Contract is not initialized.");
    }
  }, [contract]);

  const handleSubscribe = async (planFunction, price) => {
    console.log(`handleSubscribe - Plan: ${planFunction}, Price: ${price} ETH`);

    try {
      if (!window.ethereum) {
        setTransactionStatus("MetaMask is not installed.");
        console.error("MetaMask not found.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider initialized");

      const signer = await provider.getSigner();
      console.log("Signer obtained");

      const address = await signer.getAddress();
      console.log("Connected wallet:", address);

      const balance = await provider.getBalance(address);
      const balanceInEther = ethers.formatEther(balance);
      console.log(`Wallet Balance: ${balanceInEther} ETH`);

      if (parseFloat(balanceInEther) < price) {
        console.log("Transaction failed: Insufficient funds");
        setTransactionStatus(
          "Insufficient funds: Not enough ETH in your wallet"
        );
        return;
      }

      console.log("Sending transaction...");
      setTransactionStatus("Waiting for transaction confirmation...");

      const txPromise = contract[planFunction]({
        value: ethers.parseEther(price.toString()),
      });

      // Timeout sau 60 giây nếu transaction không phản hồi
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Transaction timeout!")), 60000)
      );

      const tx = await Promise.race([txPromise, timeoutPromise]);

      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed:", tx.hash);

      setTransactionStatus("Subscription successful!");
    } catch (error) {
      console.error("Error in handleSubscribe:", error);
      setTransactionStatus("Subscription failed: " + error.message);
    }
  };

  const checkRemainingTime = async () => {
    try {
      if (!contract) {
        setRemainingTime("Error: Contract is not initialized.");
        console.error("Error: Contract is null or undefined.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      console.log("Checking subscription for:", userAddress);

      // Gọi hàm checkSubscription từ smart contract
      const [plan, expiryTime] = await contract.checkSubscription(userAddress);

      // Chuyển đổi plan thành chuỗi tương ứng
      let planName;
      switch (Number(plan)) {
        case 1:
          planName = "Basic";
          break;
        case 2:
          planName = "Standard";
          break;
        case 3:
          planName = "Premium";
          break;
        default:
          setRemainingTime("Not subscribed.");
          return;
      }

      if (expiryTime === 0n) {
        setRemainingTime("You don't have an active subscription.");
      } else {
        const currentTime = BigInt(Math.floor(Date.now() / 1000));
        const remaining = expiryTime - currentTime;

        if (remaining > 0n) {
          const daysRemaining = Number(remaining) / (60 * 60 * 24); // Chuyển giây thành ngày
          setRemainingTime(
            `Plan: ${planName}, Remaining time: ${daysRemaining.toFixed(
              2
            )} days`
          );
        } else {
          setRemainingTime(`Plan: ${planName}, Your subscription has expired.`);
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setRemainingTime("Error checking remaining time.");
    }
  };
  const checkAvailableMovies = async () => {
    try {
      if (!contract) {
        setAvailableMovies("Error: Contract is not initialized.");
        console.error("Error: Contract is null or undefined.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      console.log("Checking available movies for:", userAddress);

      // Gọi hàm từ smart contract để lấy danh sách phim
      const movies = await contract.getAvailableMovies(userAddress);

      if (movies.length === 0) {
        setAvailableMovies("No available movies for your subscription.");
      } else {
        setAvailableMovies(`Available movies: ${movies.join(", ")}`);
      }
    } catch (error) {
      console.error("Error checking available movies:", error);
      setAvailableMovies("Error retrieving available movies.");
    }
  };

  const plans = [
    {
      name: "Basic",
      price: "0.001 ETH",
      quality: "Fair",
      resolution: "480p",
      devices: "Mobile phone, tablet",
      simultaneousDevices: 1,
      downloadDevices: 1,
      planFunction: "subscribeBasic",
    },
    {
      name: "Standard",
      price: "0.003 ETH",
      quality: "Good",
      resolution: "720p (HD)",
      devices: "TV, computer, mobile phone, tablet",
      simultaneousDevices: 1,
      downloadDevices: 1,
      planFunction: "subscribeStandard",
    },
    {
      name: "Premium",
      price: "0.005 ETH",
      quality: "Great",
      resolution: "1080p (Full HD)",
      devices: "TV, computer, mobile phone, tablet",
      simultaneousDevices: 2,
      downloadDevices: 2,
      planFunction: "subscribePremium",
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Choose a Subscription Plan
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 hover:bg-gray-50 hover:shadow-lg flex flex-col h-full"
          >
            <h3 className="text-xl font-semibold text-center">{plan.name}</h3>
            <p className="text-center text-gray-600 mt-2">
              Monthly price: <span className="font-bold">{plan.price}</span>
            </p>
            <div className="mt-4 space-y-2 flex-grow">
              <p>
                <span className="font-semibold">Video and sound quality:</span>{" "}
                {plan.quality}
              </p>
              <p>
                <span className="font-semibold">Resolution:</span>{" "}
                {plan.resolution}
              </p>
              <p>
                <span className="font-semibold">Supported devices:</span>{" "}
                {plan.devices}
              </p>
              <p>
                <span className="font-semibold">
                  Devices your household can watch at the same time:
                </span>{" "}
                {plan.simultaneousDevices}
              </p>
              <p>
                <span className="font-semibold">Download devices:</span>{" "}
                {plan.downloadDevices}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPlan(plan.name);
                handleSubscribe(
                  plan.planFunction,
                  parseFloat(plan.price.split(" ")[0])
                );
              }}
              className="w-full mt-6 px-4 py-2 text-white rounded bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 to-green-500 hover:from-pink-600 hover:via-purple-600 hover:via-blue-600 hover:to-green-600 transition-all duration-300 animate-gradient"
            >
              Subscribe to {plan.name}
            </button>
          </div>
        ))}
      </div>
      {transactionStatus && (
        <p
          className={`text-center ${
            transactionStatus === "Subscription successful!"
              ? "text-green-600"
              : transactionStatus === "Transaction canceled"
              ? "text-yellow-600"
              : transactionStatus.startsWith("Insufficient funds")
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {transactionStatus}
        </p>
      )}
      <div className="text-center mt-6">
        <button
          onClick={checkRemainingTime}
          className="px-4 py-2 text-white rounded bg-blue-500 hover:bg-blue-600 transition-all duration-300"
        >
          Check Remaining Time
        </button>
        {remainingTime && <p className="mt-2 text-gray-600">{remainingTime}</p>}
      </div>
      <div className="text-center mt-6">
        <button
          onClick={checkAvailableMovies}
          className="px-4 py-2 text-white rounded bg-green-500 hover:bg-green-600 transition-all duration-300"
        >
          Check Available Movies
        </button>
        {availableMovies && (
          <p className="mt-2 text-gray-600">{availableMovies}</p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
