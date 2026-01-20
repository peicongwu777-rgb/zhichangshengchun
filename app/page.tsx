"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import {
  Send,
  Settings,
  User,
  Bot,
  Terminal,
  Check,
  ChevronRight,
  Code2,
  TrendingUp,
  FlaskConical,
  BookOpen,
  UserCog,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import ApiKeyForm, { useApiKey } from "./components/ApiKeyForm";
import TalentDraw from "./components/TalentDraw";
import AttributeAlloc from "./components/AttributeAlloc";

type GameStage = 'setup' | 'talent' | 'attribute' | 'playing' | 'report';

type Talent = {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
};

type Attributes = {
  charisma: number;
  intelligence: number;
  constitution: number;
  wealth: number;
};

type GameConfig = {
  region: string;
  major: string;
  targetJob: string;
  talents: Talent[];
  attributes: Attributes;
};

const REGIONS = [
  {
    id: "usa",
    name: "美国",
    flag: "USA", 
    keywords: ["H1B", "Layoffs", "LeetCode"],
    description: "高薪高压，签证是最大的生存挑战。",
  },
  {
    id: "cn",
    name: "中国大陆",
    flag: "CHN",
    keywords: ["996", "35岁危机", "内卷"],
    description: "竞争激烈的修罗场，拼的是体力与人情。",
  },
  {
    id: "hk",
    name: "中国香港",
    flag: "HKG",
    keywords: ["中环", "两文三语", "金融"],
    description: "快节奏的国际都市，效率就是金钱。",
  }
];

const MAJORS = [
  { id: "cs", name: "计算机科学", icon: <Code2 className="w-4 h-4" /> },
  { id: "business", name: "商科 / 金融", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "stem", name: "理工科 (非CS)", icon: <FlaskConical className="w-4 h-4" /> },
  { id: "arts", name: "文科 / 社科", icon: <BookOpen className="w-4 h-4" /> }
];

