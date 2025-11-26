import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = storage.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (emailOrUser, password) => {
        // If first argument is an object, it's the admin user
        if (typeof emailOrUser === 'object') {
            const user = emailOrUser;
            setUser(user);
            storage.setCurrentUser(user);
            return user;
        }

        // Regular user login
        const email = emailOrUser;
        const foundUser = await storage.getUserByEmail(email);

        if (!foundUser) {
            throw new Error('User not found');
        }

        if (foundUser.password !== password) {
            throw new Error('Invalid password');
        }

        // Don't store password in session
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        storage.setCurrentUser(userWithoutPassword);

        return userWithoutPassword;
    };

    const signup = async (name, email, password, role) => {
        const existingUser = await storage.getUserByEmail(email);

        if (existingUser) {
            throw new Error('User already exists');
        }

        const newUser = await storage.addUser({
            name,
            email,
            password,
            role // 'company' or 'client'
        });

        // Auto-login after signup
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        storage.setCurrentUser(userWithoutPassword);

        return userWithoutPassword;
    };

    const logout = () => {
        setUser(null);
        storage.setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
