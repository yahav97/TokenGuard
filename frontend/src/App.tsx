import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Zap, Database } from 'lucide-react';

// הגדרת הממשקים (TypeScript Types) לתשובות מהשרת
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

  // משיכת הנתונים מה-FastAPI כשהרכיב עולה
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, deptsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/analytics/summary'),
          fetch('http://127.0.0.1:8000/analytics/departments')
        ]);
        
        const summaryData = await summaryRes.json();
        const deptsData = await deptsRes.json();
        
        setSummary(summaryData);
        setDepartments(deptsData);
      } catch (error) {
        console.error("Failed to fetch data from API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // ריענון הנתונים כל 5 שניות לתחושת "זמן אמת"
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        <Activity className="animate-spin mr-2" />
        טוען נתוני FinOps...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Database className="text-blue-600" />
            TokenGuard Enterprise Dashboard
          </h1>
          <p className="text-slate-500 mt-2">בקרה בזמן אמת על תקציבי AI וניתוב מודלים</p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Total Saved */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">סך הכל חיסכון</p>
              <h3 className="text-3xl font-bold text-emerald-600">${summary.total_usd_saved.toFixed(2)}</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-full">
              <DollarSign className="text-emerald-500" size={24} />
            </div>
          </div>

          {/* Card 2: Cache Hit Rate */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">יעילות זיכרון (Cache Hits)</p>
              <h3 className="text-3xl font-bold text-blue-600">{summary.cache_hit_rate}%</h3>
              <p className="text-xs text-slate-400 mt-1">{summary.cache_hits} בקשות נשלפו מהקאש</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-full">
              <Zap className="text-blue-500" size={24} />
            </div>
          </div>

          {/* Card 3: Total Requests */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">סך הכל בקשות שרת</p>
              <h3 className="text-3xl font-bold text-slate-800">{summary.total_requests}</h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-full">
              <Activity className="text-slate-500" size={24} />
            </div>
          </div>
        </div>

        {/* FinOps Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">מצב תקציב AI לפי מחלקות</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department_name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="monthly_budget" name="תקציב חודשי" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current_spending" name="בזבוז בפועל" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;