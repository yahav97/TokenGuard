import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Zap, Database, Leaf, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

// TypeScript Interfaces
interface SummaryData {
  total_requests: number;
  cache_hits: number;
  cache_hit_rate: number;
  total_usd_saved: number;
}

interface DepartmentData {
  department_name: string;
  monthly_budget: number;
  current_spending: number;
}

function App() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [ecoMode, setEcoMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, deptsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/analytics/summary'),
          fetch('http://127.0.0.1:8000/analytics/departments')
        ]);
        
        if (!summaryRes.ok || !deptsRes.ok) throw new Error("Server communication error");

        const summaryData = await summaryRes.json();
        const deptsData = await deptsRes.json();
        
        setSummary(summaryData);
        setDepartments(deptsData);
        setError(null);
      } catch (err) {
        // בודקים באופן בטוח האם השגיאה היא אכן אובייקט שגיאה תקני
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to connect to the TokenGuard backend.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Dynamic Insights Engine ---
  const generateInsights = () => {
    const insights = [];
    if (!departments.length || !summary) return insights;

    const highestSpender = departments.reduce((prev, current) => 
      (prev.current_spending > current.current_spending) ? prev : current
    );
    
    const utilization = (highestSpender.current_spending / highestSpender.monthly_budget) * 100;
    if (utilization > 75) {
      insights.push({
        icon: <AlertTriangle className="text-[#E50914]" size={18} />,
        text: `Budget Alert: ${highestSpender.department_name} utilized ${utilization.toFixed(1)}% of allocation.`,
        borderColor: "border-[#E50914]/40",
        bg: "bg-[#E50914]/10"
      });
    }

    if (summary.cache_hit_rate < 30) {
      insights.push({
        icon: <Lightbulb className="text-zinc-400" size={18} />,
        text: `Optimization opportunity: Cache hit rate is ${summary.cache_hit_rate}%. Adjust vector threshold to 0.80.`,
        borderColor: "border-[#444444]",
        bg: "bg-[#222222]"
      });
    } else {
      insights.push({
        icon: <CheckCircle className="text-white/80" size={18} />,
        text: `System optimal: Memory efficiency is maintaining a ${summary.cache_hit_rate}% hit rate.`,
        borderColor: "border-[#444444]",
        bg: "bg-[#222222]"
      });
    }

    if (ecoMode) {
      insights.push({
        icon: <Leaf className="text-[#10B981]" size={18} />,
        text: `Eco Mode active. Complex requests downgraded to standard models. Compression locked at 60%.`,
        borderColor: "border-[#10B981]/40",
        bg: "bg-[#10B981]/10"
      });
    } else {
      insights.push({
        icon: <Zap className="text-zinc-500" size={18} />,
        text: `Dynamic routing active. Premium models enabled for high-complexity prompts.`,
        borderColor: "border-[#333333]",
        bg: "bg-transparent"
      });
    }

    return insights;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] text-zinc-400 p-4 font-sans selection:bg-[#E50914]/80 selection:text-white">
        <AlertTriangle size={32} className="mb-4 text-[#E50914] drop-shadow-md" />
        <h2 className="text-2xl font-semibold mb-2 text-white">Connection Failed</h2>
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414] text-zinc-400 font-sans text-sm selection:bg-[#E50914]/80 selection:text-white">
        <Activity className="animate-spin mr-3 text-[#E50914]" size={16} />
        Initializing TokenGuard environment...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-zinc-200 p-6 md:p-10 font-sans selection:bg-[#E50914]/80 selection:text-white">
      {/* תוקן: max-w-screen-2xl ממרכז ומגדיל את רוחב הפורטל על מסכים רחבים */}
      <div className="max-w-screen-2xl mx-auto rounded-3xl p-6 md:p-8">
        
        {/* Cinematic Header with Softer Borders */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#333333] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#2B2B2B] border border-[#444444]/60 rounded-xl shadow-lg">
                <Database size={20} className="text-[#E50914]" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                TokenGuard
              </h1>
              <span className="px-3 py-1 rounded-full bg-[#333333] border border-[#444444] text-[11px] uppercase tracking-widest font-semibold text-zinc-300 shadow-inner">
                Enterprise
              </span>
            </div>
            <p className="text-zinc-400 text-sm font-medium">FinOps & Dynamic Routing Control Center</p>
          </div>
          
          <button 
            onClick={() => setEcoMode(!ecoMode)}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border shadow-lg ${
              ecoMode 
                ? 'bg-[#10B981] text-white border-[#10B981] hover:bg-[#059669] shadow-[#10B981]/30' 
                : 'bg-[#2B2B2B] text-zinc-200 border-[#444444] hover:text-white hover:border-[#666666] hover:bg-[#333333]'
            }`}
          >
            <Leaf size={18} className={ecoMode ? 'fill-white' : ''} />
            {ecoMode ? 'Eco Mode Active' : 'Enable Eco Mode'}
          </button>
        </header>

        {/* KPI Cards with Modern Softness & Depth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            // תוקן: צבע הירוק מיועד ל-Saved (דולרים). שאר הצבעים הם קרירים וניטרליים
            { title: "Costs Saved", value: `$${summary.total_usd_saved.toFixed(2)}`, icon: <DollarSign className="text-[#10B981]" size={20} />, hoverColor: "#10B981" },
            { title: "Hit Rate", value: `${summary.cache_hit_rate}%`, sub: `/ ${summary.cache_hits} responses`, icon: <Zap className="text-[#22D3EE]" size={20} />, hoverColor: "#22D3EE" },
            { title: "Total Requests", value: summary.total_requests, icon: <Activity className="text-[#818CF8]" size={20} />, hoverColor: "#818CF8" }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#2B2B2B] p-7 rounded-2xl border border-[#444444]/60 shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-[#000000]/60 group" style={{ borderColor: item.hoverColor + '60' }}>
              <div className="flex justify-between items-start mb-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{item.title}</p>
                <div className="p-2 bg-[#1A1A1A] rounded-lg border border-[#333333]" style={{ borderColor: item.hoverColor + '50' }}>
                  {item.icon}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-white tracking-tighter drop-shadow-sm">
                  {item.value}
                </h3>
                {item.sub && <span className="text-xs font-medium text-zinc-500">{item.sub}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart with Softer Grid */}
          <div className="lg:col-span-2 bg-[#2B2B2B] p-7 rounded-2xl border border-[#444444]/60 shadow-2xl">
            <h2 className="text-sm font-semibold text-zinc-300 mb-8 uppercase tracking-wider">Budget vs. Actual</h2>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3A3A3A" />
                  <XAxis dataKey="department_name" axisLine={false} tickLine={false} tick={{ fill: '#909090', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: '#909090', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip 
                    cursor={{fill: '#333333', opacity: 0.6}}
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#444444', borderRadius: '12px', color: '#fff', fontSize: '13px', padding: '14px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.7)' }}
                    itemStyle={{ color: '#e4e4e7', fontWeight: 500 }}
                  />
                  {/* תוקן: המקרא משתמש בטקסט ניטרלי יותר עכשיו */}
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#e2e8f0', paddingTop: '25px', fontWeight: 500 }} iconType="circle" iconSize={8} />
                  
                  {/* צבעי הגרף: כחול ספיר (Allocation) מול אדום נטפליקס (Utilized) */}
                  <Bar dataKey="monthly_budget" name="Allocation" fill="#818CF8" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="current_spending" name="Utilized" fill="#E50914" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cinematic Insights Panel */}
          <div className="bg-[#2B2B2B] p-7 rounded-2xl border border-[#444444]/60 shadow-2xl flex flex-col">
            <h2 className="text-sm font-semibold text-zinc-300 mb-6 uppercase tracking-wider flex items-center gap-2">
              <Activity className="text-zinc-500" size={16} />
              Active Telemetry
            </h2>
            <div className="flex flex-col gap-5 overflow-y-auto pr-1">
              {generateInsights().map((insight, index) => (
                <div key={index} className={`p-5 rounded-xl border border-[#444444]/50 flex gap-4 transition-all duration-300 ${insight.borderColor} ${insight.bg}`}>
                  <div className="mt-0.5 shrink-0 p-1.5 bg-[#1A1A1A]/70 rounded-lg border border-[#333333]/50">
                    {insight.icon}
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed font-medium tracking-wide">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;