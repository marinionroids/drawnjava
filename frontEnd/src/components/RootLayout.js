import React from 'react';
import HandleConnect from './HandleConnect';

const RootLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-900">
            <div className="debug-text text-white"></div>
            <HandleConnect />
            <div className="pt-[70px]">
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default RootLayout;