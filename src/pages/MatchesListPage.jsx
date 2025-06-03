import React, { useState, useEffect, useRef } from 'react';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { useAuth } from '@/contexts/AuthContext';
    import { Users, MessageSquare, Search, Send as SendIcon, Zap as AiIcon, Loader2 } from 'lucide-react';
    import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabase';

    const ChatMessage = ({ text, isSender, time, isAI }) => (
      <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2 xxs:mb-3`}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`max-w-[75%] p-2 xxs:p-3 rounded-lg shadow-md ${isAI ? 'bg-purple-600 text-white' : isSender ? 'bg-pink-600 text-white' : 'bg-slate-700 text-gray-200'}`}>
          {isAI && <p className="text-[10px] xxs:text-xs font-semibold text-purple-200 mb-0.5 xxs:mb-1">AI Assistant</p>}
          <p className="text-xs xxs:text-sm whitespace-pre-wrap">{text}</p>
          <p className={`text-[9px] xxs:text-xs mt-1 ${isAI ? 'text-purple-300' : isSender ? 'text-pink-200' : 'text-gray-400'} text-right`}>{time}</p>
        </motion.div>
      </div>
    );

    const MatchesListPage = () => {
      const { currentUser, loadingAuth } = useAuth();
      const { toast } = useToast();
      const [matchedProfilesDetails, setMatchedProfilesDetails] = useState([]);
      const [loadingMatches, setLoadingMatches] = useState(true);
      const [showChatModal, setShowChatModal] = useState(false);
      const [selectedChatProfile, setSelectedChatProfile] = useState(null);
      const [currentMatchId, setCurrentMatchId] = useState(null);
      const [chatMessages, setChatMessages] = useState([]);
      const [currentMessage, setCurrentMessage] = useState('');
      const [sendingMessage, setSendingMessage] = useState(false);
      const chatMessagesEndRef = useRef(null);

      useEffect(() => {
        const fetchMatchesAndProfiles = async () => {
          if (!currentUser || !currentUser.id) {
            setLoadingMatches(false);
            return;
          }
          setLoadingMatches(true);
          try {
            // Fetch match records where the current user is either profile_one_id or profile_two_id
            const { data: matchesData, error: matchesError } = await supabase
              .from('matches')
              .select('*, profile_one_id(id, company_name, industry, logo_url, description, looking_for), profile_two_id(id, company_name, industry, logo_url, description, looking_for)')
              .or(`profile_one_id.eq.${currentUser.id},profile_two_id.eq.${currentUser.id}`);

            if (matchesError) throw matchesError;

            const profiles = matchesData.map(match => {
              const otherProfile = match.profile_one_id.id === currentUser.id ? match.profile_two_id : match.profile_one_id;
              return { ...otherProfile, match_id: match.id }; // Add match_id for chat
            });
            
            setMatchedProfilesDetails(profiles);
          } catch (error) {
            console.error("Error fetching matches:", error);
            toast({ title: "Error", description: "Could not load your connections.", variant: "destructive" });
          } finally {
            setLoadingMatches(false);
          }
        };

        if (!loadingAuth && currentUser) {
          fetchMatchesAndProfiles();
        } else if (!loadingAuth && !currentUser) {
           setLoadingMatches(false);
        }
      }, [currentUser, loadingAuth, toast]);
      
      useEffect(() => {
        if (showChatModal && chatMessagesEndRef.current) {
          chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, [chatMessages, showChatModal]);

      const fetchChatMessages = async (matchId) => {
        if (!matchId) return;
        try {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: true });
          if (error) throw error;
          setChatMessages(data || []);
        } catch (error) {
          console.error("Error fetching chat messages:", error);
          toast({ title: "Chat Error", description: "Could not load messages.", variant: "destructive" });
        }
      };

      useEffect(() => {
        if (selectedChatProfile && currentMatchId) {
          fetchChatMessages(currentMatchId);

          const channel = supabase.channel(`chat:${currentMatchId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `match_id=eq.${currentMatchId}` }, payload => {
              setChatMessages(prevMessages => [...prevMessages, payload.new]);
            })
            .subscribe();
          
          return () => {
            supabase.removeChannel(channel);
          };
        }
      }, [selectedChatProfile, currentMatchId]);


      const generateAIChatOpening = async (targetCompany, matchIdForAI) => {
        if (!currentUser || !targetCompany || !matchIdForAI) return;
        setSendingMessage(true);
        try {
          const now = new Date();
          const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const aiMessages = [
            { match_id: matchIdForAI, sender_profile_id: currentUser.id, receiver_profile_id: targetCompany.id, message_text: `Hello ${targetCompany.company_name} team! I'm the AI assistant for ${currentUser.company_name}. We're very interested in your work in ${targetCompany.industry}.`, is_ai_message: true, created_at: now.toISOString() },
            { match_id: matchIdForAI, sender_profile_id: currentUser.id, receiver_profile_id: targetCompany.id, message_text: `${currentUser.company_name} is looking for ${(currentUser.looking_for || []).join(', ')} and we see a potential synergy. Would you be open to a quick chat?`, is_ai_message: true, created_at: new Date(now.getTime() + 1000).toISOString() }, // ensure distinct timestamp
          ];

          const { error } = await supabase.from('chat_messages').insert(aiMessages);
          if (error) throw error;

          toast({ title: "AI Contact Initiated!", description: `AI has messaged ${targetCompany.company_name}.`, variant: "default" });
        } catch (error) {
          console.error("Error sending AI message:", error);
          toast({ title: "AI Error", description: error.message, variant: "destructive" });
        } finally {
            setSendingMessage(false);
        }
      };


      const handleOpenChat = (profile) => {
        setSelectedChatProfile(profile);
        setCurrentMatchId(profile.match_id); // profile now includes match_id
        setShowChatModal(true);
        setCurrentMessage(''); 
      };
      
      const handleSendMessage = async () => {
        if (!currentMessage.trim() || !selectedChatProfile || !currentUser || !currentMatchId || sendingMessage) return;
        setSendingMessage(true);

        const newMessageObj = {
          match_id: currentMatchId,
          sender_profile_id: currentUser.id,
          receiver_profile_id: selectedChatProfile.id,
          message_text: currentMessage.trim(),
          is_ai_message: false,
        };

        try {
          const { error } = await supabase.from('chat_messages').insert(newMessageObj);
          if (error) throw error;
          setCurrentMessage('');
        } catch (error) {
          console.error("Error sending message:", error);
          toast({ title: "Send Error", description: "Could not send message.", variant: "destructive" });
        } finally {
          setSendingMessage(false);
        }
      };


      if (loadingAuth || loadingMatches) {
        return <div className="text-center py-10 text-lg xxs:text-xl text-gray-300 flex justify-center items-center"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading connections...</div>;
      }

      if (!currentUser) {
        return <div className="text-center py-10 text-lg xxs:text-xl text-gray-300">Please log in to view your connections.</div>;
      }

      if (matchedProfilesDetails.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-16rem)] text-center p-4">
            <Users className="w-16 h-16 xxs:w-20 xxs:h-20 sm:w-24 sm:h-24 text-pink-500 mb-4 sm:mb-6" />
            <h2 className="text-xl xxs:text-2xl sm:text-3xl font-semibold text-gray-100 mb-3 sm:mb-4">No Connections Yet</h2>
            <p className="text-xs xxs:text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">Keep swiping to find your B2B connections!</p>
            <Button asChild size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs xxs:text-sm">
              <Link to="/match">
                <Search className="mr-2 h-3 w-3 xxs:h-4 xxs:w-4" /> Find Matches
              </Link>
            </Button>
          </div>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto py-6 xxs:py-8 px-2"
        >
          <h1 className="text-2xl xxs:text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center gradient-text">Your Connections</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xxs:gap-4 sm:gap-6">
            {matchedProfilesDetails.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800 border-slate-700 shadow-xl hover:shadow-pink-500/30 transition-shadow duration-300 flex flex-col h-full">
                  <CardHeader className="flex flex-row items-center space-x-3 xxs:space-x-4 p-3 xxs:p-4 sm:p-6">
                    <Avatar className="h-10 w-10 xxs:h-12 xxs:w-12 sm:h-16 sm:w-16 border-2 border-pink-500">
                      <AvatarImage src={profile.logo_url || undefined} alt={`${profile.company_name} logo`} />
                      <AvatarFallback className="bg-slate-700 text-pink-400">
                        {profile.company_name ? profile.company_name.substring(0, 2).toUpperCase() : 'B2B'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base xxs:text-lg sm:text-xl font-semibold text-gray-100">{profile.company_name}</CardTitle>
                      <CardDescription className="text-pink-400 text-[10px] xxs:text-xs sm:text-sm">{profile.industry}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 xxs:p-4 sm:p-6 pt-0 space-y-2 flex-grow">
                    <p className="text-gray-300 line-clamp-2 xxs:line-clamp-3 text-[11px] xxs:text-xs sm:text-sm">{profile.description}</p>
                    {profile.looking_for && profile.looking_for.length > 0 && (
                       <div className="text-gray-300">
                        <p className="font-semibold text-pink-400 mb-1 text-[10px] xxs:text-xs">Looking For:</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.looking_for.slice(0,2).map(item => (
                            <span key={item} className="px-1.5 py-0.5 bg-slate-700 text-[9px] xxs:text-[10px] sm:text-xs rounded-full text-pink-300">{item}</span>
                          ))}
                          {profile.looking_for.length > 2 && <span className="px-1.5 py-0.5 bg-slate-700 text-[9px] xxs:text-[10px] sm:text-xs rounded-full text-pink-300">+{profile.looking_for.length -2} more</span>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <div className="p-3 xxs:p-4 sm:p-6 pt-0 grid grid-cols-2 gap-2">
                     <Button 
                        onClick={() => handleOpenChat(profile)} 
                        variant="outline" 
                        size="sm"
                        className="w-full text-pink-400 border-pink-500 hover:bg-pink-500/10 hover:text-pink-300 text-[10px] xxs:text-xs sm:text-sm h-8 xxs:h-9"
                      >
                        <MessageSquare className="mr-1 h-3 w-3 xxs:h-4 xxs:w-4" />
                        Chat
                      </Button>
                      <Button
                        onClick={() => generateAIChatOpening(profile, profile.match_id)}
                        variant="outline"
                        size="sm"
                        className="w-full text-purple-400 border-purple-500 hover:bg-purple-500/10 hover:text-purple-300 text-[10px] xxs:text-xs sm:text-sm h-8 xxs:h-9"
                        disabled={sendingMessage}
                      >
                        {sendingMessage ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <AiIcon className="mr-1 h-3 w-3 xxs:h-4 xxs:w-4" /> }
                        AI Contact
                      </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedChatProfile && (
            <AlertDialog open={showChatModal} onOpenChange={setShowChatModal}>
              <AlertDialogContent className="bg-slate-800/95 backdrop-blur-md border-slate-700 text-gray-200 max-w-md w-[95vw] sm:w-[90vw] flex flex-col max-h-[85vh] p-3 xxs:p-4 sm:p-6">
                <AlertDialogHeader className="pt-0 px-0 pb-2 xxs:pb-3 border-b border-slate-700">
                  <div className="flex items-center space-x-2 xxs:space-x-3">
                    <Avatar className="h-8 w-8 xxs:h-10 xxs:w-10 border-pink-500 border">
                      <AvatarImage src={selectedChatProfile.logo_url || undefined} alt={`${selectedChatProfile.company_name} logo`} />
                      <AvatarFallback className="bg-slate-700 text-pink-400 text-xs xxs:text-sm">
                        {selectedChatProfile.company_name ? selectedChatProfile.company_name.substring(0, 2).toUpperCase() : 'B2B'}
                      </AvatarFallback>
                    </Avatar>
                    <AlertDialogTitle className="text-base xxs:text-lg sm:text-xl gradient-text">{selectedChatProfile.company_name}</AlertDialogTitle>
                  </div>
                </AlertDialogHeader>
                
                <div className="flex-grow overflow-y-auto py-2 px-1 xxs:p-4 space-y-2">
                  {chatMessages.map((msg) => (
                    <ChatMessage 
                        key={msg.id} 
                        text={msg.message_text} 
                        isSender={msg.sender_profile_id === currentUser.id} 
                        time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                        isAI={msg.is_ai_message} />
                  ))}
                   {chatMessages.length === 0 && (
                    <p className="text-center text-gray-500 text-xs xxs:text-sm py-8 xxs:py-10">No messages yet. Start the conversation!</p>
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-2 xxs:p-4 border-t border-slate-700">
                  <div className="flex items-center space-x-2">
                      <Input 
                        type="text" 
                        placeholder="Type message..." 
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        className="flex-grow bg-slate-700 border-slate-600 text-gray-200 placeholder-gray-400 focus:border-pink-500 text-xs xxs:text-sm h-9 xxs:h-10" 
                        disabled={sendingMessage}
                      />
                      <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-2 xxs:px-3 sm:px-4 h-9 xxs:h-10" disabled={sendingMessage}>
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-3 w-3 xxs:h-4 xxs:w-4 sm:h-5 sm:w-5" /> }
                        <span className="sr-only">Send</span>
                      </Button>
                  </div>
                </form>

                <AlertDialogFooter className="px-0 pb-0 pt-2 xxs:pt-2">
                  <AlertDialogCancel onClick={() => setShowChatModal(false)} className="w-full text-gray-300 hover:bg-slate-700 border-slate-600 h-9 xxs:h-10 text-xs xxs:text-sm">Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </motion.div>
      );
    };
    export default MatchesListPage;