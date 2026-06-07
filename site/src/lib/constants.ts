const ALL_QUESTIONS = [
  "《水经注》和《水经》是什么关系？",
  "三峡这段为什么写得这么详细？",
  "你当年是怎么考察这些水道的？",
  "解释一下'伏流'是什么意思",
  "'水德含和，变通在我'怎么理解？",
  "你写《水经注》时最难忘的经历是什么？",
  "黄河在古代和现在有什么不同？",
  "都江堰为什么能运转两千多年？",
  "你怎么判断一条河的源头在哪里？",
  "北方和南方的河流有什么主要区别？",
  "为什么说《水经注》也是文学作品？",
  "你在北魏做官时走过最远的地方是哪里？",
  "古人是如何利用水运交通的？",
  "古代有哪些著名的水利工程？",
  "那些没有去过的南方水道，你是怎么写的？",
  "最让你震撼的自然景观是什么？",
  "为什么选择给《水经》做注，而不是自己写一本？",
  "河流改道对沿岸城市有什么影响？",
  "你觉得做学问最重要的是什么？",
  "你见过的最奇特的地理现象是什么？",
  "古代地名和今天有什么变化？",
  "你写书的时候参考了哪些前人的著作？",
  "阴山和黄河之间是什么样子的？",
  "如果让你重新写《水经注》，你会改进什么？",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getExampleQuestions(n: number = 6): string[] {
  return shuffle(ALL_QUESTIONS).slice(0, n);
}

export const SITE_TITLE = "郦道元";

export const SITE_SUBTITLE = "北魏地理学家 · 水经注作者";

export const FAMOUS_QUOTE =
  "自三峡七百里中，两岸连山，略无阙处。重岩叠嶂，隐天蔽日。";

export const WELCOME_HINT = "向郦道元请教中国古代地理";

export const STORAGE_KEY = "lidaoyuan-chat-v2";
