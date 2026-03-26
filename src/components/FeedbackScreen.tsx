
"use client";

import React, { useState, useEffect } from 'react';
import { EmojiFace } from './EmojiFace';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { CheckCircle2, Heart } from 'lucide-react';

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
    if (loading || submitted || !firestore) return;
    setLoading(true);
    
    const ratingsCol = collection(firestore, "ratings");
    const newDocRef = doc(ratingsCol);
    const dateStr = new Date().toISOString().split('T')[0];
    
    const ratingData = {
      id: newDocRef.id,
      score: ratingValue,
      ratingDate: dateStr,
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
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col items-center p-6 md:p-12 lg:p-16">
      {/* Success Message Overlay */}
      {submitted && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-6 text-center">
          <div className="relative mb-8 md:mb-12">
            <div className="bg-[#379936]/10 p-12 md:p-16 rounded-full">
              <CheckCircle2 className="w-32 h-32 md:w-64 md:h-64 text-[#379936]" />
            </div>
            <Heart className="absolute -top-4 -right-4 w-12 h-12 md:w-24 md:h-24 text-destructive fill-destructive animate-bounce" />
          </div>
          
          <h2 className="text-5xl md:text-8xl lg:text-9xl font-black text-[#379936] tracking-tighter uppercase mb-4 md:mb-8 select-none leading-none">
            Muito obrigado!
          </h2>
          <p className="text-xl md:text-4xl lg:text-5xl text-muted-foreground font-medium max-w-4xl leading-tight select-none">
            Sua opinião é fundamental para melhorarmos nosso serviço.
          </p>

          <div className="mt-12 md:mt-20 h-3 md:h-4 w-64 md:w-[500px] bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[#379936] animate-progress" />
          </div>
        </div>
      )}

      {/* Título - Fixado no topo */}
      <header className="shrink-0 mb-4">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#379936] tracking-tighter uppercase select-none leading-none">
          IFCE FoodScore
        </h1>
      </header>

      {/* Pergunta - Ocupa o espaço central entre o título e as carinhas */}
      <div className="flex-1 flex items-center justify-center w-full">
        <p className="text-2xl md:text-4xl lg:text-5xl text-muted-foreground font-medium px-4 text-center">
          O que você achou do prato de hoje?
        </p>
      </div>

      {/* Main Buttons Grid - Posicionado bem mais abaixo */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-6 md:mb-8 mt-auto">
        <div className="grid grid-cols-5 gap-4 md:gap-10 lg:gap-14 w-full">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading || submitted}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-4 md:gap-8 transition-all hover:scale-105 active:scale-95 group focus:outline-none"
            >
              <div className="w-full aspect-square drop-shadow-2xl group-hover:drop-shadow-[0_20px_30px_rgba(55,153,54,0.3)] transition-all">
                <EmojiFace rating={val} />
              </div>
              <span className="font-black text-[10px] sm:text-lg md:text-xl lg:text-2xl text-muted-foreground group-hover:text-[#379936] transition-colors text-center uppercase tracking-tight leading-tight">
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

      {/* Footer - Posicionado logo abaixo das carinhas, com margem mínima no fundo */}
      <footer className="shrink-0 mb-4 md:mb-6">
        <div className="inline-flex items-center gap-3 px-8 py-4 md:px-12 md:py-6 bg-muted/20 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
          <div className="w-3 h-3 md:w-5 md:h-5 bg-[#379936] rounded-full animate-pulse" />
          <span className="text-xs md:text-lg font-bold text-muted-foreground uppercase tracking-widest">
            Totem de Avaliação • Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
