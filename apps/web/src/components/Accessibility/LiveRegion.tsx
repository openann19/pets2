'use client';
import React from 'react';
export const LiveRegion = ({ message, priority = 'polite', role = 'status' }) => {
    if (!message)
        return null;
    return (<div role={role} aria-live={priority} aria-atomic="true" className="sr-only">
      {message}
    </div>);
};
export default LiveRegion;
//# sourceMappingURL=LiveRegion.jsx.map