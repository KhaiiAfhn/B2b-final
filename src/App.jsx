import React from 'react';
    import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import HomePage from '@/pages/HomePage';
    import RegisterPage from '@/pages/RegisterPage';
    import MatchPage from '@/pages/MatchPage';
    import ProfilePage from '@/pages/ProfilePage';
    import MatchesListPage from '@/pages/MatchesListPage';
    import ChatbotPage from '@/pages/ChatbotPage'; 
    import { Toaster } from '@/components/ui/toaster';
    import { AuthProvider, useAuth } from '@/contexts/AuthContext';

    function ProtectedRoute({ children }) {
      const { currentUser, loadingAuth } = useAuth();
      
      if (loadingAuth) {
        return <div>Loading...</div>; // Or a proper loading spinner
      }

      if (!currentUser) {
        return <Navigate to="/register" replace />;
      }
      return children;
    }

    function App() {
      return (
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/match" 
                  element={
                    <ProtectedRoute>
                      <MatchPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/matches" 
                  element={
                    <ProtectedRoute>
                      <MatchesListPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chatbot" 
                  element={
                    <ProtectedRoute>
                      <ChatbotPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Layout>
            <Toaster />
          </Router>
        </AuthProvider>
      );
    }

    export default App;