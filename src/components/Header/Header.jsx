import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import './Header.css';

function Header() {
    const [user, setUser] = useState(null);

    function decodeToken(token) {
        const jwtSecret = process.env.REACT_APP_JWT_SECRET; // Use REACT_APP_ prefix for React apps

        try {
            const decoded = jwt.verify(token, jwtSecret);
            return decoded;
        } catch (error) {
            console.error('Token decoding error: ', error);
            return null;
        }
    }

    useEffect(() => {
        // Fetch the user information from local storage:
        const token = localStorage.getItem('token');
        if (token) {
            // Decode the token to get user info 
            const userFromToken = decodeToken(token);
            setUser(userFromToken);
        }
    }, []); // Add an empty dependency array

    return (
        <div className="header">
            <span>Hello, {user ? user.name : 'Guest'}</span>
            {user && (
                <span className={user.isAdmin ? 'admin-label' : 'employee-label'}>
                    {user.isAdmin ? 'Admin' : 'Employee'}
                </span>
            )}
        </div>
    );
}

export default Header;
