
"use client";

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { summarizeDailyFeedback } from '@/ai/flows/summarize-daily-feedback-flow';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, Users, Star, MessageSquareQuote } from 'lucide-react';
import { Button } from './ui/button';

export const AdminDashboard = () => {
  const firestore = useFirestore();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const evaluationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "ratings"),
      where("ratingDate", "==", today)
    );
  }, [firestore, today]);

  const { data: evaluations, isLoading } = useCollection(evaluationsQuery);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const ratingsCount = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    evaluations?.forEach(e => {
      const score = e.score;
      if (score >= 1 && score <= 5) {
        counts[score - 1]++;
      }
    });
    return counts;
  }, [evaluations]);

  const chartData = [
    { name: '1', count: ratingsCount[0], color: 'hsl(var(--chart-1))' },
    { name: '2', count: ratingsCount[1], color: 'hsl(var(--chart-2))' },
    { name: '3', count: ratingsCount[2], color: 'hsl(var(--chart-3))' },
    { name: '4', count: ratingsCount[3], color: 'hsl(var(--chart-4))' },
    { name: '5', count: ratingsCount[4], color: 'hsl(var(--chart-5))' },
  ];

  const average = useMemo(() => {
    if (!evaluations || evaluations.length === 0) return "0";
    const sum = evaluations.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / evaluations.length).toFixed(1);
  }, [evaluations]);

  const handleSummarize = async () => {
    if (!evaluations || evaluations.length === 0) return;
    setSummarizing(true);
    try {
      const result = await summarizeDailyFeedback({ 
        evaluations: evaluations.map(d => d.score) 
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
            <p className="text-muted-foreground text-lg">Visão geral do feedback dos estudantes</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-sm text-muted-foreground uppercase tracking-widest">Data de Hoje</p>
          <p className="text-2xl font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-bold uppercase tracking-tight">Total de Votos</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{evaluations?.length || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Votos registrados hoje</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-bold uppercase tracking-tight">Média do Dia</CardTitle>
            <Star className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-secondary">{average} / 5.0</div>
            <div className="h-3 w-full bg-muted rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-500" 
                style={{ width: `${(Number(average) / 5) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-bold uppercase tracking-tight">Tendência</CardTitle>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{Number(average) >= 4 ? "Excelente" : Number(average) >= 3 ? "Boa" : "Precisa Melhorar"}</div>
            <p className="text-sm text-muted-foreground mt-1">Classificação baseada em votos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase">Distribuição</CardTitle>
            <CardDescription>Quantidade de votos por nota (1-5)</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" fontSize={14} fontWeight="bold" />
                <YAxis allowDecimals={false} fontSize={14} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/20 bg-primary/[0.02]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquareQuote className="w-7 h-7 text-[#379936]" />
                <CardTitle className="text-2xl font-black uppercase">Análise de IA</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleSummarize}
                disabled={summarizing || !evaluations || evaluations.length === 0}
                className="font-bold uppercase tracking-tight"
              >
                {summarizing && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                Gerar Resumo
              </Button>
            </div>
            <CardDescription>Análise inteligente do feedback coletado hoje</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {summary ? (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl leading-relaxed font-medium text-foreground/90">{summary}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                <MessageSquareQuote className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xl font-medium">Clique em "Gerar Resumo" para analisar os dados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
