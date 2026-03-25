"use client";

import React, { useState, useEffect } from 'react';
import { EmojiFace } from './EmojiFace';
import { addEvaluation } from '@/lib/firebase';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { IFCELogo } from './IFCELogo';

export const FeedbackScreen = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRating = async (rating: number) => {
    if (loading || submitted) return;
    setLoading(true);
    try {
      await addEvaluation(rating);
      setSubmitted(true);
      // Automatically reset after 3 seconds for the next person
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Failed to submit rating", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-4xl mx-auto w-full">
      <header className="text-center mb-12 space-y-6 flex flex-col items-center">
        <IFCELogo className="h-24 md:h-32" />
        <div className="space-y-2">
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">O que você achou do prato de hoje?</p>
        </div>
      </header>

      <div className="relative w-full">
        {/* Success Overlay */}
        <div className={cn(
          "absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 transition-all duration-500 rounded-3xl",
          submitted ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}>
          <div className="bg-secondary/10 p-8 rounded-full mb-6">
            <CheckCircle2 className="w-24 h-24 text-secondary animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-primary text-center">Muito obrigado!</h2>
          <p className="text-lg text-muted-foreground mt-2">Sua opinião ajuda a melhorar nossa cantina.</p>
        </div>

        {/* Voting Grid */}
        <div className={cn(
          "grid grid-cols-5 gap-4 md:gap-8 w-full transition-all duration-500",
          submitted ? "opacity-0 blur-sm pointer-events-none" : "opacity-100 blur-0"
        )}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-4 transition-transform hover:scale-105 active:scale-95 group focus:outline-none"
            >
              <div className="w-full aspect-square max-w-[160px] drop-shadow-md group-hover:drop-shadow-xl transition-all">
                <EmojiFace rating={val} />
              </div>
              <span className="hidden md:block font-bold text-muted-foreground group-hover:text-primary transition-colors text-center">
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

      <footer className="mt-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Totem de Avaliação IFCE Itapipoca</span>
        </div>
      </footer>
    </div>
  );
};
