import React, { useState, useEffect, useRef } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Send as SendIcon, Bot, User, Loader2, Building, Link as LinkIcon } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabase';
    import { useToast } from '@/components/ui/use-toast';

    const ChatMessage = ({ text, isUser, time, companySuggestions }) => (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className={`flex items-end space-x-2 max-w-[85%]`}>
          {!isUser && (
            <Avatar className="h-8 w-8 border-2 border-purple-500">
              <AvatarFallback className="bg-purple-600 text-white"><Bot size={18}/></AvatarFallback>
            </Avatar>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-3 rounded-lg shadow-md ${isUser ? 'bg-pink-600 text-white rounded-br-none' : 'bg-slate-700 text-gray-200 rounded-bl-none'}`}
          >
            <p className="text-sm whitespace-pre-wrap">{text}</p>
            {companySuggestions && companySuggestions.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-gray-300 font-semibold">Here are some companies I found:</p>
                {companySuggestions.map(company => (
                  <Card key={company.id} className="bg-slate-600 p-2 border-slate-500">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={company.logo_url || undefined} alt={`${company.company_name} logo`} />
                        <AvatarFallback className="bg-slate-500 text-white text-xs">
                          {company.company_name ? company.company_name.substring(0,1) : <Building size={14}/>}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-pink-300">{company.company_name}</p>
                        <p className="text-[10px] text-gray-300">{company.industry}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{company.description}</p>
                    {/* Add a button/link to view profile in MatchPage or similar if desired */}
                  </Card>
                ))}
              </div>
            )}
            {time && <p className={`text-xs mt-1 ${isUser ? 'text-pink-200' : 'text-gray-400'} text-right`}>{time}</p>}
          </motion.div>
          {isUser && (
             <Avatar className="h-8 w-8 border-2 border-pink-500">
              <AvatarFallback className="bg-pink-600 text-white"><User size={18}/></AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );

    const ChatbotPage = () => {
      const { currentUser } = useAuth();
      const { toast } = useToast();
      const [messages, setMessages] = useState([]);
      const [inputMessage, setInputMessage] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const messagesEndRef = useRef(null);

      useEffect(() => {
        setMessages([
          { 
            id: Date.now(), 
            text: "Hello! I'm your B2B Assistant. How can I help you find the right connections today? For example, you can ask me to 'find companies in technology' or 'look for suppliers of electrical appliances'.", 
            isUser: false, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
      }, []);

      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

      const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = {
          id: Date.now(),
          text: inputMessage,
          isUser: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        // Simulate chatbot processing and Supabase query
        try {
          // Basic keyword extraction (very simplistic)
          const lowerInput = inputMessage.toLowerCase();
          let queryKeywords = [];
          
          if (lowerInput.includes("find") || lowerInput.includes("look for") || lowerInput.includes("search")) {
            // Attempt to extract keywords after "find", "look for", "search for"
            const commonPhrases = ["find companies in", "look for companies in", "search for companies in", "find suppliers of", "look for suppliers of", "search for suppliers of", "find", "look for", "search for", "suppliers of", "in"];
            let relevantText = lowerInput;
            for (const phrase of commonPhrases) {
                if (relevantText.startsWith(phrase)) {
                    relevantText = relevantText.substring(phrase.length).trim();
                    break; 
                }
            }
            queryKeywords = relevantText.split(/\s+/).filter(kw => kw.length > 2 && !commonPhrases.includes(kw)); // Filter out small words and common phrases
          } else {
            queryKeywords = lowerInput.split(/\s+/).filter(kw => kw.length > 2);
          }


          let botResponseText = "I'm searching for that now...";
          let companySuggestions = [];

          if (queryKeywords.length > 0) {
            let queryBuilder = supabase.from('company_profiles').select('*').not('id', 'eq', currentUser.id);
            
            const orConditions = queryKeywords.map(kw => `description.ilike.%${kw}%,industry.ilike.%${kw}%,company_name.ilike.%${kw}%,looking_for.cs.{${kw}}`).join(',');
            queryBuilder = queryBuilder.or(orConditions);
            
            const { data: companies, error } = await queryBuilder.limit(5);

            if (error) {
              console.error("Error querying Supabase:", error);
              botResponseText = "Sorry, I encountered an error while searching. Please try again.";
            } else if (companies && companies.length > 0) {
              botResponseText = `I found ${companies.length} potential compan${companies.length === 1 ? 'y' : 'ies'} related to "${queryKeywords.join(' ')}". Check them out below!`;
              companySuggestions = companies;
            } else {
              botResponseText = `I couldn't find specific companies matching "${queryKeywords.join(' ')}". Can you try different keywords or be more specific? For example, 'Find marketing agencies' or 'Search for logistics partners'.`;
            }
          } else {
            botResponseText = "I need a bit more information to search. What kind of company or service are you looking for?";
          }
          
          // Simulate delay for bot response
          setTimeout(() => {
            const botMessage = {
              id: Date.now() + 1,
              text: botResponseText,
              isUser: false,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              companySuggestions: companySuggestions
            };
            setMessages(prev => [...prev, botMessage]);
            setIsLoading(false);
          }, 1500 + Math.random() * 1000);

        } catch (error) {
          console.error("Chatbot error:", error);
          const errorMessage = {
            id: Date.now() + 1,
            text: "Oops! Something went wrong on my end. Please try asking again.",
            isUser: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
          toast({ title: "Chatbot Error", description: "Could not process your request.", variant: "destructive"});
        }
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)]"
        >
          <Card className="flex-grow flex flex-col bg-slate-800/90 border-slate-700 shadow-2xl w-full max-w-3xl mx-auto">
            <CardHeader className="border-b border-slate-700 p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-purple-500">
                   <AvatarFallback className="bg-purple-600 text-white"><Bot size={24}/></AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-bold gradient-text">B2B AI Assistant</CardTitle>
                  <CardDescription className="text-gray-400 text-xs">Your smart guide to finding business connections.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <ChatMessage key={msg.id} text={msg.text} isUser={msg.isUser} time={msg.time} companySuggestions={msg.companySuggestions} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                   <div className="flex items-end space-x-2 max-w-[85%]">
                        <Avatar className="h-8 w-8 border-2 border-purple-500">
                            <AvatarFallback className="bg-purple-600 text-white"><Bot size={18}/></AvatarFallback>
                        </Avatar>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-3 rounded-lg shadow-md bg-slate-700 text-gray-200 rounded-bl-none"
                        >
                            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                        </motion.div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-4 border-t border-slate-700">
              <form onSubmit={handleSendMessage} className="flex items-center w-full space-x-2">
                <Input
                  type="text"
                  placeholder="Ask me anything about B2B needs..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-grow bg-slate-700 border-slate-600 text-gray-200 placeholder-gray-400 focus:border-pink-500 h-10"
                  disabled={isLoading}
                />
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 h-10" disabled={isLoading || !inputMessage.trim()}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendIcon className="h-5 w-5" />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default ChatbotPage;