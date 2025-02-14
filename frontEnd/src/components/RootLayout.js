import React from 'react';
import HandleConnect from './HandleConnect';

const RootLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-900">
            <div className="debug-text text-white">Debug: RootLayout Header</div>
            <HandleConnect />
            <div className="pt-[100px]">
                <div className="flex-1 pt-[50px]">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default RootLayout;