import { useState, useEffect } from 'react';

const CustomerHistoryPopup = ({ isOpen, onClose, customerId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !customerId) {
            setHistory([]);
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting/customers/${customerId}/enquiry-history`, { headers });
                const json = await response.json();
                
                if (response.ok && json.status === 'success') {
                    setHistory(json.data || []);
                } else {
                    setHistory([]);
                }
            } catch (err) {
                console.error("Error fetching customer history:", err);
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [isOpen, customerId]);

    if (!isOpen) return null;

    return (
        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/40 tw-p-4 sm:tw-p-6" style={{ zIndex: 99999 }}>
            {/* Background overlay click to close */}
            <div className="tw-absolute tw-inset-0" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="tw-bg-white tw-w-full tw-max-w-5xl tw-max-h-full tw-flex tw-flex-col tw-rounded-xl tw-shadow-2xl tw-overflow-hidden tw-relative tw-z-[1060] tw-border-2 tw-border-blue-600/20">
                
                {/* Header */}
                <div className="tw-flex tw-items-center tw-justify-between tw-p-4 sm:tw-p-5 tw-border-b tw-border-gray-100 tw-shrink-0 tw-bg-gray-50/50">
                    <h5 className="tw-text-lg sm:tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">Customer History</h5>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-transition-colors tw-border-none tw-cursor-pointer"
                    >
                        <span className="tw-text-xl tw-leading-none tw-mb-[2px]">&times;</span>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="tw-flex-1 tw-overflow-y-auto tw-p-4 sm:tw-p-5">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover bg-white mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Enq no</th>
                                    <th>Customer name</th>
                                    <th>Address 1</th>
                                    <th>city</th>
                                    <th>no of products</th>
                                    <th>stage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">Loading history...</td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">No history data available.</td>
                                    </tr>
                                ) : (
                                    history.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.enquiry_number}</td>
                                            <td>{row.customer_name}</td>
                                            <td>{row.address1}</td>
                                            <td>{row.city_name}</td>
                                            <td>{row.no_of_products}</td>
                                            <td>{row.stage_name}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="tw-flex tw-items-center tw-justify-start tw-p-4 sm:tw-p-5 tw-border-t tw-border-gray-100 tw-shrink-0 tw-bg-gray-50/50">
                    <button type="button" className="btn btn-warning tw-px-6" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerHistoryPopup;
