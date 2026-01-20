"use client";

import React, { useState } from "react";
import { UserCog, Minus, Plus, AlertTriangle } from "lucide-react";

type Attributes = {
  charisma: number;    // 颜值
  intelligence: number; // 智力
  constitution: number; // 体质
  wealth: number;      // 家境
};

type AttributeAllocProps = {
  onConfirm: (attributes: Attributes) => void;
  initialPoints?: number;
};

export default function AttributeAlloc({ onConfirm, initialPoints = 20 }: AttributeAllocProps) {
  const [attributes, setAttributes] = useState<Attributes>({
    charisma: 0,
    intelligence: 0,
    constitution: 0,
    wealth: 0,
  });

  const currentTotal = Object.values(attributes).reduce((a, b) => a + b, 0);
  const remainingPoints = initialPoints - currentTotal;

  const updateAttribute = (key: keyof Attributes, delta: number) => {
    const newValue = attributes[key] + delta;
    
    // 检查下限
    if (newValue < 0) return;
    
    // 检查上限 (总点数限制)
    if (delta > 0 && remainingPoints <= 0) return;

    setAttributes((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleConfirm = () => {
    if (remainingPoints === 0) {
      onConfirm(attributes);
    }
  };

  const renderAttributeRow = (key: keyof Attributes, label: string, description: string) => (
    <div className="flex items-center justify-between p-4 border border-border hover:border-secondary/50 transition-colors group">
      <div className="flex-1">
        <div className="flex items-center gap-2">
           <span className="text-secondary font-bold uppercase">{label}</span>
           <span className="text-[10px] text-muted">[{key.substring(0, 3).toUpperCase()}]</span>
        </div>
        <p className="text-xs text-muted group-hover:text-zinc-300 transition-colors mt-1">
          {description}
        </p>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button
          onClick={() => updateAttribute(key, -1)}
          disabled={attributes[key] <= 0}
          className="w-8 h-8 flex items-center justify-center border border-border text-muted hover:text-foreground hover:border-foreground disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-6 text-center font-bold text-lg text-foreground">
          {attributes[key]}
        </span>
        
        <button
          onClick={() => updateAttribute(key, 1)}
          disabled={remainingPoints <= 0}
          className="w-8 h-8 flex items-center justify-center border border-border text-muted hover:text-secondary hover:border-secondary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto font-mono p-4 border-2 border-secondary bg-background shadow-[0_0_20px_rgba(0,204,255,0.1)]">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          属性分配 (ATTRIBUTE_ALLOC)
        </h2>
        <div className="flex items-center justify-between mt-2">
           <p className="text-xs text-muted">
             {">"} 请合理分配初始属性点。
           </p>
           <div className={`text-sm font-bold px-3 py-1 border ${remainingPoints === 0 ? "border-primary text-primary" : "border-secondary text-secondary"}`}>
              REMAINING: {remainingPoints}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-8">
        {renderAttributeRow("charisma", "颜值", "决定第一印象和特殊社交事件的成功率。")}
        {renderAttributeRow("intelligence", "智力", "影响学习效率、技术难题解决和薪资上限。")}
        {renderAttributeRow("constitution", "体质", "决定加班耐受度、健康状况和猝死概率。")}
        {renderAttributeRow("wealth", "家境", "决定初始资金、容错率和隐藏的人脉资源。")}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted flex items-center gap-2">
           {remainingPoints > 0 && (
             <>
               <AlertTriangle className="w-4 h-4 text-yellow-500" />
               <span className="text-yellow-500">还有点数未分配完毕</span>
             </>
           )}
        </div>
        <button
          onClick={handleConfirm}
          disabled={remainingPoints !== 0}
          className="px-8 py-3 bg-secondary text-black font-bold uppercase tracking-widest hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {">"} 开始重开
        </button>
      </div>
    </div>
  );
}
