
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

  // Garante que o totem esteja autenticado anonimamente para gravar os dados
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

    // Gravação não bloqueante conforme padrões de performance
    setDoc(newDocRef, ratingData)
      .then(() => {
        setSubmitted(true);
        // Reseta após 3 segundos para a próxima pessoa
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
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col items-center justify-between p-6 md:p-16">
      {/* Success Message Overlay */}
      {submitted && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-6">
          <div className="relative mb-12">
            <div className="bg-[#379936]/10 p-16 rounded-full">
              <CheckCircle2 className="w-40 h-40 md:w-64 md:h-64 text-[#379936]" />
            </div>
            <Heart className="absolute -top-6 -right-6 w-16 h-16 md:w-24 md:h-24 text-destructive fill-destructive animate-bounce" />
          </div>
          
          <h2 className="text-6xl md:text-9xl font-black text-[#379936] text-center tracking-tighter uppercase mb-8 select-none">
            Muito obrigado!
          </h2>
          <p className="text-2xl md:text-5xl text-muted-foreground font-medium text-center max-w-4xl leading-tight select-none">
            Sua opinião é fundamental para melhorarmos nosso serviço.
          </p>

          <div className="mt-20 h-4 w-72 md:w-[500px] bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[#379936] animate-progress" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <header className="text-center mt-4 md:mt-10 space-y-6 flex flex-col items-center w-full">
        <h1 className="text-6xl md:text-9xl font-black text-[#379936] tracking-tighter uppercase select-none leading-none">
          IFCE FoodScore
        </h1>
        <p className="text-2xl md:text-4xl lg:text-5xl text-muted-foreground font-medium px-4">
          O que você achou do prato de hoje?
        </p>
      </header>

      <div className="w-full flex-1 flex items-center justify-center max-w-7xl mx-auto py-10 md:py-20">
        <div className="grid grid-cols-5 gap-6 md:gap-12 lg:gap-16 w-full px-4">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              disabled={loading || submitted}
              onClick={() => handleRating(val)}
              className="flex flex-col items-center gap-8 md:gap-12 transition-all hover:scale-110 active:scale-95 group focus:outline-none"
            >
              <div className="w-full aspect-square drop-shadow-2xl group-hover:drop-shadow-[0_25px_35px_rgba(55,153,54,0.3)] transition-all">
                <EmojiFace rating={val} />
              </div>
              <span className="hidden sm:block font-black text-xs md:text-2xl lg:text-4xl text-muted-foreground group-hover:text-[#379936] transition-colors text-center uppercase tracking-tight">
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

      <footer className="mb-6 md:mb-12 text-center w-full">
        <div className="inline-flex items-center gap-4 px-10 py-5 md:px-16 md:py-8 bg-muted/30 rounded-full border border-border/50 backdrop-blur-sm shadow-inner">
          <div className="w-4 h-4 md:w-6 md:h-6 bg-[#379936] rounded-full animate-pulse" />
          <span className="text-sm md:text-2xl font-bold text-muted-foreground uppercase tracking-widest">
            Totem de Avaliação • Campus Itapipoca
          </span>
        </div>
      </footer>
    </div>
  );
};
