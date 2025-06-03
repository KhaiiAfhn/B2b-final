import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Briefcase, Users, UserCircle, LogIn, LogOut, FolderHeart as HomeIcon, Search, MessageCircle as ChatbotIcon } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';

    const Layout = ({ children }) => {
      const location = useLocation();
      const { currentUser, logout } = useAuth();
      const { toast } = useToast();

      const navItems = [
        { path: '/', label: 'Home', icon: <HomeIcon className="w-5 h-5 xxs:w-4 xxs:h-4 sm:w-4 sm:h-4" /> },
        ...(currentUser ? [
          { path: '/match', label: 'Discover', icon: <Search className="w-5 h-5 xxs:w-4 xxs:h-4 sm:w-4 sm:h-4" /> },
          { path: '/matches', label: 'Matches', icon: <Users className="w-5 h-5 xxs:w-4 xxs:h-4 sm:w-4 sm:h-4" /> },
          { path: '/chatbot', label: 'Assistant', icon: <ChatbotIcon className="w-5 h-5 xxs:w-4 xxs:h-4 sm:w-4 sm:h-4" /> },
          { path: '/profile', label: 'Profile', icon: <UserCircle className="w-5 h-5 xxs:w-4 xxs:h-4 sm:w-4 sm:h-4" /> },
        ] : [
          { path: '/register', label: 'Login', icon: <LogIn className="w-5 h-5 xxs:w-4 xxs:h-4 sm:w-4 sm:h-4" /> },
        ]),
      ];

      const handleLogout = async () => {
        try {
          await logout();
          toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
            variant: "default",
          });
        } catch (error) {
          toast({
            title: "Logout Failed",
            description: error.message || "An error occurred during logout.",
            variant: "destructive",
          });
        }
      };

      return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100">
          <header className="sticky top-0 z-50 shadow-lg bg-slate-900/80 backdrop-blur-md">
            <nav className="container mx-auto px-2 xxs:px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <Briefcase className="w-7 h-7 xxs:w-8 xxs:h-8 sm:w-10 sm:h-10 text-pink-500" />
                <h1 className="text-xl xxs:text-2xl sm:text-3xl font-bold gradient-text">B2B Connect</h1>
              </Link>
              <div className="flex items-center space-x-0 xxs:space-x-1 sm:space-x-2">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                    asChild
                    size="sm"
                    className={`px-1 py-1 xxs:px-2 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ease-in-out hover:bg-pink-500/20 ${location.pathname === item.path ? 'bg-pink-500/30 text-pink-400' : 'text-gray-300 hover:text-pink-400'}`}
                  >
                    <Link to={item.path} className="flex flex-col items-center space-y-0 xxs:space-y-0.5 sm:flex-row sm:space-y-0 sm:space-x-2">
                      {item.icon}
                      <span className="hidden xxs:inline text-[9px] xxs:text-[10px] sm:text-sm">{item.label}</span>
                    </Link>
                  </Button>
                ))}
                {currentUser && (
                   <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="px-1 py-1 xxs:px-2 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ease-in-out hover:bg-red-500/20 text-gray-300 hover:text-red-400 flex flex-col items-center space-y-0 xxs:space-y-0.5 sm:flex-row sm:space-y-0 sm:space-x-2"
                  >
                    <LogOut className="w-5 h-5 xxs:w-4 xxs:h-4 sm:w-4 sm:h-4" />
                    <span className="hidden xxs:inline text-[9px] xxs:text-[10px] sm:text-sm">Logout</span>
                  </Button>
                )}
              </div>
            </nav>
          </header>
          
          <main className="flex-grow container mx-auto px-2 sm:px-4 lg:px-6 py-3 xxs:py-4 sm:py-8 w-full">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </main>

          <footer className="bg-slate-900/80 py-4 xxs:py-6 sm:py-8 text-center text-gray-400">
            <div className="container mx-auto px-2 sm:px-6 lg:px-8">
              <p className="text-[10px] xxs:text-[11px] sm:text-sm">
                &copy; {new Date().getFullYear()} B2B Connect. All rights reserved.
              </p>
              <p className="text-[8px] xxs:text-[9px] sm:text-xs mt-1">
                Connecting Businesses, One Swipe at a Time.
              </p>
            </div>
          </footer>
        </div>
      );
    };

    export default Layout;