import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_CONFIG } from '@/constants/animations';
const HoloLogo = ({ size = 44, withText = true, monochrome = false }) => {
    const emblemSize = size;
    return (<motion.div className="flex items-center gap-2 select-none" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_CONFIG.standard}>
      {/* Heart with Paws Logo */}
      <div className="relative" style={{ width: emblemSize, height: emblemSize }} aria-hidden="true">
        <svg className="text-white drop-shadow-lg" viewBox="0 0 100 100" width={emblemSize} height={emblemSize} role="img" aria-label="Heart with paws logo" fill="currentColor" stroke="none">
          <path d="M50,95 C-20,45 25,-10 50,25 C75,-10 120,45 50,95 Z M66,35 C62.7,35 60,37.7 60,41 C60,44.3 62.7,47 66,47 C69.3,47 72,44.3 72,41 C72,37.7 69.3,35 66,35 Z M80,48 C77.2,48 75,50.2 75,53 C75,55.8 77.2,58 80,58 C82.8,58 85,55.8 85,53 C85,50.2 82.8,48 80,48 Z M71,60 C67.7,60 65,62.7 65,66 C65,69.3 67.7,72 71,72 C74.3,72 77,69.3 77,66 C77,62.7 74.3,60 71,60 Z M52,48 C49.2,48 47,50.2 47,53 C47,55.8 49.2,58 52,58 C54.8,58 57,55.8 57,53 C57,50.2 54.8,48 52,48 Z M68,52 C58.1,52 50,60.1 50,70 C50,82 68,85 68,85 C68,85 86,82 86,70 C86,60.1 77.9,52 68,52 Z"/>
        </svg>
      </div>

      {withText && (<div className="relative">
          <motion.span className="block text-xl font-bold tracking-tight text-white/95" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_CONFIG.standard}>
            Pawfect<span className="text-pink-300">Match</span>
          </motion.span>
        </div>)}
    </motion.div>);
};
export default HoloLogo;
//# sourceMappingURL=HoloLogo.jsx.map