import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
        }, 2000); // 2 seconds duration

        return () => clearTimeout(timer);
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <div className="splash-logo">
                    {/* S Logo constructed from icons - Simplified as text/image for now */}
                    <div className="big-s">S</div>
                </div>
                <div className="splash-footer">
                    <h1 className="brand-name">sahibinden.com</h1>
                    <p className="slogan">al-sat-kirala-keşfet</p>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
