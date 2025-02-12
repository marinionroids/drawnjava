import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import HomePage from './components/HomePage';
import LootboxDetails from "./components/LootboxDetails";
import Profile from './components/Profile';
import { clusterApiUrl } from "@solana/web3.js";
import { Buffer } from 'buffer';
import {UserBalanceProvider} from "./components/UserBalanceContext";
window.Buffer = Buffer;

function App() {
  // Set up wallet configuration as a memo
  const wallets = useMemo(
      () => [new SolflareWalletAdapter()],
      []
  );

  // You can use either mainnet-beta or devnet
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  return (
      <UserBalanceProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider
            wallets={wallets}
            autoConnect={false}
        >
          <Router>
            <RootLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/lootbox" replace />} />
                <Route path="/lootbox" element={<HomePage />} />
                <Route path="/lootbox/:name" element={<LootboxDetails />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </RootLayout>
          </Router>
        </WalletProvider>
      </ConnectionProvider>
      </UserBalanceProvider>
  );
}

export default App;