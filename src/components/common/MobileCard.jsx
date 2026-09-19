import React from 'react';

const MobileCard = ({ children, className = '' }) => {
    return (
        <div className={`tw-bg-white tw-rounded-xl tw-shadow-md tw-border tw-border-slate-200 tw-overflow-hidden tw-mb-5 last:tw-mb-0 tw--mx-3 sm:tw-mx-0 ${className}`}>
            {children}
        </div>
    );
};

MobileCard.Header = ({ label, value }) => {
    return (
        <div className="tw-px-4 tw-pt-4 tw-pb-2">
            <div className="tw-flex tw-justify-between tw-items-center">
                <span className="tw-text-xs tw-font-semibold tw-text-gray-400 tw-uppercase tw-tracking-wider">
                    {label}
                </span>
                <span className="tw-text-sm tw-font-bold tw-text-indigo-800">
                    {value}
                </span>
            </div>
            <div className="tw-h-px tw-w-full tw-bg-gray-800 tw-mt-2"></div>
        </div>
    );
};

MobileCard.Body = ({ children, className = '' }) => {
    return (
        <div className={`tw-px-4 tw-py-2 tw-flex tw-flex-col tw-gap-3 ${className}`}>
            {children}
        </div>
    );
};

MobileCard.Actions = ({ children }) => {
    return (
        <div className="tw-flex tw-flex-col tw-gap-1 tw-items-end">
            <span className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Action</span>
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-500 tw-overflow-x-auto tw-pb-1">
                {children}
            </div>
        </div>
    );
};

MobileCard.Field = ({ label, value, inline = false, valueColor = 'text-gray-800', bold = false, align = 'left' }) => {
    if (inline) {
        return (
            <div className={`tw-flex tw-gap-2 tw-items-center ${align === 'right' ? 'tw-justify-end' : ''}`}>
                <span className="tw-text-xs tw-text-gray-400">{label}</span>
                <span className={`tw-text-sm ${bold ? 'tw-font-bold' : 'tw-font-semibold'} ${valueColor === 'blue' ? 'tw-text-blue-500' : 'tw-text-gray-800'}`}>
                    {value}
                </span>
            </div>
        );
    }
    
    return (
        <div className={`tw-flex tw-flex-col tw-gap-0.5 ${align === 'right' ? 'tw-text-right' : 'tw-text-left'}`}>
            <span className="tw-text-xs tw-text-gray-400">{label}</span>
            <span className={`tw-text-sm ${bold ? 'tw-font-bold' : 'tw-font-semibold'} ${valueColor === 'blue' ? 'tw-text-blue-500' : 'tw-text-gray-800'}`}>
                {value}
            </span>
        </div>
    );
};

MobileCard.BoxField = ({ label, value }) => {
    return (
        <div className="tw-flex tw-flex-col tw-gap-1">
            <span className="tw-text-xs tw-text-gray-400">{label}</span>
            <div className="tw-bg-gray-50 tw-rounded-lg tw-px-3 tw-py-2 tw-text-sm tw-font-bold tw-text-gray-800">
                {value}
            </div>
        </div>
    );
};

MobileCard.Footer = ({ children, className = '' }) => {
    return (
        <div className={`tw-px-4 tw-pt-2 tw-pb-4 ${className}`}>
            {children}
        </div>
    );
};

export default MobileCard;
