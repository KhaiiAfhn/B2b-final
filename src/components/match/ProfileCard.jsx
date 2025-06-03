import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { X, Check, Briefcase, MapPin, Users, Info, Loader2 } from 'lucide-react';

    const ProfileCard = ({ profile, dragConstraints, onDragEnd, showDetails, setShowDetails, onSwipe, isSwiping, targetEmailProfileId }) => {
      if (!profile) return null;

      return (
        <motion.div
          key={profile.id}
          drag="x"
          dragConstraints={dragConstraints}
          onDragEnd={onDragEnd}
          dragElastic={0.6}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ 
            opacity: 0, 
            x: profile.id === targetEmailProfileId ? 0 : (info) => info && info.offset && info.offset.x > 0 ? dragConstraints.right * 1.5 : dragConstraints.left * 1.5,
            scale: 0.85,
            transition: { duration: 0.2 }
          }}
          transition={{ type: 'spring', stiffness: 220, damping: 30 }}
          className="w-full max-w-[340px] xxs:max-w-sm sm:max-w-md cursor-grab active:cursor-grabbing touch-pan-y"
        >
          <Card className="bg-slate-800 border-slate-700 shadow-2xl overflow-hidden select-none">
            <CardHeader className="p-0 relative">
              <div className="w-full h-40 xxs:h-48 sm:h-64 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt={`${profile.company_name} logo`} className="object-contain h-24 w-24 xxs:h-32 xxs:w-32 sm:h-40 sm:w-40 p-1 sm:p-2 bg-white/10 rounded-lg backdrop-blur-sm" />
                ) : (
                  <Briefcase className="w-20 h-20 xxs:w-24 xxs:h-24 sm:w-32 sm:h-32 text-white/70" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 xxs:p-3 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
                <CardTitle className="text-xl xxs:text-2xl sm:text-3xl font-bold text-white shadow-black [text-shadow:_0_1px_3px_var(--tw-shadow-color)]">{profile.company_name}</CardTitle>
                <CardDescription className="text-pink-300 font-medium text-xs xxs:text-sm sm:text-base">{profile.industry}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-2 xxs:p-3 sm:p-6 space-y-2 xxs:space-y-3">
              <div className="flex items-center text-gray-300 text-[11px] xxs:text-xs sm:text-sm">
                <MapPin className="w-3 h-3 xxs:w-4 xxs:h-4 sm:w-5 sm:h-5 mr-1 xxs:mr-2 sm:mr-3 text-pink-400" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center text-gray-300 text-[11px] xxs:text-xs sm:text-sm">
                <Users className="w-3 h-3 xxs:w-4 xxs:h-4 sm:w-5 sm:h-5 mr-1 xxs:mr-2 sm:mr-3 text-pink-400" />
                <span>{profile.company_size}</span>
              </div>
              <div className="text-gray-300 text-[11px] xxs:text-xs sm:text-sm">
                <p className="font-semibold text-pink-400 mb-0.5 xxs:mb-1">About Us:</p>
                <p className={`whitespace-pre-wrap ${showDetails ? '' : 'line-clamp-2 xxs:line-clamp-2 sm:line-clamp-3'}`}>{profile.description}</p>
              </div>
              {profile.looking_for && profile.looking_for.length > 0 && (
                <div className="text-gray-300 text-[11px] xxs:text-xs sm:text-sm">
                  <p className="font-semibold text-pink-400 mb-0.5 xxs:mb-1">Looking For:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.looking_for.slice(0, 3).map(item => (
                      <span key={item} className="px-1.5 py-0.5 xxs:px-2 sm:px-3 sm:py-1 bg-slate-700 text-[9px] xxs:text-[10px] sm:text-xs rounded-full text-pink-300">{item}</span>
                    ))}
                    {profile.looking_for.length > 3 && <span className="px-1.5 py-0.5 xxs:px-2 sm:px-3 sm:py-1 bg-slate-700 text-[9px] xxs:text-[10px] sm:text-xs rounded-full text-pink-300">+{profile.looking_for.length - 3} more</span>}
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="w-full text-pink-400 border-pink-500 hover:bg-pink-500/10 hover:text-pink-300 text-[10px] xxs:text-xs sm:text-sm py-1 xxs:py-1.5">
                <Info className="mr-1 xxs:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {showDetails ? 'Show Less' : 'Show More'}
              </Button>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 p-2 xxs:p-3 sm:p-6 pt-0">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => onSwipe('left')}
                className="bg-red-500/80 hover:bg-red-600 text-white text-sm xxs:text-base sm:text-lg py-2 sm:py-3 h-10 xxs:h-11 sm:h-12"
                disabled={isSwiping}
              >
                {isSwiping === 'left' ? <Loader2 className="h-5 w-5 animate-spin" /> : <><X className="mr-1 h-4 w-4 xxs:h-5 xxs:w-5 sm:h-6 sm:w-6" /> Pass</>}
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={() => onSwipe('right')}
                className="bg-green-500/80 hover:bg-green-600 text-white text-sm xxs:text-base sm:text-lg py-2 sm:py-3 h-10 xxs:h-11 sm:h-12"
                disabled={isSwiping}
              >
                 {isSwiping === 'right' ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="mr-1 h-4 w-4 xxs:h-5 xxs:w-5 sm:h-6 sm:w-6" /> Like</>}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default ProfileCard;
