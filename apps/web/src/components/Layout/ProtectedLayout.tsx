import React from 'react';
import Header from './Header';
const ProtectedLayout = ({ children, showHeader = true }) => {
    return (<>
      {showHeader && <Header />}
      {children}
    </>);
};
export default ProtectedLayout;
//# sourceMappingURL=ProtectedLayout.jsx.map
//# sourceMappingURL=ProtectedLayout.jsx.map