
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
      // Reseta após 3 segundos para a próxima pessoa
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Failed to submit rating", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col items-center justify-between p-4 md:p-8">
      {/* Success Message Overlay - Tela cheia e prioritária */}
      {submitted && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-6">
          <div className="relative mb-8">
            <div className="bg-[#379936]/10 p-12 rounded-full">
              <CheckCircle2 className="w-32 h-32 md:w-48 md:h-48 text-[#379936]" />
            </div>
            <Heart className="absolute -top-4 -right-4 w-12 h-12 md:w-16 md:h-16 text-destructive fill-destructive animate-bounce" />
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black text-[#379936] text-center tracking-tighter uppercase mb-6 select-none">
            Muito obrigado!
          </h2>
          <p className="text-xl md:text-4xl text-muted-foreground font-medium text-center max-w-3xl leading-tight select-none">
            Sua opinião é fundamental para melhorarmos nosso serviço.
          </p>

          <div className="mt-16 h-3 w-64 md:w-96 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[#379936] animate-progress" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <header className="text-center mt-8 md:mt-12 space-y-4 flex flex-col items-center w-full">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-[#379936] tracking-tighter uppercase select-none">
          IFCE FoodScore
        </h1>
        <p className="text-xl md:text-3xl lg:text-4xl text-muted-foreground font-medium px-4">
          O que você achou do prato de hoje?
        </p>
      </header>

      <div className="w-full flex-1 flex items-center justify-center max-w-6xl mx-auto py-8">
        <div className="grid grid-cols-5 gap-4 md:gap-8 lg:gap-12 w-full">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading || submitted}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-6 transition-all hover:scale-110 active:scale-95 group focus:outline-none"
            >
              <div className="w-full aspect-square drop-shadow-2xl group-hover:drop-shadow-[0_20px_20px_rgba(55,153,54,0.3)] transition-all">
                <EmojiFace rating={val} />
              </div>
              <span className="hidden sm:block font-black text-sm md:text-xl lg:text-2xl text-muted-foreground group-hover:text-[#379936] transition-colors text-center uppercase tracking-tight">
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

      <footer className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-muted/30 rounded-full border border-border/50 backdrop-blur-sm shadow-inner">
          <div className="w-3 h-3 bg-[#379936] rounded-full animate-pulse" />
          <span className="text-xs md:text-base font-bold text-muted-foreground uppercase tracking-widest">
            Totem de Avaliação • Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
