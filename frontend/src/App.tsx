import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Zap, Database, Leaf, Lightbulb, AlertTriangle, CheckCircle, Lock, User, LogOut, Key } from 'lucide-react';

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
  department_key?: string;
}

interface AuthSuccessData {
  message: string;
  apiKey?: string;
  defaultKey?: string;
}

function App() {
  // --- Auth States ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('loggedUser') || '';
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState<AuthSuccessData | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // --- Dashboard States ---
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ecoMode, setEcoMode] = useState<boolean>(false);

  // --- Create Workspace Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptBudget, setNewDeptBudget] = useState('');
  const [newDeptKey, setNewDeptKey] = useState<string | null>(null);

  // --- Auth Handler ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    setAuthSuccess(null);

    const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';

    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegisterMode) {
          setAuthSuccess({
            message: 'Workspace created successfully! Save your keys before logging in.',
            apiKey: data.api_key,
            defaultKey: data.default_key
          });
          setIsRegisterMode(false);
          setPassword('');
        } else {
          setIsAuthenticated(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('loggedUser', username);
        }
      } else {
        setAuthError(data.detail || 'Authentication failed.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError('Failed to connect to the authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedUser');
    setPassword('');
    setIsRegisterMode(false);
    setAuthSuccess(null);
  };

  // --- Create Department Handler ---
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/departments/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': username 
        },
        body: JSON.stringify({ 
          department_name: newDeptName, 
          monthly_budget: parseFloat(newDeptBudget) 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments([...departments, data.department]);
        setNewDeptKey(data.department.department_key);
        setNewDeptName('');
        setNewDeptBudget('');
      } else {
        alert("Failed to create workspace.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'x-user-id': username 
        };

        const [summaryRes, deptsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/analytics/summary', { headers }),
          fetch('http://127.0.0.1:8000/analytics/departments', { headers })
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
  }, [isAuthenticated, username]);

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
        text: `Optimization opportunity: Cache hit rate is ${summary.cache_hit_rate}%. Adjust vector threshold.`,
        borderColor: "border-[#444444]",
        bg: "bg-[#222222]"
      });
    } else {
      insights.push({
        icon: <CheckCircle className="text-zinc-200" size={18} />,
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

  // ==========================================
  // VIEW: LOGIN / REGISTER SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414] font-sans selection:bg-[#E50914]/80 selection:text-zinc-100 px-4">
        <div className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-2xl border border-[#333333] shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-[#2B2B2B] border border-[#444444]/60 rounded-xl shadow-lg">
              <Database size={24} className="text-[#E50914]" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tighter">TokenGuard</h1>
          </div>
          
          <h2 className="text-center text-zinc-300 text-lg font-medium mb-6">
            {isRegisterMode ? 'Create your Workspace' : 'Sign in to your Dashboard'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#222222] border border-[#333333] text-zinc-100 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#E50914] transition-colors"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#222222] border border-[#333333] text-zinc-100 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#E50914] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && (
              <p className="text-[#E50914] text-sm text-center font-medium bg-[#E50914]/10 p-3 rounded border border-[#E50914]/30">
                {authError}
              </p>
            )}

            {authSuccess && (
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 p-4 rounded-lg space-y-3">
                <p className="text-[#10B981] text-sm text-center font-bold">
                  {authSuccess.message}
                </p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold uppercase">API Key (SDK Access):</span>
                    <div className="flex items-center gap-2 bg-[#1A1A1A] p-2 rounded border border-[#333333] mt-1">
                      <Key size={14} className="text-[#10B981]" />
                      <code className="text-xs text-zinc-300 font-mono break-all">{authSuccess.apiKey}</code>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold uppercase">Default Department Key:</span>
                    <div className="flex items-center gap-2 bg-[#1A1A1A] p-2 rounded border border-[#333333] mt-1">
                      <Database size={14} className="text-[#818CF8]" />
                      <code className="text-xs text-zinc-300 font-mono break-all">{authSuccess.defaultKey}</code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className={`w-full text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4 ${
                isRegisterMode 
                  ? 'bg-[#818CF8] hover:bg-[#6366f1] shadow-[#818CF8]/30' 
                  : 'bg-[#E50914] hover:bg-[#b80710] shadow-[#E50914]/30'
              }`}
            >
              {isLoggingIn ? 'Processing...' : (isRegisterMode ? 'Create Workspace' : 'Secure Login')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setAuthError('');
                setAuthSuccess(null);
                setPassword('');
              }}
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors underline-offset-4 hover:underline"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: LOADING OR ERROR (Post-Login)
  // ==========================================
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] text-zinc-400 p-4 font-sans">
        <AlertTriangle size={32} className="mb-4 text-[#E50914]" />
        <h2 className="text-2xl font-semibold mb-2 text-zinc-100">Connection Failed</h2>
        <p className="text-sm font-medium">{error}</p>
        <button 
          onClick={handleLogout}
          className="mt-6 px-4 py-2 bg-[#2B2B2B] text-zinc-100 rounded hover:bg-[#333333] transition-colors text-sm font-semibold"
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414] text-zinc-400 font-sans text-sm">
        <Activity className="animate-spin mr-3 text-[#E50914]" size={16} />
        Loading Workspace Data...
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#141414] text-zinc-200 p-6 md:p-10 font-sans selection:bg-[#E50914]/80 selection:text-zinc-100">
      <div className="max-w-screen-2xl mx-auto rounded-3xl p-6 md:p-8">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#333333] pb-6 relative">
          
          {/* הילה אדומה/עדינה ברקע שנותנת עומק */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#ea6969be] opacity-[0.03] rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-4 mb-3">
              
              {/* קוביית לוגו עם אפקט זריחה יוקרתי */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#ea6969be] opacity-20 blur-lg rounded-xl group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative p-3 bg-gradient-to-br from-[#2B2B2B] to-[#141414] border border-[#ea6969be]/30 rounded-xl shadow-2xl">
                  <Database size={24} className="text-[#ea6969be]" />
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  {/* טקסט עם גרדיאנט שמחליף את הלבן החד */}
                  <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
                    Token<span className="text-[#ea6969be]">Guard</span>
                  </h1>
                  
                  {/* תגית Enterprise מוארת עם נקודה מהבהבת */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea6969be]/10 border border-[#ea6969be]/30 shadow-[0_0_10px_rgba(234,105,105,0.1)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ea6969be] animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#ea6969be]">
                      Enterprise
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-zinc-400 text-sm font-medium flex items-center gap-2 ml-2">
              <span className="w-5 h-px bg-zinc-600"></span>
              Welcome back, <span className="text-zinc-100 font-semibold">{username}</span>
            </p>
            
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setIsModalOpen(true);
                setNewDeptKey(null);
              }}
              className="px-5 py-2.5 bg-[#818CF8] hover:bg-[#6366f1] text-white text-sm font-semibold rounded-xl shadow-[0_0_15px_rgba(129,140,248,0.2)] transition-all"
            >
              + New Workspace
            </button>

            <button 
              onClick={() => {
                const newState = !ecoMode;
                setEcoMode(newState);
                fetch('http://127.0.0.1:8000/config/eco', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ enabled: newState })
                }).catch(() => setEcoMode(!newState));
              }}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border shadow-lg ${
                ecoMode 
                  ? 'bg-[#10B981] text-white border-[#10B981] hover:bg-[#059669] shadow-[#10B981]/30' 
                  : 'bg-[#2B2B2B] text-zinc-200 border-[#444444] hover:text-zinc-100 hover:border-[#666666] hover:bg-[#333333]'
              }`}
            >
              <Leaf size={18} className={ecoMode ? 'fill-white' : ''} />
              {ecoMode ? 'Eco Mode Active' : 'Enable Eco Mode'}
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
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
                <h3 className="text-4xl font-extrabold text-zinc-100 tracking-tighter drop-shadow-sm">
                  {item.value}
                </h3>
                {item.sub && <span className="text-xs font-medium text-zinc-500">{item.sub}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#2B2B2B] p-7 rounded-2xl border border-[#444444]/60 shadow-2xl">
            <h2 className="text-sm font-semibold text-zinc-300 mb-8 uppercase tracking-wider">Budget vs. Actual</h2>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3A3A3A" />
                  <XAxis dataKey="department_name" axisLine={false} tickLine={false} tick={{ fill: '#909090', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis domain={[0, 'auto']} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: '#909090', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip 
                    cursor={{fill: '#333333', opacity: 0.6}}
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#444444', borderRadius: '12px', color: '#f4f4f5', fontSize: '13px', padding: '14px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.7)' }}
                    itemStyle={{ color: '#e4e4e7', fontWeight: 500 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#e2e8f0', paddingTop: '25px', fontWeight: 500 }} iconType="circle" iconSize={8} />
                  
                  <Bar dataKey="monthly_budget" name="Allocation" fill="#818CF8" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="current_spending" name="Utilized" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                  <p className="text-sm text-zinc-200 leading-relaxed font-medium tracking-wide">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Create Workspace Modal --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] border border-[#333333] p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-zinc-100 mb-2">Create New Workspace</h2>
              <p className="text-sm text-zinc-400 mb-6">Allocate a budget and get an integration key.</p>
              
              {newDeptKey ? (
                <div className="bg-[#10B981]/10 border border-[#10B981]/30 p-5 rounded-xl mb-6">
                  <p className="text-[#10B981] font-semibold text-sm mb-2">Success! Here is your integration key:</p>
                  <div className="bg-[#141414] p-3 rounded border border-[#333333] font-mono text-zinc-300 text-sm break-all">
                    {newDeptKey}
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 text-center">Use this key in your SDK.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateDepartment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Department Name</label>
                    <input 
                      type="text" required value={newDeptName} onChange={e => setNewDeptName(e.target.value)}
                      className="w-full bg-[#222222] border border-[#333333] text-zinc-100 rounded-lg p-3 focus:border-[#818CF8] outline-none"
                      placeholder="e.g. Sales AI Agent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Monthly Budget ($)</label>
                    <input 
                      type="number" required min="1" value={newDeptBudget} onChange={e => setNewDeptBudget(e.target.value)}
                      className="w-full bg-[#222222] border border-[#333333] text-zinc-100 rounded-lg p-3 focus:border-[#818CF8] outline-none"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#818CF8] hover:bg-[#6366f1] text-white font-bold py-3 rounded-lg mt-2 transition-colors">
                    Create & Generate Key
                  </button>
                </form>
              )}
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-4 text-zinc-400 hover:text-zinc-200 text-sm font-medium py-2"
              >
                {newDeptKey ? 'Done' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;