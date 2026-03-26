
"use client";

import React, { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { MessageSquare, Star, TrendingUp, Clock, History, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AdminDashboard = () => {
  const firestore = useFirestore();

  const ratingsQuery = useMemoFirebase(() => 
    query(collection(firestore, "dailyMealRatings"), orderBy("createdAt", "desc"), limit(100)),
    [firestore]
  );

  const feedbacksQuery = useMemoFirebase(() => 
    query(collection(firestore, "mealFeedbacks"), orderBy("createdAt", "desc"), limit(50)),
    [firestore]
  );

  const { data: ratings, isLoading: loadingRatings } = useCollection(ratingsQuery);
  const { data: feedbacks, isLoading: loadingFeedbacks } = useCollection(feedbacksQuery);

  const stats = useMemo(() => {
    if (!ratings || ratings.length === 0) return { avg: 0, count: 0 };
    const sum = ratings.reduce((acc, r) => acc + (r.ratingValue || 0), 0);
    return {
      avg: (sum / ratings.length).toFixed(1),
      count: ratings.length
    };
  }, [ratings]);

  const chartData = useMemo(() => {
    if (!ratings) return [];
    const grouped = ratings.slice(0, 100).reduce((acc: any, curr) => {
      const date = curr.ratingDate;
      if (!acc[date]) acc[date] = { date, total: 0, count: 0 };
      acc[date].total += curr.ratingValue;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((d: any) => ({
        name: format(new Date(d.date + 'T12:00:00'), 'dd/MM'),
        avg: parseFloat((d.total / d.count).toFixed(1))
      }))
      .reverse();
  }, [ratings]);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#F8FAFC] min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary uppercase tracking-tighter leading-none">
              IFCE Campus Itapipoca
            </h1>
            <p className="text-muted-foreground font-medium text-sm">
              Dashboard de Monitoramento de Refeições
            </p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit px-4 py-1 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary bg-white shadow-sm">
          <Clock className="w-3 h-3 mr-2 animate-pulse" />
          Live Update Ativo
        </Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-white overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              Satisfação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-primary group-hover:scale-110 transition-transform origin-left">{stats.avg}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Média ponderada (1 a 5)</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Total de Votos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-primary group-hover:scale-110 transition-transform origin-left">{stats.count}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Amostra coletada no Totem</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-secondary" />
              Sugestões & Queixas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-primary group-hover:scale-110 transition-transform origin-left">{feedbacks?.length || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Feedback qualitativo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight text-primary">Evolução por Data</CardTitle>
            <CardDescription>Média das notas registradas nos últimos dias</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 5]} hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(55,153,54,0.05)'}} 
                      content={<ChartTooltipContent hideLabel />} 
                    />
                    <Bar dataKey="avg" radius={[6, 6, 0, 0]} barSize={35}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.avg >= 4 ? '#379936' : entry.avg >= 3 ? '#FACC15' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                 Aguardando primeiras avaliações...
               </div>
             )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mural de Sugestões
            </CardTitle>
            <CardDescription>Mensagens anônimas enviadas pelos alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {feedbacks?.map((f) => (
                <div key={f.id} className="p-4 bg-muted/20 rounded-xl border border-border/40 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black uppercase text-muted-foreground bg-white px-2 py-0.5 rounded-full border border-border/40">
                      {f.createdAt ? format(new Date(f.createdAt), 'dd MMM • HH:mm', { locale: ptBR }) : '-'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{f.content}</p>
                </div>
              ))}
              {(!feedbacks || feedbacks.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 opacity-20 mb-2" />
                  <p className="italic text-sm">Nenhuma mensagem ainda.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl bg-white">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-black uppercase tracking-tight text-primary">Histórico Completo de Votos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/80">
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Data e Hora</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Período</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Nota</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-right">Classificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratings?.map((r) => (
                <TableRow key={r.id} className="border-border/40 hover:bg-muted/10 transition-colors">
                  <TableCell className="font-medium text-xs text-muted-foreground">
                    {r.createdAt ? format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm:ss') : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground px-2 py-1 bg-muted rounded-lg">
                      {r.period || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`font-black ${
                      r.ratingValue >= 4 ? 'bg-primary/10 text-primary' : 
                      r.ratingValue >= 3 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-destructive/10 text-destructive'
                    } border-none`}>
                      {r.ratingValue}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-black uppercase text-[9px] text-right">
                    {r.ratingValue === 1 && "Muito Ruim"}
                    {r.ratingValue === 2 && "Ruim"}
                    {r.ratingValue === 3 && "Médio"}
                    {r.ratingValue === 4 && "Bom"}
                    {r.ratingValue === 5 && "Excelente"}
                  </TableCell>
                </TableRow>
              ))}
              {(!ratings || ratings.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                    Nenhum voto registrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
