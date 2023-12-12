// src/components/Home.js
import React from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/HomeStyles.css';

function Home() {
    return (
        <div className="home-container">
            <div className="pfp-container">
                <div className="pfp"></div>
                <div className="pfp-info">
                    Welcome to Home!
                </div>
            </div>
        </div>
    );
}

export default Home;
