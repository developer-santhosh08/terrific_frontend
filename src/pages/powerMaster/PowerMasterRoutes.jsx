import { Routes, Route } from 'react-router-dom';
import RequirePermission from '../../components/RequirePermission';
import CompanyList from './company/company/CompanyList';
import CompanyAdd from './company/company/CompanyAdd';
import CompanyEdit from './company/company/CompanyEdit';
import BranchList from './company/branch/BranchList';
import BranchAdd from './company/branch/BranchAdd';
import BranchEdit from './company/branch/BranchEdit';
import TaxMasterList from './company/taxMaster/TaxMasterList';
import TaxMasterAdd from './company/taxMaster/TaxMasterAdd';
import TaxMasterEdit from './company/taxMaster/TaxMasterEdit';
import ProjectList from './company/project/ProjectList';
import ProjectAdd from './company/project/ProjectAdd';
import ProjectEdit from './company/project/ProjectEdit';

import EnquirySoruceList from './enquiry/enquirySource/EnquirySoruceList';
import EnquirySoruceAdd from './enquiry/enquirySource/EnquirySoruceAdd';
import EnquirySoruceEdit from './enquiry/enquirySource/EnquirySoruceEdit';
import PandFNotesList from './enquiry/p&f notes/P&fNotesList';
import PandFNotesAdd from './enquiry/p&f notes/P&fNotesAdd';
import PandFNotesEdit from './enquiry/p&f notes/P&fNotesEdit';

import TaxNotesList from './enquiry/taxNotes/TaxNotesList';
import TaxNotesAdd from './enquiry/taxNotes/TaxNotesAdd';
import TaxNotesEdit from './enquiry/taxNotes/TaxNotesEdit';

import PaymentNotesList from './enquiry/paymentNotes/PaymentNotesList';
import PaymentNotesAdd from './enquiry/paymentNotes/PaymentNotesAdd';
import PaymentNotesEdit from './enquiry/paymentNotes/PaymentNotesEdit';

import DeliveryNotesList from './enquiry/deliveryNotes/DeliveryNotesList';
import DeliveryNotesAdd from './enquiry/deliveryNotes/DeliveryNotesAdd';
import DeliveryNotesEdit from './enquiry/deliveryNotes/DeliveryNotesEdit';

import WarrantyNotesList from './enquiry/warrantyNotes/WarrantyNotesList';
import WarrantyNotesAdd from './enquiry/warrantyNotes/WarrantyNotesAdd';
import WarrantyNotesEdit from './enquiry/warrantyNotes/WarrantyNotesEdit';

import FrightNotesList from './enquiry/frightNotes/FrightNotesList';
import FrightNotesAdd from './enquiry/frightNotes/FrightNotesAdd';
import FrightNotesEdit from './enquiry/frightNotes/FrightNotesEdit';

import EnquiryEditList from './enquiryconfig/enquiryedit/EnquiryEditList';
import EnquiryEditAdd from './enquiryconfig/enquiryedit/EnquiryEditAdd';
import EnquiryEditEdit from './enquiryconfig/enquiryedit/EnquiryEditEdit';

import HrCategoryList from './hr/hrCategory/HrCategoryList';
import HrCategoryAdd from './hr/hrCategory/HrCategoryAdd';
import HrCategoryEdit from './hr/hrCategory/HrCategoryEdit';

import DesignationList from './hr/designation/DesignationList';
import DesignationAdd from './hr/designation/DesignationAdd';
import DesignationEdit from './hr/designation/DesignationEdit';

import DepartmentList from './hr/department/DepartmentList';
import DepartmentAdd from './hr/department/DepartmentAdd';
import DepartmentEdit from './hr/department/DepartmentEdit';

import MarketingPersonList from './hr/marketingperson/MarketingPersonList';
import MarketingPersonAdd from './hr/marketingperson/MarketingPersonAdd';
import MarketingPersonEdit from './hr/marketingperson/MarketingPersonEdit';

import AreaMarketingList from './hr/areamarketing/AreaMarketingList';
import AreaMarketingAdd from './hr/areamarketing/AreaMarketingAdd';
import AreaMarketingEdit from './hr/areamarketing/AreaMarketingEdit';

import LabourChargesList from './hr/labourcharges/LabourChargesList';
import LabourChargesAdd from './hr/labourcharges/LabourChargesAdd';
import LabourChargesEdit from './hr/labourcharges/LabourChargesEdit';

import CountyList from './geolocations/country/CountyList';
import CountyAdd from './geolocations/country/CountyAdd';
import CountyEdit from './geolocations/country/CountyEdit';
import AreaList from './geolocations/area/AreaList';
import AreaAdd from './geolocations/area/AreaAdd';
import AreaEdit from './geolocations/area/AreaEdit';
import EmployeeTypeList from './employee/employeetype/EmployeeTypeList';
import EmployeeTypeAdd from './employee/employeetype/EmployeeTypeAdd';
import EmployeeTypeEdit from './employee/employeetype/EmployeeTypeEdit';
import EmployeeList from './employee/employee/EmployeeList';
import EmployeeAdd from './employee/employee/EmployeeAdd';
import EmployeeEdit from './employee/employee/EmployeeEdit';
import EmployeeBrandList from './employee/employeebrand/EmployeeBrandList';
import EmployeeBrandAdd from './employee/employeebrand/EmployeeBrandAdd';
import EmployeeBrandEdit from './employee/employeebrand/EmployeeBrandEdit';
import EmployeeBusinessList from './employee/employeebusiness/EmployeeBusinessList';
import EmployeeBusinessAdd from './employee/employeebusiness/EmployeeBusinessAdd';
import EmployeeBusinessEdit from './employee/employeebusiness/EmployeeBusinessEdit';
import StateList from './geolocations/state/StateList';
import StateAdd from './geolocations/state/StateAdd';
import StateEdit from './geolocations/state/StateEdit';
import CityList from './geolocations/city/CityList';
import CityAdd from './geolocations/city/CityAdd';
import CityEdit from './geolocations/city/CityEdit';
import DistrictList from './geolocations/district/DistrictList'; // assuming it exists
import DistrictAdd from './geolocations/district/DistrictAdd';
import DistrictEdit from './geolocations/district/DistrictEdit';

