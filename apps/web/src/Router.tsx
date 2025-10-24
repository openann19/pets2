import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './providers/NotificationProvider';
import { WeatherProvider } from './providers/WeatherProvider';
// Simple router component
const AppRouter = () => {
    return (<Router>
      <AuthProvider>
        <NotificationProvider>
          <WeatherProvider>
            <Routes>
              <Route path="/" element={<div>Home</div>}/>
              {/* Add more routes as needed */}
            </Routes>
          </WeatherProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>);
};
export default AppRouter;
//# sourceMappingURL=Router.jsx.map
//# sourceMappingURL=Router.jsx.map