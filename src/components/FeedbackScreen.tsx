
"use client";

import React, { useState, useEffect } from 'react';
import { EmojiFace } from './EmojiFace';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { CheckCircle2, Heart, Loader2 } from 'lucide-react';

export const FeedbackScreen = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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
    
    const ratingsCol = collection(firestore, "ratings");
    const newDocRef = doc(ratingsCol);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const fullTimestamp = now.toISOString();
    
    const ratingData = {
      id: newDocRef.id,
      score: ratingValue,
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

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col items-center p-6 md:p-10">
      {/* Overlay de Sucesso */}
      {submitted && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-6 text-center">
          <div className="relative mb-4 md:mb-6">
            <div className="bg-primary/10 p-4 md:p-6 rounded-full">
              <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>
            <Heart className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 text-destructive fill-destructive animate-bounce" />
          </div>
          
          <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-primary tracking-tighter uppercase mb-2 select-none leading-none">
            Muito obrigado!
          </h2>
          <p className="text-xs md:text-base lg:text-lg text-muted-foreground font-medium max-w-xs md:max-w-md leading-tight select-none px-4">
            Sua opinião é fundamental para melhorarmos nosso serviço.
          </p>

          <div className="mt-6 h-1 w-24 md:w-32 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress" />
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <header className="shrink-0">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary tracking-tighter uppercase select-none leading-none">
          IFCE FoodScore
        </h1>
      </header>

      {/* Espaçador Superior Equilibrado */}
      <div className="flex-1" />

      {/* Pergunta Centralizada */}
      <div className="shrink-0 w-full relative">
        {isUserLoading && !user && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-widest animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Conectando...
          </div>
        )}
        <p className="text-2xl md:text-4xl lg:text-5xl text-muted-foreground font-medium px-4 text-center leading-tight">
          O que você achou do prato de hoje?
        </p>
      </div>

      {/* Espaçador Inferior Equilibrado */}
      <div className="flex-1" />

      {/* Grid de Carinhas na parte inferior */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-2">
        <div className="grid grid-cols-5 gap-4 md:gap-8 lg:gap-12 w-full">
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
              <span className="font-black text-[9px] sm:text-base md:text-lg lg:text-xl text-muted-foreground group-hover:text-primary transition-colors text-center uppercase tracking-tight leading-tight">
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

      {/* Rodapé colado às carinhas */}
      <footer className="shrink-0 mb-4 md:mb-6 mt-4">
        <div className="inline-flex items-center gap-3 px-6 py-2 md:px-8 md:py-3 bg-muted/20 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
          <div className="w-2.5 h-2.5 md:w-3 h-3 bg-primary rounded-full animate-pulse" />
          <span className="text-[9px] md:text-xs lg:text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Totem de Avaliação • Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