import ContraPersonList from './contra/contraperson/ContraPersonList';
import ContraPersonAdd from './contra/contraperson/ContraPersonAdd';
import ContraPersonEdit from './contra/contraperson/ContraPersonEdit';

import BankList from './bank/bank/BankList';
import BankAdd from './bank/bank/BankAdd';
import BankEdit from './bank/bank/BankEdit';
import PaymentModeList from './bank/paymentmode/PaymentModeList';
import PaymentModeAdd from './bank/paymentmode/PaymentModeAdd';
import PaymentModeEdit from './bank/paymentmode/PaymentModeEdit';
import AccountDetailsList from './bank/accountdetails/AccountDetailsList';
import AccountDetailsAdd from './bank/accountdetails/AccountDetailsAdd';
import AccountDetailsEdit from './bank/accountdetails/AccountDetailsEdit';
import ChequeBookList from './bank/chequebook/ChequeBookList';
import ChequeBookAdd from './bank/chequebook/ChequeBookAdd';
import ChequeBookEdit from './bank/chequebook/ChequeBookEdit';
import AccountsCategoryList from './bank/accountscategory/AccountsCategoryList';
import AccountsCategoryAdd from './bank/accountscategory/AccountsCategoryAdd';
import AccountsCategoryEdit from './bank/accountscategory/AccountsCategoryEdit';
import AccountsHeadList from './bank/accountshead/AccountsHeadList';
import AccountsHeadAdd from './bank/accountshead/AccountsHeadAdd';
import AccountsHeadEdit from './bank/accountshead/AccountsHeadEdit';
import BudgetDetailsList from './bank/budgetdetails/BudgetDetailsList';
import BudgetDetailsAdd from './bank/budgetdetails/BudgetDetailsAdd';
import BudgetDetailsEdit from './bank/budgetdetails/BudgetDetailsEdit';

import CustomerCategoryList from './customer/customercategory/CustomerCategoryList';
import CustomerCategoryAdd from './customer/customercategory/CustomerCategoryAdd';
import CustomerCategoryEdit from './customer/customercategory/CustomerCategoryEdit';

import CustomerList from './customer/customer/CustomerList';
import CustomerAdd from './customer/customer/CustomerAdd';
import CustomerEdit from './customer/customer/CustomerEdit';

import CustomerSubList from './customer/customersubcategory/CustomerSubList';
import CustomerSubAdd from './customer/customersubcategory/CustomerSubAdd';
import CustomerSubEdit from './customer/customersubcategory/CustomerSubEdit';

import CustomerGroupList from './customer/customergroup/CustomerGroupList';
import CustomerGroupAdd from './customer/customergroup/CustomerGroupAdd';
import CustomerGroupEdit from './customer/customergroup/CustomerGroupEdit';

import CustomerGradingList from './customer/customergrading/CustomerGradingList';
import CustomerGradingAdd from './customer/customergrading/CustomerGradingAdd';
import CustomerGradingEdit from './customer/customergrading/CustomerGradingEdit';

import BrandList from './items/brand/BrandList';
import BrandAdd from './items/brand/BrandAdd';
import BrandEdit from './items/brand/BrandEdit';

import ProductGroupList from './items/productgroup/ProductGroupList';
import ProductGroupAdd from './items/productgroup/ProductGroupAdd';
import ProductGroupEdit from './items/productgroup/ProductGroupEdit';

import ProductCategoryList from './items/productcategory/ProductCategoryList';
import ProductCategoryAdd from './items/productcategory/ProductCategoryAdd';
import ProductCategoryEdit from './items/productcategory/ProductCategoryEdit';

import ProductSubList from './items/productsubcategory/ProductSubList';
import ProductSubAdd from './items/productsubcategory/ProductSubAdd';
import ProductSubEdit from './items/productsubcategory/ProductSubEdit';

import ProductModelList from './items/productmodel/ProductModelList';
import ProductModelAdd from './items/productmodel/ProductModelAdd';
import ProductModelEdit from './items/productmodel/ProductModelEdit';

import ProductList from './items/product/ProductList';
import ProductAdd from './items/product/ProductAdd';
import ProductEdit from './items/product/ProductEdit';

import StockLocationList from './items/stocklocation/StockLocationList';
import StockLocationAdd from './items/stocklocation/StockLocationAdd';
import StockLocationEdit from './items/stocklocation/StockLocationEdit';

import InspectionQuestionsList from './items/inspectionquestions/InspectionQuestionsList';
import InspectionQuestionsAdd from './items/inspectionquestions/InspectionQuestionsAdd';
import InspectionQuestionsEdit from './items/inspectionquestions/InspectionQuestionsEdit';

import ProductInspectionList from './items/productinspection/ProductInspectionList';
import ProductInspectionAdd from './items/productinspection/ProductInspectionAdd';
import ProductInspectionEdit from './items/productinspection/ProductInspectionEdit';

import VendorCategoryList from './vendor/vendorcategory/VendorCategoryList';
import VendorCategoryAdd from './vendor/vendorcategory/VendorCategoryAdd';
import VendorCategoryEdit from './vendor/vendorcategory/VendorCategoryEdit';

import VendorList from './vendor/vendor/VendorList';
import VendorAdd from './vendor/vendor/VendorAdd';
import VendorEdit from './vendor/vendor/VendorEdit';
import VendorMappingList from './vendor/vendorproduct/VendorMappingList';
import VendorMappingAdd from './vendor/vendorproduct/VendorMappingAdd';
import VendorMappingEdit from './vendor/vendorproduct/VendorMappingEdit';

import VendorSubList from './vendor/vendorsubcategory/VendorSubList';
import VendorSubAdd from './vendor/vendorsubcategory/VendorSubAdd';
import VendorSubEdit from './vendor/vendorsubcategory/VendorSubEdit';

