"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, RefreshCw } from "lucide-react";

type Talent = {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
};

const TALENT_POOL: Talent[] = [
  { id: "t01", name: "只有背影是杀手", description: "面试通过率+10%，但入职后被发现是照骗", rarity: "common" },
  { id: "t02", name: "天选打工人", description: "体力+5，但发际线-10，发量稀疏", rarity: "common" },
  { id: "t03", name: "PPT 纺织工", description: "大厂入职率+20%，汇报能力 MAX", rarity: "rare" },
  { id: "t04", name: "家里有矿", description: "初始存款+100w，但智力-2", rarity: "legendary" },
  { id: "t05", name: "摸鱼宗师", description: "San值消耗减半，但晋升概率-50%", rarity: "epic" },
  { id: "t06", name: "背锅侠", description: "体质+10，容易替领导背锅", rarity: "common" },
  { id: "t07", name: "咖啡因过敏", description: "无法加班，每天 18:00 强制下班", rarity: "rare" },
  { id: "t08", name: "无效社交达人", description: "人脉+20，但借钱成功率 0%", rarity: "common" },
  { id: "t09", name: "舔狗日记", description: "领导好感度+30，尊严-50", rarity: "rare" },
  { id: "t10", name: "重生之我是老板", description: "创业成功率+1%，其余情况破产", rarity: "legendary" },
  { id: "t11", name: "带薪拉屎冠军", description: "每天额外获得 30 分钟休息时间", rarity: "common" },
  { id: "t12", name: "内卷永动机", description: "加班不掉 San 值，但不仅没有加班费还会被同事排挤", rarity: "epic" },
  { id: "t13", name: "画饼充饥", description: "San值恢复速度+20%，容易相信老板的话", rarity: "common" },
  { id: "t14", name: "Excel 仙人", description: "智力+5，处理数据效率翻倍", rarity: "rare" },
  { id: "t15", name: "甲方虐我千百遍", description: "抗压能力+10，San值上限+20", rarity: "rare" },
  { id: "t16", name: "周报生成器", description: "每周自动生成完美周报，节省 2 小时", rarity: "epic" },
  { id: "t17", name: "隐形富豪", description: "家境+20，但外表看起来很穷", rarity: "legendary" },
  { id: "t18", name: "职场小透明", description: "裁员概率-20%，但升职概率-20%", rarity: "common" },
  { id: "t19", name: "外语达人", description: "智力+3，外企面试通过率+30%", rarity: "rare" },
  { id: "t20", name: "头发越少越强", description: "每掉 10% 头发，编程能力+20%", rarity: "epic" },
];

type TalentDrawProps = {
  onConfirm: (selectedTalents: Talent[]) => void;
};

export default function TalentDraw({ onConfirm }: TalentDrawProps) {
  const [drawnTalents, setDrawnTalents] = useState<Talent[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // 随机抽取逻辑
  const drawTalents = () => {
    setIsDrawing(true);
    // 简单的洗牌算法
    const shuffled = [...TALENT_POOL].sort(() => 0.5 - Math.random());
    // 模拟抽卡延迟动画
    setTimeout(() => {
      setDrawnTalents(shuffled.slice(0, 10));
      setSelectedIds([]);
      setIsDrawing(false);
    }, 600);
  };

  useEffect(() => {
    drawTalents();
  }, []);

  const toggleTalent = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((tid) => tid !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleConfirm = () => {
    const selected = drawnTalents.filter((t) => selectedIds.includes(t.id));
    onConfirm(selected);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "text-yellow-400 border-yellow-400/50";
      case "epic":
        return "text-purple-400 border-purple-400/50";
      case "rare":
        return "text-cyan-400 border-cyan-400/50";
      default:
        return "text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-mono p-4 border-2 border-primary bg-background shadow-[0_0_20px_rgba(0,255,0,0.1)]">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            天赋抽取 (TALENT_DRAW)
          </h2>
          <p className="text-xs text-muted mt-1">
            {">"} 从 10 个随机天赋中选择 3 个 ({selectedIds.length}/3)
          </p>
        </div>
        <button
          onClick={drawTalents}
          disabled={isDrawing}
          className="flex items-center gap-2 px-3 py-1 text-xs border border-border hover:bg-zinc-800 text-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isDrawing ? "animate-spin" : ""}`} />
          重抽
        </button>
      </div>

      {isDrawing ? (
        <div className="h-[400px] flex items-center justify-center text-primary animate-pulse">
          {">"} EXTRACTING_DNA_SEQUENCE...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {drawnTalents.map((talent) => {
            const isSelected = selectedIds.includes(talent.id);
            const rarityStyle = getRarityColor(talent.rarity);
            
            return (
              <button
                key={talent.id}
                onClick={() => toggleTalent(talent.id)}
                disabled={!isSelected && selectedIds.length >= 3}
                className={`group relative text-left p-3 border transition-all ${
                  isSelected
                    ? "bg-primary text-black border-primary"
                    : `bg-transparent hover:bg-white/5 ${rarityStyle}`
                } ${!isSelected && selectedIds.length >= 3 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-sm ${isSelected ? "text-black" : ""}`}>
                    {talent.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-black" />}
                  {!isSelected && (
                     <span className="text-[10px] uppercase opacity-70 border border-current px-1 rounded-sm">
                        {talent.rarity.substring(0, 1)}
                     </span>
                  )}
                </div>
                <div className={`text-xs ${isSelected ? "text-black/80" : "text-muted group-hover:text-zinc-300"}`}>
                  {talent.description}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          onClick={handleConfirm}
          disabled={selectedIds.length !== 3 || isDrawing}
          className="px-8 py-3 bg-primary text-black font-bold uppercase tracking-widest hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {">"} 确认选择
        </button>
      </div>
    </div>
  );
}
