import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import '@solana/wallet-adapter-react-ui/styles.css';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import HomePage from './components/HomePage';
import LootboxDetails from "./components/LootboxDetails";
import Profile from './components/profile';
import { clusterApiUrl } from "@solana/web3.js";
import { Buffer } from 'buffer';
import {UserBalanceProvider} from "./components/UserBalanceContext";
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'; // Add this
window.Buffer = Buffer;

function App() {
  console.log('App rendering');
  const wallets = useMemo(
      () => [new SolflareWalletAdapter()],
      []
  );

  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  return (
      <div className="debug-app">
        <UserBalanceProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={false}>
              <WalletModalProvider>
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
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </UserBalanceProvider>
      </div>
  );
}

export default App;