import VendorGroupList from './vendor/vendorgroup/VendorGroupList';
import VendorGroupAdd from './vendor/vendorgroup/VendorGroupAdd';
import VendorGroupEdit from './vendor/vendorgroup/VendorGroupEdit';

import UnitList from './items/unit/UnitList';
import UnitAdd from './items/unit/UnitAdd';
import UnitEdit from './items/unit/UnitEdit';

import FeedbackParameterList from './feedback/feedbackparameter/FeedbackParameterList';
import FeedbackParameterAdd from './feedback/feedbackparameter/FeedbackParameterAdd';
import FeedbackParameterEdit from './feedback/feedbackparameter/FeedbackParameterEdit';

import SmsList from './reminder/sms/SmsList';
import SmsAdd from './reminder/sms/SmsAdd';
import SmsEdit from './reminder/sms/SmsEdit';

import EmailList from './reminder/email/EmailList';
import EmailAdd from './reminder/email/EmailAdd';
import EmailEdit from './reminder/email/EmailEdit';

import BulkSmsList from './bulksms/bulksms/BulkSmsList';
import BulkSmsAdd from './bulksms/bulksms/BulkSmsAdd';
import BulkSmsEdit from './bulksms/bulksms/BulkSmsEdit';

import TransporterModeList from './transporter/transportermode/TransporterModeList';
import TransporterModeAdd from './transporter/transportermode/TransporterModeAdd';
import TransporterModeEdit from './transporter/transportermode/TransporterModeEdit';
import TransporterDetailsList from './transporter/transporterdetails/TransporterDetailsList';
import TransporterDetailsAdd from './transporter/transporterdetails/TransporterDetailsAdd';
import TransporterDetailsEdit from './transporter/transporterdetails/TransporterDetailsEdit';

