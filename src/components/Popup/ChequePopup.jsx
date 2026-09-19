import React, { useState } from 'react';

const options = [
    'In Collection',
    'Collected',
    'Bounced',
    'Cancelled'
];

const ChequePopup = ({ isOpen, onClose, onSubmit }) => {
    const [selected, setSelected] = useState(options[0]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (onSubmit) onSubmit({ status: selected });
        onClose();
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{position:'fixed',inset:0,zIndex:1050,background:'transparent'}}>
            <style>{`
                .modal-dialog { margin: 24px auto; }
                .modal-content { box-sizing: border-box; }
                .option-item { padding: 10px 12px; cursor: pointer; }
                .option-item:hover { background: #f3f4f6; }
                .option-item.selected { background: #2563EB; color: white; }
            `}</style>
            <div className="modal-overlay" style={{position:'absolute',inset:0,background:'transparent'}} onClick={onClose} />
            <div className="modal-dialog" style={{zIndex:1060, maxWidth: '520px', width: 'calc(100% - 40px)', boxSizing: 'border-box'}}>
                <div className="modal-content p-4" style={{position:'relative', borderRadius:12, border: '2px solid #374151', boxShadow: '0 12px 40px rgba(55,65,81,0.15)', overflow: 'hidden'}}>
                    <div className="d-flex" style={{position: 'relative', alignItems: 'center', minHeight: 56, marginBottom: 6}}>
                        <h5 className="modal-title" style={{fontSize: '1.25rem', fontWeight:700, margin:0, flex:1}}>Return Expense</h5>
                        <button type="button" aria-label="Close" onClick={onClose} style={{background:'#ef4444',border:'none',color:'#fff',fontSize:'1.1rem',width:34,height:34,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:17,cursor:'pointer'}}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Select Status</label>
                            <div style={{border:'1px solid #e5e7eb',borderRadius:6,overflow:'hidden'}}>
                                {options.map(o => (
                                    <div key={o} className={`option-item ${selected === o ? 'selected' : ''}`} onClick={() => setSelected(o)}>
                                        {o}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer d-flex justify-content-between">
                        <div>
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        </div>
                        <div>
                            <button type="button" className="btn-save" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChequePopup;
