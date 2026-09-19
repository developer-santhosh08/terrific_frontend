import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const EmailEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [templateName, setTemplateName] = useState('Welcome Email');
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!templateName.trim()) newErrors.templateName = 'The template name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = () => {
        navigate('/power-master/reminder/email');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Email Template</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/reminder/email')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-4">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Template Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Template Name" defaultValue="Welcome Email" />
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="tw-border tw-border-slate-300 tw-rounded-sm overflow-hidden">
                                        <div className="tw-bg-slate-50 tw-border-b tw-border-slate-300 tw-p-2 tw-flex tw-items-center tw-gap-3 tw-flex-wrap tw-text-slate-600">
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">✨</span>
                                            <span className="tw-text-slate-300">|</span>
                                            <strong className="tw-cursor-pointer hover:tw-text-blue-600 tw-font-serif">B</strong>
                                            <em className="tw-cursor-pointer hover:tw-text-blue-600 tw-font-serif">I</em>
                                            <u className="tw-cursor-pointer hover:tw-text-blue-600 tw-font-serif">U</u>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">🧹</span>
                                            <span className="tw-text-slate-300">|</span>
                                            <div className="tw-flex tw-items-center tw-gap-1 tw-cursor-pointer hover:tw-text-blue-600">
                                                <span className="tw-text-sm">Proxima Nova</span>
                                                <span className="tw-text-xs">▼</span>
                                            </div>
                                            <span className="tw-text-slate-300">|</span>
                                            <div className="tw-flex tw-items-center tw-gap-1 tw-cursor-pointer hover:tw-text-blue-600">
                                                <div className="tw-bg-yellow-300 tw-text-black tw-px-1 tw-font-bold tw-text-sm">A</div>
                                                <span className="tw-text-xs">▼</span>
                                            </div>
                                            <span className="tw-text-slate-300">|</span>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">☰</span>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">1.</span>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">⫷</span>
                                            <span className="tw-text-xs tw-cursor-pointer hover:tw-text-blue-600">▼</span>
                                            <span className="tw-text-slate-300">|</span>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">▦</span>
                                            <span className="tw-text-xs tw-cursor-pointer hover:tw-text-blue-600">▼</span>
                                            <span className="tw-text-slate-300">|</span>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">🔗</span>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">🖼️</span>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">▶</span>
                                            <span className="tw-cursor-pointer hover:tw-text-blue-600">⛶</span>
                                            <strong className="tw-cursor-pointer hover:tw-text-blue-600">&lt;/&gt;</strong>
                                            <strong className="tw-cursor-pointer hover:tw-text-blue-600">?</strong>
                                        </div>
                                        <textarea 
                                            className="form-control tw-border-0 tw-rounded-none focus:tw-ring-0 tw-resize-y" 
                                            rows="12"
                                            defaultValue="Welcome to our service..."
                                        ></textarea>
                                        <div className="tw-bg-slate-50 tw-border-t tw-border-slate-300 tw-h-3 tw-flex tw-justify-center tw-items-center">
                                            <div className="tw-w-4 tw-h-0.5 tw-bg-slate-300"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/reminder/email')}>Cancel</button>
                                <button type="submit" className="btn-save">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default EmailEdit;
