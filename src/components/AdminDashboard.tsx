
"use client";

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { summarizeDailyFeedback } from '@/ai/flows/summarize-daily-feedback-flow';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, Users, Star, MessageSquareQuote, Calendar } from 'lucide-react';
import { Button } from './ui/button';

export const AdminDashboard = () => {
  const firestore = useFirestore();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const evaluationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "dailyMealRatings"),
      where("ratingDate", "==", today),
      orderBy("createdAt", "desc")
    );
  }, [firestore, today]);

  const { data: evaluations, isLoading } = useCollection(evaluationsQuery);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const ratingsCount = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    evaluations?.forEach(e => {
      const score = e.ratingValue;
      if (score >= 1 && score <= 5) {
        counts[score - 1]++;
      }
    });
    return counts;
  }, [evaluations]);

  const chartData = [
    { name: 'Muito Ruim', count: ratingsCount[0], color: '#EF4444' },
    { name: 'Ruim', count: ratingsCount[1], color: '#F97316' },
    { name: 'Médio', count: ratingsCount[2], color: '#FACC15' },
    { name: 'Bom', count: ratingsCount[3], color: '#4ADE80' },
    { name: 'Excelente', count: ratingsCount[4], color: '#17CFCF' },
  ];

  const average = useMemo(() => {
    if (!evaluations || evaluations.length === 0) return "0.0";
    const sum = evaluations.reduce((acc, curr) => acc + curr.ratingValue, 0);
    return (sum / evaluations.length).toFixed(1);
  }, [evaluations]);

  const handleSummarize = async () => {
    if (!evaluations || evaluations.length === 0) return;
    setSummarizing(true);
    try {
      const result = await summarizeDailyFeedback({ 
        evaluations: evaluations.map(d => d.ratingValue) 
      });
      setSummary(result.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 text-[#379936] animate-spin" />
    </div>
  );

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b pb-10">
        <div className="flex items-center gap-8">
          <h1 className="text-4xl md:text-5xl font-black text-[#379936] tracking-tighter uppercase leading-none">
            IFCE FoodScore
          </h1>
          <div className="h-12 w-px bg-border hidden md:block" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Painel da Cantina</h1>
            <p className="text-muted-foreground text-lg">Análise de satisfação dos alunos</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50 flex items-center gap-4">
          <Calendar className="text-primary w-6 h-6" />
          <div className="text-right">
            <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Avaliações de Hoje</p>
            <p className="text-xl font-black">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="shadow-md overflow-hidden group">
          <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">Volume de Votos</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black tracking-tighter">{evaluations?.length || 0}</div>
            <p className="text-xs font-medium text-muted-foreground mt-2">Estudantes participaram hoje</p>
          </CardContent>
        </Card>

        <Card className="shadow-md overflow-hidden group">
          <div className="h-1 bg-secondary/20 group-hover:bg-secondary transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">Nota Média</CardTitle>
            <Star className="w-5 h-5 text-secondary fill-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black tracking-tighter text-secondary">{average}</div>
            <div className="h-2 w-full bg-muted rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-1000 ease-out" 
                style={{ width: `${(Number(average) / 5) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md overflow-hidden group">
          <div className="h-1 bg-accent/20 group-hover:bg-accent transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">Status Geral</CardTitle>
            <TrendingUp className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter uppercase">
              {Number(average) >= 4 ? "Excelente" : Number(average) >= 3 ? "Satisfatório" : "Crítico"}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-2">Baseado no feedback em tempo real</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="shadow-lg border-none bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Distribuição Diária</CardTitle>
            <CardDescription>Frequência de cada nível de satisfação</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" fontSize={12} fontWeight="bold" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/20 bg-primary/[0.01]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquareQuote className="w-7 h-7 text-primary" />
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Insight da IA</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleSummarize}
                disabled={summarizing || !evaluations || evaluations.length === 0}
                className="font-bold uppercase tracking-tight border-primary text-primary hover:bg-primary hover:text-white transition-all"
              >
                {summarizing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Analisar Hoje"}
              </Button>
            </div>
            <CardDescription>Resumo qualitativo gerado automaticamente</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {summary ? (
              <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-inner">
                <p className="text-xl leading-relaxed font-medium text-foreground/90 italic">"{summary}"</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed rounded-2xl bg-white/50">
                <MessageSquareQuote className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-lg font-bold uppercase tracking-widest opacity-40">Aguardando análise...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
