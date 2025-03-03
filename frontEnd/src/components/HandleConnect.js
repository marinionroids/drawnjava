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
  const [activeWallet, setActiveWallet] = useState(null);

  // Function to get active wallet details
  const getWalletDetails = () => {
    if (!wallet) return null;
    
    return {
      name: wallet.adapter.name,
      icon: wallet.adapter.icon,
      id: wallet.adapter.name.toLowerCase().replace(/\s+/g, '-')
    };
  };

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
      
      // Also retrieve saved wallet info if available
      const savedWalletId = Cookies.get('walletId');
      if (savedWalletId && !activeWallet) {
        // You could potentially re-select the wallet here if needed
        console.log(`Previously used wallet: ${savedWalletId}`);
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsSignedIn(false);
      setUserData(null);
      return null;
    }
  };

  useEffect(() => {
    // Reset wallet selection on page load if not connected
    if (!connected && wallet) {
      disconnect();
    }
    
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
    
    if (connected && publicKey) {
      // Update active wallet when connected
      const walletInfo = getWalletDetails();
      setActiveWallet(walletInfo);
      
      // Log wallet info for debugging
      console.log("Connected wallet:", walletInfo);
      
      if (!userData) {
        handleSignMessage();
      }
    } else {
      setActiveWallet(null);
    }
  }, [connected, publicKey, wallet]);

  const verifyWithBackend = async (message, signature) => {
    try {
      const walletInfo = getWalletDetails();
      const response = await fetch("https://drawngg.com/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          message: message,
          signature: signature,
          walletProvider: walletInfo?.name || 'unknown', // Send wallet info to backend
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { success, message: responseMessage, data } = await response.json();
      // Save JWT in cookies
      Cookies.set('jwt', data.token, { expires: 1 });
      
      // Save wallet information
      if (walletInfo) {
        Cookies.set('walletId', walletInfo.id, { expires: 1 });
        Cookies.set('walletName', walletInfo.name, { expires: 1 });
      }
      
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

      // Connect with the selected wallet
      if (wallet) {
        await connect();
        
        // Wallet information will be set in the useEffect hook when connected changes
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    Cookies.remove('jwt');
    Cookies.remove('walletId');
    Cookies.remove('walletName');
    setUserData(null);
    setIsSignedIn(false);
    setIsConnected(false);
    setActiveWallet(null);
    
    // Force refresh to reset UI state
    window.location.reload();
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
          userData={userData}
          activeWallet={activeWallet} // Pass wallet info to Navbar
      />
  );
};

export default HandleConnect;