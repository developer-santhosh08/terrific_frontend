import React, { useEffect } from 'react';
import { useLoader } from '../../context/LoaderContext';

const originalFetch = window.fetch;

const FetchInterceptor = ({ children }) => {
    const { setLoading } = useLoader();

    useEffect(() => {
        let activeRequests = 0;

        window.fetch = async (...args) => {
            activeRequests++;
            if (activeRequests === 1) {
                setLoading(true);
            }


            try {
                const response = await originalFetch(...args);
                return response;
            } finally {
                activeRequests--;
                if (activeRequests === 0) {
                    setLoading(false);
                }
            }
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [setLoading]);

    return children;
};

export default FetchInterceptor;
