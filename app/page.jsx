"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoggedIn && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <LandingPage />;
}

function Dashboard({ user, onLogout }) {
  return (
    <div className="flex h-screen bg-[#0b0e14] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#11141d] border-r border-zinc-800 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mr-3 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            OS
          </div>
          <span className="font-bold text-lg tracking-tight">AI Business OS</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <NavItem icon="dashboard" label="Dashboard" active />
          <NavItem icon="agents" label="Agents" />
          <NavItem icon="tasks" label="Tasks" />
          <NavItem icon="analytics" label="Analytics" />
          <NavItem icon="storage" label="Storage" />
          <NavItem icon="settings" label="Settings" />
        </nav>
        <div className="p-4">
          <div className="bg-[#1a1f2e] border border-zinc-700/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
            <div>
              <p className="text-sm font-medium text-white">System Online</p>
              <p className="text-xs text-zinc-400">All systems operational</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-end px-8 border-b border-zinc-800 bg-[#0b0e14] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 mr-4">
              <div className="w-8 h-8 rounded-full bg-[#1a1f2e] flex items-center justify-center text-blue-400 font-semibold border border-zinc-700">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm text-zinc-300">{user.name} {user.second_name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e1545] to-[#111833] border border-blue-900/30 p-8 lg:p-10 shadow-2xl min-h-[300px] flex items-center">
            <div className="relative z-10 max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-blue-200/70 text-lg mb-8 leading-relaxed">
                Your AI agents are working hard to automate and optimize your business operations.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 rounded-lg bg-[#2a2454]/50 border border-[#3b3472] text-xs sm:text-sm font-medium text-purple-200 flex items-center gap-2 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  AI-Powered
                </div>
                <div className="px-4 py-2 rounded-lg bg-[#1a2344]/50 border border-[#2b3a69] text-xs sm:text-sm font-medium text-blue-200 flex items-center gap-2 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Secure
                </div>
                <div className="px-4 py-2 rounded-lg bg-[#2c1d42]/50 border border-[#482e6c] text-xs sm:text-sm font-medium text-pink-200 flex items-center gap-2 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Real-time
                </div>
              </div>
            </div>
            
            {/* Robot Image on the right */}
            <div className="absolute top-0 right-0 h-full w-1/2 lg:w-2/5 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e1545] to-transparent z-10 w-32 left-0"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111833] via-transparent to-[#1e1545] z-10 opacity-60"></div>
              <Image 
                src="/robot-banner.png" 
                alt="AI Robot" 
                fill 
                className="object-cover object-center lg:object-right mix-blend-screen opacity-90 scale-110 translate-y-4"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Active Agents" value="12" trend="+ 2" trendDesc="vs last 7 days" trendUp icon="bot" color="purple" />
            <StatCard title="Tasks Completed" value="1,432" trend="+ 18%" trendDesc="vs last 7 days" trendUp icon="check" color="blue" />
            <StatCard title="System Health" value="99.9%" trend="Optimal" trendDesc="All systems running" trendUp icon="heart" color="green" />
            <StatCard title="Total Storage" value="45 GB" trend="- 2%" trendDesc="vs last 7 days" trendUp={false} icon="storage" color="orange" />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tasks */}
            <div className="lg:col-span-2 bg-[#11141d] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-lg font-bold">Recent Tasks</h2>
                <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-zinc-800/50">
                  {[
                    { id: 1021, time: '2 min ago' },
                    { id: 1022, time: '15 min ago' },
                    { id: 1023, time: '32 min ago' },
                    { id: 1024, time: '1 hr ago' }
                  ].map((task) => (
                    <li key={task.id} className="p-4 sm:p-6 hover:bg-zinc-800/20 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1a1f2e] border border-zinc-700 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                          <svg className="w-5 h-5 text-zinc-400 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-zinc-200">Data Extraction Task #{task.id}</p>
                          <p className="text-xs text-zinc-500 mt-1">Processed by Agent Alpha</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-green-400">Completed</span>
                        <p className="text-xs text-zinc-500 mt-1">{task.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#11141d] rounded-2xl border border-zinc-800 p-6">
              <h2 className="text-lg font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ActionCard title="New Task" desc="Create and assign a new task" icon="plus" color="blue" />
                <ActionCard title="Deploy Agent" desc="Deploy a new AI agent" icon="lightning" color="purple" />
                <ActionCard title="Analytics" desc="View insights and performance" icon="chart" color="green" />
                <ActionCard title="Settings" desc="Configure system preferences" icon="cog" color="orange" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  const getIcon = () => {
    switch(icon) {
      case 'dashboard': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
      case 'agents': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'tasks': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
      case 'analytics': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      case 'storage': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
      case 'settings': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      default: return null;
    }
  };

  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-[#1a2344] text-blue-400 shadow-[inset_2px_0_0_0_#3b82f6]' 
        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
    }`}>
      {getIcon()}
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, trendDesc, trendUp, icon, color }) {
  const getIcon = () => {
    switch(icon) {
      case 'bot': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'check': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
      case 'heart': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
      case 'storage': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
      default: return null;
    }
  };

  const getColorClasses = () => {
    switch(color) {
      case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'blue': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'green': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'orange': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const trendColor = trendUp ? 'text-green-400' : 'text-red-400';
  const TrendIcon = trendUp ? (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
  ) : (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
  );

  return (
    <div className="bg-[#11141d] p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getColorClasses()}`}>
          {getIcon()}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <div className="text-right">
          <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${trendColor}`}>
            {TrendIcon}
            {trend}
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5">{trendDesc}</p>
        </div>
      </div>
      
      {/* Decorative sparkline-like bottom border */}
      <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r opacity-50 ${
        color === 'purple' ? 'from-purple-500/0 via-purple-500 to-purple-500/0' :
        color === 'blue' ? 'from-blue-500/0 via-blue-500 to-blue-500/0' :
        color === 'green' ? 'from-green-500/0 via-green-500 to-green-500/0' :
        'from-orange-500/0 via-orange-500 to-orange-500/0'
      }`}></div>
    </div>
  );
}

function ActionCard({ title, desc, icon, color }) {
  const getIcon = () => {
    switch(icon) {
      case 'plus': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
      case 'lightning': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
      case 'chart': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      case 'cog': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      default: return null;
    }
  };

  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'bg-[#1a2344] text-blue-400 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      case 'purple': return 'bg-[#2a2454] text-purple-400 group-hover:bg-purple-500/20 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      case 'green': return 'bg-[#1a2e28] text-green-400 group-hover:bg-green-500/20 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]';
      case 'orange': return 'bg-[#30211a] text-orange-400 group-hover:bg-orange-500/20 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <button className="flex flex-col items-center justify-center p-6 bg-[#1a1f2e] rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all hover:-translate-y-1 group text-center h-full">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all ${getColorClasses()}`}>
        {getIcon()}
      </div>
      <span className="text-sm font-semibold text-zinc-200 mb-1">{title}</span>
      <span className="text-xs text-zinc-500">{desc}</span>
    </button>
  );
}

function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Navbar for Landing */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
            OS
          </div>
          <span className="font-bold text-xl tracking-tight">AI Business OS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">Sign In</Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 max-w-7xl mx-auto px-6 py-12 gap-12 w-full">
        <div className="flex flex-col items-start text-left lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Operational v2.0
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Unleash the Power of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Intelligent Operations
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 max-w-xl">
            Welcome to your AI-powered multi-agent business platform. Automate workflows, extract insights, and deploy autonomous agents with a stunning, intuitive OS interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
              href="/register"
              className="flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:-translate-y-0.5"
            >
              Deploy Your Agents Now
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 backdrop-blur-md hover:-translate-y-0.5"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:w-1/2 relative w-full aspect-[4/3] max-w-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
          <div className="relative w-full h-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm bg-white/5 p-2">
            <Image 
              src="/hero-image.png"
              alt="AI Business OS Dashboard"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover rounded-xl"
              priority
            />
          </div>
        </div>
      </main>
    </div>
  );
}
