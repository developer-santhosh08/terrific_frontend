import React from 'react';

interface TestProps {
    message: string;
}

const TSTestComponent: React.FC<TestProps> = ({ message }) => {
    return (
        <div className="tw-p-4 tw-bg-indigo-50 tw-rounded-xl tw-border tw-border-indigo-200 tw-mt-4">
            <h3 className="tw-text-indigo-900 tw-font-bold">TypeScript Component ✅</h3>
            <p className="tw-text-indigo-700">{message}</p>
        </div>
    );
};

export default TSTestComponent;
