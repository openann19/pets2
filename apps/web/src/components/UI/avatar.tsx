import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
const Avatar = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props}/>));
Avatar.displayName = 'Avatar';
const AvatarImage = React.forwardRef(({ className, alt = '', src, width = 40, height = 40 }, ref) => (<div ref={ref}>
      <Image src={src} className={cn('aspect-square h-full w-full', className)} alt={alt} width={width} height={height}/>
    </div>));
AvatarImage.displayName = 'AvatarImage';
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)} {...props}/>));
AvatarFallback.displayName = 'AvatarFallback';
export { Avatar, AvatarImage, AvatarFallback };
//# sourceMappingURL=avatar.jsx.map
//# sourceMappingURL=avatar.jsx.map