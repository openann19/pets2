/**
 * 🎨 ICON SYSTEM
 * React components for Heroicons subset with consistent styling
 */
import React from 'react';
import { HeartIcon, XMarkIcon, StarIcon, SparklesIcon, ArrowPathIcon, UserIcon, ChatBubbleLeftRightIcon, MapPinIcon, CameraIcon, PhotoIcon, VideoCameraIcon, PhoneIcon, EnvelopeIcon, BellIcon, Cog6ToothIcon, HomeIcon, MagnifyingGlassIcon, PlusIcon, MinusIcon, CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowDownIcon, PlayIcon, PauseIcon, StopIcon, ForwardIcon, BackwardIcon, VolumeUpIcon, VolumeOffIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, LockOpenIcon, KeyIcon, ShieldCheckIcon, GlobeAltIcon, LanguageIcon, SunIcon, MoonIcon, ComputerDesktopIcon, AdjustmentsHorizontalIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon, CalendarIcon, ClockIcon, TagIcon, BookmarkIcon, ShareIcon, DownloadIcon, UploadIcon, DocumentIcon, FolderIcon, TrashIcon, PencilIcon, DocumentDuplicateIcon, ClipboardIcon, PrinterIcon, ArchiveBoxIcon, CubeIcon, GiftIcon, TrophyIcon, FireIcon, BoltIcon, LightBulbIcon, PuzzlePieceIcon, RocketLaunchIcon, BeakerIcon, WrenchIcon, PaintBrushIcon, ScissorsIcon, CursorArrowRaysIcon, HandRaisedIcon, FingerPrintIcon, QrCodeIcon, CreditCardIcon, BanknotesIcon, ReceiptPercentIcon, ShoppingCartIcon, ShoppingBagIcon, TruckIcon, BuildingStorefrontIcon, BuildingOfficeIcon, HomeModernIcon, BuildingLibraryIcon, AcademicCapIcon, BookOpenIcon, GraduationCapIcon, PresentationChartLineIcon, ChartBarIcon, ChartPieIcon, PresentationChartBarIcon, DocumentChartBarIcon, DocumentTextIcon, DocumentMagnifyingGlassIcon, MagnifyingGlassCircleIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, FunnelIcon as FunnelOutlineIcon, AdjustmentsHorizontalIcon as AdjustmentsOutlineIcon, Cog6ToothIcon as CogOutlineIcon, UserIcon as UserOutlineIcon, HeartIcon as HeartOutlineIcon, StarIcon as StarOutlineIcon, BookmarkIcon as BookmarkOutlineIcon, ShareIcon as ShareOutlineIcon, ChatBubbleLeftRightIcon as ChatOutlineIcon, BellIcon as BellOutlineIcon, HomeIcon as HomeOutlineIcon, MagnifyingGlassIcon as SearchOutlineIcon, PlusIcon as PlusOutlineIcon, MinusIcon as MinusOutlineIcon, CheckIcon as CheckOutlineIcon, ExclamationTriangleIcon as WarningOutlineIcon, InformationCircleIcon as InfoOutlineIcon, XCircleIcon as ErrorOutlineIcon, } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, XMarkIcon as XOutline, StarIcon as StarOutline, SparklesIcon as SparklesOutline, ArrowPathIcon as ArrowPathOutline, UserIcon as UserOutline, ChatBubbleLeftRightIcon as ChatOutline, MapPinIcon as MapPinOutline, CameraIcon as CameraOutline, PhotoIcon as PhotoOutline, VideoCameraIcon as VideoOutline, PhoneIcon as PhoneOutline, EnvelopeIcon as EnvelopeOutline, BellIcon as BellOutline, Cog6ToothIcon as CogOutline, HomeIcon as HomeOutline, MagnifyingGlassIcon as SearchOutline, PlusIcon as PlusOutline, MinusIcon as MinusOutline, CheckIcon as CheckOutline, ExclamationTriangleIcon as WarningOutline, InformationCircleIcon as InfoOutline, XCircleIcon as ErrorOutline, } from '@heroicons/react/24/outline';

// Icon size mapping
const ICON_SIZES = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
} as const;

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
} as const;

