import React from 'react';
import { motion, MotionProps } from 'framer-motion';
const FadeInUpDiv = ({ children, delay = 0, duration = 0.6, yOffset = 20, className = '', viewport = { once: true }, whileInView = false, }) => {
    const animationProps = whileInView
        ? {
            initial: { opacity: 0, y: yOffset },
            whileInView: { opacity: 1, y: 0 },
            viewport,
            transition: { duration, delay },
        }
        : {
            initial: { opacity: 0, y: yOffset },
            animate: { opacity: 1, y: 0 },
            transition: { duration, delay },
        };
    return (<motion.div className={className} {...animationProps}>
      {children}
    </motion.div>);
};
export default FadeInUpDiv;
//# sourceMappingURL=FadeInUpDiv.jsx.map
//# sourceMappingURL=FadeInUpDiv.jsx.map