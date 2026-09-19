import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Trash, Plus } from '@phosphor-icons/react';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const ProductInspectionEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [questions, setQuestions] = useState([
        { id: 1, text: 'Sample Question 1' },
        { id: 2, text: 'Sample Question 2' }
    ]);

    const handleAddQuestion = () => {
        const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        setQuestions([...questions, { id: newId, text: '' }]);
    };

    const handleRemoveQuestion = (id) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id));
        }
    };

    const handleQuestionChange = (id, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text: value } : q));
    };

    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    
    const [productOptions, setProductOptions] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
                const [mapRes, prodRes] = await Promise.all([
                    apiFetch(`/master/vendorProductMapping/${id}`),
                    apiFetch('/master/product')
                ]);
                const mapJson = mapRes?.json || {};
                const prodJson = prodRes?.json || {};

                let prodOpts = [];
                if (prodJson.status && prodJson.data) {
                    prodOpts = prodJson.data.map(p => ({ value: p.id, label: p.name }));
                    setProductOptions(prodOpts);
                }

                if (mapJson.status && mapJson.data) {
                    const data = mapJson.data;
                    const foundProd = prodOpts.find(p => p.value === data.product_id);
                    if (foundProd) setSelectedProduct(foundProd);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!selectedProduct) newErrors.productName = 'The product name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = () => {
        navigate('/power-master/items/product-inspection-mapping');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Product Inspection Mapping</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/product-inspection-mapping')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col-12 col-md-3 form-group">
                                        <label>Product Name <span className="text-danger">*</span></label>
                                        <Select
                                            options={productOptions}
                                            value={selectedProduct}
                                            onChange={setSelectedProduct}
                                            placeholder="Choose a Product Name"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                        {errors.productName && <small className="text-danger">{errors.productName}</small>}
                                    </div>
                                </div>

                            <div className="row mb-2">
                                <div className="col-12">
                                    <h5 className="tw-font-semibold tw-mb-3">Questions</h5>
                                    <div className="table-responsive">
                                        <table className="table table-bordered no-margin">
                                            <thead>
                                                <tr>
                                                    <th className="tw-w-16">S.No</th>
                                                    <th>Question</th>
                                                    <th className="tw-w-32">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {questions.map((q, index) => (
                                                    <tr key={q.id}>
                                                        <td className="align-middle">{index + 1}</td>
                                                        <td className="align-middle">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Question"
                                                                value={q.text}
                                                                onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="tw-flex tw-justify-start tw-gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-delete"
                                                                    onClick={() => handleRemoveQuestion(q.id)}
                                                                    disabled={questions.length === 1}
                                                                >
                                                                    <Trash weight="bold" className="tw-w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-add"
                                                                    onClick={handleAddQuestion}
                                                                >
                                                                    <Plus weight="bold" className="tw-w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/items/product-inspection-mapping')}>Cancel</button>
                                <button type="submit" className="btn-save">Update</button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default ProductInspectionEdit;
