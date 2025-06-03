import React from 'react';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, Zap, Users, Target } from 'lucide-react';

    const HomePage = () => {
      const featuredCompanyImages = [
        { alt: "Business professionals networking at a conference", query: "Business professionals networking conference" },
        { alt: "Team collaborating in a modern office environment", query: "Team collaboration modern office" },
        { alt: "Diverse group of people in a business meeting", query: "Diverse business meeting" },
        { alt: "Creative workspace with laptops and coffee", query: "Creative workspace laptops coffee" },
      ];

      return (
        <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-4">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6">
              Welcome to <span className="gradient-text">B2B Connect</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              The revolutionary platform connecting businesses. Swipe right for synergy, swipe left for next. Find your next B2B partner with ease.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "backOut" }}
            className="mb-12"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300">
              <Link to="/register" className="flex items-center">
                Get Started Now <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
            {[
              { icon: <Zap className="w-12 h-12 text-yellow-400" />, title: "Instant Connections", description: "Quickly find and connect with relevant businesses." },
              { icon: <Target className="w-12 h-12 text-green-400" />, title: "AI-Powered Matching", description: "Our smart algorithm suggests the best potential partners." },
              { icon: <Users className="w-12 h-12 text-blue-400" />, title: "Grow Your Network", description: "Expand your professional circle and discover new opportunities." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                className="bg-slate-800/70 p-8 rounded-xl shadow-2xl border border-slate-700 hover:border-pink-500 transition-colors duration-300"
              >
                <div className="flex justify-center mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-100">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-16 w-full max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-gray-100">See Who's Connecting</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                <img  alt={featuredCompanyImages[0].alt} class="h-full w-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110" src="https://images.unsplash.com/photo-1592181572975-1d0d8880d175" />
              </div>
              <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                <img  alt={featuredCompanyImages[1].alt} class="h-full w-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110" src="https://images.unsplash.com/photo-1592181572975-1d0d8880d175" />
              </div>
              <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                <img  alt={featuredCompanyImages[2].alt} class="h-full w-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110" src="https://images.unsplash.com/photo-1592181572975-1d0d8880d175" />
              </div>
              <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                <img  alt={featuredCompanyImages[3].alt} class="h-full w-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110" src="https://images.unsplash.com/photo-1592181572975-1d0d8880d175" />
              </div>
            </div>
          </motion.div>

        </div>
      );
    };

    export default HomePage;