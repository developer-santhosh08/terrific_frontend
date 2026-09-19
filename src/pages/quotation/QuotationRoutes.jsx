import { Routes, Route } from 'react-router-dom';
import QuotationList from './QuotationList';
import QuotationAdd from './QuotationAdd';
import QuotationEdit from './QuotationEdit';

export default function QuotationRoutes() {
    return (
        <Routes>
            <Route path="" element={<QuotationList />} />
            <Route path="add" element={<QuotationAdd />} />
            <Route path="edit/:id" element={<QuotationEdit />} />
        </Routes>
    );
}
