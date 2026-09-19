import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Trash, Plus, FloppyDisk } from '@phosphor-icons/react';

const BudgetDetailsEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [rows, setRows] = useState([
        { id: 1, accountHead: null, months: Array(12).fill(0), status: null }
    ]);

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), accountHead: null, months: Array(12).fill(0), status: null }]);
    };

    const handleDeleteRow = (index) => {
        if (rows.length > 1) {
            const newRows = rows.filter((_, i) => i !== index);
            setRows(newRows);
        }
    };

    const accountsHeadOptions = [
        { value: 'Eng Advance', label: 'Eng Advance' },
        { value: 'Eng Expenses', label: 'Eng Expenses' }
    ];

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
    ];

    const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Budget Details</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/bank/budget-details')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="text-center fw-bold mb-4 tw-text-slate-700 tw-uppercase">
                            BUDGET DETAILS - FINANCE YEAR -
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th>#</th>
                                        <th style={{ minWidth: '200px' }}>Accounts Head</th>
                                        {monthLabels.map(m => (
                                            <th key={m} style={{ minWidth: '80px' }}>{m}</th>
                                        ))}
                                        <th style={{ minWidth: '100px' }}>Total</th>
                                        <th style={{ minWidth: '150px' }}>Status</th>
                                        <th style={{ minWidth: '100px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <Select 
                                                    options={accountsHeadOptions} 
                                                    placeholder="Choose Accounts Head"
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    menuPosition="fixed"
                                                />
                                            </td>
                                            {row.months.map((val, mIndex) => (
                                                <td key={mIndex}>
                                                    <input type="number" className="form-control form-control-sm" defaultValue={val} />
                                                </td>
                                            ))}
                                            <td>
                                                <input type="text" className="form-control form-control-sm" readOnly />
                                            </td>
                                            <td>
                                                <Select 
                                                    options={statusOptions} 
                                                    placeholder="Choose Status"
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    menuPosition="fixed"
                                                />
                                            </td>
                                            <td>
                                                <div className="tw-flex tw-justify-start tw-gap-2">
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDeleteRow(index)}
                                                        disabled={rows.length === 1}
                                                    >
                                                        <Trash weight="bold" className="tw-w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-add"
                                                        onClick={handleAddRow}
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
                        <div className="d-flex justify-content-end align-items-center mt-3">
                            <button className="btn-save">
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BudgetDetailsEdit;
