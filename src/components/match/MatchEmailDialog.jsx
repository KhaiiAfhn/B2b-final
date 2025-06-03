import React from 'react';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
    import { Textarea } from "@/components/ui/textarea";
    import { Label } from "@/components/ui/label";
    import { Button } from '@/components/ui/button';
    import { Copy, Send } from 'lucide-react';

    const MatchEmailDialog = ({ isOpen, onClose, emailContent, setEmailContent, targetProfile, onCopy, onSend }) => {
      if (!isOpen || !targetProfile) return null;

      return (
        <AlertDialog open={isOpen} onOpenChange={(openState) => { if (!openState) onClose(); }}>
            <AlertDialogContent className="bg-slate-800 border-slate-700 text-gray-200 w-[90vw] max-w-lg p-4 sm:p-6">
                <AlertDialogHeader className="pb-2 sm:pb-3">
                    <AlertDialogTitle className="text-lg xxs:text-xl sm:text-2xl gradient-text">It's a Match! Send an Intro?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs sm:text-sm text-gray-400">
                        We've drafted an initial email to {targetProfile.company_name}. You can edit it below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2 space-y-1 sm:space-y-2">
                    <Label htmlFor="emailContentDialog" className="text-xs sm:text-sm text-gray-300">Email to {targetProfile.email}:</Label>
                    <Textarea
                        id="emailContentDialog"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        rows={8} 
                        className="bg-slate-700 border-slate-600 text-gray-200 focus:border-pink-500 text-xs sm:text-sm"
                    />
                </div>
                <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-2">
                    <AlertDialogCancel onClick={onClose} className="text-gray-300 hover:bg-slate-700 border-slate-600 w-full sm:w-auto text-xs sm:text-sm h-9">Maybe Later</AlertDialogCancel>
                    <Button variant="outline" onClick={onCopy} className="text-pink-400 border-pink-500 hover:bg-pink-500/10 hover:text-pink-300 w-full sm:w-auto text-xs sm:text-sm h-9">
                        <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Copy
                    </Button>
                    <AlertDialogAction onClick={onSend} className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto text-xs sm:text-sm h-9">
                        <Send className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Send
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      );
    };

    export default MatchEmailDialog;
