import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../../context/PermissionContext';
import {
    HouseIcon, AddressBookIcon, ChartBarIcon, QuestionIcon,
    TagIcon, ClockIcon, ArrowsLeftRightIcon, PackageIcon, BankIcon,
    MoneyIcon, CaretRightIcon,
    SquaresFourIcon, UserIcon, CurrencyDollarIcon, BriefcaseIcon, UsersIcon, TruckIcon,
    StackIcon, UserCircleIcon, FileTextIcon, BuildingsIcon, MapPinIcon, GlobeIcon,
    NoteIcon, StarIcon, BellIcon, EnvelopeIcon, ChatTextIcon, ChatCircleIcon,
    PercentIcon, FolderOpenIcon, ListIcon, GearSixIcon
} from '@phosphor-icons/react';

const ALL_ITEMS = [
    { to: '/', reqPerm: ['Dashboard.Overview.View', 'Dashboard.Analytics.View'], label: 'Dashboard', Icon: HouseIcon, exact: true },
    {
        to: '/sales-contact', reqPerm: 'Sales Contact.Sales Contact.View',
        label: 'Sales Contact',
        Icon: AddressBookIcon,
        exact: false,
        children: [
            { label: 'Sales Contact', Icon: AddressBookIcon, to: '/sales-contact', reqPerm: 'Sales Contact.Sales Contact.View', exact: true },
            { label: 'Order Lost Contact', Icon: AddressBookIcon, to: '/sales-contact/closed', reqPerm: 'Sales Contact.Closed Contacts.View' },
            { label: 'Converted Contact', Icon: AddressBookIcon, to: '/sales-contact/converted', reqPerm: 'Sales Contact.Converted Contact.View' },
            { label: 'Hold Contact', Icon: AddressBookIcon, to: '/sales-contact/hold', reqPerm: 'Sales Contact.Hold Contacts.View' },
        ],
    },
    {
        to: '/work-plan', reqPerm: 'Work Plan.Work Plan.View',
        label: 'Work Plan',
        Icon: AddressBookIcon,
        exact: false,
        children: [
            { label: 'Work Plan', Icon: AddressBookIcon, to: '/work-plan', reqPerm: 'Work Plan.Work Plan.View', exact: true },
            { label: 'Completed Plan', Icon: AddressBookIcon, to: '/work-plan/completed', reqPerm: 'Work Plan.Completed Plan.View' },
        ],
    },
    { to: '/reporting', reqPerm: 'Reporting.Reporting Details.View', label: 'Reporting', Icon: ChartBarIcon, exact: false },
    {
        to: '/enquiry', reqPerm: 'Enquiry.Enquiry.View',
        label: 'Enquiry',
        Icon: QuestionIcon,
        exact: false,
        children: [
            { label: 'Enquiry', Icon: QuestionIcon, to: '/enquiry', reqPerm: 'Enquiry.Enquiry.View', exact: true },
            { label: 'Cash Receipt', Icon: FileTextIcon, to: '/enquiry/cash-discount', reqPerm: 'Enquiry.Cash Discount - Pending List.View' },
        ],
    },
    {
        to: '/sales/followups', reqPerm: 'Sales.Followup.View',
        label: 'Sales',
        Icon: TagIcon,
        exact: false,
        children: [
            { label: 'Followup', Icon: ClockIcon, to: '/sales/followups', reqPerm: 'Sales.Followup.View', activePrefixes: ['/sales/site-visit'] },

            { label: 'Job Card', Icon: MapPinIcon, to: '/sales/job-card', reqPerm: 'Sales.Job Card.View', activePrefixes: ['/sales/erection'] },
            { label: 'Invoice', Icon: FileTextIcon, to: '/sales/invoice', reqPerm: 'Sales.Invoice.View', activePrefixes: ['/sales/complete-invoice'] },
            { label: 'Advanced Receipt', Icon: FileTextIcon, to: '/sales/advanced-receipt', reqPerm: 'Sales.Advanced Receipt.View' },
            { label: 'Further Receipt', Icon: FileTextIcon, to: '/sales/further-receipt', reqPerm: 'Sales.Further Receipt.View' },
            { label: 'Complete Sales', Icon: FileTextIcon, to: '/sales/complete-sales', reqPerm: 'Sales.Complete Sales.View' },
            { label: 'Unallotted Enquiry', Icon: FileTextIcon, to: '/sales/unallotted-enquiry', reqPerm: 'Sales.Unallotted Enquiry.View' },
            { label: 'Closed Enquiry', Icon: FileTextIcon, to: '/sales/closed-enquiry', reqPerm: 'Sales.Closed Enquiry.View' },
            // { label: 'Sales Return', Icon: FileTextIcon, to: '/sales/sales-return' },
        ],
    },
    {
        to: '/contra', reqPerm: 'Contra.Contra list.View',
        label: 'Contra',
        Icon: ArrowsLeftRightIcon,
        exact: false,
        children: [
            { label: 'Contra list', Icon: ArrowsLeftRightIcon, to: '/contra', reqPerm: 'Contra.Contra list.View', exact: true, activePrefixes: ['/contra/add', '/contra/edit'] },
            { label: 'Contra Receipt', Icon: FileTextIcon, to: '/contra/receipt', reqPerm: 'Contra.Contra Receipt.View', exact: true, activePrefixes: ['/contra/receipt/add', '/contra/receipt/edit'] }
        ],
    },
    {
        to: '/inventory',
        label: 'Inventory',
        Icon: PackageIcon,
        exact: false,
        children: [
            { label: 'Stock Details', Icon: StackIcon, to: '/inventory/stock-details', reqPerm: 'Inventory.Stock Details.View' },
            { label: 'Direct GRN', Icon: FileTextIcon, to: '/inventory/direct-grn', reqPerm: 'Inventory.Direct GRN.View' },
            { label: 'Purchase Order', Icon: FileTextIcon, to: '/inventory/purchase-order', reqPerm: 'Inventory.Purchase Order List.View', activePrefixes: ['/inventory/suggested-order'] },
            { label: 'GRN Inspection', Icon: FileTextIcon, to: '/inventory/grn-inspection', reqPerm: 'Inventory.GRN Inspection List.View', activePrefixes: ['/inventory/future-inspection'] },
            { label: 'Advanced Payments', Icon: CurrencyDollarIcon, to: '/inventory/advanced-payments', reqPerm: 'Inventory.Advanced Payment List.View' },
            { label: 'Further Receipt', Icon: ArrowsLeftRightIcon, to: '/inventory/further-receipt', reqPerm: 'Inventory.Further Receipt List.View' },
            // { label: 'Stock Transfer', Icon: ArrowsLeftRightIcon, to: '/inventory/stock-transfer' },
        ],
    },
    {
        to: '/bank-process/payment-voucher', reqPerm: 'Bank Process.Payment Voucher.View',
        label: 'Bank Process',
        Icon: BankIcon,
        exact: false,
        children: [
            // { label: 'Cheque Transaction', Icon: FileTextIcon, to: '/bank-process/cheque-transaction' },
            { label: 'Payment Voucher', Icon: FileTextIcon, to: '/bank-process/payment-voucher', reqPerm: 'Bank Process.Payment Voucher.View' },
            // { label: 'Reconciliation', Icon: FileTextIcon, to: '/bank-process/reconciliation' },
            // { label: 'Customer Opening Receipt', Icon: FileTextIcon, to: '/bank-process/customer-opening-receipt' },
            // { label: 'Debit Note', Icon: FileTextIcon, to: '/bank-process/debit-note' },
            { label: 'Daywise Report', Icon: FileTextIcon, to: '/bank-process/daywise-report', reqPerm: 'Bank Process.Daywise Report.View' },
            { label: 'Receipt', Icon: FileTextIcon, to: '/bank-process/receipt', reqPerm: 'Bank Process.Receipt.View' },
        ],
    },
    {
        to: '/power-master/company', reqPerm: 'Power Master.General Master - Company.View',
        label: 'Power Master',
        Icon: GearSixIcon,
        exact: false,
        children: [
            {
                label: 'General Master', Icon: SquaresFourIcon, to: '/power-master/company', reqPerm: 'Power Master.General Master - Company.View',
                children: [
                    { label: 'Company', Icon: BriefcaseIcon, to: '/power-master/company', reqPerm: 'Power Master.General Master - Company.View' },
                    { label: 'Branch', Icon: BuildingsIcon, to: '/power-master/branch', reqPerm: 'Power Master.General Master - Branch.View' },
                    { label: 'Tax Master', Icon: PercentIcon, to: '/power-master/tax-master', reqPerm: 'Power Master.General Master - Tax Master.View' },
                    { label: 'Project', Icon: FolderOpenIcon, to: '/power-master/project', reqPerm: 'Power Master.General Master - Project.View' },
                ],
            },
            {
                label: 'Enquiry Master', Icon: QuestionIcon, to: '/power-master/enquiry-source', reqPerm: 'Power Master.Enquiry Master - Enquiry Source.View',
                children: [
                    { label: 'Enquiry Source', Icon: FileTextIcon, to: '/power-master/enquiry-source', reqPerm: 'Power Master.Enquiry Master - Enquiry Source.View' },
                    { label: 'P&F Notes', Icon: NoteIcon, to: '/power-master/pf-notes', reqPerm: 'Power Master.Enquiry Master - P&F Notes.View' },
                    { label: 'Tax Notes', Icon: NoteIcon, to: '/power-master/tax-notes', reqPerm: 'Power Master.Enquiry Master - Tax Notes.View' },
                    { label: 'Payment Notes', Icon: NoteIcon, to: '/power-master/payment-notes', reqPerm: 'Power Master.Enquiry Master - Payment Notes.View' },
                    { label: 'Delivery Notes', Icon: NoteIcon, to: '/power-master/delivery-notes', reqPerm: 'Power Master.Enquiry Master - Delivery Notes.View' },
                    { label: 'Warranty Notes', Icon: NoteIcon, to: '/power-master/warranty-notes', reqPerm: 'Power Master.Enquiry Master - Warranty Notes.View' },
                    { label: 'Fright Notes', Icon: NoteIcon, to: '/power-master/fright-notes', reqPerm: 'Power Master.Enquiry Master - Fright Notes.View' },
                ],
            },
            // {
            //     label: 'Enquiry Config', Icon: SquaresFourIcon, to: '/power-master/enquiryconfig/enquiryeditconfig',
            //     children: [
            //         { label: 'Enquiry Edit Config', Icon: FileTextIcon, to: '/power-master/enquiryconfig/enquiryeditconfig' },
            //     ],
            // },
            {
                label: 'HR Master', Icon: UsersIcon, to: '/power-master/hr/hr-category', reqPerm: 'Power Master.HR Master - HR Category.View',
                children: [
                    { label: 'HR Category', Icon: StackIcon, to: '/power-master/hr/hr-category', reqPerm: 'Power Master.HR Master - HR Category.View' },
                    { label: 'Designation', Icon: UserCircleIcon, to: '/power-master/hr/designation', reqPerm: 'Power Master.HR Master - Designation.View' },
                    { label: 'Department', Icon: BriefcaseIcon, to: '/power-master/hr/department', reqPerm: 'Power Master.HR Master - Department.View' },
                    // { label: 'Marketing Person', Icon: UserCircleIcon, to: '/power-master/hr/marketing-person' },
                    // { label: 'Area Marketing Person', Icon: MapPinIcon, to: '/power-master/hr/area-marketing-person' },
                    // { label: 'Labour Charges', Icon: MoneyIcon, to: '/power-master/hr/labour-charges' },
                ],
            },
            {
                label: 'Geo Locations', Icon: GlobeIcon, to: '/power-master/geolocations/country', reqPerm: 'Power Master.Geo Locations - Country.View',
                children: [
                    { label: 'Country', Icon: GlobeIcon, to: '/power-master/geolocations/country', reqPerm: 'Power Master.Geo Locations - Country.View' },
                    { label: 'State', Icon: MapPinIcon, to: '/power-master/geolocations/state', reqPerm: 'Power Master.Geo Locations - State.View' },
                    // { label: 'District', Icon: MapPinIcon, to: '/power-master/geolocations/district' },
                    { label: 'City', Icon: MapPinIcon, to: '/power-master/geolocations/city', reqPerm: 'Power Master.Geo Locations - City.View' },
                    // { label: 'Area', Icon: MapPinIcon, to: '/power-master/geolocations/area' },
                ],
            },
            {
                label: 'Employee', Icon: UserCircleIcon, to: '/power-master/employee/employee', reqPerm: 'Power Master.Employee - Employee.View',
                children: [
                    { label: 'Employee Type', Icon: StackIcon, to: '/power-master/employee/employee-type', reqPerm: 'Power Master.Employee - Employee Type.View' },
                    { label: 'Employee', Icon: UserCircleIcon, to: '/power-master/employee/employee', reqPerm: 'Power Master.Employee - Employee.View' },
                    // { label: 'Brand Mapping', Icon: StackIcon, to: '/power-master/employee/brand-mapping' },
                    // { label: 'Business Vertical Mapping', Icon: BriefcaseIcon, to: '/power-master/employee/business-vertical-mapping' },
                ],
            },
            {
                label: 'Contra', Icon: ArrowsLeftRightIcon, to: '/power-master/contra/contra-person', reqPerm: 'Power Master.Contra - Contra Person.View',
                children: [
                    { label: 'Contra Person', Icon: UserCircleIcon, to: '/power-master/contra/contra-person', reqPerm: 'Power Master.Contra - Contra Person.View' },
                ],
            },
            {
                label: 'Bank', Icon: BankIcon, to: '/power-master/bank/bank', reqPerm: 'Power Master.Bank - Bank.View',
                children: [
                    { label: 'Bank', Icon: BankIcon, to: '/power-master/bank/bank', reqPerm: 'Power Master.Bank - Bank.View' },
                    { label: 'Payment Mode', Icon: CurrencyDollarIcon, to: '/power-master/bank/payment-mode', reqPerm: 'Power Master.Bank - Payment Mode.View' },
                    { label: 'Account Details', Icon: FileTextIcon, to: '/power-master/bank/account-details', reqPerm: 'Power Master.Bank - Account Details.View' },
                    // { label: 'Cheque Book', Icon: FileTextIcon, to: '/power-master/bank/cheque-book', reqPerm: 'Power Master.Bank - Cheque Book.View' },
                    { label: 'Accounts Category', Icon: StackIcon, to: '/power-master/bank/accounts-category', reqPerm: 'Power Master.Bank - Accounts Category.View' },
                    { label: 'Accounts Head', Icon: StackIcon, to: '/power-master/bank/accounts-head', reqPerm: 'Power Master.Bank - Accounts Head.View' },
                    // { label: 'Budget Details', Icon: MoneyIcon, to: '/power-master/bank/budget-details' },
                ],
            },
            {
                label: 'Customer', Icon: UserCircleIcon, to: '/power-master/customer/customer', reqPerm: 'Power Master.Customer - Customer.View',
                children: [
                    { label: 'Customer Category', Icon: StackIcon, to: '/power-master/customer/customer-category', reqPerm: 'Power Master.Customer - Customer Category.View' },
                    { label: 'Customer', Icon: UserCircleIcon, to: '/power-master/customer/customer', reqPerm: 'Power Master.Customer - Customer.View' },
                    { label: 'Customer Sub Category', Icon: StackIcon, to: '/power-master/customer/customer-sub-category', reqPerm: 'Power Master.Customer - Customer Sub Category.View' },
                    { label: 'Customer Group', Icon: UsersIcon, to: '/power-master/customer/customer-group', reqPerm: 'Power Master.Customer - Customer Group.View' },
                    { label: 'Customer Grading', Icon: StarIcon, to: '/power-master/customer/customer-grading', reqPerm: 'Power Master.Customer - Customer Grading.View' },
                ],
            },
            {
                label: 'Items', Icon: PackageIcon, to: '/power-master/items/product', reqPerm: 'Power Master.Items - Product.View',
                children: [
                    { label: 'Brand', Icon: StackIcon, to: '/power-master/items/brand', reqPerm: 'Power Master.Items - Brand.View' },
                    { label: 'Product Group', Icon: StackIcon, to: '/power-master/items/product-group', reqPerm: 'Power Master.Items - Product Group.View' },
                    { label: 'Product Category', Icon: StackIcon, to: '/power-master/items/product-category', reqPerm: 'Power Master.Items - Product Category.View' },
                    { label: 'Product Sub Category', Icon: StackIcon, to: '/power-master/items/product-sub-category', reqPerm: 'Power Master.Items - Product Sub Category.View' },
                    { label: 'Product Model', Icon: StackIcon, to: '/power-master/items/product-model', reqPerm: 'Power Master.Items - Product Model.View' },
                    { label: 'Product', Icon: PackageIcon, to: '/power-master/items/product', reqPerm: 'Power Master.Items - Product.View' },
                    // { label: 'Stock Location', Icon: MapPinIcon, to: '/power-master/items/stock-location', reqPerm: 'Power Master.Items.View' },
                    { label: 'Unit', Icon: StackIcon, to: '/power-master/items/unit', reqPerm: 'Power Master.Items - Unit.View' },
                    // { label: 'Inspection Question', Icon: QuestionIcon, to: '/power-master/items/inspection-question' },
                    // { label: 'Product Inspection Mapping', Icon: StackIcon, to: '/power-master/items/product-inspection-mapping' },

                ],
            },
            {
                label: 'Vendor', Icon: TruckIcon, to: '/power-master/vendor/vendor', reqPerm: 'Power Master.Vendor - Vendor.View',
                children: [
                    { label: 'Vendor', Icon: TruckIcon, to: '/power-master/vendor/vendor', reqPerm: 'Power Master.Vendor - Vendor.View' },
                    { label: 'Vendor Product Mapping', Icon: StackIcon, to: '/power-master/vendor/vendor-product-mapping', reqPerm: 'Power Master.Vendor - Vendor Product Mapping.View' },
                    { label: 'Vendor Category', Icon: StackIcon, to: '/power-master/vendor/vendor-category', reqPerm: 'Power Master.Vendor - Vendor Category.View' },
                    { label: 'Vendor Sub Category', Icon: StackIcon, to: '/power-master/vendor/vendor-sub-category', reqPerm: 'Power Master.Vendor - Vendor Sub Category.View' },
                    { label: 'Vendor Group', Icon: UsersIcon, to: '/power-master/vendor/vendor-group', reqPerm: 'Power Master.Vendor - Vendor Group.View' },
                ],
            },
            // {
            //     label: 'Feedback', Icon: ChatCircleIcon, to: '/power-master/feedback/feedback-parameter', reqPerm: 'Power Master.General Master.View',
            //     children: [
            //         { label: 'Feedback Parameter', Icon: StarIcon, to: '/power-master/feedback/feedback-parameter', reqPerm: 'Power Master.General Master.View' },
            //     ],
            // },
            // {
            //     label: 'Reminder', Icon: BellIcon, to: '/power-master/reminder/email', reqPerm: 'Power Master.General Master.View',
            //     children: [
            //         { label: 'Email', Icon: EnvelopeIcon, to: '/power-master/reminder/email', reqPerm: 'Power Master.General Master.View' },
            //         { label: 'SMS', Icon: ChatTextIcon, to: '/power-master/reminder/sms', reqPerm: 'Power Master.General Master.View' },
            //     ],
            // },
            // {
            //     label: 'Bulk SMS', Icon: ChatTextIcon, to: '/power-master/bulksms/bulksms', reqPerm: 'Power Master.General Master.View',
            //     children: [
            //         { label: 'Bulk SMS', Icon: ChatTextIcon, to: '/power-master/bulksms/bulksms', reqPerm: 'Power Master.General Master.View' },
            //     ],
            // },
            // {
            //     label: 'Transporter', Icon: TruckIcon, to: '/power-master/transporter/transporter-mode', reqPerm: 'Power Master.General Master.View',
            //     children: [
            //         { label: 'Transporter Mode', Icon: TruckIcon, to: '/power-master/transporter/transporter-mode', reqPerm: 'Power Master.General Master.View' },
            //         { label: 'Transporter Details', Icon: FileTextIcon, to: '/power-master/transporter/transporter-details', reqPerm: 'Power Master.General Master.View' },
            //     ],
            // },
        ],
    },
    {
        to: '/user-rights', reqPerm: 'User Rights.User Right.View',
        label: 'User Rights',
        Icon: UserIcon,
        exact: false,
        children: [
            { label: 'User Rights List', Icon: ListIcon, to: '/user-rights', reqPerm: 'User Rights.User Right.View', exact: true, activePrefixes: ['/user-rights/add', '/user-rights/edit'] },
        ],
    },
    {
        to: '/report/stock-report', reqPerm: 'Report.Stock Report.View',
        label: 'Report',
        Icon: FolderOpenIcon,
        exact: false,
        children: [
            { label: 'Stock Report', Icon: FileTextIcon, to: '/report/stock-report', reqPerm: 'Report.Stock Report.View' },
            { label: 'Customer Ledger Report', Icon: FileTextIcon, to: '/report/customer-ledger', reqPerm: 'Report.Customer Ledger Report.View' },
            { label: 'Vendor Ledger Report', Icon: FileTextIcon, to: '/report/vendor-ledger', reqPerm: 'Report.Vendor Ledger Report.View' },
            { label: 'Outstanding Report', Icon: FileTextIcon, to: '/report/outstanding-report', reqPerm: 'Report.Outstanding Report.View' },
            { label: 'Enquiry Hold Report', Icon: FileTextIcon, to: '/report/enquiry-hold', reqPerm: 'Report.Enquiry Hold Report.View' },
            { label: 'Pending Vendor Payment', Icon: FileTextIcon, to: '/report/vendor-payment-pending', reqPerm: 'Report.Pending Vendor Payment.View' },
            { label: 'Total Paid Vendor Payment', Icon: FileTextIcon, to: '/report/vendor-payment-totalpaid', reqPerm: 'Report.Total Paid Vendor Payment.View' },
            { label: 'Payment Voucher Report', Icon: FileTextIcon, to: '/report/payment-voucher-report', reqPerm: 'Report.Payment Voucher Report.View' },
        ],
    },
    {
        to: '/payroll', reqPerm: 'Payroll.Payroll List.View',
        label: 'Payroll',
        Icon: CurrencyDollarIcon,
        exact: false,
        children: [
            { label: 'Payroll Entry', Icon: MoneyIcon, to: '/payroll/salary', reqPerm: 'Payroll.Payroll Entry.View' },
            { label: 'Payroll List', Icon: ListIcon, to: '/payroll/list', reqPerm: 'Payroll.Payroll List.View' },
            { label: 'Payroll Report', Icon: StackIcon, to: '/payroll/report', reqPerm: 'Payroll.Payroll Report.View' },
        ]
    },
];

