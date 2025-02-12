// Profile.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [userData, setUserData] = useState(null);

    // Get the JWT token from cookies
    const jwt = Cookies.get('jwt');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("http://drawngg.com/api/user", {
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
                setUserData(data);
                setUsername(data.username || '');
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        if (jwt) {
            fetchUserData();
        }
    }, [jwt]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('http://drawngg.com/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                throw new Error('Failed to update username');
            }

            setIsEditing(false);
            // Reload the page to refresh the user data
            window.location.reload();
        } catch (error) {
            console.error('Error updating username:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Username</label>
                            <div className="flex items-center space-x-4">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                ) : (
                                    <span className="text-white text-lg">{username || 'Loading...'}</span>
                                )}
                                {isEditing ? (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Level</label>
                        <div className="text-white text-lg">GAMBLER</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;