export default function Home() {
  const { apiKey, modelId, hydrated } = useApiKey();
  const [showSettings, setShowSettings] = useState(false);
  const [stage, setStage] = useState<GameStage>('setup');
  const [showProfile, setShowProfile] = useState(false); // 控制属性面板显示

  const [config, setConfig] = useState<GameConfig>({
    region: "",
    major: "",
    targetJob: "",
    talents: [],
    attributes: {
      charisma: 0,
      intelligence: 0,
      constitution: 0,
      wealth: 0
    }
  });

  const [customJob, setCustomJob] = useState("");

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      ...config,
      targetJob: customJob || config.targetJob
    },
    headers: {
      Authorization: apiKey ? `Bearer ${apiKey}` : "",
      "x-model-id": modelId || "",
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!hydrated) return null;

  const hasCredentials = !!apiKey && !!modelId;
  if (!hasCredentials) {
    return <ApiKeyForm />;
  }

  // 1. SETUP STAGE (Region & Major)
  if (stage === 'setup') {
    return (
      <main className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto flex flex-col font-mono">
        <header className="mb-12 border-b border-border pb-6">
           <div className="text-xs text-primary mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary animate-pulse"></span>
              SYSTEM_READY
           </div>
           <h1 className="text-4xl font-bold mb-4 tracking-tighter">
             职场求生_2026.exe
           </h1>
           <p className="text-muted">
             {">"} 初始化... <br/>
             {">"} 请选择你的初始配置以开始模拟。
           </p>
        </header>

        {/* 区域选择 */}
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="text-primary">[1]</span> 选择区域 (REGION)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => setConfig({ ...config, region: region.name })}
                className={`text-left p-4 border transition-all ${
                  config.region === region.name
                    ? "border-primary bg-primary text-black"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-xl">{region.flag}</span>
                  {config.region === region.name && <Check className="w-5 h-5" />}
                </div>
                <div className="font-bold mb-2">{region.name}</div>
                <div className={`text-xs mb-4 ${config.region === region.name ? "text-black/70" : "text-muted"}`}>
                  {region.description}
                </div>
                <div className="flex flex-wrap gap-1">
                   {region.keywords.map(k => (
                     <span key={k} className={`text-[10px] px-1 border ${
                       config.region === region.name 
                         ? "border-black/30 text-black/80" 
                         : "border-border text-muted"
                     }`}>
                       {k}
                     </span>
                   ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 专业配置 */}
        <section className={`mb-12 transition-opacity duration-300 ${config.region ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="text-secondary">[2]</span> 配置身份 (PROFILE)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <label className="block text-xs text-muted mb-3">{">"} 选择专业</label>
                <div className="grid grid-cols-1 gap-2">
                  {MAJORS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setConfig({ ...config, major: m.name })}
                      className={`flex items-center gap-3 p-3 border text-sm transition-all ${
                        config.major === m.name
                          ? "border-secondary bg-secondary text-black font-bold"
                          : "border-border hover:border-secondary hover:text-secondary"
                      }`}
                    >
                      {m.icon}
                      {m.name}
                    </button>
                  ))}
                </div>
             </div>

             <div>
                <label className="block text-xs text-muted mb-3">{">"} 目标岗位 (可选)</label>
                <input
                   type="text"
                   value={customJob}
                   onChange={(e) => setCustomJob(e.target.value)}
                   placeholder="输入岗位名称..."
                   className="w-full bg-transparent border border-border p-3 text-foreground placeholder:text-muted focus:border-secondary focus:outline-none"
                />
             </div>
          </div>
        </section>

        <button
          onClick={() => setStage('talent')}
          disabled={!config.region || !config.major}
          className="w-full py-4 border-2 border-primary text-primary font-bold text-lg hover:bg-primary hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors uppercase tracking-widest"
        >
          {config.region && config.major ? ">> 下一步: 天赋抽取 <<" : "等待配置..."}
        </button>
        
        <button
           onClick={() => setShowSettings(true)}
           className="mt-8 text-xs text-muted hover:text-foreground text-center flex justify-center gap-2"
        >
           [设置 API Key]
        </button>

        <ApiKeyForm open={showSettings} onClose={() => setShowSettings(false)} />
      </main>
    );
  }

  // 2. TALENT STAGE
  if (stage === 'talent') {
     return (
        <main className="min-h-screen p-4 flex flex-col items-center justify-center font-mono">
           <TalentDraw onConfirm={(talents) => {
              setConfig({ ...config, talents });
              setStage('attribute');
           }} />
        </main>
     );
  }

  // 3. ATTRIBUTE STAGE
  if (stage === 'attribute') {
     return (
        <main className="min-h-screen p-4 flex flex-col items-center justify-center font-mono">
           <AttributeAlloc onConfirm={(attributes) => {
              setConfig({ ...config, attributes });
              setStage('playing');
           }} />
        </main>
     );
  }

  // 4. PLAYING STAGE
  return (
    <main className="flex flex-col h-screen font-mono overflow-hidden relative">
      <header className="flex-none border-b border-border p-4 flex justify-between items-center bg-background z-10">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-primary flex items-center justify-center bg-primary/10">
               <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="leading-none">
               <h1 className="font-bold text-sm">DM_AI</h1>
               <div className="text-[10px] text-muted mt-1">
                  {config.region} | {config.major}
               </div>
            </div>
         </div>
         <div className="flex gap-2">
            <button 
               onClick={() => setShowProfile(!showProfile)} 
               className={`p-2 border transition-colors ${showProfile ? "bg-secondary text-black border-secondary" : "border-border hover:bg-white hover:text-black"}`}
            >
               <UserCog className="w-4 h-4" />
            </button>
            <button onClick={() => {
                if(confirm("确定要终止进程吗？")) {
                   setStage('setup');
                   window.location.reload();
                }
            }} className="p-2 border border-border hover:bg-white hover:text-black transition-colors text-xs">
               [重置]
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 border border-border hover:bg-white hover:text-black transition-colors">
               <Settings className="w-4 h-4" />
            </button>
         </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
         {/* 聊天区域 */}
         <div className="flex-1 flex flex-col overflow-hidden">
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {messages.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                        <Terminal className="w-12 h-12 mb-4" />
                        <p>{">"} 等待指令输入...</p>
                        <p className="text-xs mt-2">{">"} SYSTEM_INIT_COMPLETE</p>
                     </div>
                  )}
                  
                  {messages.map((m) => (
                     <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`text-[10px] mb-1 ${m.role === 'user' ? "text-secondary" : "text-primary"}`}>
                           {m.role === 'user' ? "USER" : "SYSTEM"}
                        </div>
                        <div className={`max-w-[90%] p-4 border ${
                           m.role === 'user' 
                             ? "border-secondary text-foreground bg-secondary/5" 
                             : "border-primary text-foreground bg-primary/5"
                        }`}>
                           <div className="whitespace-pre-wrap leading-relaxed">
                              {m.content}
                           </div>
                        </div>
                     </div>
                  ))}

                  {isLoading && (
                     <div className="flex items-center gap-2 text-primary animate-pulse">
                        <span className="w-2 h-4 bg-primary"></span>
                        <span className="text-xs">COMPUTING...</span>
                     </div>
                  )}
                  
                  {error && (
                     <div className="p-4 border border-red-500 text-red-500 bg-red-500/10">
                        ERROR: {error.message}
                     </div>
                  )}
                  <div ref={messagesEndRef} />
             </div>

             <div className="flex-none p-4 border-t border-border bg-background">
                 <form onSubmit={handleSubmit} className="flex gap-2">
                    <span className="py-3 text-primary animate-pulse">{'>'}</span>
                    <input
                       value={input}
                       onChange={handleInputChange}
                       placeholder="输入行动指令..."
                       className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted focus:ring-0"
                       autoFocus
                       disabled={isLoading}
                    />
                    <button 
                      type="submit" 
                      disabled={isLoading || !input.trim()}
                      className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-colors uppercase text-sm font-bold"
                    >
                       Send
                    </button>
                 </form>
             </div>
         </div>

         {/* 属性面板 (侧边栏) */}
         {showProfile && (
            <div className="w-80 border-l border-border bg-background/95 backdrop-blur absolute right-0 top-0 bottom-0 z-20 flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.5)]">
               <div className="p-4 border-b border-border flex justify-between items-center">
                  <h2 className="font-bold text-secondary flex items-center gap-2">
                     <UserCog className="w-5 h-5" />
                     人物档案
                  </h2>
                  <button onClick={() => setShowProfile(false)} className="text-muted hover:text-foreground">
                     <X className="w-4 h-4" />
                  </button>
               </div>
               
               <div className="p-4 space-y-6 overflow-y-auto flex-1">
                  {/* 属性 */}
                  <div>
                     <h3 className="text-xs text-muted uppercase mb-3 border-b border-border/50 pb-1">Base Attributes</h3>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-sm">颜值 (CHR)</span>
                           <span className="font-bold text-secondary">{config.attributes.charisma}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm">智力 (INT)</span>
                           <span className="font-bold text-secondary">{config.attributes.intelligence}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm">体质 (CON)</span>
                           <span className="font-bold text-secondary">{config.attributes.constitution}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm">家境 (WLH)</span>
                           <span className="font-bold text-secondary">{config.attributes.wealth}</span>
                        </div>
                     </div>
                  </div>

                  {/* 天赋 */}
                  <div>
                     <h3 className="text-xs text-muted uppercase mb-3 border-b border-border/50 pb-1">Talents</h3>
                     <div className="space-y-2">
                        {config.talents.map(t => (
                           <div key={t.id} className="p-2 border border-border bg-surface/50 text-xs">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-primary">{t.name}</span>
                                 <span className="text-[10px] uppercase opacity-50">{t.rarity}</span>
                              </div>
                              <div className="text-muted">{t.description}</div>
                           </div>
                        ))}
                     </div>
                  </div>

                   {/* 基础信息 */}
                  <div>
                     <h3 className="text-xs text-muted uppercase mb-3 border-b border-border/50 pb-1">Configuration</h3>
                     <div className="text-xs space-y-2 text-muted">
                        <p>Region: <span className="text-foreground">{config.region}</span></p>
                        <p>Major: <span className="text-foreground">{config.major}</span></p>
                        <p>Target: <span className="text-foreground">{config.targetJob || "N/A"}</span></p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>

      <ApiKeyForm open={showSettings} onClose={() => setShowSettings(false)} />
    </main>
  );
}
