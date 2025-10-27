'use client';
import React from 'react';
/**
 * Utility component to test responsive design across different screen sizes
 */
export function ResponsiveTest() {
    return (<div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-sm backdrop-blur-md border border-white/20">
      <div className="font-bold mb-2">📱 Responsive Test</div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Mobile: 0-768px</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Tablet: 768-1024px</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Desktop: 1024px+</span>
        </div>
      </div>
    </div>);
}
/**
 * Hook to detect current screen size
 */
export function useScreenSize() {
    const [screenSize, setScreenSize] = React.useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
    });
    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setScreenSize({
                width,
                height,
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
            });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); };
    }, []);
    return screenSize;
}
/**
 * Utility to generate responsive class names
 */
export function responsiveClass(baseClass, mobileClass, tabletClass, desktopClass) {
    const classes = [baseClass];
    if (mobileClass) {
        classes.push(mobileClass);
    }
    if (tabletClass) {
        classes.push(`md:${tabletClass}`);
    }
    if (desktopClass) {
        classes.push(`lg:${desktopClass}`);
    }
    return classes.join(' ');
}
/**
 * Component to test button responsiveness
 */
export function ButtonResponsiveTest() {
    const screenSize = useScreenSize();
    return (<div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <h3 className="text-lg font-bold">Button Responsive Test</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Small Button */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h4 className="font-semibold mb-2">Small Button</h4>
          <button className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Small Action
          </button>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Mobile: px-3 py-2 text-sm
          </div>
        </div>
        
        {/* Medium Button */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h4 className="font-semibold mb-2">Medium Button</h4>
          <button className="px-4 py-3 text-base bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Medium Action
          </button>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Mobile: px-4 py-3 text-base
          </div>
        </div>
        
        {/* Large Button */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h4 className="font-semibold mb-2">Large Button</h4>
          <button className="px-6 py-4 text-lg bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            Large Action
          </button>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Mobile: px-6 py-4 text-lg
          </div>
        </div>
      </div>
      
      {/* Screen Size Info */}
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
        <h4 className="font-semibold mb-2">Current Screen Size</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Width:</span> {screenSize.width}px
          </div>
          <div>
            <span className="font-medium">Height:</span> {screenSize.height}px
          </div>
          <div>
            <span className="font-medium">Type:</span> 
            {screenSize.isMobile && ' 📱 Mobile'}
            {screenSize.isTablet && ' 📟 Tablet'}
            {screenSize.isDesktop && ' 💻 Desktop'}
          </div>
          <div>
            <span className="font-medium">Breakpoint:</span>
            {screenSize.isMobile && ' < 768px'}
            {screenSize.isTablet && ' 768-1024px'}
            {screenSize.isDesktop && ' > 1024px'}
          </div>
        </div>
      </div>
    </div>);
}
/**
 * Component to test card responsiveness
 */
export function CardResponsiveTest() {
    return (<div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <h3 className="text-lg font-bold">Card Responsive Test</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (<div key={item} className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-3"></div>
            <h4 className="font-semibold text-sm sm:text-base">Card {item}</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Responsive card that adapts to screen size
            </p>
            <div className="mt-3 flex gap-2">
              <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Action
              </button>
              <button className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>))}
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>• Mobile: 1 column (grid-cols-1)</p>
        <p>• Tablet: 2 columns (sm:grid-cols-2)</p>
        <p>• Desktop: 4 columns (lg:grid-cols-4)</p>
      </div>
    </div>);
}
/**
 * Component to test swipe card responsiveness
 */
export function SwipeCardResponsiveTest() {
    return (<div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <h3 className="text-lg font-bold">Swipe Card Responsive Test</h3>
      
      <div className="max-w-sm mx-auto md:max-w-md lg:max-w-lg">
        <div className="bg-white dark:bg-gray-700 rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-600">
          {/* Image Section */}
          <div className="h-64 bg-gradient-to-br from-pink-400 to-purple-500 relative">
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold">Pet Name</h3>
              <p className="text-sm opacity-90">2 years old</p>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="p-6">
            <div className="flex justify-between text-sm mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Breed</p>
                <p className="font-semibold">Golden Retriever</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Size</p>
                <p className="font-semibold">Large</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Friendly and energetic golden retriever looking for a loving home.
            </p>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-3 sm:gap-4">
              <button className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                ✕
              </button>
              <button className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors">
                ⭐
              </button>
              <button className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
                ♥
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        <p>• Mobile: max-w-sm, smaller buttons (w-12 h-12)</p>
        <p>• Tablet: max-w-md, medium buttons (sm:w-14 sm:h-14)</p>
        <p>• Desktop: max-w-lg, standard buttons</p>
      </div>
    </div>);
}
//# sourceMappingURL=responsive-test.jsx.map