export default function PowerMasterRoutes() {
    return (
        <Routes>
            <Route path="company" element={
                <RequirePermission permission="Power Master.General Master - Company.View">
                    <CompanyList />
                </RequirePermission>
            } />
            <Route path="company/add" element={
                <RequirePermission permission="Power Master.General Master - Company.Add">
                    <CompanyAdd />
                </RequirePermission>
            } />
            <Route path="company/edit/:id" element={
                <RequirePermission permission="Power Master.General Master - Company.Edit">
                    <CompanyEdit />
                </RequirePermission>
            } />
            <Route path="branch" element={
                <RequirePermission permission="Power Master.General Master - Branch.View">
                    <BranchList />
                </RequirePermission>
            } />
            <Route path="branch/add" element={
                <RequirePermission permission="Power Master.General Master - Branch.Add">
                    <BranchAdd />
                </RequirePermission>
            } />
            <Route path="branch/edit/:id" element={
                <RequirePermission permission="Power Master.General Master - Branch.Edit">
                    <BranchEdit />
                </RequirePermission>
            } />
            <Route path="tax-master" element={
                <RequirePermission permission="Power Master.General Master - Tax Master.View">
                    <TaxMasterList />
                </RequirePermission>
            } />
            <Route path="tax-master/add" element={
                <RequirePermission permission="Power Master.General Master - Tax Master.Add">
                    <TaxMasterAdd />
                </RequirePermission>
            } />
            <Route path="tax-master/edit/:id" element={
                <RequirePermission permission="Power Master.General Master - Tax Master.Edit">
                    <TaxMasterEdit />
                </RequirePermission>
            } />
            <Route path="project" element={
                <RequirePermission permission="Power Master.General Master - Project.View">
                    <ProjectList />
                </RequirePermission>
            } />
            <Route path="project/add" element={
                <RequirePermission permission="Power Master.General Master - Project.Add">
                    <ProjectAdd />
                </RequirePermission>
            } />
            <Route path="project/edit/:id" element={
                <RequirePermission permission="Power Master.General Master - Project.Edit">
                    <ProjectEdit />
                </RequirePermission>
            } />
            <Route path="enquiry-source" element={
                <RequirePermission permission="Power Master.Enquiry Master - Enquiry Source.View">
                    <EnquirySoruceList />
                </RequirePermission>
            } />
            <Route path="enquiry-source/add" element={
                <RequirePermission permission="Power Master.Enquiry Master - Enquiry Source.Add">
                    <EnquirySoruceAdd />
                </RequirePermission>
            } />
            <Route path="enquiry-source/edit/:id" element={
                <RequirePermission permission="Power Master.Enquiry Master - Enquiry Source.Edit">
                    <EnquirySoruceEdit />
                </RequirePermission>
            } />
            <Route path="pf-notes" element={
                <RequirePermission permission="Power Master.Enquiry Master - P&F Notes.View">
                    <PandFNotesList />
                </RequirePermission>
            } />
            <Route path="pf-notes/add" element={
                <RequirePermission permission="Power Master.Enquiry Master - P&F Notes.Add">
                    <PandFNotesAdd />
                </RequirePermission>
            } />
            <Route path="pf-notes/edit/:id" element={
                <RequirePermission permission="Power Master.Enquiry Master - P&F Notes.Edit">
                    <PandFNotesEdit />
                </RequirePermission>
            } />
            <Route path="tax-notes" element={
                <RequirePermission permission="Power Master.Enquiry Master - Tax Notes.View">
                    <TaxNotesList />
                </RequirePermission>
            } />
            <Route path="tax-notes/add" element={
                <RequirePermission permission="Power Master.Enquiry Master - Tax Notes.Add">
                    <TaxNotesAdd />
                </RequirePermission>
            } />
            <Route path="tax-notes/edit/:id" element={
                <RequirePermission permission="Power Master.Enquiry Master - Tax Notes.Edit">
                    <TaxNotesEdit />
                </RequirePermission>
            } />
            <Route path="payment-notes" element={
                <RequirePermission permission="Power Master.Enquiry Master - Payment Notes.View">
                    <PaymentNotesList />
                </RequirePermission>
            } />
            <Route path="payment-notes/add" element={
                <RequirePermission permission="Power Master.Enquiry Master - Payment Notes.Add">
                    <PaymentNotesAdd />
                </RequirePermission>
            } />
            <Route path="payment-notes/edit/:id" element={
                <RequirePermission permission="Power Master.Enquiry Master - Payment Notes.Edit">
                    <PaymentNotesEdit />
                </RequirePermission>
            } />
            <Route path="delivery-notes" element={
                <RequirePermission permission="Power Master.Enquiry Master - Delivery Notes.View">
                    <DeliveryNotesList />
                </RequirePermission>
            } />
            <Route path="delivery-notes/add" element={
                <RequirePermission permission="Power Master.Enquiry Master - Delivery Notes.Add">
                    <DeliveryNotesAdd />
                </RequirePermission>
            } />
            <Route path="delivery-notes/edit/:id" element={
                <RequirePermission permission="Power Master.Enquiry Master - Delivery Notes.Edit">
                    <DeliveryNotesEdit />
                </RequirePermission>
            } />
            <Route path="warranty-notes" element={
                <RequirePermission permission="Power Master.Enquiry Master - Warranty Notes.View">
                    <WarrantyNotesList />
                </RequirePermission>
            } />
            <Route path="warranty-notes/add" element={
                <RequirePermission permission="Power Master.Enquiry Master - Warranty Notes.Add">
                    <WarrantyNotesAdd />
                </RequirePermission>
            } />
            <Route path="warranty-notes/edit/:id" element={
                <RequirePermission permission="Power Master.Enquiry Master - Warranty Notes.Edit">
                    <WarrantyNotesEdit />
                </RequirePermission>
            } />
            <Route path="fright-notes" element={
                <RequirePermission permission="Power Master.Enquiry Master - Fright Notes.View">
                    <FrightNotesList />
                </RequirePermission>
            } />
            <Route path="fright-notes/add" element={
                <RequirePermission permission="Power Master.Enquiry Master - Fright Notes.Add">
                    <FrightNotesAdd />
                </RequirePermission>
            } />
            <Route path="fright-notes/edit/:id" element={
                <RequirePermission permission="Power Master.Enquiry Master - Fright Notes.Edit">
                    <FrightNotesEdit />
                </RequirePermission>
            } />

            <Route path="enquiryconfig/enquiryeditconfig" element={
                <RequirePermission permission="Power Master.Enquiry Master.View">
                    <EnquiryEditList />
                </RequirePermission>
            } />
            <Route path="enquiryconfig/enquiryeditconfig/add" element={
                <RequirePermission permission="Power Master.Enquiry Master.Add">
                    <EnquiryEditAdd />
                </RequirePermission>
            } />
            <Route path="enquiryconfig/enquiryeditconfig/edit/:id" element={
                <RequirePermission permission="Power Master.Enquiry Master.Edit">
                    <EnquiryEditEdit />
                </RequirePermission>
            } />

            <Route path="hr/hr-category" element={
                <RequirePermission permission="Power Master.HR Master - HR Category.View">
                    <HrCategoryList />
                </RequirePermission>
            } />
            <Route path="hr/hr-category/add" element={
                <RequirePermission permission="Power Master.HR Master - HR Category.Add">
                    <HrCategoryAdd />
                </RequirePermission>
            } />
            <Route path="hr/hr-category/edit/:id" element={
                <RequirePermission permission="Power Master.HR Master - HR Category.Edit">
                    <HrCategoryEdit />
                </RequirePermission>
            } />
            <Route path="hr/designation" element={
                <RequirePermission permission="Power Master.HR Master - Designation.View">
                    <DesignationList />
                </RequirePermission>
            } />
            <Route path="hr/designation/add" element={
                <RequirePermission permission="Power Master.HR Master - Designation.Add">
                    <DesignationAdd />
                </RequirePermission>
            } />
            <Route path="hr/designation/edit/:id" element={
                <RequirePermission permission="Power Master.HR Master - Designation.Edit">
                    <DesignationEdit />
                </RequirePermission>
            } />
            <Route path="hr/department" element={
                <RequirePermission permission="Power Master.HR Master - Department.View">
                    <DepartmentList />
                </RequirePermission>
            } />
            <Route path="hr/department/add" element={
                <RequirePermission permission="Power Master.HR Master - Department.Add">
                    <DepartmentAdd />
                </RequirePermission>
            } />
            <Route path="hr/department/edit/:id" element={
                <RequirePermission permission="Power Master.HR Master - Department.Edit">
                    <DepartmentEdit />
                </RequirePermission>
            } />

            <Route path="hr/marketing-person" element={
                <RequirePermission permission="Power Master.HR Master.View">
                    <MarketingPersonList />
                </RequirePermission>
            } />
            <Route path="hr/marketing-person/add" element={
                <RequirePermission permission="Power Master.HR Master.Add">
                    <MarketingPersonAdd />
                </RequirePermission>
            } />
            <Route path="hr/marketing-person/edit/:id" element={
                <RequirePermission permission="Power Master.HR Master.Edit">
                    <MarketingPersonEdit />
                </RequirePermission>
            } />

            <Route path="hr/area-marketing-person" element={
                <RequirePermission permission="Power Master.HR Master.View">
                    <AreaMarketingList />
                </RequirePermission>
            } />
            <Route path="hr/area-marketing-person/add" element={
                <RequirePermission permission="Power Master.HR Master.Add">
                    <AreaMarketingAdd />
                </RequirePermission>
            } />
            <Route path="hr/area-marketing-person/edit/:id" element={
                <RequirePermission permission="Power Master.HR Master.Edit">
                    <AreaMarketingEdit />
                </RequirePermission>
            } />

            <Route path="hr/labour-charges" element={
                <RequirePermission permission="Power Master.HR Master.View">
                    <LabourChargesList />
                </RequirePermission>
            } />
            <Route path="hr/labour-charges/add" element={
                <RequirePermission permission="Power Master.HR Master.Add">
                    <LabourChargesAdd />
                </RequirePermission>
            } />
            <Route path="hr/labour-charges/edit/:id" element={
                <RequirePermission permission="Power Master.HR Master.Edit">
                    <LabourChargesEdit />
                </RequirePermission>
            } />
            <Route path="geolocations/country" element={
                <RequirePermission permission="Power Master.Geo Locations - Country.View">
                    <CountyList />
                </RequirePermission>
            } />
            <Route path="geolocations/country/add" element={
                <RequirePermission permission="Power Master.Geo Locations - Country.Add">
                    <CountyAdd />
                </RequirePermission>
            } />
            <Route path="geolocations/country/edit/:id" element={
                <RequirePermission permission="Power Master.Geo Locations - Country.Edit">
                    <CountyEdit />
                </RequirePermission>
            } />
            <Route path="geolocations/area" element={
                <RequirePermission permission="Power Master.Geo Locations.View">
                    <AreaList />
                </RequirePermission>
            } />
            <Route path="geolocations/area/add" element={
                <RequirePermission permission="Power Master.Geo Locations.Add">
                    <AreaAdd />
                </RequirePermission>
            } />
            <Route path="geolocations/area/edit/:id" element={
                <RequirePermission permission="Power Master.Geo Locations.Edit">
                    <AreaEdit />
                </RequirePermission>
            } />
            <Route path="geolocations/state" element={
                <RequirePermission permission="Power Master.Geo Locations - State.View">
                    <StateList />
                </RequirePermission>
            } />
            <Route path="geolocations/state/add" element={
                <RequirePermission permission="Power Master.Geo Locations - State.Add">
                    <StateAdd />
                </RequirePermission>
            } />
            <Route path="geolocations/state/edit/:id" element={
                <RequirePermission permission="Power Master.Geo Locations - State.Edit">
                    <StateEdit />
                </RequirePermission>
            } />
            <Route path="geolocations/city" element={
                <RequirePermission permission="Power Master.Geo Locations - City.View">
                    <CityList />
                </RequirePermission>
            } />
            <Route path="geolocations/city/add" element={
                <RequirePermission permission="Power Master.Geo Locations - City.Add">
                    <CityAdd />
                </RequirePermission>
            } />
            <Route path="geolocations/city/edit/:id" element={
                <RequirePermission permission="Power Master.Geo Locations - City.Edit">
                    <CityEdit />
                </RequirePermission>
            } />
            <Route path="geolocations/district" element={
                <RequirePermission permission="Power Master.Geo Locations - City.View">
                    <DistrictList />
                </RequirePermission>
            } />
            <Route path="geolocations/district/add" element={
                <RequirePermission permission="Power Master.Geo Locations - City.Add">
                    <DistrictAdd />
                </RequirePermission>
            } />
            <Route path="geolocations/district/edit/:id" element={
                <RequirePermission permission="Power Master.Geo Locations - City.Edit">
                    <DistrictEdit />
                </RequirePermission>
            } />
            <Route path="employee/employee-type" element={
                <RequirePermission permission="Power Master.Employee - Employee Type.View">
                    <EmployeeTypeList />
                </RequirePermission>
            } />
            <Route path="employee/employee-type/add" element={
                <RequirePermission permission="Power Master.Employee - Employee Type.Add">
                    <EmployeeTypeAdd />
                </RequirePermission>
            } />
            <Route path="employee/employee-type/edit/:id" element={
                <RequirePermission permission="Power Master.Employee - Employee Type.Edit">
                    <EmployeeTypeEdit />
                </RequirePermission>
            } />
            <Route path="employee/employee" element={
                <RequirePermission permission="Power Master.Employee - Employee.View">
                    <EmployeeList />
                </RequirePermission>
            } />
            <Route path="employee/employee/add" element={
                <RequirePermission permission="Power Master.Employee - Employee.Add">
                    <EmployeeAdd />
                </RequirePermission>
            } />
            <Route path="employee/employee/edit/:id" element={
                <RequirePermission permission="Power Master.Employee - Employee.Edit">
                    <EmployeeEdit />
                </RequirePermission>
            } />
            <Route path="employee/brand-mapping" element={
                <RequirePermission permission="Power Master.Employee - Employee.View">
                    <EmployeeBrandList />
                </RequirePermission>
            } />
            <Route path="employee/brand-mapping/add" element={
                <RequirePermission permission="Power Master.Employee - Employee.Add">
                    <EmployeeBrandAdd />
                </RequirePermission>
            } />
            <Route path="employee/brand-mapping/edit/:id" element={
                <RequirePermission permission="Power Master.Employee - Employee.Edit">
                    <EmployeeBrandEdit />
                </RequirePermission>
            } />
            <Route path="employee/business-vertical-mapping" element={
                <RequirePermission permission="Power Master.Employee - Employee.View">
                    <EmployeeBusinessList />
                </RequirePermission>
            } />
            <Route path="employee/business-vertical-mapping/add" element={
                <RequirePermission permission="Power Master.Employee - Employee.Add">
                    <EmployeeBusinessAdd />
                </RequirePermission>
            } />
            <Route path="employee/business-vertical-mapping/edit/:id" element={
                <RequirePermission permission="Power Master.Employee - Employee.Edit">
                    <EmployeeBusinessEdit />
                </RequirePermission>
            } />

            <Route path="contra/contra-person" element={
                <RequirePermission permission="Power Master.Contra - Contra Person.View">
                    <ContraPersonList />
                </RequirePermission>
            } />
            <Route path="contra/contra-person/add" element={
                <RequirePermission permission="Power Master.Contra - Contra Person.Add">
                    <ContraPersonAdd />
                </RequirePermission>
            } />
            <Route path="contra/contra-person/edit/:id" element={
                <RequirePermission permission="Power Master.Contra - Contra Person.Edit">
                    <ContraPersonEdit />
                </RequirePermission>
            } />

            <Route path="bank/bank" element={
                <RequirePermission permission="Power Master.Bank - Bank.View">
                    <BankList />
                </RequirePermission>
            } />
            <Route path="bank/bank/add" element={
                <RequirePermission permission="Power Master.Bank - Bank.Add">
                    <BankAdd />
                </RequirePermission>
            } />
            <Route path="bank/bank/edit/:id" element={
                <RequirePermission permission="Power Master.Bank - Bank.Edit">
                    <BankEdit />
                </RequirePermission>
            } />
            <Route path="bank/payment-mode" element={
                <RequirePermission permission="Power Master.Bank - Payment Mode.View">
                    <PaymentModeList />
                </RequirePermission>
            } />
            <Route path="bank/payment-mode/add" element={
                <RequirePermission permission="Power Master.Bank - Payment Mode.Add">
                    <PaymentModeAdd />
                </RequirePermission>
            } />
            <Route path="bank/payment-mode/edit/:id" element={
                <RequirePermission permission="Power Master.Bank - Payment Mode.Edit">
                    <PaymentModeEdit />
                </RequirePermission>
            } />
            <Route path="bank/account-details" element={
                <RequirePermission permission="Power Master.Bank - Account Details.View">
                    <AccountDetailsList />
                </RequirePermission>
            } />
            <Route path="bank/account-details/add" element={
                <RequirePermission permission="Power Master.Bank - Account Details.Add">
                    <AccountDetailsAdd />
                </RequirePermission>
            } />
            <Route path="bank/account-details/edit/:id" element={
                <RequirePermission permission="Power Master.Bank - Account Details.Edit">
                    <AccountDetailsEdit />
                </RequirePermission>
            } />
            <Route path="bank/cheque-book" element={
                <RequirePermission permission="Power Master.Bank - Cheque Book.View">
                    <ChequeBookList />
                </RequirePermission>
            } />
            <Route path="bank/cheque-book/add" element={
                <RequirePermission permission="Power Master.Bank - Cheque Book.Add">
                    <ChequeBookAdd />
                </RequirePermission>
            } />
            <Route path="bank/cheque-book/edit/:id" element={
                <RequirePermission permission="Power Master.Bank - Cheque Book.Edit">
                    <ChequeBookEdit />
                </RequirePermission>
            } />
            <Route path="bank/accounts-category" element={
                <RequirePermission permission="Power Master.Bank - Accounts Category.View">
                    <AccountsCategoryList />
                </RequirePermission>
            } />
            <Route path="bank/accounts-category/add" element={
                <RequirePermission permission="Power Master.Bank - Accounts Category.Add">
                    <AccountsCategoryAdd />
                </RequirePermission>
            } />
            <Route path="bank/accounts-category/edit/:id" element={
                <RequirePermission permission="Power Master.Bank - Accounts Category.Edit">
                    <AccountsCategoryEdit />
                </RequirePermission>
            } />
            <Route path="bank/accounts-head" element={
                <RequirePermission permission="Power Master.Bank - Accounts Head.View">
                    <AccountsHeadList />
                </RequirePermission>
            } />
            <Route path="bank/accounts-head/add" element={
                <RequirePermission permission="Power Master.Bank - Accounts Head.Add">
                    <AccountsHeadAdd />
                </RequirePermission>
            } />
            <Route path="bank/accounts-head/edit/:id" element={
                <RequirePermission permission="Power Master.Bank - Accounts Head.Edit">
                    <AccountsHeadEdit />
                </RequirePermission>
            } />
            <Route path="bank/budget-details" element={
                <RequirePermission permission="Power Master.Bank.View">
                    <BudgetDetailsList />
                </RequirePermission>
            } />
            <Route path="bank/budget-details/add" element={
                <RequirePermission permission="Power Master.Bank.Add">
                    <BudgetDetailsAdd />
                </RequirePermission>
            } />
            <Route path="bank/budget-details/edit/:id" element={
                <RequirePermission permission="Power Master.Bank.Edit">
                    <BudgetDetailsEdit />
                </RequirePermission>
            } />

            <Route path="customer/customer-category" element={
                <RequirePermission permission="Power Master.Customer - Customer Category.View">
                    <CustomerCategoryList />
                </RequirePermission>
            } />
            <Route path="customer/customer-category/add" element={
                <RequirePermission permission="Power Master.Customer - Customer Category.Add">
                    <CustomerCategoryAdd />
                </RequirePermission>
            } />
            <Route path="customer/customer-category/edit/:id" element={
                <RequirePermission permission="Power Master.Customer - Customer Category.Edit">
                    <CustomerCategoryEdit />
                </RequirePermission>
            } />

            <Route path="customer/customer" element={
                <RequirePermission permission="Power Master.Customer - Customer.View">
                    <CustomerList />
                </RequirePermission>
            } />
            <Route path="customer/customer/add" element={
                <RequirePermission permission="Power Master.Customer - Customer.Add">
                    <CustomerAdd />
                </RequirePermission>
            } />
            <Route path="customer/customer/edit/:id" element={
                <RequirePermission permission="Power Master.Customer - Customer.Edit">
                    <CustomerEdit />
                </RequirePermission>
            } />

            <Route path="customer/customer-sub-category" element={
                <RequirePermission permission="Power Master.Customer - Customer Sub Category.View">
                    <CustomerSubList />
                </RequirePermission>
            } />
            <Route path="customer/customer-sub-category/add" element={
                <RequirePermission permission="Power Master.Customer - Customer Sub Category.Add">
                    <CustomerSubAdd />
                </RequirePermission>
            } />
            <Route path="customer/customer-sub-category/edit/:id" element={
                <RequirePermission permission="Power Master.Customer - Customer Sub Category.Edit">
                    <CustomerSubEdit />
                </RequirePermission>
            } />

            <Route path="customer/customer-group" element={
                <RequirePermission permission="Power Master.Customer - Customer Group.View">
                    <CustomerGroupList />
                </RequirePermission>
            } />
            <Route path="customer/customer-group/add" element={
                <RequirePermission permission="Power Master.Customer - Customer Group.Add">
                    <CustomerGroupAdd />
                </RequirePermission>
            } />
            <Route path="customer/customer-group/edit/:id" element={
                <RequirePermission permission="Power Master.Customer - Customer Group.Edit">
                    <CustomerGroupEdit />
                </RequirePermission>
            } />

            <Route path="customer/customer-grading" element={
                <RequirePermission permission="Power Master.Customer - Customer Grading.View">
                    <CustomerGradingList />
                </RequirePermission>
            } />
            <Route path="customer/customer-grading/add" element={
                <RequirePermission permission="Power Master.Customer - Customer Grading.Add">
                    <CustomerGradingAdd />
                </RequirePermission>
            } />
            <Route path="customer/customer-grading/edit/:id" element={
                <RequirePermission permission="Power Master.Customer - Customer Grading.Edit">
                    <CustomerGradingEdit />
                </RequirePermission>
            } />

            <Route path="items/brand" element={
                <RequirePermission permission="Power Master.Items - Brand.View">
                    <BrandList />
                </RequirePermission>
            } />
            <Route path="items/brand/add" element={
                <RequirePermission permission="Power Master.Items - Brand.Add">
                    <BrandAdd />
                </RequirePermission>
            } />
            <Route path="items/brand/edit/:id" element={
                <RequirePermission permission="Power Master.Items - Brand.Edit">
                    <BrandEdit />
                </RequirePermission>
            } />

            <Route path="items/product-group" element={
                <RequirePermission permission="Power Master.Items - Product Group.View">
                    <ProductGroupList />
                </RequirePermission>
            } />
            <Route path="items/product-group/add" element={
                <RequirePermission permission="Power Master.Items - Product Group.Add">
                    <ProductGroupAdd />
                </RequirePermission>
            } />
            <Route path="items/product-group/edit/:id" element={
                <RequirePermission permission="Power Master.Items - Product Group.Edit">
                    <ProductGroupEdit />
                </RequirePermission>
            } />

            <Route path="items/product-category" element={
                <RequirePermission permission="Power Master.Items - Product Category.View">
                    <ProductCategoryList />
                </RequirePermission>
            } />
            <Route path="items/product-category/add" element={
                <RequirePermission permission="Power Master.Items - Product Category.Add">
                    <ProductCategoryAdd />
                </RequirePermission>
            } />
            <Route path="items/product-category/edit/:id" element={
                <RequirePermission permission="Power Master.Items - Product Category.Edit">
                    <ProductCategoryEdit />
                </RequirePermission>
            } />

            <Route path="items/product-sub-category" element={
                <RequirePermission permission="Power Master.Items - Product Sub Category.View">
                    <ProductSubList />
                </RequirePermission>
            } />
            <Route path="items/product-sub-category/add" element={
                <RequirePermission permission="Power Master.Items - Product Sub Category.Add">
                    <ProductSubAdd />
                </RequirePermission>
            } />
            <Route path="items/product-sub-category/edit/:id" element={
                <RequirePermission permission="Power Master.Items - Product Sub Category.Edit">
                    <ProductSubEdit />
                </RequirePermission>
            } />

            <Route path="items/product-model" element={
                <RequirePermission permission="Power Master.Items - Product Model.View">
                    <ProductModelList />
                </RequirePermission>
            } />
            <Route path="items/product-model/add" element={
                <RequirePermission permission="Power Master.Items - Product Model.Add">
                    <ProductModelAdd />
                </RequirePermission>
            } />
            <Route path="items/product-model/edit/:id" element={
                <RequirePermission permission="Power Master.Items - Product Model.Edit">
                    <ProductModelEdit />
                </RequirePermission>
            } />

            <Route path="items/product" element={
                <RequirePermission permission="Power Master.Items - Product.View">
                    <ProductList />
                </RequirePermission>
            } />
            <Route path="items/product/add" element={
                <RequirePermission permission="Power Master.Items - Product.Add">
                    <ProductAdd />
                </RequirePermission>
            } />
            <Route path="items/product/edit/:id" element={
                <RequirePermission permission="Power Master.Items - Product.Edit">
                    <ProductEdit />
                </RequirePermission>
            } />

            <Route path="items/inspection-question" element={
                <RequirePermission permission="Power Master.Items.View">
                    <InspectionQuestionsList />
                </RequirePermission>
            } />
            <Route path="items/inspection-question/add" element={
                <RequirePermission permission="Power Master.Items.Add">
                    <InspectionQuestionsAdd />
                </RequirePermission>
            } />
            <Route path="items/inspection-question/edit/:id" element={
                <RequirePermission permission="Power Master.Items.Edit">
                    <InspectionQuestionsEdit />
                </RequirePermission>
            } />

            <Route path="items/product-inspection-mapping" element={
                <RequirePermission permission="Power Master.Items.View">
                    <ProductInspectionList />
                </RequirePermission>
            } />
            <Route path="items/product-inspection-mapping/add" element={
                <RequirePermission permission="Power Master.Items.Add">
                    <ProductInspectionAdd />
                </RequirePermission>
            } />
            <Route path="items/product-inspection-mapping/edit/:id" element={
                <RequirePermission permission="Power Master.Items.Edit">
                    <ProductInspectionEdit />
                </RequirePermission>
            } />

            <Route path="vendor/vendor" element={
                <RequirePermission permission="Power Master.Vendor - Vendor.View">
                    <VendorList />
                </RequirePermission>
            } />
            <Route path="vendor/vendor/add" element={
                <RequirePermission permission="Power Master.Vendor - Vendor.Add">
                    <VendorAdd />
                </RequirePermission>
            } />
            <Route path="vendor/vendor/edit/:id" element={
                <RequirePermission permission="Power Master.Vendor - Vendor.Edit">
                    <VendorEdit />
                </RequirePermission>
            } />

            <Route path="vendor/vendor-product-mapping" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Product Mapping.View">
                    <VendorMappingList />
                </RequirePermission>
            } />
            <Route path="vendor/vendor-product-mapping/add" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Product Mapping.Add">
                    <VendorMappingAdd />
                </RequirePermission>
            } />
            <Route path="vendor/vendor-product-mapping/edit/:id" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Product Mapping.Edit">
                    <VendorMappingEdit />
                </RequirePermission>
            } />

            <Route path="vendor/vendor-category" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Category.View">
                    <VendorCategoryList />
                </RequirePermission>
            } />
            <Route path="vendor/vendor-category/add" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Category.Add">
                    <VendorCategoryAdd />
                </RequirePermission>
            } />
            <Route path="vendor/vendor-category/edit/:id" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Category.Edit">
                    <VendorCategoryEdit />
                </RequirePermission>
            } />

            <Route path="vendor/vendor-sub-category" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Sub Category.View">
                    <VendorSubList />
                </RequirePermission>
            } />
            <Route path="vendor/vendor-sub-category/add" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Sub Category.Add">
                    <VendorSubAdd />
                </RequirePermission>
            } />
            <Route path="vendor/vendor-sub-category/edit/:id" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Sub Category.Edit">
                    <VendorSubEdit />
                </RequirePermission>
            } />

            <Route path="vendor/vendor-group" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Group.View">
                    <VendorGroupList />
                </RequirePermission>
            } />
            <Route path="vendor/vendor-group/add" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Group.Add">
                    <VendorGroupAdd />
                </RequirePermission>
            } />
            <Route path="vendor/vendor-group/edit/:id" element={
                <RequirePermission permission="Power Master.Vendor - Vendor Group.Edit">
                    <VendorGroupEdit />
                </RequirePermission>
            } />

            <Route path="items/stock-location" element={
                <RequirePermission permission="Power Master.Items.View">
                    <StockLocationList />
                </RequirePermission>
            } />
            <Route path="items/stock-location/add" element={
                <RequirePermission permission="Power Master.Items.Add">
                    <StockLocationAdd />
                </RequirePermission>
            } />
            <Route path="items/stock-location/edit/:id" element={
                <RequirePermission permission="Power Master.Items.Edit">
                    <StockLocationEdit />
                </RequirePermission>
            } />

            <Route path="items/unit" element={
                <RequirePermission permission="Power Master.Items - Unit.View">
                    <UnitList />
                </RequirePermission>
            } />
            <Route path="items/unit/add" element={
                <RequirePermission permission="Power Master.Items - Unit.Add">
                    <UnitAdd />
                </RequirePermission>
            } />
            <Route path="items/unit/edit/:id" element={
                <RequirePermission permission="Power Master.Items - Unit.Edit">
                    <UnitEdit />
                </RequirePermission>
            } />

            <Route path="feedback/feedback-parameter" element={
                <RequirePermission permission="Power Master.General Master.View">
                    <FeedbackParameterList />
                </RequirePermission>
            } />
            <Route path="feedback/feedback-parameter/add" element={
                <RequirePermission permission="Power Master.General Master.Add">
                    <FeedbackParameterAdd />
                </RequirePermission>
            } />
            <Route path="feedback/feedback-parameter/edit/:id" element={
                <RequirePermission permission="Power Master.General Master.Edit">
                    <FeedbackParameterEdit />
                </RequirePermission>
            } />

            <Route path="reminder/email" element={
                <RequirePermission permission="Power Master.General Master.View">
                    <EmailList />
                </RequirePermission>
            } />
            <Route path="reminder/email/add" element={
                <RequirePermission permission="Power Master.General Master.Add">
                    <EmailAdd />
                </RequirePermission>
            } />
            <Route path="reminder/email/edit/:id" element={
                <RequirePermission permission="Power Master.General Master.Edit">
                    <EmailEdit />
                </RequirePermission>
            } />

            <Route path="reminder/sms" element={
                <RequirePermission permission="Power Master.General Master.View">
                    <SmsList />
                </RequirePermission>
            } />
            <Route path="reminder/sms/add" element={
                <RequirePermission permission="Power Master.General Master.Add">
                    <SmsAdd />
                </RequirePermission>
            } />
            <Route path="reminder/sms/edit/:id" element={
                <RequirePermission permission="Power Master.General Master.Edit">
                    <SmsEdit />
                </RequirePermission>
            } />

            <Route path="bulksms/bulksms" element={
                <RequirePermission permission="Power Master.General Master.View">
                    <BulkSmsList />
                </RequirePermission>
            } />
            <Route path="bulksms/bulksms/add" element={
                <RequirePermission permission="Power Master.General Master.Add">
                    <BulkSmsAdd />
                </RequirePermission>
            } />
            <Route path="bulksms/bulksms/edit/:id" element={
                <RequirePermission permission="Power Master.General Master.Edit">
                    <BulkSmsEdit />
                </RequirePermission>
            } />

            <Route path="transporter/transporter-mode" element={
                <RequirePermission permission="Power Master.General Master.View">
                    <TransporterModeList />
                </RequirePermission>
            } />
            <Route path="transporter/transporter-mode/add" element={
                <RequirePermission permission="Power Master.General Master.Add">
                    <TransporterModeAdd />
                </RequirePermission>
            } />
            <Route path="transporter/transporter-mode/edit/:id" element={
                <RequirePermission permission="Power Master.General Master.Edit">
                    <TransporterModeEdit />
                </RequirePermission>
            } />

            <Route path="transporter/transporter-details" element={
                <RequirePermission permission="Power Master.General Master.View">
                    <TransporterDetailsList />
                </RequirePermission>
            } />
            <Route path="transporter/transporter-details/add" element={
                <RequirePermission permission="Power Master.General Master.Add">
                    <TransporterDetailsAdd />
                </RequirePermission>
            } />
            <Route path="transporter/transporter-details/edit/:id" element={
                <RequirePermission permission="Power Master.General Master.Edit">
                    <TransporterDetailsEdit />
                </RequirePermission>
            } />
        </Routes>
    );
}
// Force Vite HMR reload
