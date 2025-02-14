import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import Cookies from 'js-cookie';
import Navbar from "./Navbar";
import { useUserBalance } from './UserBalanceContext';

const HandleConnect = () => {
  const { balance, updateBalance } = useUserBalance();
  const {
    select,
    connect,
    disconnect,
    connected,
    publicKey,
    wallet,
    signMessage,
  } = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [signature, setSignature] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const fetchUserData = async () => {
    try {
      const jwt = Cookies.get('jwt');
      if (!jwt) {
        return null;
      }

      const response = await fetch("https://drawngg.com/api/user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();
      if (data.balance !== undefined) {
        updateBalance(data.balance); // Update balance in context
      }
      Cookies.set('recievingAddress', data.recievingAddress);
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      Cookies.remove('jwt');
      setIsSignedIn(false);
      setUserData(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const savedJwt = Cookies.get('jwt');

      if (savedJwt) {
        const userData = await fetchUserData();
        if (userData) {
          setIsSignedIn(true);
          setUserData(userData);
        }
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    setIsConnected(connected);
    if (connected && publicKey && !userData) {
      handleSignMessage();
    }
  }, [connected, publicKey]);

  // Add this function in HandleConnect.jsx after handleDisconnect
  const handleTestUser = async () => {
    try {
      const response = await fetch("https://drawngg.com/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: "AX2nzQy66m9MrrzezaGnt6c84Cm7GwtJb3GAapczXvwN",
          message: "Welcome to Lootbox!",
          signature: "5mcAQuvLRUyD5rNHSZgkSif4tyKfyKEgVZF8YdikVfjProUHbpya6KaJiZ8Kc6QXKrxP3BiTdByoAFNiaZRSVE8p"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();
      // Save JWT in cookies
      Cookies.set('jwt', data.token, { expires: 1 });
      setUserData(data);
      setIsSignedIn(true);
      window.location.reload();
    } catch (error) {
      console.error("Test user auth failed:", error);
      alert(`Error authenticating test user: ${error.message}`);
    }
  };

  const verifyWithBackend = async (message, signature) => {
    try {
      const response = await fetch("https://drawngg.com/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          message: message,
          signature: signature,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { success, message: responseMessage, data } = await response.json();
      // Save JWT in cookies
      Cookies.set('jwt', data.token, { expires: 1 });
      setUserData(data);
      window.location.reload();
      setIsSignedIn(true);
    } catch (error) {
      console.error("Backend verification failed:", error);
      alert(`Error verifying user: ${error.message}`);
    }
  };

  const handleSignMessage = async () => {
    try {
      if (!connected || !publicKey) {
        throw new Error("Wallet not connected.");
      }

      if (!signMessage) {
        throw new Error("Signing not supported by this wallet.");
      }

      const message = "Welcome to Lootbox!";
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const base58Signature = bs58.encode(signatureBytes);

      setSignature(base58Signature);
      await verifyWithBackend(message, base58Signature);
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  const handleConnect = async () => {
    try {
      // Clear any existing data first
      setUserData(null);
      setIsSignedIn(false);

      if (!wallet) {
        // First ensure Solflare is selected
        const success = await select("Solflare");
        if (!success) {
          throw new Error("Failed to select wallet");
        }
      }

      // Only try to connect after we're sure the wallet is selected
      if (wallet) {
        await connect();
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    Cookies.remove('jwt');
    setUserData(null);
    setIsSignedIn(false);
    setIsConnected(false);
  };

  const username = userData?.username;
  return (
      <Navbar
          isConnected={isConnected || isSignedIn}
          username={username}
          balance={balance}
          level={"GAMBLER"}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onTestUser={handleTestUser}  // Add this line
          userData={userData}
      />
  );
};

export default HandleConnect;