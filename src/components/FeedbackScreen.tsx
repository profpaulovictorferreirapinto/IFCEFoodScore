
"use client";

import React, { useState, useEffect } from 'react';
import { EmojiFace } from './EmojiFace';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { CheckCircle2, Heart, Loader2, MessageSquareText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const FeedbackScreen = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackFeedbackModalOpen] = useState(false);
  
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (auth && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  const handleRating = (ratingValue: number) => {
    if (loading || submitted || !firestore || !user) return;
    setLoading(true);
    
    const ratingsCol = collection(firestore, "dailyMealRatings");
    const newDocRef = doc(ratingsCol);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const fullTimestamp = now.toISOString();
    
    const ratingData = {
      id: newDocRef.id,
      ratingValue: ratingValue,
      ratingDate: dateStr,
      createdAt: fullTimestamp,
    };

    setDoc(newDocRef, ratingData)
      .then(() => {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: newDocRef.path,
          operation: 'create',
          requestResourceData: ratingData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSendFeedback = () => {
    if (!feedbackContent.trim() || !firestore || !user) return;
    setLoading(true);

    const feedbackCol = collection(firestore, "mealFeedbacks");
    const newDocRef = doc(feedbackCol);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    const feedbackData = {
      id: newDocRef.id,
      content: feedbackContent,
      ratingDate: dateStr,
      createdAt: now.toISOString(),
    };

    setDoc(newDocRef, feedbackData)
      .then(() => {
        setFeedbackContent("");
        setIsFeedbackFeedbackModalOpen(false);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: newDocRef.path,
          operation: 'create',
          requestResourceData: feedbackData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col items-center p-6 md:p-10">
      {/* Overlay de Sucesso */}
      {submitted && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-6 text-center">
          <div className="relative mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <Heart className="absolute -top-1 -right-1 w-4 h-4 text-destructive fill-destructive animate-bounce" />
          </div>
          
          <h2 className="text-xl md:text-2xl font-black text-primary tracking-tighter uppercase mb-1 select-none leading-none">
            Muito obrigado!
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-xs leading-tight select-none px-4">
            Sua opinião ajuda a melhorar nossa cantina.
          </p>

          <div className="mt-4 h-1 w-20 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress" />
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <header className="shrink-0 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary tracking-tighter uppercase select-none leading-none">
          IFCE FoodScore
        </h1>
      </header>

      {/* Espaçadores flexíveis para centralizar a pergunta */}
      <div className="flex-1" />

      {/* Pergunta Centralizada */}
      <div className="shrink-0 w-full relative">
        {isUserLoading && !user && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-widest animate-pulse">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            Sincronizando...
          </div>
        )}
        <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-medium px-4 text-center leading-tight select-none">
          O que você achou do prato de hoje?
        </p>
      </div>

      <div className="flex-1" />

      {/* Grid de Carinhas na parte inferior */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-2">
        <div className="grid grid-cols-5 gap-4 md:gap-6 lg:gap-8 w-full">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading || submitted || isUserLoading || !user}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-3 md:gap-4 transition-all hover:scale-105 active:scale-95 group focus:outline-none disabled:opacity-50"
            >
              <div className="w-full aspect-square drop-shadow-2xl group-hover:drop-shadow-[0_20px_30px_rgba(55,153,54,0.3)] transition-all">
                <EmojiFace rating={val} />
              </div>
              <span className="font-black text-[9px] sm:text-xs md:text-sm lg:text-base text-muted-foreground group-hover:text-primary transition-colors text-center uppercase tracking-tight leading-tight select-none">
                {val === 1 && "Muito Ruim"}
                {val === 2 && "Ruim"}
                {val === 3 && "Médio"}
                {val === 4 && "Bom"}
                {val === 5 && "Excelente"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rodapé com Botão de Feedback */}
      <footer className="shrink-0 mb-4 md:mb-6 mt-6 flex flex-col items-center gap-4">
        <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackFeedbackModalOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-all gap-2 px-6 py-6 font-bold uppercase tracking-tight text-xs"
            >
              <MessageSquareText className="w-4 h-4" />
              Sugestões ou Reclamações
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase text-primary">Sua opinião</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Como podemos melhorar a nossa cantina? Escreva abaixo sua sugestão ou reclamação de forma anônima.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea 
                placeholder="Escreva aqui sua mensagem..."
                className="min-h-[150px] text-lg p-4 rounded-xl border-primary/20 focus-visible:ring-primary"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSendFeedback} 
                disabled={!feedbackContent.trim() || loading}
                className="w-full font-bold uppercase py-6 text-lg"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Enviar Feedback"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="inline-flex items-center gap-3 px-6 py-2 bg-muted/20 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest select-none">
            Totem de Avaliação • Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
