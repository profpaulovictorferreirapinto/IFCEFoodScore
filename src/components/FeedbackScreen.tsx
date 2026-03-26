"use client";

import React, { useState } from 'react';
import { EmojiFace } from './EmojiFace';
import { addEvaluation } from '@/lib/firebase';
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
    <div className="flex flex-col items-center justify-between min-h-screen p-4 md:p-8 max-w-5xl mx-auto w-full">
      <header className="text-center mt-4 md:mt-8 space-y-4 flex flex-col items-center w-full">
        <IFCELogo className="h-40 md:h-56 lg:h-64 w-auto" />
        <div className="space-y-2">
          <p className="text-xl md:text-3xl text-muted-foreground font-medium px-4">
            O que você achou do prato de hoje?
          </p>
        </div>
      </header>

      <div className="relative w-full flex-1 flex items-center justify-center py-8">
        {/* Success Overlay */}
        <div className={cn(
          "absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 transition-all duration-500 rounded-3xl",
          submitted ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}>
          <div className="bg-secondary/10 p-8 rounded-full mb-6">
            <CheckCircle2 className="w-24 h-24 text-secondary animate-bounce" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-primary text-center">Muito obrigado!</h2>
          <p className="text-lg md:text-2xl text-muted-foreground mt-4">Sua opinião ajuda a melhorar nossa cantina.</p>
        </div>

        {/* Voting Grid */}
        <div className={cn(
          "grid grid-cols-5 gap-3 md:gap-6 lg:gap-10 w-full transition-all duration-500",
          submitted ? "opacity-0 blur-sm pointer-events-none" : "opacity-100 blur-0"
        )}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-4 transition-transform hover:scale-105 active:scale-90 group focus:outline-none"
            >
              <div className="w-full aspect-square max-w-[180px] drop-shadow-md group-hover:drop-shadow-2xl transition-all">
                <EmojiFace rating={val} />
              </div>
              <span className="hidden sm:block font-bold text-sm md:text-lg text-muted-foreground group-hover:text-primary transition-colors text-center whitespace-nowrap">
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

      <footer className="mb-4 md:mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted/50 rounded-full border border-border">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <span className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Totem de Avaliação IFCE Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
