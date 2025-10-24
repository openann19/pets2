/**
 * 🎨 ICON SYSTEM
 * React components for Heroicons subset with consistent styling
 */
import React from 'react';
import { HeartIcon, XMarkIcon, StarIcon, SparklesIcon, ArrowPathIcon, UserIcon, ChatBubbleLeftRightIcon, MapPinIcon, CameraIcon, PhotoIcon, VideoCameraIcon, PhoneIcon, EnvelopeIcon, BellIcon, Cog6ToothIcon, HomeIcon, MagnifyingGlassIcon, PlusIcon, MinusIcon, CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowDownIcon, PlayIcon, PauseIcon, StopIcon, ForwardIcon, BackwardIcon, VolumeUpIcon, VolumeOffIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, LockOpenIcon, KeyIcon, ShieldCheckIcon, GlobeAltIcon, LanguageIcon, SunIcon, MoonIcon, ComputerDesktopIcon, AdjustmentsHorizontalIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon, CalendarIcon, ClockIcon, TagIcon, BookmarkIcon, ShareIcon, DownloadIcon, UploadIcon, DocumentIcon, FolderIcon, TrashIcon, PencilIcon, DocumentDuplicateIcon, ClipboardIcon, PrinterIcon, ArchiveBoxIcon, CubeIcon, GiftIcon, TrophyIcon, FireIcon, BoltIcon, LightBulbIcon, PuzzlePieceIcon, RocketLaunchIcon, BeakerIcon, WrenchIcon, PaintBrushIcon, ScissorsIcon, CursorArrowRaysIcon, HandRaisedIcon, FingerPrintIcon, QrCodeIcon, CreditCardIcon, BanknotesIcon, ReceiptPercentIcon, ShoppingCartIcon, ShoppingBagIcon, TruckIcon, BuildingStorefrontIcon, BuildingOfficeIcon, HomeModernIcon, BuildingLibraryIcon, AcademicCapIcon, BookOpenIcon, GraduationCapIcon, PresentationChartLineIcon, ChartBarIcon, ChartPieIcon, PresentationChartBarIcon, DocumentChartBarIcon, DocumentTextIcon, DocumentMagnifyingGlassIcon, MagnifyingGlassCircleIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, FunnelIcon as FunnelOutlineIcon, AdjustmentsHorizontalIcon as AdjustmentsOutlineIcon, Cog6ToothIcon as CogOutlineIcon, UserIcon as UserOutlineIcon, HeartIcon as HeartOutlineIcon, StarIcon as StarOutlineIcon, BookmarkIcon as BookmarkOutlineIcon, ShareIcon as ShareOutlineIcon, ChatBubbleLeftRightIcon as ChatOutlineIcon, BellIcon as BellOutlineIcon, HomeIcon as HomeOutlineIcon, MagnifyingGlassIcon as SearchOutlineIcon, PlusIcon as PlusOutlineIcon, MinusIcon as MinusOutlineIcon, CheckIcon as CheckOutlineIcon, XMarkIcon as XOutlineIcon, ExclamationTriangleIcon as WarningOutlineIcon, InformationCircleIcon as InfoOutlineIcon, XCircleIcon as ErrorOutlineIcon, } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, XMarkIcon as XOutline, StarIcon as StarOutline, SparklesIcon as SparklesOutline, ArrowPathIcon as ArrowPathOutline, UserIcon as UserOutline, ChatBubbleLeftRightIcon as ChatOutline, MapPinIcon as MapPinOutline, CameraIcon as CameraOutline, PhotoIcon as PhotoOutline, VideoCameraIcon as VideoOutline, PhoneIcon as PhoneOutline, EnvelopeIcon as EnvelopeOutline, BellIcon as BellOutline, Cog6ToothIcon as CogOutline, HomeIcon as HomeOutline, MagnifyingGlassIcon as SearchOutline, PlusIcon as PlusOutline, MinusIcon as MinusOutline, CheckIcon as CheckOutline, ExclamationTriangleIcon as WarningOutline, InformationCircleIcon as InfoOutline, XCircleIcon as ErrorOutline, } from '@heroicons/react/24/outline';
// Icon size mapping
const ICON_SIZES = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
};
// Icon color mapping
const ICON_COLORS = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
    neutral: 'text-neutral-500',
    white: 'text-white',
    black: 'text-black',
};
// Base icon wrapper component
const IconWrapper = ({ size = 'md', color = 'neutral', className = '', 'aria-label': ariaLabel, 'aria-hidden': ariaHidden = true, children, }) => {
    const sizeClass = ICON_SIZES[size];
    const colorClass = ICON_COLORS[color];
    return (<span className={`inline-flex items-center justify-center ${sizeClass} ${colorClass} ${className}`} aria-label={ariaLabel} aria-hidden={ariaHidden}>
      {children}
    </span>);
};
// Solid icons
export const Heart = (props) => (<IconWrapper {...props}>
    <HeartIcon className="w-full h-full"/>
  </IconWrapper>);
