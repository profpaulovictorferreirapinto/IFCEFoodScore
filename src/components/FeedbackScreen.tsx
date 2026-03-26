
"use client";

import React, { useState, useEffect } from 'react';
import { EmojiFace } from './EmojiFace';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { CheckCircle2, Heart, Loader2, MessageSquareText, Clock } from 'lucide-react';
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
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [period, setPeriod] = useState<string>("Manhã");
  
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Bloqueio do botão "Voltar" do navegador
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    
    const ratingData = {
      id: newDocRef.id,
      ratingValue: ratingValue,
      ratingDate: dateStr,
      period: period,
      createdAt: now.toISOString(),
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
        setIsFeedbackModalOpen(false);
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
    <div className="relative min-h-screen w-full bg-background overflow-hidden flex flex-col items-center p-6 md:p-10">
      {/* Overlay de Sucesso */}
      {submitted && (
        <div className="fixed inset-0 z-[100] bg-background w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-10 text-center">
          <div className="relative mb-6">
            <div className="bg-primary/10 p-6 rounded-full shadow-[0_0_30px_rgba(55,153,54,0.1)]">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
            <Heart className="absolute -top-1 -right-1 w-6 h-6 text-destructive fill-destructive animate-bounce" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary tracking-tighter uppercase mb-3 leading-none">
            Muito obrigado!
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground font-semibold max-w-[500px] leading-tight px-4">
            Sua opinião ajuda a melhorar nossa refeição.
          </p>

          <div className="mt-8 h-1.5 w-32 bg-muted rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary animate-progress" />
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <header className="shrink-0 flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tighter uppercase select-none leading-none">
          IFCE FoodScore
        </h1>
      </header>

      {/* Seletor de Período */}
      <div className="shrink-0 flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Selecione o período em que foi servida a refeição:</span>
        </div>
        <div className="flex p-1 bg-muted/30 rounded-2xl border border-border/40">
          {["Manhã", "Tarde", "Noite"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                period === p 
                ? "bg-white text-primary shadow-md scale-105" 
                : "text-muted-foreground hover:bg-white/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Pergunta Centralizada */}
      <div className="shrink-0 flex flex-col items-center justify-center py-4">
        <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-medium px-4 text-center leading-tight select-none">
          O que você achou da refeição de hoje?
        </p>
      </div>

      <div className="flex-1" />

      {/* Grid de Carinhas */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-5 gap-4 md:gap-6 lg:gap-8 w-full">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading || submitted || isUserLoading || !user}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-2 md:gap-3 transition-all hover:scale-105 active:scale-95 group focus:outline-none disabled:opacity-50"
            >
              <div className="w-full aspect-square drop-shadow-2xl group-hover:drop-shadow-[0_15px_25px_rgba(55,153,54,0.3)] transition-all">
                <EmojiFace rating={val} />
              </div>
              <span className="font-black text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground group-hover:text-primary transition-colors text-center uppercase tracking-tighter leading-none select-none">
                {val === 1 && "Detestei"}
                {val === 2 && "Não gostei"}
                {val === 3 && "Indiferente"}
                {val === 4 && "Gostei"}
                {val === 5 && "Adorei"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <footer className="shrink-0 flex flex-col items-center gap-4 mt-auto pb-6">
        <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all gap-2 px-6 py-6 font-bold uppercase tracking-tight text-[10px] h-auto shadow-sm"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              Sugestões ou Reclamações
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase text-primary">Sua opinião</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Escreva abaixo sua mensagem de forma anônima sobre a refeição do período: <span className="font-bold text-primary">{period}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Textarea 
                placeholder="Escreva aqui sua mensagem..."
                className="min-h-[120px] text-base p-4 rounded-xl border-primary/20 focus-visible:ring-primary"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSendFeedback} 
                disabled={!feedbackContent.trim() || loading}
                className="w-full font-bold uppercase py-5 text-base h-auto"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Enviar Feedback"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted/20 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[7px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest select-none">
            Totem de Avaliação • Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
