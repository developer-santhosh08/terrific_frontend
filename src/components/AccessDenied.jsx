import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WarningIcon } from '@phosphor-icons/react';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-[60vh] tw-p-6 tw-text-center">
            <div className="tw-bg-red-50 tw-p-8 tw-rounded-full tw-mb-6">
                <WarningIcon size={80} className="tw-text-red-500" weight="duotone" />
            </div>
            
            <h1 className="tw-text-4xl tw-font-bold tw-text-gray-900 tw-mb-4">Access Denied</h1>
            
            <p className="tw-text-lg tw-text-gray-600 tw-max-w-md tw-mb-8">
                You do not have the required permissions to view this page. If you believe this is an error, please contact your system administrator.
            </p>
            
            <button 
                onClick={() => navigate(-1)}
                className="tw-px-6 tw-py-3 tw-bg-blue-600 tw-text-white tw-font-medium tw-rounded-lg tw-shadow-sm hover:tw-bg-blue-700 tw-transition-colors tw-flex tw-items-center tw-gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                </svg>
                Go Back
            </button>
        </div>
    );
};

export default AccessDenied;