export const X = (props) => (<IconWrapper {...props}>
    <XMarkIcon className="w-full h-full"/>
  </IconWrapper>);
export const Star = (props) => (<IconWrapper {...props}>
    <StarIcon className="w-full h-full"/>
  </IconWrapper>);
export const Sparkles = (props) => (<IconWrapper {...props}>
    <SparklesIcon className="w-full h-full"/>
  </IconWrapper>);
export const Refresh = (props) => (<IconWrapper {...props}>
    <ArrowPathIcon className="w-full h-full"/>
  </IconWrapper>);
export const User = (props) => (<IconWrapper {...props}>
    <UserIcon className="w-full h-full"/>
  </IconWrapper>);
export const Chat = (props) => (<IconWrapper {...props}>
    <ChatBubbleLeftRightIcon className="w-full h-full"/>
  </IconWrapper>);
export const Location = (props) => (<IconWrapper {...props}>
    <MapPinIcon className="w-full h-full"/>
  </IconWrapper>);
export const Camera = (props) => (<IconWrapper {...props}>
    <CameraIcon className="w-full h-full"/>
  </IconWrapper>);
export const Photo = (props) => (<IconWrapper {...props}>
    <PhotoIcon className="w-full h-full"/>
  </IconWrapper>);
export const Video = (props) => (<IconWrapper {...props}>
    <VideoCameraIcon className="w-full h-full"/>
  </IconWrapper>);
export const Phone = (props) => (<IconWrapper {...props}>
    <PhoneIcon className="w-full h-full"/>
  </IconWrapper>);
export const Email = (props) => (<IconWrapper {...props}>
    <EnvelopeIcon className="w-full h-full"/>
  </IconWrapper>);
export const Notification = (props) => (<IconWrapper {...props}>
    <BellIcon className="w-full h-full"/>
  </IconWrapper>);
export const Settings = (props) => (<IconWrapper {...props}>
    <Cog6ToothIcon className="w-full h-full"/>
  </IconWrapper>);
export const Home = (props) => (<IconWrapper {...props}>
    <HomeIcon className="w-full h-full"/>
  </IconWrapper>);
export const Search = (props) => (<IconWrapper {...props}>
    <MagnifyingGlassIcon className="w-full h-full"/>
  </IconWrapper>);
export const Plus = (props) => (<IconWrapper {...props}>
    <PlusIcon className="w-full h-full"/>
  </IconWrapper>);
export const Minus = (props) => (<IconWrapper {...props}>
    <MinusIcon className="w-full h-full"/>
  </IconWrapper>);
export const Check = (props) => (<IconWrapper {...props}>
    <CheckIcon className="w-full h-full"/>
  </IconWrapper>);
export const Warning = (props) => (<IconWrapper {...props}>
    <ExclamationTriangleIcon className="w-full h-full"/>
  </IconWrapper>);
export const Info = (props) => (<IconWrapper {...props}>
    <InformationCircleIcon className="w-full h-full"/>
  </IconWrapper>);
export const Error = (props) => (<IconWrapper {...props}>
    <XCircleIcon className="w-full h-full"/>
  </IconWrapper>);
// Outline icons
export const HeartOutline = (props) => (<IconWrapper {...props}>
    <HeartOutline className="w-full h-full"/>
  </IconWrapper>);
export const XOutline = (props) => (<IconWrapper {...props}>
    <XOutline className="w-full h-full"/>
  </IconWrapper>);
export const StarOutline = (props) => (<IconWrapper {...props}>
    <StarOutline className="w-full h-full"/>
  </IconWrapper>);
export const SparklesOutline = (props) => (<IconWrapper {...props}>
    <SparklesOutline className="w-full h-full"/>
  </IconWrapper>);
