// App.jsx
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    {/* Other components will go here */}
                </main>
            </div>
        </AuthProvider>
    );
}

export default App;