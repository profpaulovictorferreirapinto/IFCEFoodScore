
"use client";

import React, { useState, useEffect } from 'react';
import { getDailyEvaluations, Evaluation } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { summarizeDailyFeedback } from '@/ai/flows/summarize-daily-feedback-flow';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, Users, Star, MessageSquareQuote } from 'lucide-react';
import { Button } from './ui/button';

export const AdminDashboard = () => {
  const [dailyData, setDailyData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const evals = await getDailyEvaluations();
        setDailyData(evals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ratingsCount = [0, 0, 0, 0, 0];
  dailyData.forEach(e => {
    if (e.rating >= 1 && e.rating <= 5) {
      ratingsCount[e.rating - 1]++;
    }
  });

  const chartData = [
    { name: '1', count: ratingsCount[0], color: 'hsl(var(--chart-1))' },
    { name: '2', count: ratingsCount[1], color: 'hsl(var(--chart-2))' },
    { name: '3', count: ratingsCount[2], color: 'hsl(var(--chart-3))' },
    { name: '4', count: ratingsCount[3], color: 'hsl(var(--chart-4))' },
    { name: '5', count: ratingsCount[4], color: 'hsl(var(--chart-5))' },
  ];

  const average = dailyData.length > 0 
    ? (dailyData.reduce((acc, curr) => acc + curr.rating, 0) / dailyData.length).toFixed(1)
    : 0;

  const handleSummarize = async () => {
    if (dailyData.length === 0) return;
    setSummarizing(true);
    try {
      const result = await summarizeDailyFeedback({ 
        evaluations: dailyData.map(d => d.rating) 
      });
      setSummary(result.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-black text-[#379936] tracking-tighter uppercase">
            IFCE FoodScore
          </h1>
          <div className="h-10 w-px bg-border hidden md:block" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Painel da Cantina</h1>
            <p className="text-muted-foreground">Visão geral do feedback dos estudantes</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-sm text-muted-foreground uppercase tracking-widest">Data de Hoje</p>
          <p className="text-xl font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total de Votos</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyData.length}</div>
            <p className="text-xs text-muted-foreground">Votos registrados hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Média do Dia</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{average} / 5.0</div>
            <div className="h-2 w-full bg-muted rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-secondary" 
                style={{ width: `${(Number(average) / 5) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tendência</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(average) >= 4 ? "Excelente" : Number(average) >= 3 ? "Boa" : "Precisa Melhorar"}</div>
            <p className="text-xs text-muted-foreground">Classificação baseada em votos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Avaliações</CardTitle>
            <CardDescription>Quantidade de votos por nota (1-5)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-primary/20 bg-primary/[0.02]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-primary" />
                <CardTitle>Resumo de IA</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSummarize}
                disabled={summarizing || dailyData.length === 0}
              >
                {summarizing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Gerar Resumo
              </Button>
            </div>
            <CardDescription>Análise inteligente do feedback coletado hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="prose prose-sm dark:prose-invert">
                <p className="text-lg leading-relaxed">{summary}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p>Clique em "Gerar Resumo" para analisar os dados do dia.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
