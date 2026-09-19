import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Trash } from '@phosphor-icons/react';

import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';
const ProductAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [groupOptions, setGroupOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [modelOptions, setModelOptions] = useState([]);
    
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    
    const [unitsOptions, setUnitsOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [groupRes, catRes, subCatRes, modelRes, unitsRes] = await Promise.all([
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/dropdown/product_group'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/dropdown/product_category'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/dropdown/product_subcategory'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/dropdown/product_model'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/dropdown/units'),
                ]);

                const [groupJson, catJson, subCatJson, modelJson, unitsJson] = await Promise.all([
                    groupRes.json(),
                    catRes.json(),
                    subCatRes.json(),
                    modelRes.json(),
                    unitsRes.json()
                ]);

                if (groupJson.status && groupJson.data) {
                    setGroupOptions(groupJson.data.map(d => ({ value: d.id, label: d.name })));
                }

                if (catJson.status && catJson.data) {
                    setCategoryOptions(catJson.data.map(d => ({ value: d.id, label: d.name })));
                }

                if (subCatJson.status && subCatJson.data) {
                    setSubCategoryOptions(subCatJson.data.map(d => ({ value: d.id, label: d.name })));
                }

                if (modelJson.status && modelJson.data) {
                    setModelOptions(modelJson.data.map(d => ({ value: d.id, label: d.name })));
                }

                

                if (unitsJson.status && unitsJson.data) {
                    setUnitsOptions(unitsJson.data.map(d => ({ value: d.id, label: d.name })));
                }
            } catch (err) {
                console.error("Error fetching dropdown options:", err);
            }
        };
        fetchOptions();
    }, []);

    const typeOptions = [{ value: 'Accessories', label: 'Accessories' }, { value: 'Product', label: 'Product' }];
    const priceOptions = [{ value: 'LP', label: 'LP' }, { value: 'MRP', label: 'MRP' }];
    const yesNoOptions = [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }];
    const measureOptions = [{ value: 'Partial', label: 'Partial' }, { value: 'Not Partial', label: 'Not Partial' }];

    const [productImage, setProductImage] = useState(null);
    const [productFile, setProductFile] = useState(null);
    const [isSubProduct, setIsSubProduct] = useState('No');
    const [productMeasure, setProductMeasure] = useState('Not Partial');
    const [serialNumber, setSerialNumber] = useState('Yes');

    const [formData, setFormData] = useState({
        product_group_id: '',
        product_category_id: '',
        product_sub_category_id: '',
        product_model_id: '',
        name: '',
        design_code: '',
        hsn_code: '',
        description: '',
        unit_id: '',
        product_type: 'Product',
        price_type: 'MRP',
        refill_stock: 'No',
        frame: '',
        kw: '',
        minimum_quantity: '',
        other: '',
        status: 'Active',
        sub_product_name: '',
        unit_quantity: '',
        free_unit_quantity: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, selected) => {
        setFormData(prev => ({ ...prev, [name]: selected ? selected.value : '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoading(true);
        setError(null);

        try {
            const token = sessionStorage.getItem('erp_token');
            const payload = new FormData();
            Object.keys(formData).forEach(key => {
                payload.append(key, formData[key] !== null ? formData[key] : '');
            });
            
            payload.append('sub_product', isSubProduct === 'Yes' ? 1 : 0);
            payload.append('unit_type', productMeasure === 'Partial' ? 1 : 0);
            payload.append('serial_number_status', serialNumber === 'Yes' ? 1 : 0);
            payload.append('product_type', formData.product_type === 'Product' ? 1 : 0);
            payload.append('price_type', formData.price_type === 'MRP' ? 1 : 0);
            payload.append('refill_stock', formData.refill_stock === 'Yes' ? 1 : 0);

            const imageFile = document.getElementById('productImageAdd')?.files[0];
            if (imageFile) payload.append('product_image', imageFile);
            
            const prodFile = document.getElementById('productFileAdd')?.files[0];
            if (prodFile) payload.append('product_file', prodFile);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/product`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: payload
            });
            const result = await response.json();
            if (result.status) {
                setShowSubmitPopup(true);
            } else {
                setError(result.message || 'Failed to create product');
                setFieldErrors(result.errors || {});
            }
        } catch (err) {
            console.error('Error creating product:', err);
            setError('An error occurred while creating the product');
            setFieldErrors({});
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        setShowSubmitPopup(false);
        navigate('/power-master/items/product');
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProductImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // we'll display a generic document icon or the actual file preview
            setProductFile(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Create Product</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/product')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                    {Object.keys(fieldErrors).length > 0 && (
                                        <ul className="mb-0 mt-2">
                                            {Object.values(fieldErrors).map((err, idx) => (
                                                <li key={idx}>{Array.isArray(err) ? err[0] : err}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Group <span className="text-danger">*</span></label>
                                    <Select options={groupOptions} placeholder="Product Group" className="react-select-container" classNamePrefix="react-select" value={groupOptions.find(opt => opt.value === formData.product_group_id) || null} onChange={(selected) => handleSelectChange('product_group_id', selected)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Category <span className="text-danger">*</span></label>
                                    <Select options={categoryOptions} placeholder="Choose a Product Category" className="react-select-container" classNamePrefix="react-select" value={categoryOptions.find(opt => opt.value === formData.product_category_id) || null} onChange={(selected) => handleSelectChange('product_category_id', selected)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Sub Category <span className="text-danger">*</span></label>
                                    <Select options={subCategoryOptions} placeholder="Product Sub Category" className="react-select-container" classNamePrefix="react-select" value={subCategoryOptions.find(opt => opt.value === formData.product_sub_category_id) || null} onChange={(selected) => handleSelectChange('product_sub_category_id', selected)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Model <span className="text-danger">*</span></label>
                                    <Select options={modelOptions} placeholder="Product Model Name" className="react-select-container" classNamePrefix="react-select" value={modelOptions.find(opt => opt.value === formData.product_model_id) || null} onChange={(selected) => handleSelectChange('product_model_id', selected)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Name" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Design Code</label>
                                    <input type="text" className="form-control" placeholder="Design Code" name="design_code" value={formData.design_code} onChange={handleChange} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>HSN Code</label>
                                    <input type="text" className="form-control" placeholder="HSN Code" name="hsn_code" value={formData.hsn_code} onChange={handleChange} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Description</label>
                                    <input type="text" className="form-control" placeholder="Description" name="description" value={formData.description} onChange={handleChange} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Product Unit <span className="text-danger">*</span></label>
                                    <Select options={unitsOptions} placeholder="Product Unit" className="react-select-container" classNamePrefix="react-select" value={unitsOptions.find(opt => opt.value === formData.unit_id) || null} onChange={(selected) => handleSelectChange('unit_id', selected)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Product Type</label>
                                    <Select options={typeOptions} placeholder="Product Type" className="react-select-container" classNamePrefix="react-select" value={typeOptions.find(opt => opt.label === formData.product_type) || typeOptions[1]} onChange={(selected) => handleSelectChange('product_type', selected)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Applicable Price</label>
                                    <Select options={priceOptions} placeholder="Applicable Price" className="react-select-container" classNamePrefix="react-select" value={priceOptions.find(opt => opt.label === formData.price_type) || priceOptions[1]} onChange={(selected) => handleSelectChange('price_type', selected)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Refill Stock</label>
                                    <Select options={yesNoOptions} placeholder="Refill Stock" className="react-select-container" classNamePrefix="react-select" value={yesNoOptions.find(opt => opt.label === formData.refill_stock) || yesNoOptions[1]} onChange={(selected) => handleSelectChange('refill_stock', selected)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>If Sub Product</label>
                                    <Select
                                        options={yesNoOptions}
                                        placeholder="If Sub Product"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        value={yesNoOptions.find(opt => opt.value === isSubProduct)}
                                        onChange={(selected) => setIsSubProduct(selected.value)}
                                    />
                                </div>
                                {isSubProduct === 'Yes' && (
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Sub Product Name</label>
                                        <input type="text" className="form-control" placeholder="Sub Product Name" name="sub_product_name" value={formData.sub_product_name} onChange={handleChange} />
                                    </div>
                                )}

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Product Measure</label>
                                    <Select
                                        options={measureOptions}
                                        placeholder="Product Measure"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        value={measureOptions.find(opt => opt.value === productMeasure)}
                                        onChange={(selected) => setProductMeasure(selected.value)}
                                    />
                                </div>
                                {productMeasure === 'Partial' && (
                                    <>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Unit Quantity</label>
                                            <Select options={unitsOptions} placeholder="Unit Quantity" className="react-select-container" classNamePrefix="react-select" value={unitsOptions.find(opt => opt.value === formData.unit_quantity) || null} onChange={(selected) => handleSelectChange('unit_quantity', selected)} />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Free Unit Quantity</label>
                                            <Select options={unitsOptions} placeholder="Free Unit Quantity" className="react-select-container" classNamePrefix="react-select" value={unitsOptions.find(opt => opt.value === formData.free_unit_quantity) || null} onChange={(selected) => handleSelectChange('free_unit_quantity', selected)} />
                                        </div>
                                    </>
                                )}

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Serial Number</label>
                                    <Select
                                        options={yesNoOptions}
                                        placeholder="Serial Number"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        value={yesNoOptions.find(opt => opt.value === serialNumber)}
                                        onChange={(selected) => setSerialNumber(selected.value)}
                                    />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Frame</label>
                                    <input type="text" className="form-control" placeholder="Frame" name="frame" value={formData.frame} onChange={handleChange} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>KW</label>
                                    <input type="text" className="form-control" placeholder="KW" name="kw" value={formData.kw} onChange={handleChange} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Minimum Quantity</label>
                                    <input type="number" className="form-control" placeholder="Minimum Quantity" name="minimum_quantity" value={formData.minimum_quantity} onChange={handleChange} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Other1</label>
                                    <input type="text" className="form-control" placeholder="Other1" name="other" value={formData.other} onChange={handleChange} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Product Image</label>
                                    <input type="file" id="productImageAdd" className="form-control" accept="image/*" onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setProductImage(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }} />
                                    {productImage && (
                                        <div className="tw-relative tw-inline-block tw-p-2 tw-rounded-lg tw-shadow-md tw-bg-white tw-border tw-border-gray-100 tw-mt-3">
                                            <img src={productImage} alt="Preview" className="tw-w-32 tw-h-32 tw-object-cover tw-rounded-md" />
                                            <button type="button" onClick={() => { document.getElementById('productImageAdd').value = ''; setProductImage(null); }} className="tw-absolute -tw-top-2 -tw-right-2 tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-rounded-full tw-shadow-md tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-border tw-border-red-100">
                                                <i className="fa fa-trash tw-text-xs"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Product File</label>
                                    <input type="file" id="productFileAdd" className="form-control" onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setProductFile(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }} />
                                    {productFile && (
                                        <div className="tw-relative tw-inline-block tw-p-2 tw-rounded-lg tw-shadow-md tw-bg-white tw-border tw-border-gray-100 tw-mt-3">
                                            <img src={productFile} alt="Preview" className="tw-w-32 tw-h-32 tw-object-cover tw-rounded-md" />
                                            <button type="button" onClick={() => { document.getElementById('productFileAdd').value = ''; setProductFile(null); }} className="tw-absolute -tw-top-2 -tw-right-2 tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-rounded-full tw-shadow-md tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-border tw-border-red-100">
                                                <i className="fa fa-trash tw-text-xs"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn tw-bg-yellow-500 tw-text-white tw-px-6 tw-py-2 tw-rounded-md hover:tw-bg-yellow-600 tw-font-medium" onClick={() => navigate('/power-master/items/product')}>Cancel</button>
                                <button type="submit" className="btn tw-bg-green-500 tw-text-white tw-px-6 tw-py-2 tw-rounded-md hover:tw-bg-green-600 tw-font-medium" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
    );
};

export default ProductAdd;
