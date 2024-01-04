import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from "@gsap/react";
import './LandingPage.css';
const FeatureSection = () => {
    let listItem1 = useRef()
    let listItem2 = useRef()
    let listItem3 = useRef()
    
    useGSAP(() => {
        gsap.to([listItem1.current, listItem2.current, listItem3.current],
             { rotation: 360 }); // <-- automatically reverted

    }, { scope: listItem1 }) // <-- scope for selector text (optional)

    return (
        <>
            <div className="feature-section">
                <h2>Key Features</h2>
                <ul>
                    <li
                        ref={listItem1}>Track your inventory effortlessly</li>
                    <li
                        ref={listItem2}>Real-time updates</li>
                    <li
                        ref={listItem3}>Advanced reporting and analytics</li>
                </ul>
            </div>
            <div className="footer">
                <p>&copy; 2023 TRX by Lina Rawas. All Rights Reserved.</p>
            </div>
        </>
    );
};

export default FeatureSection;

