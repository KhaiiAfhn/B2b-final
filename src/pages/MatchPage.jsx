import React, { useState, useEffect, useMemo, useRef } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
    import { Textarea } from "@/components/ui/textarea";
    import { Label } from "@/components/ui/label";
    import { X, Check, Briefcase, MapPin, Users, Search, RotateCcw, Info, Copy, Send, Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabase';
    import { generateInitialEmail } from '@/lib/emailUtils'; 
    import ProfileCard from '@/components/match/ProfileCard';
    import MatchEmailDialog from '@/components/match/MatchEmailDialog';
    import NoMoreProfilesCard from '@/components/match/NoMoreProfilesCard';

    const MatchPage = () => {
      const { toast } = useToast();
      const { currentUser, loadingAuth } = useAuth();
      const [profiles, setProfiles] = useState([]);
      const [currentIndex, setCurrentIndex] = useState(0);
      const [showDetails, setShowDetails] = useState(false);
      const [showEmailDialog, setShowEmailDialog] = useState(false);
      const [emailContent, setEmailContent] = useState('');
      const [targetEmailProfile, setTargetEmailProfile] = useState(null);
      const cardContainerRef = useRef(null);
      const [loadingProfiles, setLoadingProfiles] = useState(true);
      const [swiping, setSwiping] = useState(false); // To prevent multiple swipes

      useEffect(() => {
        const fetchProfiles = async () => {
          if (!currentUser || !currentUser.id) {
            setLoadingProfiles(false);
            return;
          }
          setLoadingProfiles(true);
          try {
            const { data: likedData, error: likedError } = await supabase
              .from('likes')
              .select('liked_profile_id')
              .eq('swiper_profile_id', currentUser.id);

            if (likedError) throw likedError;
            const likedProfileIds = likedData.map(l => l.liked_profile_id);
            
            const { data: matchedData, error: matchesError } = await supabase
              .from('matches')
              .select('profile_one_id, profile_two_id')
              .or(`profile_one_id.eq.${currentUser.id},profile_two_id.eq.${currentUser.id}`);

            if (matchesError) throw matchesError;
            const matchedPartnerIds = matchedData.map(m => m.profile_one_id === currentUser.id ? m.profile_two_id : m.profile_one_id);
            
            const excludedIds = [...new Set([...likedProfileIds, ...matchedPartnerIds])];


            const { data: allProfiles, error: profilesError } = await supabase
              .from('company_profiles')
              .select('*')
              .not('id', 'eq', currentUser.id)
              .not('id', 'in', `(${excludedIds.length > 0 ? excludedIds.map(id => `'${id}'`).join(',') : "'dummy_id_to_avoid_syntax_error'"})`);

            if (profilesError) throw profilesError;
            
            setProfiles(allProfiles || []);
            setCurrentIndex(0);
          } catch (error) {
            console.error("Error fetching profiles:", error);
            toast({ title: "Error", description: "Could not load profiles.", variant: "destructive" });
            setProfiles([]);
          } finally {
            setLoadingProfiles(false);
          }
        };

        if (!loadingAuth && currentUser) {
          fetchProfiles();
        } else if (!loadingAuth && !currentUser) {
          setLoadingProfiles(false);
        }
      }, [currentUser, loadingAuth, toast]);

      const currentProfile = useMemo(() => profiles[currentIndex], [profiles, currentIndex]);

      const handleSwipe = async (direction) => {
        if (!currentProfile || !currentUser || swiping) return;
        setSwiping(true);

        try {
          if (direction === 'right') {
            const { error: likeError } = await supabase.from('likes').insert({
              swiper_profile_id: currentUser.id,
              liked_profile_id: currentProfile.id,
            });
            if (likeError) throw likeError;

            const { data: theyLikedUs, error: checkMatchError } = await supabase
              .from('likes')
              .select('*')
              .eq('swiper_profile_id', currentProfile.id)
              .eq('liked_profile_id', currentUser.id)
              .maybeSingle();

            if (checkMatchError) throw checkMatchError;

            if (theyLikedUs) {
              const { error: matchInsertError } = await supabase.from('matches').insert({
                profile_one_id: currentUser.id,
                profile_two_id: currentProfile.id,
              }).select().single(); // Ensure it's a single record
              
              // Check for unique constraint violation (23505) for matches
              if (matchInsertError && matchInsertError.code !== '23505') { 
                throw matchInsertError;
              }
              
              toast({
                title: "It's a Match!",
                description: `You and ${currentProfile.company_name} both liked each other!`,
                variant: "default",
                duration: 3000,
              });
              
              setTargetEmailProfile(currentProfile);
              const generatedEmail = generateInitialEmail(currentUser, currentProfile);
              setEmailContent(generatedEmail);
              setShowEmailDialog(true);
            } else {
               toast({
                title: 'Liked!',
                description: `You liked ${currentProfile.company_name}.`,
                variant: 'default',
              });
            }
          } else { 
            toast({
              title: 'Passed',
              description: `You passed on ${currentProfile.company_name}.`,
              variant: 'destructive',
            });
          }
          
          if (direction === 'left' || (direction === 'right' && !targetEmailProfile)) {
              setShowDetails(false); 
              setCurrentIndex((prevIndex) => prevIndex + 1);
          }
        } catch (error) {
          console.error("Error handling swipe:", error);
          toast({ title: "Swipe Error", description: error.message, variant: "destructive" });
        } finally {
          setSwiping(false);
        }
      };
      
      const handleEmailDialogClose = () => {
        setShowEmailDialog(false);
        setTargetEmailProfile(null); 
        setShowDetails(false);
        setCurrentIndex((prevIndex) => prevIndex + 1); 
      };

      const copyEmailToClipboard = () => {
        navigator.clipboard.writeText(emailContent);
        toast({ title: "Email Copied!", description: "The draft email has been copied." });
      };

      const simulateSendEmail = () => {
        toast({ title: "Email Sent (Simulated)", description: `Your email to ${targetEmailProfile?.company_name} "sent".` });
        handleEmailDialogClose();
      };

      const dragConstraints = useMemo(() => {
        if (cardContainerRef.current) {
          const containerWidth = cardContainerRef.current.offsetWidth;
          return { left: -containerWidth / 1.5, right: containerWidth / 1.5, top: 0, bottom: 0 };
        }
        return { left: -200, right: 200, top: 0, bottom: 0 };
      }, []);

      const swipeThreshold = 60; 

      const onDragEnd = (event, info) => {
        if (swiping) return;
        const { offset, velocity } = info;
        const swipePower = Math.abs(offset.x) * velocity.x;

        if (swipePower < -swipeThreshold * 80 || offset.x < -swipeThreshold) {
          handleSwipe('left');
        } else if (swipePower > swipeThreshold * 80 || offset.x > swipeThreshold) {
          handleSwipe('right');
        }
      };
      
      const resetSwipes = async () => {
        if(!currentUser || !currentUser.id) return;
        setLoadingProfiles(true);
        try {
            const { error: deleteLikesError } = await supabase
                .from('likes')
                .delete()
                .eq('swiper_profile_id', currentUser.id);
            if (deleteLikesError) throw deleteLikesError;

            const { error: deleteMatchesError } = await supabase
                .from('matches')
                .delete()
                .or(`profile_one_id.eq.${currentUser.id},profile_two_id.eq.${currentUser.id}`);
            if (deleteMatchesError) throw deleteMatchesError;

            const { data: allProfiles, error: profilesError } = await supabase
              .from('company_profiles')
              .select('*')
              .not('id', 'eq', currentUser.id);
            if (profilesError) throw profilesError;
            
            setProfiles(allProfiles || []);
            setCurrentIndex(0);
            setShowDetails(false);
            toast({ title: "Swipes Reset", description: "You can now re-evaluate profiles." });
        } catch (error) {
            console.error("Error resetting swipes:", error);
            toast({ title: "Error Resetting", description: error.message, variant: "destructive" });
        } finally {
            setLoadingProfiles(false);
        }
      };

      if (loadingAuth || loadingProfiles) {
        return <div className="text-center py-10 text-xl text-gray-300 flex justify-center items-center"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading profiles...</div>;
      }

      if (!currentUser) {
        return <div className="text-center py-10 text-xl text-gray-300">Please log in to discover profiles.</div>;
      }
      
      if (profiles.length === 0 || currentIndex >= profiles.length) {
        return <NoMoreProfilesCard onResetSwipes={resetSwipes} />;
      }

      return (
        <div ref={cardContainerRef} className="flex flex-col items-center justify-center p-2 xxs:p-3 sm:p-4 relative min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-16rem)] w-full overflow-hidden">
          <AnimatePresence>
            {currentProfile && (
              <ProfileCard
                profile={currentProfile}
                dragConstraints={dragConstraints}
                onDragEnd={onDragEnd}
                showDetails={showDetails}
                setShowDetails={setShowDetails}
                onSwipe={handleSwipe}
                isSwiping={swiping}
                targetEmailProfileId={targetEmailProfile?.id}
              />
            )}
          </AnimatePresence>
          {profiles.length > 0 && currentIndex < profiles.length && (
            <div className="mt-2 xxs:mt-3 sm:mt-4 text-[10px] xxs:text-xs sm:text-sm text-gray-400">
              Profile {currentIndex + 1} of {profiles.length}
            </div>
          )}
           <Button onClick={resetSwipes} variant="outline" size="icon" className="absolute bottom-1 right-1 xxs:bottom-2 xxs:right-2 sm:bottom-4 sm:right-4 text-pink-400 border-pink-500 hover:bg-pink-500/10 hover:text-pink-300 h-7 w-7 xxs:h-8 xxs:w-8 sm:h-9 sm:w-9" disabled={loadingProfiles || swiping}>
              {loadingProfiles ? <Loader2 className="h-4 w-4 animate-spin"/> : <RotateCcw className="h-3 w-3 xxs:h-4 xxs:w-4 sm:h-4 sm:w-4" />}
              <span className="sr-only">Reset Swipes</span>
            </Button>

            <MatchEmailDialog
                isOpen={showEmailDialog}
                onClose={handleEmailDialogClose}
                emailContent={emailContent}
                setEmailContent={setEmailContent}
                targetProfile={targetEmailProfile}
                onCopy={copyEmailToClipboard}
                onSend={simulateSendEmail}
            />
        </div>
      );
    };

    export default MatchPage;