const hasNestedChildren = (children) => children?.some(c => c.children?.length > 0);



/* ── MORE dropdown sub-menu (recursive) ─────────────────────────── */
const MoreSubMenu = ({ items, onClose }) => (
    <ul>
        {items.map((child, idx) => {
            const hasCh = child.children?.length > 0;

            return (
                <li key={idx} className="tw-relative group/sub">
                    <Link
                        to={child.to || '#'}
                        className="more-dropdown__item"
                        onClick={(e) => { if (hasCh) e.preventDefault(); else onClose(); }}
                    >
                        {child.Icon && <child.Icon weight="duotone" className="tw-w-3.5 tw-h-3.5 tw-mr-1.5 tw-shrink-0" />}
                        {child.label}
                        {hasCh && <CaretRightIcon weight="bold" className="tw-w-3 tw-h-3 tw-ml-auto" />}
                    </Link>
                    {hasCh && (
                        <div className="more-dropdown__submenu tw-hidden group-hover/sub:tw-block tw-absolute tw-left-full tw-top-0 tw-z-50">
                            <MoreSubMenu items={child.children} onClose={onClose} />
                        </div>)}
                </li>
            );
        })}
    </ul>
);

/* ── Main Navigation ─────────────────────────────────────────────── */
const Navigation = ({ drawerOpen, setDrawerOpen, userPermissions, headerLogo }) => {
    const { hasPermission } = usePermissions();
    const location = useLocation();
    const containerRef = useRef(null);
    const itemRefs = useRef([]);
    const groupLeaveTimer = useRef(null);
    /* prevents the sub-panel from firing immediately when the dropdown first renders */
    const ddJustOpened = useRef(false);
    const groupItemRefs = useRef([]);

    // Filter ALL_ITEMS based on userPermissions
    const getFilteredItems = useCallback(() => {
        if (!userPermissions) return []; // Not loaded yet, show nothing instead of all menus

        const filterItem = (item, parentLabel = null) => {
            if (!item.children) {
                if (item.reqPerm) {
                    if (Array.isArray(item.reqPerm)) {
                        return item.reqPerm.some(perm => hasPermission(perm)) ? item : null;
                    }
                    return hasPermission(item.reqPerm) ? item : null;
                }

                // Fallback for items that don't have reqPerm
                const label = parentLabel ? parentLabel : item.label;
                const normalizedLabel = item.label.toLowerCase().replace(/s$/, '');
                const hasAccess = userPermissions.some(p => {
                    const parts = p.split('.');
                    if (parts[0] !== label) return false;
                    if (parts.length > 1) {
                        const pMenu = parts[1].toLowerCase().replace(/s$/, '');
                        if (pMenu === normalizedLabel || pMenu.includes(normalizedLabel) || normalizedLabel.includes(pMenu)) {
                            return true;
                        }
                    }
                    return false;
                });
                return hasAccess ? item : null;
            } else {
                const filteredChildren = item.children.map(child => filterItem(child, parentLabel || item.label)).filter(Boolean);
                if (filteredChildren.length > 0) {
                    return { ...item, children: filteredChildren };
                }
                return null;
            }
        };

        return ALL_ITEMS.map(item => filterItem(item)).filter(Boolean);
    }, [userPermissions]);

    const filteredAllItems = getFilteredItems();

    const [visibleCount, setVisibleCount] = useState(filteredAllItems.length);
    const [openMenuIdx, setOpenMenuIdx] = useState(null);
    const [activeGroupIdx, setActiveGroupIdx] = useState(0);
    const [mobileOpenIdx, setMobileOpenIdx] = useState(null);
    const [dropAlign, setDropAlign] = useState('left');
    const [subPanelTop, setSubPanelTop] = useState(0);
    const [drawerAccIdx, setDrawerAccIdx] = useState(null);
    const [drawerSubGroupKey, setDrawerSubGroupKey] = useState(null);
    const [mobSubGroupKey, setMobSubGroupKey] = useState(null);

    const isActive = (item) => {
        if (item.exact) {
            return location.pathname === item.to || (!!item.activePrefixes && item.activePrefixes.some(prefix => location.pathname.startsWith(prefix)));
        }
        if (location.pathname === item.to || location.pathname.startsWith(item.to + '/')) return true;
        if (item.activePrefixes && item.activePrefixes.some(prefix => location.pathname.startsWith(prefix))) return true;
        if (item.children && item.children.some(child => isActive(child))) return true;
        return false;
    };

    /* overflow calculation — measures nav-overflow-wrap directly for accuracy */
    const calculate = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const els = itemRefs.current.filter(Boolean);

        // Save original display values
        const originalDisplays = els.map(el => el.style.display);

        /* temporarily unhide all items to measure natural widths */
        els.forEach(el => { el.style.visibility = 'hidden'; el.style.display = 'flex'; el.style.flexShrink = '0'; });
        void container.offsetWidth; // force reflow

        /* Minimum buffer: hamburger button (38px) + right pos (10px) + minimal gap (2px) = 50px */
        const availableWidth = container.offsetWidth - 50;
        let used = 0, count = 0;
        for (let i = 0; i < els.length; i++) {
            const w = els[i].offsetWidth;
            const gap = i > 0 ? 4 : 0; // Account for CSS gap: 4px
            if (used + w + gap > availableWidth) break;
            used += w + gap;
            count++;
        }

        // Restore original display values so we don't accidentally reveal hidden items
        els.forEach((el, i) => {
            el.style.visibility = '';
            el.style.display = originalDisplays[i];
            el.style.flexShrink = '';
        });

        setVisibleCount(count);
    }, []);

    useEffect(() => { const t = setTimeout(calculate, 60); return () => clearTimeout(t); }, [calculate, filteredAllItems.length]);
    /* ResizeObserver fires when the nav-overflow-wrap resizes (e.g. window resize) */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const ro = new ResizeObserver(calculate);
        ro.observe(container);
        return () => ro.disconnect();
    }, [calculate]);
    /* Belt-and-suspenders: also catch window resize directly */
    useEffect(() => {
        window.addEventListener('resize', calculate);
        return () => window.removeEventListener('resize', calculate);
    }, [calculate]);


    /* click handler — opens/closes dropdown on click */
    const handleNavClick = (idx) => {
        if (openMenuIdx === idx) {
            setOpenMenuIdx(null);
        } else {
            setOpenMenuIdx(idx);
            setDropAlign(idx >= Math.ceil(visibleCount / 2) ? 'right' : 'left');

            // Pre-open the group that contains the current active route
            let foundActiveGroup = null;
            const clickedItem = filteredAllItems[idx];
            if (clickedItem && clickedItem.children) {
                for (let i = 0; i < clickedItem.children.length; i++) {
                    const childGroup = clickedItem.children[i];
                    if (childGroup.children?.length > 0) {
                        const isCurrentGroup = childGroup.children.some(sub =>
                            location.pathname === sub.to || location.pathname.startsWith(sub.to + '/')
                        );
                        if (isCurrentGroup) {
                            foundActiveGroup = i;
                            break;
                        }
                    }
                }
            }
            setActiveGroupIdx(foundActiveGroup);

            ddJustOpened.current = true;
            setTimeout(() => { ddJustOpened.current = false; }, 200);
        }
    };

    /* close dropdown when clicking outside the nav bar */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpenMenuIdx(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateSubPanelPosition = useCallback(() => {
        if (activeGroupIdx !== null && groupItemRefs.current[activeGroupIdx]) {
            const el = groupItemRefs.current[activeGroupIdx];
            const outer = el.closest('.nav-pm-outer');
            const leftPane = el.closest('.nav-pm-left');
            if (outer && leftPane) {
                const elRect = el.getBoundingClientRect();
                const outerRect = outer.getBoundingClientRect();
                const leftPaneRect = leftPane.getBoundingClientRect();

                let newTop = elRect.top - outerRect.top;

                // If item is above the visible area, clamp to 0
                if (newTop < 0) newTop = 0;

                // Clamp bottom: ensure the right panel doesn't drop below the left panel's bottom.
                // We estimate the right panel's max possible top to keep it looking attached 
                // but not flying off the screen.
                const rightPane = outer.querySelector('.nav-pm-card:not(.nav-pm-left)');
                if (rightPane) {
                    const rightHeight = rightPane.getBoundingClientRect().height;
                    const maxTop = leftPaneRect.height - rightHeight;
                    // If right menu is taller than left menu, maxTop could be negative. We always ensure newTop >= 0.
                    if (newTop > maxTop) {
                        newTop = Math.max(0, maxTop);
                    }
                } else {
                    // Fallback if right panel isn't in DOM yet (e.g. first render)
                    // We'll just clamp it to a reasonable maximum so it doesn't fly off
                    const maxTop = leftPaneRect.height - 40;
                    if (newTop > maxTop) newTop = Math.max(0, maxTop);
                }

                setSubPanelTop(newTop);
            }
        }
    }, [activeGroupIdx]);

    /* group toggle — sub-panel toggles on click */
    const handleGroupToggle = (gIdx) => {
        if (activeGroupIdx === gIdx) {
            setActiveGroupIdx(null);
        } else {
            setActiveGroupIdx(gIdx);
        }
    };

    /* ensure pre-opened sub-panel aligns correctly and updates on scroll */
    useEffect(() => {
        if (openMenuIdx !== null && activeGroupIdx !== null) {
            setTimeout(() => {
                // Scroll the active item to the top of the left pane
                if (groupItemRefs.current[activeGroupIdx]) {
                    const el = groupItemRefs.current[activeGroupIdx];
                    const leftPane = el.closest('.nav-pm-left');
                    if (leftPane) {
                        const elTop = el.getBoundingClientRect().top;
                        const paneTop = leftPane.getBoundingClientRect().top;
                        leftPane.scrollTop = leftPane.scrollTop + (elTop - paneTop);
                    }
                }
                // Update right panel position
                updateSubPanelPosition();
            }, 10);
        }
    }, [openMenuIdx, activeGroupIdx, updateSubPanelPosition]);

    /* If window < 1001px, force visibleCount to 0 to push everything to sidebar */
    const isMobileNav = window.innerWidth < 1001;
    let effectiveCount = isMobileNav ? 0 : visibleCount;

    const overflowItems = filteredAllItems.slice(effectiveCount);
    const moreIsActive = overflowItems.some(item => isActive(item));

    return (
        <>
            <nav className="main-nav" role="navigation">

                {/* ── Hamburger — always inside nav pill at the right end ── */}
                <button
                    className="nav-hamburger-btn"
                    onClick={() => setDrawerOpen(o => !o)}
                    aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                    style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 38, height: 38, borderRadius: 9, zIndex: 20,
                        background: drawerOpen
                            ? 'linear-gradient(135deg,#1e40af,var(--secondary-color, #2563EB))'
                            : 'var(--primary-bg, linear-gradient(135deg,#22C1C3,#1aa8aa))',
                        border: 'none',
                        cursor: 'pointer', padding: 0, outline: 'none',
                        boxShadow: 'none',
                        transition: 'background 0.25s ease, transform 0.18s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                >
                    <i
                        className={drawerOpen ? 'mdi mdi-close' : 'mdi mdi-menu'}
                        style={{
                            fontSize: 22, color: '#ffffff', lineHeight: 1,
                            transition: 'opacity 0.18s ease',
                            display: 'block',
                        }}
                    />
                </button>

                {/* ── Nav bar ── */}
                <div ref={containerRef} className="nav-overflow-wrap">
                    <ul id="main-menu" className="sm sm-blue">
                        {filteredAllItems.map((item, idx) => {
                            const hasChildren = item.children?.length > 0;
                            const isMobOpen = mobileOpenIdx === idx;
                            const isOpen = openMenuIdx === idx;
                            const isNested = hasChildren && hasNestedChildren(item.children);
                            const activeGroup = isOpen && isNested ? item.children[activeGroupIdx] : null;

                            return (
                                <li
                                    key={item.to}
                                    ref={el => { itemRefs.current[idx] = el; }}
                                    style={{ display: idx < effectiveCount ? '' : 'none' }}
                                >
                                    <Link
                                        to={item.to || '#'}
                                        className={`${isActive(item) ? 'current' : ''} nav-item-link`}
                                        onClick={(e) => {
                                            if (e.ctrlKey || e.metaKey || e.button !== 0) return;
                                            if (hasChildren) {
                                                e.preventDefault();
                                                if (window.innerWidth < 768) {
                                                    setMobileOpenIdx(isMobOpen ? null : idx);
                                                } else {
                                                    handleNavClick(idx);
                                                }
                                            } else {
                                                setOpenMenuIdx(null);
                                            }
                                        }}
                                    >
                                        <item.Icon weight="duotone" size={13} className="nav-item-icon" />
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {hasChildren && (
                                            <span style={{ marginLeft: 'auto', transition: 'transform 0.25s', display: 'inline-flex', transform: isMobOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                <i className="mdi mdi-chevron-down" style={{ fontSize: 16 }} />
                                            </span>)}
                                    </Link>

                                    {/* ── Desktop dropdown (inside <li>) ── */}
                                    {isOpen && hasChildren && (
                                        isNested ? (
                                            /* Power Master: two separate floating cards side-by-side */
                                            <div
                                                className={`nav-pm-outer${dropAlign === 'right' ? ' nav-pm-outer--rtl' : ''}`}
                                            >
                                                {/* Left card — group list */}
                                                <div className="nav-dd nav-pm-card nav-pm-left" onScroll={updateSubPanelPosition}>
                                                    <div className="nav-dd-groups">
                                                        {item.children.map((child, cIdx) => {
                                                            const hasCh = child.children?.length > 0;
                                                            const isActive = activeGroupIdx === cIdx;
                                                            const isCurrentGroup = hasCh && child.children.some(sub => location.pathname === sub.to || location.pathname.startsWith(sub.to + '/'));

                                                            if (hasCh) {
                                                                return (
                                                                    <div
                                                                        key={cIdx}
                                                                        ref={el => { groupItemRefs.current[cIdx] = el; }}
                                                                        className={`nav-ddi nav-ddi--group${isActive ? ' nav-ddi--active' : ''}${isCurrentGroup ? ' nav-ddi--current' : ''}`}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleGroupToggle(cIdx);
                                                                        }}
                                                                    >
                                                                        {child.Icon && <child.Icon weight="duotone" size={20} className="tw-shrink-0" />}
                                                                        <span className="tw-flex-1 tw-truncate">{child.label}</span>
                                                                        <CaretRightIcon
                                                                            size={12}
                                                                            className="tw-shrink-0"
                                                                            style={{
                                                                                opacity: isActive ? 0.7 : (isCurrentGroup ? 1 : 0.5),
                                                                                transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                                transition: 'transform 0.15s ease',
                                                                            }}
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <Link
                                                                    key={child.to}
                                                                    to={child.to}
                                                                    className={`nav-ddi${isActive(child) ? ' nav-ddi--current' : ''}`}
                                                                    onClick={() => setOpenMenuIdx(null)}
                                                                >
                                                                    {child.Icon && <child.Icon weight="duotone" size={20} className="tw-shrink-0" />}
                                                                    <span>{child.label}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Right card — sub-items of active group (separate card, aligned to hovered item) */}
                                                {activeGroup?.children?.length > 0 && (
                                                    <div
                                                        className="nav-dd nav-pm-card"
                                                        style={{ marginTop: subPanelTop }}
                                                    >
                                                        {activeGroup.children.map(child => (
                                                            <Link
                                                                key={child.to}
                                                                to={child.to}
                                                                className={`nav-ddi${isActive(child) ? ' nav-ddi--current' : ''}`}
                                                                onClick={() => setOpenMenuIdx(null)}
                                                            >
                                                                {child.Icon && <child.Icon weight="duotone" size={20} className="tw-shrink-0" />}
                                                                <span>{child.label}</span>
                                                            </Link>
                                                        ))}
                                                    </div>)}
                                            </div>) : (
                                            /* FLAT: single card vertical list */
                                            <div
                                                className={`nav-dd${dropAlign === 'right' ? ' nav-dd--rtl' : ''}`}
                                            >
                                                {item.children.map(child => (
                                                    <Link
                                                        key={child.to}
                                                        to={child.to}
                                                        className={`nav-ddi${isActive(child) ? ' nav-ddi--current' : ''}`}
                                                        onClick={() => setOpenMenuIdx(null)}
                                                    >
                                                        {child.Icon && <child.Icon weight="duotone" size={20} className="tw-shrink-0" />}
                                                        <span>{child.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        ))}

                                    {/* Mobile accordion — hidden on desktop via CSS */}
                                    {hasChildren && isMobOpen && (
                                        <div className="nmob-acc">
                                            {item.children.map((child, cIdx) => {
                                                const hasCh = child.children?.length > 0;
                                                const subKey = `mob-${idx}-${cIdx}`;
                                                const subExpanded = mobSubGroupKey === subKey;
                                                return (
                                                    <div key={cIdx}>
                                                        {hasCh ? (
                                                            <>
                                                                <button
                                                                    className="nmob-group-label nmob-group-label--btn"
                                                                    onClick={() => setMobSubGroupKey(subExpanded ? null : subKey)}
                                                                >
                                                                    {child.Icon && <child.Icon weight="duotone" size={13} style={{ flexShrink: 0 }} />}
                                                                    <span style={{ flex: 1 }}>{child.label}</span>
                                                                    <i className="mdi mdi-chevron-down" style={{ fontSize: 15, transition: 'transform 0.25s', transform: subExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                                                </button>
                                                                {subExpanded && child.children.map(sub => (
                                                                    <Link key={sub.to} to={sub.to}
                                                                        className={`nmob-sub-item${isActive(sub) ? ' nmob-sub-item--active' : ''}`}
                                                                        onClick={() => setDrawerOpen?.(false)}>
                                                                        {sub.Icon && <sub.Icon weight="duotone" size={12} style={{ flexShrink: 0, marginRight: 6 }} />}
                                                                        {sub.label}
                                                                    </Link>
                                                                ))}
                                                            </>) : (
                                                            <Link to={child.to}
                                                                className={`nmob-item${isActive(child) ? ' nmob-item--active' : ''}`}
                                                                onClick={() => setDrawerOpen?.(false)}>
                                                                {child.Icon && <child.Icon weight="duotone" size={14} style={{ flexShrink: 0, marginRight: 8 }} />}
                                                                {child.label}
                                                            </Link>)}
                                                    </div>
                                                );
                                            })}
                                        </div>)}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {/* ── Drawer overlay ── */}
            {drawerOpen && (
                <div
                    onClick={() => setDrawerOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1045 }}
                />)}

            {/* ── Tablet/Laptop drawer panel (768-1419px) ── */}
            <div style={{
                position: 'fixed', top: 0, right: 0,
                width: 290, height: '100vh', background: '#fff',
                zIndex: 1050, boxShadow: '-6px 0 32px rgba(0,0,0,0.16)',
                transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease',
                overflowY: 'auto', display: 'flex', flexDirection: 'column',
                pointerEvents: drawerOpen ? 'auto' : 'none',
            }}>
                {/* Drawer header */}
                <div style={{ background: 'var(--primary-bg, linear-gradient(135deg,#22C1C3,#1aa8aa))', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={headerLogo || "/assets/images/logo-3.png"} alt="Terrific" style={{ height: 28, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <button onClick={() => setDrawerOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, lineHeight: 1, fontWeight: 400 }}>×</button>
                </div>

                {/* Drawer items */}
                <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
                    {overflowItems.map((item, idx) => {
                        const hasCh = item.children?.length > 0;
                        const active = isActive(item);
                        const expanded = drawerAccIdx === idx;
                        return (
                            <div
                                key={item.to}
                                className={drawerOpen ? 'drawer-item-animate' : ''}
                                style={{ animationDelay: drawerOpen ? `${idx * 55}ms` : '0ms' }}
                            >
                                {/* Top-level item row */}
                                {hasCh ? (
                                    <button
                                        onClick={() => setDrawerAccIdx(expanded ? null : idx)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: active ? 'var(--secondary-bg, #eff6ff)' : 'transparent', border: 'none', cursor: 'pointer', color: active ? 'var(--secondary-color, #2563EB)' : '#1e293b', fontWeight: active ? 700 : 500, fontSize: 13.5, textAlign: 'left', borderLeft: active ? '3px solid #2563EB' : '3px solid transparent' }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: active ? 'rgba(37,99,235,0.10)' : 'rgba(100,116,139,0.08)', transition: 'background 0.2s' }}>
                                            <item.Icon weight="duotone" size={17} style={{ color: active ? 'var(--secondary-color, #2563EB)' : '#64748b' }} />
                                        </span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        <CaretRightIcon size={13} style={{ flexShrink: 0, transition: 'transform 0.25s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', color: active ? 'var(--secondary-color, #2563EB)' : '#94a3b8' }} />
                                    </button>) : (
                                    <Link
                                        to={item.to}
                                        onClick={() => setDrawerOpen(false)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', color: active ? 'var(--secondary-color, #2563EB)' : '#1e293b', background: active ? 'var(--secondary-bg, #eff6ff)' : 'transparent', fontWeight: active ? 700 : 500, fontSize: 13.5, textDecoration: 'none', borderLeft: active ? '3px solid #2563EB' : '3px solid transparent' }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: active ? 'rgba(37,99,235,0.10)' : 'rgba(100,116,139,0.08)', transition: 'background 0.2s' }}>
                                            <item.Icon weight="duotone" size={17} style={{ color: active ? 'var(--secondary-color, #2563EB)' : '#64748b' }} />
                                        </span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                    </Link>)}
                                {/* Accordion sub-items */}
                                {hasCh && expanded && (
                                    <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                                        {item.children.map((child, cIdx) => {
                                            const subHasCh = child.children?.length > 0;
                                            const subKey = `${idx}-${cIdx}`;
                                            const subExpanded = drawerSubGroupKey === subKey;

                                            if (subHasCh) return (
                                                <div key={cIdx}>
                                                    <button
                                                        onClick={() => setDrawerSubGroupKey(subExpanded ? null : subKey)}
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: subExpanded ? '#eff6ff' : 'transparent', border: 'none', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'left' }}
                                                    >
                                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: subExpanded ? 'rgba(37,99,235,0.10)' : 'rgba(100,116,139,0.08)' }}>
                                                            {child.Icon && <child.Icon weight="duotone" size={14} style={{ color: subExpanded ? 'var(--secondary-color, #2563EB)' : '#64748b' }} />}
                                                        </span>
                                                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: subExpanded ? 'var(--secondary-color, #2563EB)' : '#334155' }}>{child.label}</span>
                                                        <i className="mdi mdi-chevron-down" style={{ fontSize: 15, color: subExpanded ? 'var(--secondary-color, #2563EB)' : '#94a3b8', transition: 'transform 0.25s', transform: subExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'block' }} />
                                                    </button>
                                                    {subExpanded && (
                                                        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                                                            {child.children.map(sub => {
                                                                const subActive = isActive(sub);
                                                                return (
                                                                    <Link key={sub.to} to={sub.to} onClick={() => setDrawerOpen(false)}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px 9px 52px', color: subActive ? 'var(--secondary-color, #2563EB)' : '#475569', fontWeight: subActive ? 600 : 400, fontSize: 12.5, textDecoration: 'none', background: subActive ? 'var(--secondary-bg, #eff6ff)' : 'transparent', borderLeft: subActive ? '3px solid var(--secondary-color, #2563EB)' : '3px solid transparent' }}>
                                                                        {sub.Icon && <sub.Icon weight="duotone" size={13} style={{ flexShrink: 0 }} />}
                                                                        <span style={{ flex: 1 }}>{sub.label}</span>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>)}
                                                </div>
                                            );
                                            const childActive = isActive(child);
                                            return (
                                                <Link key={child.to} to={child.to} onClick={() => setDrawerOpen(false)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px 10px 46px', color: childActive ? 'var(--secondary-color, #2563EB)' : '#475569', fontWeight: childActive ? 600 : 400, fontSize: 13, textDecoration: 'none', background: childActive ? 'var(--secondary-bg, #eff6ff)' : 'transparent', borderLeft: childActive ? '3px solid var(--secondary-color, #2563EB)' : '3px solid transparent' }}>
                                                    {child.Icon && <child.Icon weight="duotone" size={15} style={{ flexShrink: 0 }} />}
                                                    <span style={{ flex: 1 }}>{child.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Navigation;
