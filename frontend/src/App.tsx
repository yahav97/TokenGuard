import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Zap, Database, Leaf, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

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
        text: `Critical Alert: ${highestSpender.department_name} utilized ${utilization.toFixed(1)}% of allocation.`,
        borderColor: "border-[#E50914]/50",
        bg: "bg-[#E50914]/10"
      });
    }

    if (summary.cache_hit_rate < 30) {
      insights.push({
        icon: <Lightbulb className="text-zinc-400" size={18} />,
        text: `Optimization opportunity: Cache hit rate is ${summary.cache_hit_rate}%. Adjust vector threshold to 0.80.`,
        borderColor: "border-[#333333]",
        bg: "bg-[#181818]"
      });
    } else {
      insights.push({
        icon: <CheckCircle className="text-zinc-300" size={18} />,
        text: `System optimal: Memory efficiency is maintaining a ${summary.cache_hit_rate}% hit rate.`,
        borderColor: "border-[#333333]",
        bg: "bg-[#181818]"
      });
    }

    if (ecoMode) {
      insights.push({
        icon: <Leaf className="text-[#E50914]" size={18} />,
        text: `Eco Mode enforced. Complex requests downgraded. Compression locked at 60%.`,
        borderColor: "border-[#E50914]/50",
        bg: "bg-[#E50914]/10"
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] text-zinc-400 p-4 font-sans">
        <AlertTriangle size={32} className="mb-4 text-[#E50914]" />
        <h2 className="text-xl font-medium mb-2 text-white">Connection Failed</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414] text-zinc-500 font-sans text-sm">
        <Activity className="animate-spin mr-3 text-[#E50914]" size={16} />
        Initializing TokenGuard environment...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-zinc-300 p-6 md:p-10 font-sans selection:bg-[#E50914] selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Cinematic Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#333333] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-[#181818] border border-[#333333] rounded-sm">
                <Database size={18} className="text-[#E50914]" />
              </div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                TokenGuard
              </h1>
              <span className="px-2 py-0.5 rounded bg-[#222222] border border-[#333333] text-[10px] uppercase tracking-widest font-medium text-zinc-400">
                Enterprise
              </span>
            </div>
            <p className="text-zinc-500 text-sm">FinOps & Dynamic Routing Control Center</p>
          </div>
          
          <button 
            onClick={() => setEcoMode(!ecoMode)}
            className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-medium transition-all duration-200 border ${
              ecoMode 
                ? 'bg-[#E50914] text-white border-[#E50914] hover:bg-[#b80710] shadow-[0_0_15px_rgba(229,9,20,0.3)]' 
                : 'bg-[#181818] text-zinc-400 border-[#333333] hover:text-white hover:border-zinc-500'
            }`}
          >
            <Leaf size={16} className={ecoMode ? 'fill-white' : ''} />
            {ecoMode ? 'Eco Mode Active' : 'Enable Eco Mode'}
          </button>
        </header>

        {/* Sharp KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#181818] p-6 rounded-sm border border-[#333333] hover:border-[#555555] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Costs Saved</p>
              <DollarSign className="text-[#E50914]" size={16} />
            </div>
            <h3 className="text-3xl font-semibold text-white tracking-tight">
              ${summary.total_usd_saved.toFixed(2)}
            </h3>
          </div>

          <div className="bg-[#181818] p-6 rounded-sm border border-[#333333] hover:border-[#555555] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Hit Rate</p>
              <Zap className="text-zinc-600" size={16} />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold text-white tracking-tight">
                {summary.cache_hit_rate}%
              </h3>
              <span className="text-xs text-zinc-600">/ {summary.cache_hits} responses</span>
            </div>
          </div>

          <div className="bg-[#181818] p-6 rounded-sm border border-[#333333] hover:border-[#555555] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Requests</p>
              <Activity className="text-zinc-600" size={16} />
            </div>
            <h3 className="text-3xl font-semibold text-white tracking-tight">
              {summary.total_requests}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-[#181818] p-6 rounded-sm border border-[#333333]">
            <h2 className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">Budget vs. Actual</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
                  <XAxis dataKey="department_name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: '#71717a', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: '#222222', opacity: 0.5}}
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#333333', borderRadius: '4px', color: '#fff', fontSize: '12px', padding: '12px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#71717a', paddingTop: '20px' }} iconType="circle" iconSize={8} />
                  
                  {/* צבעי הגרף: כסף כהה לתקציב, אדום דרמטי לבזבוז */}
                  <Bar dataKey="monthly_budget" name="Allocation" fill="#404040" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="current_spending" name="Utilized" fill="#E50914" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cinematic Insights */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Active Telemetry</h2>
            {generateInsights().map((insight, index) => (
              <div key={index} className={`p-4 rounded-sm border-l-2 border-y border-r border-r-[#333333] border-y-[#333333] flex gap-3 ${insight.borderColor} ${insight.bg}`}>
                <div className="mt-0.5 shrink-0">{insight.icon}</div>
                <p className="text-sm text-zinc-300 leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;