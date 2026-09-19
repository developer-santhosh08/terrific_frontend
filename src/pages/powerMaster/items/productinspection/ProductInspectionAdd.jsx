import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Trash, Plus } from '@phosphor-icons/react';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const ProductInspectionAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([{ id: 1, text: '' }]);

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

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productOptions, setProductOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const result = await apiFetch('/master/product');
                if (!result) return;
                const { res, json } = result;
                if (json.status && json.data) {
                    setProductOptions(json.data.map(p => ({ value: p.id, label: p.name })));
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!selectedProduct) newErrors.productName = 'The product name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/items/product-inspection-mapping');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Product Inspection Mapping</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/product-inspection-mapping')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
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
                                <button type="submit" className="btn-save">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
        );
};

export default ProductInspectionAdd;
