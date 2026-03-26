
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
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col items-center p-6 md:p-10">
      {/* Success Message Overlay */}
      {submitted && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-6 text-center">
          <div className="relative mb-6 md:mb-10">
            <div className="bg-[#379936]/10 p-8 md:p-12 rounded-full">
              <CheckCircle2 className="w-24 h-24 md:w-40 md:h-40 text-[#379936]" />
            </div>
            <Heart className="absolute -top-2 -right-2 w-10 h-10 md:w-16 md:h-16 text-destructive fill-destructive animate-bounce" />
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#379936] tracking-tighter uppercase mb-4 md:mb-6 select-none leading-none">
            Muito obrigado!
          </h2>
          <p className="text-lg md:text-2xl lg:text-3xl text-muted-foreground font-medium max-w-2xl leading-tight select-none px-4">
            Sua opinião é fundamental para melhorarmos nosso serviço.
          </p>

          <div className="mt-8 md:mt-12 h-2 md:h-3 w-48 md:w-[400px] bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[#379936] animate-progress" />
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <header className="shrink-0 mb-2">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#379936] tracking-tighter uppercase select-none leading-none">
          IFCE FoodScore
        </h1>
      </header>

      {/* Espaçador Superior 1 - Ajustado para centralização equilibrada */}
      <div className="flex-[1]" />

      {/* Pergunta - Centralizada entre cabeçalho e carinhas */}
      <div className="shrink-0 w-full">
        <p className="text-2xl md:text-4xl lg:text-5xl text-muted-foreground font-medium px-4 text-center leading-tight">
          O que você achou do prato de hoje?
        </p>
      </div>

      {/* Espaçador Inferior 2 - Maior peso para empurrar as carinhas mais para baixo */}
      <div className="flex-[4]" />

      {/* Grid de Carinhas - Posicionado na extremidade inferior */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-2">
        <div className="grid grid-cols-5 gap-4 md:gap-10 lg:gap-14 w-full">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading || submitted}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-4 md:gap-6 transition-all hover:scale-105 active:scale-95 group focus:outline-none"
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

      {/* Rodapé - Posicionado logo abaixo das carinhas */}
      <footer className="shrink-0 mb-4 md:mb-6 mt-4">
        <div className="inline-flex items-center gap-3 px-8 py-3 md:px-10 md:py-4 bg-muted/20 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-[#379936] rounded-full animate-pulse" />
          <span className="text-[10px] md:text-sm lg:text-base font-bold text-muted-foreground uppercase tracking-widest">
            Totem de Avaliação • Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