type IconSize = keyof typeof ICON_SIZES;
type IconColor = keyof typeof ICON_COLORS;

interface IconWrapperProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: IconSize;
  color?: IconColor;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  children: React.ReactNode;
}

// Base icon wrapper component
const IconWrapper: React.FC<IconWrapperProps> = ({
  size = 'md',
  color = 'neutral',
  className = '',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = true,
  children,
  ...rest
}) => {
    const sizeClass = ICON_SIZES[size];
    const colorClass = ICON_COLORS[color];
    return (
      <span
        className={`inline-flex items-center justify-center ${sizeClass} ${colorClass} ${className}`}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        {...rest}
      >
        {children}
      </span>
    );
};

// Solid icons
export const Heart: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <HeartIcon className="w-full h-full"/>
  </IconWrapper>
);

export const X: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <XMarkIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Star: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <StarIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Sparkles: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <SparklesIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Refresh: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <ArrowPathIcon className="w-full h-full"/>
  </IconWrapper>
);

export const User: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <UserIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Chat: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <ChatBubbleLeftRightIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Location: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <MapPinIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Camera: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <CameraIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Photo: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <PhotoIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Video: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <VideoCameraIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Phone: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <PhoneIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Email: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <EnvelopeIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Notification: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <BellIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Settings: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <Cog6ToothIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Home: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <HomeIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Search: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <MagnifyingGlassIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Plus: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <PlusIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Minus: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <MinusIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Check: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <CheckIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Warning: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <ExclamationTriangleIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Info: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <InformationCircleIcon className="w-full h-full"/>
  </IconWrapper>
);

export const Error: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <XCircleIcon className="w-full h-full"/>
  </IconWrapper>
);
// Outline icons
export const HeartOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <HeartOutline className="w-full h-full"/>
  </IconWrapper>
);

export const XOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <XOutline className="w-full h-full"/>
  </IconWrapper>
);

export const StarOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <StarOutline className="w-full h-full"/>
  </IconWrapper>
);

export const SparklesOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <SparklesOutline className="w-full h-full"/>
  </IconWrapper>
);

export const RefreshOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <ArrowPathOutline className="w-full h-full"/>
  </IconWrapper>
);

export const UserOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <UserOutline className="w-full h-full"/>
  </IconWrapper>
);

export const ChatOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <ChatOutline className="w-full h-full"/>
  </IconWrapper>
);

export const LocationOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <MapPinOutline className="w-full h-full"/>
  </IconWrapper>
);

export const CameraOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <CameraOutline className="w-full h-full"/>
  </IconWrapper>
);

export const PhotoOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <PhotoOutline className="w-full h-full"/>
  </IconWrapper>
);

export const VideoOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <VideoOutline className="w-full h-full"/>
  </IconWrapper>
);

export const PhoneOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <PhoneOutline className="w-full h-full"/>
  </IconWrapper>
);

export const EmailOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <EnvelopeOutline className="w-full h-full"/>
  </IconWrapper>
);

export const NotificationOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <BellOutline className="w-full h-full"/>
  </IconWrapper>
);

export const SettingsOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <CogOutline className="w-full h-full"/>
  </IconWrapper>
);

export const HomeOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <HomeOutline className="w-full h-full"/>
  </IconWrapper>
);

export const SearchOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <SearchOutline className="w-full h-full"/>
  </IconWrapper>
);

export const PlusOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <PlusOutline className="w-full h-full"/>
  </IconWrapper>
);

export const MinusOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <MinusOutline className="w-full h-full"/>
  </IconWrapper>
);

export const CheckOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <CheckOutline className="w-full h-full"/>
  </IconWrapper>
);

export const WarningOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <WarningOutline className="w-full h-full"/>
  </IconWrapper>
);

export const InfoOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <InfoOutline className="w-full h-full"/>
  </IconWrapper>
);

export const ErrorOutline: React.FC<Omit<IconWrapperProps, 'children'>> = (props) => (
  <IconWrapper {...props}>
    <ErrorOutline className="w-full h-full"/>
  </IconWrapper>
);
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
export const getIconSize = (size: IconSize): string => ICON_SIZES[size];
export const getIconColor = (color: IconColor): string => ICON_COLORS[color];
export default Icons;