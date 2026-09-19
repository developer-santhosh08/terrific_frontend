import React from 'react';

const makeIcon = (bootstrapName) => {
  const Icon = ({ className = '', size, color, style, weight, ...props }) => {
    void weight;

    const resolvedSize = typeof size === 'number' ? `${size}px` : size;
    const mergedStyle = {
      ...style,
      ...(resolvedSize ? { fontSize: resolvedSize } : null),
      ...(color ? { color } : null),
    };

    return (
      <i
        aria-hidden="true"
        {...props}
        className={`bi bi-${bootstrapName}${className ? ` ${className}` : ''}`}
        style={mergedStyle}
      />
    );
  };

  Icon.displayName = `BootstrapIcon(${bootstrapName})`;
  return Icon;
};

export const ArrowUUpLeft = makeIcon('arrow-return-left');
export const AddressBookIcon = makeIcon('person-vcard');
export const ArrowBendUpLeftIcon = makeIcon('arrow-90deg-left');
export const ArrowLeft = makeIcon('arrow-left');
export const ArrowLeftIcon = makeIcon('arrow-left');
export const ArrowLineLeft = makeIcon('arrow-bar-left');
export const ArrowCounterClockwise = makeIcon('arrow-counterclockwise');
export const ArrowDown = makeIcon('caret-down-fill');
export const ArrowsClockwiseIcon = makeIcon('arrow-repeat');
export const ArrowsLeftRightIcon = makeIcon('arrow-left-right');
export const ArrowsOutSimpleIcon = makeIcon('arrows-expand');
export const ArrowUp = makeIcon('caret-up-fill');
export const BankIcon = makeIcon('bank');
export const Basket = makeIcon('basket');
export const BellIcon = makeIcon('bell');
export const BriefcaseIcon = makeIcon('briefcase');
export const BuildingsIcon = makeIcon('buildings');
export const Calendar = makeIcon('calendar-event');
export const CalendarIcon = makeIcon('calendar-event');
export const CaretLeft = makeIcon('chevron-left');
export const CaretRight = makeIcon('chevron-right');
export const CaretRightIcon = makeIcon('chevron-right');
export const ChartBarIcon = makeIcon('bar-chart');
export const ChatCenteredText = makeIcon('chat-text');
export const ChatCircleIcon = makeIcon('chat-dots');
export const ChatTextIcon = makeIcon('chat-text');
export const CheckCircleIcon = makeIcon('check-circle');
export const Clock = makeIcon('clock');
export const ClockCounterClockwiseIcon = makeIcon('clock-history');
export const ClockIcon = makeIcon('clock');
export const CurrencyDollarIcon = makeIcon('currency-dollar');
export const DotsThreeOutlineIcon = makeIcon('three-dots');
export const DotsThreeVertical = makeIcon('three-dots-vertical');
export const EnvelopeIcon = makeIcon('envelope');
export const EyeIcon = makeIcon('eye');
export const EyeSlash = makeIcon('eye-slash');
export const FilePdf = makeIcon('filetype-pdf');
export const FilePdfIcon = makeIcon('filetype-pdf');
export const FileTextIcon = makeIcon('file-earmark-text');
export const FileXls = makeIcon('filetype-xls');
export const FileXlsIcon = makeIcon('filetype-xls');
export const FileCsv = makeIcon('filetype-csv');
export const FloppyDisk = makeIcon('floppy');
export const FolderOpenIcon = makeIcon('folder2-open');
export const Funnel = makeIcon('funnel');
export const GearSixIcon = makeIcon('gear');
export const GlobeIcon = makeIcon('globe2');
export const House = makeIcon('house-door');
export const HouseIcon = makeIcon('house-door');
export const LightningIcon = makeIcon('lightning-charge');
export const ListIcon = makeIcon('list');
export const MagnifyingGlass = makeIcon('search');
export const MapPinIcon = makeIcon('geo-alt');
export const MoneyIcon = makeIcon('cash-coin');
export const NoteIcon = makeIcon('sticky');
export const PackageIcon = makeIcon('box-seam');
export const PencilIcon = makeIcon('pencil');
export const PencilSimple = makeIcon('pencil');
export const PencilSimpleIcon = makeIcon('pencil');
export const PercentIcon = makeIcon('percent');
export const Plus = makeIcon('plus-lg');
export const PlusIcon = makeIcon('plus-lg');
export const Printer = makeIcon('printer');
export const PrinterIcon = makeIcon('printer');
export const QuestionIcon = makeIcon('question-circle');
export const ScrollIcon = makeIcon('scroll');
export const SquaresFourIcon = makeIcon('grid-3x3-gap');
export const StackIcon = makeIcon('stack');
export const StarIcon = makeIcon('star');
export const TagIcon = makeIcon('tag');
export const Trash = makeIcon('trash');
export const TrashIcon = makeIcon('trash');
export const TruckIcon = makeIcon('truck');
export const UserCircleIcon = makeIcon('person-circle');
export const UserIcon = makeIcon('person');
export const UsersIcon = makeIcon('people');
export const WarningIcon = makeIcon('exclamation-triangle');
export const XCircleIcon = makeIcon('x-circle');
export const CakeIcon = makeIcon('gift');
export const EyeSlashIcon = makeIcon('eye-slash');
export const LockKeyIcon = makeIcon('lock');
export const PhoneIcon = makeIcon('telephone');
export const ShieldCheckIcon = makeIcon('shield-check');
export const UploadSimpleIcon = makeIcon('upload');
export const CaretDownIcon = makeIcon('caret-down-fill');
export const ShoppingCartIcon = makeIcon('cart');
export const Check = makeIcon('check-lg');
export const X = makeIcon('x-lg');
export const Eye = makeIcon('eye');
export const XCircle = makeIcon('x-circle');

// Added for Dashboard
export const CurrencyInr = makeIcon('currency-rupee');
export const Hourglass = makeIcon('hourglass-split');
export const Bank = makeIcon('bank');
export const ClipboardText = makeIcon('clipboard-data');
export const Receipt = makeIcon('receipt');
export const FileText = makeIcon('file-earmark-text');
export const Wrench = makeIcon('wrench');
export const PhoneCall = makeIcon('telephone-inbound');
export const CheckCircle = makeIcon('check-circle');
export const TrendUp = makeIcon('graph-up-arrow');

export const ImageSquare = makeIcon('image');
export const Table = makeIcon('table');
export const ArrowsOutSimple = makeIcon('arrows-expand');

// Added for Company Profile
export const Info = makeIcon('info-circle');
export const Browser = makeIcon('window');
export const EnvelopeSimple = makeIcon('envelope');
export const Gear = makeIcon('gear');
export const Image = makeIcon('image');
export const Drop = makeIcon('droplet');
export const PaperPlaneRight = makeIcon('send');
export const SlidersHorizontal = makeIcon('sliders');
export const CloudArrowUp = makeIcon('cloud-upload');
