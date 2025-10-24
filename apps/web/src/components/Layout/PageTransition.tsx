import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        y: -20,
        scale: 1.02
    }
};
const pageTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8
};
const PageTransition = ({ children }) => {
    const pathname = usePathname();
    return (<AnimatePresence mode="wait">
      <motion.div key={pathname} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="h-full w-full">
        {children}
      </motion.div>
    </AnimatePresence>);
};
export default PageTransition;
//# sourceMappingURL=PageTransition.jsx.map
//# sourceMappingURL=PageTransition.jsx.map