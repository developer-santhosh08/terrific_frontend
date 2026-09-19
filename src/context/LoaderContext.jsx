import React, { createContext, useState, useContext } from 'react';
import Loader from '../components/Loader';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoaderContext.Provider value={{ loading, setLoading }}>
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 999999,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Loader />
                </div>
            )}
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => useContext(LoaderContext);
