import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Search, RotateCcw } from 'lucide-react';

    const NoMoreProfilesCard = ({ onResetSwipes }) => {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-16rem)] text-center p-4">
          <Search className="w-16 h-16 sm:w-24 sm:h-24 text-pink-500 mb-4 sm:mb-6" />
          <h2 className="text-xl sm:text-3xl font-semibold text-gray-100 mb-2 sm:mb-4">No More Profiles</h2>
          <p className="text-xs sm:text-base text-gray-400 mb-3 sm:mb-6">You've seen all available profiles for now. Check back later or reset swipes.</p>
          <Button onClick={onResetSwipes} variant="outline" size="sm" className="text-pink-400 border-pink-500 hover:bg-pink-500/10 hover:text-pink-300 text-xs sm:text-sm">
            <RotateCcw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Reset Swipes
          </Button>
        </div>
      );
    };

    export default NoMoreProfilesCard;