export const RefreshOutline = (props) => (<IconWrapper {...props}>
    <ArrowPathOutline className="w-full h-full"/>
  </IconWrapper>);
export const UserOutline = (props) => (<IconWrapper {...props}>
    <UserOutline className="w-full h-full"/>
  </IconWrapper>);
export const ChatOutline = (props) => (<IconWrapper {...props}>
    <ChatOutline className="w-full h-full"/>
  </IconWrapper>);
export const LocationOutline = (props) => (<IconWrapper {...props}>
    <MapPinOutline className="w-full h-full"/>
  </IconWrapper>);
export const CameraOutline = (props) => (<IconWrapper {...props}>
    <CameraOutline className="w-full h-full"/>
  </IconWrapper>);
export const PhotoOutline = (props) => (<IconWrapper {...props}>
    <PhotoOutline className="w-full h-full"/>
  </IconWrapper>);
export const VideoOutline = (props) => (<IconWrapper {...props}>
    <VideoOutline className="w-full h-full"/>
  </IconWrapper>);
export const PhoneOutline = (props) => (<IconWrapper {...props}>
    <PhoneOutline className="w-full h-full"/>
  </IconWrapper>);
export const EmailOutline = (props) => (<IconWrapper {...props}>
    <EnvelopeOutline className="w-full h-full"/>
  </IconWrapper>);
export const NotificationOutline = (props) => (<IconWrapper {...props}>
    <BellOutline className="w-full h-full"/>
  </IconWrapper>);
export const SettingsOutline = (props) => (<IconWrapper {...props}>
    <CogOutline className="w-full h-full"/>
  </IconWrapper>);
export const HomeOutline = (props) => (<IconWrapper {...props}>
    <HomeOutline className="w-full h-full"/>
  </IconWrapper>);
export const SearchOutline = (props) => (<IconWrapper {...props}>
    <SearchOutline className="w-full h-full"/>
  </IconWrapper>);
export const PlusOutline = (props) => (<IconWrapper {...props}>
    <PlusOutline className="w-full h-full"/>
  </IconWrapper>);
export const MinusOutline = (props) => (<IconWrapper {...props}>
    <MinusOutline className="w-full h-full"/>
  </IconWrapper>);
export const CheckOutline = (props) => (<IconWrapper {...props}>
    <CheckOutline className="w-full h-full"/>
  </IconWrapper>);
export const WarningOutline = (props) => (<IconWrapper {...props}>
    <WarningOutline className="w-full h-full"/>
  </IconWrapper>);
export const InfoOutline = (props) => (<IconWrapper {...props}>
    <InfoOutline className="w-full h-full"/>
  </IconWrapper>);
export const ErrorOutline = (props) => (<IconWrapper {...props}>
    <ErrorOutline className="w-full h-full"/>
  </IconWrapper>);
// Icon collections for easy importing
export const Icons = {
    // Solid icons
    solid: {
        Heart,
        X,
        Star,
        Sparkles,
        Refresh,
        User,
        Chat,
        Location,
        Camera,
        Photo,
        Video,
        Phone,
        Email,
        Notification,
        Settings,
        Home,
        Search,
        Plus,
        Minus,
        Check,
        Warning,
        Info,
        Error,
    },
    // Outline icons
    outline: {
        Heart: HeartOutline,
        X: XOutline,
        Star: StarOutline,
        Sparkles: SparklesOutline,
        Refresh: RefreshOutline,
        User: UserOutline,
        Chat: ChatOutline,
        Location: LocationOutline,
        Camera: CameraOutline,
        Photo: PhotoOutline,
        Video: VideoOutline,
        Phone: PhoneOutline,
        Email: EmailOutline,
        Notification: NotificationOutline,
        Settings: SettingsOutline,
        Home: HomeOutline,
        Search: SearchOutline,
        Plus: PlusOutline,
        Minus: MinusOutline,
        Check: CheckOutline,
        Warning: WarningOutline,
        Info: InfoOutline,
        Error: ErrorOutline,
    },
};
// Utility functions
export const getIconSize = (size) => ICON_SIZES[size];
export const getIconColor = (color) => ICON_COLORS[color];
export default Icons;
//# sourceMappingURL=icons.jsx.map
//# sourceMappingURL=icons.jsx.map