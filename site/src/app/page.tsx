import Link from "next/link";

export default function CoverPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 bg-paper">
      {/* Top spacing */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg">

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold font-[family-name:var(--font-serif)] text-ink tracking-[0.3em] mb-4">
          郦 道 元
        </h1>

        {/* Subtitle */}
        <p className="text-base text-pencil mb-12 tracking-wider">
          北魏地理学家 · 水经注作者
        </p>

        {/* Famous quote */}
        <blockquote className="drop-cap text-lg text-pencil/70 italic font-[family-name:var(--font-serif)] text-center leading-relaxed max-w-sm mb-6">
          自三峡七百里中，两岸连山，略无阙处。重岩叠嶂，隐天蔽日。
        </blockquote>

        {/* Divider */}
        <div className="w-12 h-px bg-bamboo mb-10" />

        {/* Description */}
        <p className="text-sm text-pencil/60 text-center leading-relaxed mb-16 max-w-xs">
          郦道元以三十万字《水经注》记天下千余水道，
          融地理考证与山水文学于一炉。
          时隔一千五百年，与这位伟大的地理学家对话，
          探索中国古代的江河山川。
        </p>

        {/* CTA Button */}
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-seal text-white font-medium
                     hover:bg-[#7A2A0E] transition-colors cursor-pointer text-base"
        >
          开始对话
          <span className="text-lg">→</span>
        </Link>
      </div>

      {/* Footer */}
      <p className="text-xs text-pencil/30 mt-8">
        此乃 AI 据郦道元公开记载与治学思路所拟 · 非本人真实言论
      </p>
    </div>
  );
}
