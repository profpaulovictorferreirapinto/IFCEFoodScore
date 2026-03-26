
"use client";

import React, { useState } from 'react';
import { EmojiFace } from './EmojiFace';
import { addEvaluation } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { CheckCircle2, Heart } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-between h-screen p-4 md:p-8 max-w-5xl mx-auto w-full overflow-hidden">
      <header className="text-center mt-4 md:mt-8 space-y-4 flex flex-col items-center w-full">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#379936] tracking-tighter uppercase select-none">
          IFCE FoodScore
        </h1>
        <div className="space-y-2">
          <p className="text-xl md:text-3xl text-muted-foreground font-medium px-4">
            O que você achou do prato de hoje?
          </p>
        </div>
      </header>

      <div className="relative w-full flex-1 flex items-center justify-center py-4">
        {/* Success Overlay */}
        <div className={cn(
          "absolute inset-0 z-20 flex flex-col items-center justify-center bg-background transition-all duration-500 rounded-3xl",
          submitted ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-10 scale-95 pointer-events-none"
        )}>
          <div className="relative">
            <div className="bg-[#379936]/10 p-10 rounded-full mb-8 relative z-10">
              <CheckCircle2 className="w-32 h-32 text-[#379936] animate-in zoom-in duration-300" />
            </div>
            <Heart className="absolute -top-4 -right-4 w-12 h-12 text-destructive animate-bounce fill-destructive" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#379936] text-center tracking-tight uppercase">
            Muito obrigado!
          </h2>
          <p className="text-xl md:text-3xl text-muted-foreground mt-6 font-medium text-center px-6">
            Sua opinião é fundamental para melhorarmos nosso serviço.
          </p>
          
          {/* Progress bar for auto-reset feedback */}
          <div className="mt-12 h-2 w-64 bg-muted rounded-full overflow-hidden">
            {submitted && (
              <div className="h-full bg-[#379936] animate-[progress_3s_linear]" />
            )}
          </div>
        </div>

        {/* Voting Grid */}
        <div className={cn(
          "grid grid-cols-5 gap-3 md:gap-6 lg:gap-10 w-full transition-all duration-700",
          submitted ? "opacity-0 scale-90 blur-md pointer-events-none" : "opacity-100 scale-100 blur-0"
        )}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-4 transition-transform hover:scale-110 active:scale-90 group focus:outline-none"
            >
              <div className="w-full aspect-square max-w-[180px] drop-shadow-xl group-hover:drop-shadow-2xl transition-all duration-300">
                <EmojiFace rating={val} />
              </div>
              <span className="hidden sm:block font-black text-sm md:text-xl text-muted-foreground group-hover:text-[#379936] transition-colors text-center uppercase tracking-tight">
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
        <div className="inline-flex items-center gap-2 px-8 py-4 bg-muted/30 rounded-full border border-border/50 backdrop-blur-sm">
          <div className="w-2.5 h-2.5 bg-[#379936] rounded-full animate-pulse" />
          <span className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Totem de Avaliação IFCE Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
