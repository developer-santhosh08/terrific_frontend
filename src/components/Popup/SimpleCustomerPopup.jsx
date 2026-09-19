import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SimpleCustomerPopup = ({ isOpen, onClose, onSubmit, initialName = '' }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
        } else {
            setName('');
        }
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name.trim()) {
            alert("Please enter a customer name");
            return;
        }
        if (onSubmit) {
            onSubmit(name.trim());
        }
        onClose();
    };

    return createPortal(
        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/40 tw-p-4 sm:tw-p-6" style={{ zIndex: 999999 }}>
            {/* Background overlay click to close */}
            <div className="tw-absolute tw-inset-0" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="tw-bg-white tw-w-full tw-max-w-md tw-flex tw-flex-col tw-rounded-xl tw-shadow-2xl tw-overflow-hidden tw-relative tw-z-[1060] tw-border-2 tw-border-blue-600/20">
                
                {/* Header */}
                <div className="tw-flex tw-items-center tw-justify-between tw-p-4 sm:tw-p-5 tw-border-b tw-border-gray-100 tw-shrink-0 tw-bg-gray-50/50">
                    <h5 className="tw-text-lg sm:tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">Add Customer</h5>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-transition-colors tw-border-none tw-cursor-pointer"
                    >
                        <span className="tw-text-xl tw-leading-none tw-mb-[2px]">&times;</span>
                    </button>
                </div>

                {/* Body */}
                <div className="tw-p-4 sm:tw-p-5">
                    <div className="form-group mb-0">
                        <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Customer Name <span className="text-danger">*</span></label>
                        <input 
                            type="text" 
                            className="form-control tw-text-sm" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Enter customer name"
                            autoFocus
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="tw-flex tw-items-center tw-justify-between tw-p-4 sm:tw-p-5 tw-border-t tw-border-gray-100 tw-shrink-0 tw-bg-gray-50/50">
                    <button type="button" className="btn btn-warning tw-px-6" onClick={onClose}>Close</button>
                    <button 
                        type="button" 
                        className="btn btn-success tw-px-6" 
                        onClick={handleSubmit}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SimpleCustomerPopup;
