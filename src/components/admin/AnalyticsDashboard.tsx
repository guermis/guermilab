import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInView } from '@/hooks/useInView';
import { Eye, MousePointerClick, Clock, ArrowDown, TrendingUp } from 'lucide-react';

interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  avgTimeSpent: number;
  avgScrollDepth: number;
  topProjects: { slug: string; views: number }[];
  dailyViews: { date: string; count: number }[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');
  const { ref, isInView } = useInView();

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);

      const now = new Date();
      let since: string | null = null;
      if (period === '7d') since = new Date(now.getTime() - 7 * 86400000).toISOString();
      else if (period === '30d') since = new Date(now.getTime() - 30 * 86400000).toISOString();

      let query = supabase.from('analytics_events').select('*');
      if (since) query = query.gte('created_at', since);

      const { data: events } = await query;
      if (!events) { setLoading(false); return; }

      const views = events.filter(e => e.event_type === 'view');
      const clicks = events.filter(e => e.event_type === 'click');
      const timeEvents = events.filter(e => e.event_type === 'time_spent');
      const scrollEvents = events.filter(e => e.event_type === 'scroll_depth');

      const avgTime = timeEvents.length > 0
        ? Math.round(timeEvents.reduce((s, e) => s + (Number(e.value) || 0), 0) / timeEvents.length)
        : 0;

      const avgScroll = scrollEvents.length > 0
        ? Math.round(scrollEvents.reduce((s, e) => s + (Number(e.value) || 0), 0) / scrollEvents.length)
        : 0;

      // Top projects
      const projectCounts: Record<string, number> = {};
      views.filter(v => v.project_slug).forEach(v => {
        projectCounts[v.project_slug!] = (projectCounts[v.project_slug!] || 0) + 1;
      });
      const topProjects = Object.entries(projectCounts)
        .map(([slug, count]) => ({ slug, views: count }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Daily views
      const dailyCounts: Record<string, number> = {};
      views.forEach(v => {
        const day = v.created_at.slice(0, 10);
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });
      const dailyViews = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setData({
        totalViews: views.length,
        totalClicks: clicks.length,
        avgTimeSpent: avgTime,
        avgScrollDepth: avgScroll,
        topProjects,
        dailyViews,
      });
      setLoading(false);
    }

    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const maxDaily = Math.max(...(data.dailyViews.map(d => d.count)), 1);

  return (
    <div ref={ref} className={`space-y-6 ${isInView ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(['7d', '30d', 'all'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-sm px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-body transition-all border ${
              period === p
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border bg-secondary text-muted-foreground hover:border-primary/30'
            }`}
          >
            {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Tudo'}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Eye} label="Visualizações" value={data.totalViews.toString()} />
        <StatCard icon={MousePointerClick} label="Cliques" value={data.totalClicks.toString()} />
        <StatCard icon={Clock} label="Tempo médio" value={`${data.avgTimeSpent}s`} />
        <StatCard icon={ArrowDown} label="Scroll médio" value={`${data.avgScrollDepth}%`} />
      </div>

      {/* Mini chart */}
      {data.dailyViews.length > 1 && (
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body">
              Visualizações por dia
            </span>
          </div>
          <div className="flex items-end gap-1 h-20">
            {data.dailyViews.slice(-14).map((d, i) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/60 rounded-t-sm min-h-[2px] transition-all duration-500"
                  style={{
                    height: `${(d.count / maxDaily) * 100}%`,
                    animationDelay: `${i * 50}ms`,
                  }}
                  title={`${d.date}: ${d.count} views`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-muted-foreground font-mono">
              {data.dailyViews[Math.max(0, data.dailyViews.length - 14)]?.date.slice(5)}
            </span>
            <span className="text-[8px] text-muted-foreground font-mono">
              {data.dailyViews[data.dailyViews.length - 1]?.date.slice(5)}
            </span>
          </div>
        </div>
      )}

      {/* Top projects */}
      {data.topProjects.length > 0 && (
        <div className="rounded-sm border border-border bg-card p-4">
          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body">
            Projetos mais vistos
          </span>
          <div className="mt-3 space-y-2">
            {data.topProjects.map((p, i) => (
              <div key={p.slug} className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-mono w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground font-body">{p.slug}</span>
                    <span className="text-[10px] text-primary font-mono">{p.views}</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full"
                      style={{ width: `${(p.views / data.topProjects[0].views) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.totalViews === 0 && (
        <div className="text-center py-8">
          <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-body">Nenhum dado de analytics ainda.</p>
          <p className="text-xs text-muted-foreground/60 font-body mt-1">Os dados aparecem conforme visitantes interagem com o portfólio.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground font-body">{label}</span>
      </div>
      <span className="text-xl font-display text-foreground">{value}</span>
    </div>
  );
}
