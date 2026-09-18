/* 乱世人格志：所有题目、原型参数与计算逻辑均在本地运行。 */
const DIMENSIONS = [
  { name: '决断', en: 'Decision', meaning: '面对不确定时推进事情的倾向', gift: '你能在信息并不完整时给事情一个起点，让停滞的局面重新转动。', shadow: '太快定方向，可能让还没说出口的线索被留在身后。' },
  { name: '共情', en: 'Empathy', meaning: '理解情绪与关系变化的能力', gift: '你善于听见话语背后的情绪，让关系有继续向前的空间。', shadow: '照顾太多人的感受，可能让自己的边界逐渐模糊。' },
  { name: '开创', en: 'Innovation', meaning: '寻找新路径的倾向', gift: '旧路走不通时，你常能看见一条还没有名字的新路。', shadow: '持续追逐新路，可能低估旧方法中仍然有用的部分。' },
  { name: '洞察', en: 'Insight', meaning: '观察人、风险与隐藏信息的能力', gift: '你会留意局面里的暗线，在多数人看见结果前察觉变化。', shadow: '看得太多，可能让你在可以行动时仍反复推演。' },
  { name: '表达', en: 'Expression', meaning: '传递观点、情绪与计划的能力', gift: '你能给模糊的想法一个清楚的名字，使人们知道如何靠近它。', shadow: '习惯用语言推进局面，也要留意对方是否真的跟上。' },
  { name: '经营', en: 'Management', meaning: '配置资源并维持长期发展的能力', gift: '你擅长把眼前的选择放进更长的时间里，让收获持续生长。', shadow: '过度计算长远得失，可能错过值得即刻投入的时刻。' },
  { name: '独立', en: 'Independence', meaning: '在群体压力下保持判断的程度', gift: '当多数人意见一致，你仍能为自己的判断留一张椅子。', shadow: '一直独自判断，可能让可信赖的支持难以进入你的生活。' },
  { name: '担当', en: 'Responsibility', meaning: '面对困难时主动承担的倾向', gift: '困难出现时，你愿意留下来处理，而不是先寻找退路。', shadow: '把所有责任都扛起来，容易耗尽原本能走更远的力气。' }
];

// 每个选项只影响 1～3 个维度；数字为维度下标与对应加分。
const O = (text, score) => ({ text, score });
const QUESTIONS = [
  { category:'团队冲突', title:'你和几个人负责一件重要任务，意见完全不一致，截止时间只剩一天。你会怎么做？', options:[
    O('先确定一个能执行的方案，让大家动起来。', [[0,4],[7,2]]), O('先弄清每个人真正反对的原因。', [[1,4],[3,2]]), O('重新分析任务，也许争论的是错误方向。', [[3,4],[6,2]]), O('把分歧拆成几块，安排各自负责的部分。', [[5,4],[4,2]])] },
  { category:'资源不足', title:'一场重要活动临近，预算突然只剩原来的一半。你最先处理哪件事？', options:[
    O('砍掉次要环节，保住最关键的体验。', [[5,4],[0,2]]), O('找现有资源的新用法，重新设计活动。', [[2,4],[5,2]]), O('向参与者说明处境，争取他们的理解和帮助。', [[4,3],[1,3]]), O('查清预算为何变化，再决定是否继续。', [[3,4],[6,2]])] },
  { category:'陌生环境', title:'你刚到一座陌生城市，要加入一个已经运转很久的团队。第一周你更可能？', options:[
    O('主动承担一件小事，用行动熟悉节奏。', [[0,3],[7,3]]), O('观察谁在影响决定、谁真正做事。', [[3,4],[5,2]]), O('多和不同的人聊天，听他们怎样看这里。', [[1,4],[4,2]]), O('先保留自己的工作方法，再慢慢调整。', [[6,4],[2,2]])] },
  { category:'朋友求助', title:'朋友深夜发来消息，说自己准备辞掉稳定工作，明天就要回复。你会？', options:[
    O('先听完他这一段时间到底经历了什么。', [[1,4],[7,2]]), O('陪他列出代价、备用方案和时间表。', [[5,4],[3,2]]), O('问清他真正想改变的是什么，而非只谈辞职。', [[3,4],[2,2]]), O('支持他做自己的决定，并提醒他别把选择权交给别人。', [[6,4],[1,2]])] },
  { category:'利益冲突', title:'一个合作机会对你很有利，却会让长期搭档失去原本的机会。你会？', options:[
    O('直接和搭档谈清楚，寻找双方都能接受的安排。', [[4,3],[1,3]]), O('先核对规则，确认究竟有没有真正的冲突。', [[3,4],[5,2]]), O('优先履行原有默契，放弃这次机会。', [[7,4],[1,2]]), O('提出新的分工，让机会从竞争变成共同项目。', [[2,3],[5,3]])] },
  { category:'面对失败', title:'你负责的计划没有达到预期，团队开始互相埋怨。你会先做什么？', options:[
    O('承担自己该承担的部分，让讨论回到解决问题。', [[7,4],[0,2]]), O('复盘每一步，找出真正的转折点。', [[3,4],[5,2]]), O('先照顾团队情绪，再谈下一次行动。', [[1,4],[4,2]]), O('承认原方案不适合，提出一条全新的路。', [[2,4],[6,2]])] },
  { category:'新机会', title:'有人邀请你加入一个前景不明、但可能改变行业的小项目。你会？', options:[
    O('先试一小步，用实际反馈判断值不值得继续。', [[0,3],[2,3]]), O('研究团队、资金和退出条件，再给答复。', [[3,3],[5,3]]), O('如果方向契合自己的判断，就愿意承担不确定。', [[6,4],[2,2]]), O('先和重要的人讨论，这个决定会怎样影响彼此。', [[1,3],[7,3]])] },
  { category:'风险来临', title:'远行前一天，天气预报忽然显示可能有暴雨，但行程很难改。你会？', options:[
    O('立刻准备替代路线，保留出发可能。', [[0,3],[5,3]]), O('核实不同预报和当地情况，再评估风险。', [[3,4],[6,2]]), O('联系同行者，统一大家能接受的风险程度。', [[1,3],[4,3]]), O('改变目的地，把这趟旅行变成另一种体验。', [[2,4],[0,2]])] },
  { category:'面对竞争', title:'一个与你能力相近的人也在争取你想要的职位。你最可能？', options:[
    O('清楚展示自己的成果和下一步计划。', [[4,4],[0,2]]), O('研究岗位真正缺什么，再补上关键能力。', [[3,3],[5,3]]), O('保持自己的节奏，不让对方的动作打乱判断。', [[6,4],[7,2]]), O('主动找新的突破点，做出不同的贡献。', [[2,4],[0,2]])] },
  { category:'被人误解', title:'你为了保护团队做的决定，被外界理解成只顾自己。你会？', options:[
    O('尽快把当时的依据讲清楚。', [[4,4],[7,2]]), O('先了解误解从哪里出现，再选择回应方式。', [[3,4],[1,2]]), O('暂时不解释，用后续结果证明判断。', [[6,4],[5,2]]), O('先和受到影响的人谈，修复最重要的关系。', [[1,4],[7,2]])] },
  { category:'承担领导', title:'你被临时推为负责人，但组里有更资深的人。你会如何开场？', options:[
    O('先说明目标和时间安排，带着大家进入状态。', [[0,4],[4,2]]), O('请资深成员说出他们担心的地方。', [[1,3],[3,3]]), O('明确各人的专长与权限，减少互相等待。', [[5,4],[7,2]]), O('提出一个不同的组织方式，试着打破旧惯例。', [[2,4],[6,2]])] },
  { category:'独处片刻', title:'一段连续忙碌之后，你终于有一个完全空白的下午。你更想？', options:[
    O('整理接下来几个月要做的事。', [[5,4],[7,2]]), O('独自走走，想清楚最近被忽略的问题。', [[6,3],[3,3]]), O('见一个想念的人，好好聊一次。', [[1,4],[4,2]]), O('去尝试一件以前没做过的事。', [[2,4],[0,2]])] },
  { category:'群体压力', title:'会议里所有人都赞成一项决定，只有你觉得它隐藏着问题。你会？', options:[
    O('当场提出关键疑点，即使可能打断气氛。', [[6,4],[4,2]]), O('先问几个具体问题，让大家自己看见风险。', [[3,4],[4,2]]), O('会后找负责人谈，避免让讨论失焦。', [[1,3],[5,3]]), O('准备一份替代方案，再请求重新讨论。', [[2,3],[7,3]])] },
  { category:'合作方式', title:'你与一位能力很强、做事方式却完全相反的人一起推进项目。你会？', options:[
    O('先约定结果和边界，各自保留做法。', [[6,3],[5,3]]), O('试着理解对方的节奏，寻找互补之处。', [[1,4],[3,2]]), O('明确由谁做最终决定，减少反复。', [[0,4],[7,2]]), O('把两种做法重新组合，试出第三种方式。', [[2,4],[4,2]])] },
  { category:'突发事件', title:'活动开始前十分钟，负责最重要环节的人突然无法到场。你会？', options:[
    O('立刻接过核心任务，边做边调整。', [[0,4],[7,2]]), O('重新分配人员与流程，把损失控制住。', [[5,4],[3,2]]), O('先安抚受影响的人，再公布变化。', [[1,3],[4,3]]), O('干脆改换呈现形式，让缺口成为新设计的一部分。', [[2,4],[6,2]])] },
  { category:'长期规划', title:'两条路摆在面前：一条回报稳定，一条几年后可能带来更大改变。你更可能？', options:[
    O('拆成阶段目标，先保证自己能持续走下去。', [[5,4],[7,2]]), O('选能创造新可能的路，接受阶段性不稳。', [[2,4],[6,2]]), O('看哪条路更符合自己想承担的事情。', [[7,4],[3,2]]), O('听取重要之人的看法，再判断如何影响共同生活。', [[1,3],[4,3]])] },
  { category:'如何用钱', title:'你意外得到一笔不算巨大的奖金，近期没有必须支付的开销。你会？', options:[
    O('留出储备，再投入一个长期计划。', [[5,4],[3,2]]), O('拿一部分试一个一直想做的小项目。', [[2,4],[0,2]]), O('和亲近的人分享，安排一次共同经历。', [[1,4],[7,2]]), O('先放着，等自己想清楚真正需要什么。', [[6,4],[3,2]])] },
  { category:'一份承诺', title:'你答应帮朋友完成一件事，后来自己的机会也在同一天出现。你会？', options:[
    O('兑现原来的承诺，再考虑机会能否调整。', [[7,4],[1,2]]), O('坦诚说明冲突，和朋友商量新的办法。', [[4,3],[1,3]]), O('重新安排资源，争取两边都不失约。', [[5,4],[0,2]]), O('衡量这次机会的独特性，再独立决定取舍。', [[6,3],[3,3]])] },
  { category:'打破惯例', title:'你发现一套沿用多年的流程总让新人出错，但老成员觉得改动太麻烦。你会？', options:[
    O('做一个小范围试验，用结果争取改变。', [[2,4],[0,2]]), O('先访谈新人和老成员，找到各自的难处。', [[1,3],[3,3]]), O('整理错误造成的成本，再提交改进方案。', [[5,4],[4,2]]), O('自己先按新方法做，证明不同做法可行。', [[6,4],[7,2]])] },
  { category:'危机决策', title:'大家发现计划中的风险比想象的大，必须在今晚决定继续还是暂停。你会？', options:[
    O('设定止损条件，达到条件就果断暂停。', [[0,3],[5,3]]), O('找出真正不可逆的风险，再给建议。', [[3,4],[7,2]]), O('听完所有关键成员的担忧，确保决定有人愿意共同承担。', [[1,3],[4,3]]), O('重构目标与路径，试着绕开原来的风险。', [[2,4],[6,2]])] }
];

const ARCHETYPES = [
  { id:'谋局者', vector:[60,49,55,76,55,77,72,61], lead:'你习惯先看棋盘，再决定落子。你很少因为一时情绪改变长期判断。', strength:'你能从细小变化里看见结构，让眼前的选择服务于更远的目标。', cost:'想得太周全，有时会让别人难以读懂你的真实心意。', risk:'若一直等待更完整的信息，窗口可能在犹豫中关闭。', voice:'你不急着落子。\n先看清棋盘，才知道哪一步值得走。' },
  { id:'开局者', vector:[78,55,75,60,72,53,72,64], lead:'面对没人知道答案的问题，你愿意先成为第一个行动的人。', strength:'你擅长把“也许可以”变成真正开始的第一步。', cost:'速度有时会快过队友，也快过风险提示。', risk:'连续开新局之前，记得为已经开始的事情留出收束空间。', voice:'路不是等人指出来的。\n有时要先走，才会出现方向。' },
  { id:'守局者', vector:[63,75,56,67,60,70,56,82], lead:'你未必喜欢站在聚光灯下，但真正出问题时，别人总会想到你。', strength:'你能在混乱里维持秩序，把承诺变成可靠的行动。', cost:'常把自己的疲惫排在所有人之后。', risk:'担当有边界，稳住全局也需要允许别人分担。', voice:'真正困难的，不是赢下一局，\n而是在众人动摇时，仍知道为何坚持。' },
  { id:'合纵者', vector:[62,78,57,65,79,67,52,67], lead:'你能看见不同立场之间尚未说出的共同处，让人愿意重新坐下来。', strength:'你擅长建立信任，让合作不只停在纸面。', cost:'太在意关系平衡，可能推迟一场必要的冲突。', risk:'连接别人时，也要留下明确的个人边界。', voice:'人心之间有路。\n我愿意先把那条路找出来。' },
  { id:'破局者', vector:[75,48,81,72,61,48,74,57], lead:'你能看见旧规则的裂缝，并认真寻找完全不同的解法。', strength:'你善于在停滞时提出新问题，让局面重新流动。', cost:'对旧框架的耐心有限，容易忽略别人适应变化所需的时间。', risk:'每一次改变都需要承接，别让新路只停留在起点。', voice:'局势没有给出答案。\n那就换一种提问的方式。' },
  { id:'独行者', vector:[62,42,67,72,45,60,83,55], lead:'即使多数人朝一个方向走，你仍愿意为自己的判断停一步。', strength:'你能抵住群体压力，守住独立的观察和选择。', cost:'不轻易解释自己，也可能错过被理解的机会。', risk:'独立不等于独自承受，值得信任的人可以与你并肩。', voice:'我会听见众人的声音，\n但最后那一步，要由自己决定。' },
  { id:'持炬者', vector:[65,75,60,59,71,58,56,82], lead:'你常成为一个群体里稳定的精神坐标，让人知道什么值得守护。', strength:'你能把信念说清楚，也愿意亲自承担它的重量。', cost:'太努力做可靠的人，可能忘了自己也需要被照顾。', risk:'信念需要呼吸，允许方法随情境改变。', voice:'火光不必照亮所有地方。\n能照见身边的人，也是一种坚持。' },
  { id:'经营者', vector:[65,59,54,72,55,83,65,66], lead:'你在意一件事能否做成，更在意它能否长久地继续。', strength:'你会配置资源、留住余地，让一次成果有机会变成系统。', cost:'过于关注可持续，偶尔会犹豫是否值得孤注一掷。', risk:'长期规划需要弹性，别把每个意外都当作偏离。', voice:'我想留下的，不只是一场胜利，\n还有明天仍能继续的办法。' }
];

// 八维参考值是娱乐测试内部的叙事参数，并非真实人物的心理测量。
const FIGURES = [
  { name:'诸葛亮', era:'蜀汉 · 丞相', vector:[65,74,63,76,64,78,67,84], tags:['担当','洞察','经营'], note:'同样重视承诺与布局，也倾向在纷乱中为长期目标留住秩序。' },
  { name:'曹操', era:'东汉末 · 政治家', vector:[83,58,79,70,74,67,77,67], tags:['决断','开创','独立'], note:'相近之处在于面对不确定时敢于先行动，并能迅速重组局面。' },
  { name:'刘备', era:'蜀汉 · 开国君主', vector:[65,83,59,63,79,71,55,77], tags:['共情','表达','担当'], note:'你们都可能通过信任与长期关系，把分散的人聚到一起。' },
  { name:'孙权', era:'东吴 · 君主', vector:[72,68,60,73,65,82,69,74], tags:['经营','洞察','担当'], note:'相似的是在变化中保留余地，平衡眼前局势与长期经营。' },
  { name:'周瑜', era:'东吴 · 将领', vector:[79,66,74,77,78,61,70,70], tags:['决断','表达','洞察'], note:'你们都善于在复杂合作里把判断转化成清楚的行动。' },
  { name:'司马懿', era:'曹魏 · 权臣', vector:[61,45,54,82,52,79,79,61], tags:['洞察','独立','经营'], note:'相近的是耐心观察与保持判断，不轻易被一时局势牵动。' },
  { name:'张良', era:'西汉 · 谋士', vector:[59,63,60,81,66,74,76,62], tags:['洞察','独立','经营'], note:'你们都愿意先理解人和局势，再选择真正有效的落点。' },
  { name:'韩信', era:'西汉 · 将领', vector:[86,49,83,73,60,53,80,65], tags:['决断','开创','洞察'], note:'相近的是敢于跳出旧打法，并在关键时刻快速抓住机会。' },
  { name:'王安石', era:'北宋 · 改革家', vector:[74,55,84,68,65,61,76,78], tags:['开创','独立','担当'], note:'你们都容易在旧制度里看见新可能，并愿意承受改变的阻力。' },
  { name:'苏轼', era:'北宋 · 文学家', vector:[58,76,76,69,86,50,74,58], tags:['表达','共情','开创'], note:'相近的是在起伏中保留感受力，也能用表达打开新的空间。' },
  { name:'范仲淹', era:'北宋 · 政治家', vector:[63,78,55,63,73,67,61,87], tags:['担当','共情','经营'], note:'你们都可能把个人选择与更大的责任连在一起。' },
  { name:'张居正', era:'明朝 · 内阁首辅', vector:[75,54,65,76,65,87,70,78], tags:['经营','洞察','决断'], note:'相似的是愿意把复杂事务化为可执行的秩序，并长期推进。' },
  { name:'班超', era:'东汉 · 将领', vector:[84,57,75,66,68,59,77,84], tags:['决断','独立','担当'], note:'你们都可能在陌生环境里主动承担，并以行动争取主动权。' },
  { name:'李清照', era:'宋代 · 词人', vector:[55,74,69,77,84,52,83,62], tags:['表达','独立','洞察'], note:'相近的是敏锐地感知变化，同时保留鲜明而独立的声音。' },
  { name:'王阳明', era:'明朝 · 思想家', vector:[67,65,65,72,67,58,80,76], tags:['独立','担当','洞察'], note:'你们都重视内在判断，也愿意让信念在具体行动中接受检验。' },
  { name:'商鞅', era:'战国 · 改革家', vector:[82,43,84,68,66,76,88,67], tags:['开创','独立','决断'], note:'相近的是面对旧规则时敢于重建秩序，并坚持自己的判断。' }
];

const STORAGE_KEY = 'luanshi-personality-v1';
const HISTORY_MARK = 'luanshi-personality-route-v2';
const screenEls = {
  home: document.getElementById('home-screen'),
  quiz: document.getElementById('quiz-screen'),
  result: document.getElementById('result-screen')
};
const state = {
  answers: Array(QUESTIONS.length).fill(null), currentIndex: 0, result: null,
  testCompleted: false, locked: false, completedAt: null, resultCode: null
};
let activeScreen = 'home';
let transitionTimers = [];
let entranceTimer = null;

function clearTransitionTimers() {
  transitionTimers.forEach(window.clearTimeout);
  transitionTimers = [];
  if (entranceTimer !== null) window.clearTimeout(entranceTimer);
  entranceTimer = null;
}
function afterDelay(callback, delay) {
  const timer = window.setTimeout(() => {
    transitionTimers = transitionTimers.filter(id => id !== timer);
    callback();
  }, delay);
  transitionTimers.push(timer);
}
function resetTransientVisualState() {
  clearTransitionTimers();
  const targets = [document.body, document.querySelector('.page-shell'), document.getElementById('question-card'), ...Object.values(screenEls)];
  targets.forEach(el => {
    if (!el) return;
    el.classList.remove('fade-out', 'fade-in', 'is-leaving', 'transitioning', 'is-changing', 'is-entering', 'is-revealing', 'hidden');
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
    el.style.removeProperty('pointer-events');
    el.style.removeProperty('animation');
  });
  state.locked = false;
}
function routeState(screen) { return { [HISTORY_MARK]: true, screen }; }
function currentRoute() { return history.state?.[HISTORY_MARK] ? history.state.screen : null; }
function writeRoute(screen, mode) {
  try {
    if (mode === 'push' && currentRoute() !== screen) history.pushState(routeState(screen), '');
    else if (mode === 'replace') history.replaceState(routeState(screen), '');
  } catch (_) { /* 某些内置浏览器限制 file: 历史记录，页面本身仍可使用。 */ }
}
function navigate(screen, mode = 'push') {
  writeRoute(screen, mode);
  showScreen(screen);
}

function readSaved() {
  state.answers = Array(QUESTIONS.length).fill(null);
  state.currentIndex = 0;
  state.result = null;
  state.testCompleted = false;
  state.completedAt = null;
  state.resultCode = null;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || !Array.isArray(saved.answers)) return;
    if (saved.accessCode !== AccessGate.getCode()) return;
    state.answers = Array.from({ length: QUESTIONS.length }, (_, i) =>
      Number.isInteger(saved.answers[i]) && saved.answers[i] >= 0 && saved.answers[i] < 4 ? saved.answers[i] : null
    );
    const savedIndex = Number.isInteger(saved.currentQuestion) ? saved.currentQuestion : saved.currentIndex;
    state.currentIndex = Math.min(QUESTIONS.length - 1, Math.max(0, Number(savedIndex) || 0));
    // 兼容旧版只保存 {complete:true} 的结果；完整答案始终重新计算，避免旧参数产生不一致。
    if ((saved.testCompleted === true || saved.result) && state.answers.every(answer => answer !== null)) {
      state.result = calculateResult(state.answers);
      state.testCompleted = true;
      state.currentIndex = QUESTIONS.length - 1;
      state.completedAt = typeof saved.completedAt === 'string' && !Number.isNaN(Date.parse(saved.completedAt)) ? saved.completedAt : new Date().toISOString();
      const decoded = ResultCode.decode(saved.resultCode);
      const matchesResult = decoded.ok && decoded.data.personalityType === state.result.archetype.id &&
        ResultCode.keys.every((key, index) => decoded.data.scores[key] === state.result.scores[index]) &&
        decoded.data.matchedCharacters.every((item, index) => item.name === state.result.figures[index].name && item.match === state.result.figures[index].match);
      if (matchesResult) state.completedAt = decoded.data.createdAt;
      state.resultCode = matchesResult ? decoded.code : ResultCode.encode(state.result, state.completedAt);
      if (!matchesResult) saveState();
    }
  } catch (_) { /* 私密浏览或损坏的缓存不会阻断测试。 */ }
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      answers: state.answers,
      currentIndex: state.currentIndex,
      currentQuestion: state.currentIndex,
      testCompleted: state.testCompleted,
      completedAt: state.completedAt,
      resultCode: state.resultCode,
      accessCode: AccessGate.getCode(),
      result: state.result,
      scores: state.result?.scores || null,
      matchedCharacter: state.result?.figures[0]?.name || null
    }));
  } catch (_) { /* 禁用 localStorage 时仍可完成当前测试。 */ }
}
function showScreen(name, animate = true) {
  resetTransientVisualState();
  Object.entries(screenEls).forEach(([key, el]) => { el.hidden = key !== name; });
  activeScreen = name;
  if (animate) {
    screenEls[name].classList.add('is-entering');
    entranceTimer = window.setTimeout(() => {
      screenEls[name].classList.remove('is-entering');
      entranceTimer = null;
    }, 450);
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
  updateHomeLinks();
}
function updateHomeLinks() {
  const hasProgress = state.answers.some(answer => answer !== null) && !state.testCompleted;
  document.getElementById('resume-button').hidden = !hasProgress;
  document.getElementById('saved-result-button').hidden = !state.testCompleted;
  document.getElementById('start-button').firstChild.textContent = hasProgress || state.testCompleted ? '重新测试 ' : '开始测试 ';
}
function startNew() {
  resetTransientVisualState();
  state.answers = Array(QUESTIONS.length).fill(null);
  state.currentIndex = 0;
  state.result = null;
  state.testCompleted = false;
  state.completedAt = null;
  state.resultCode = null;
  state.locked = false;
  saveState();
  renderQuestion();
  navigate('quiz', activeScreen === 'home' ? 'push' : 'replace');
}
function renderQuestion() {
  const index = state.currentIndex;
  const question = QUESTIONS[index];
  document.getElementById('question-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${QUESTIONS.length}`;
  document.getElementById('question-category').textContent = `${String(index + 1).padStart(2, '0')} · ${question.category}`;
  document.getElementById('question-title').textContent = question.title;
  const progress = document.querySelector('.progress-track');
  const completed = state.answers.filter(answer => answer !== null).length;
  progress.setAttribute('aria-valuenow', completed);
  document.getElementById('quiz-progress').style.width = `${completed / QUESTIONS.length * 100}%`;
  document.getElementById('previous-button').disabled = index === 0;
  document.getElementById('previous-button').style.visibility = index === 0 ? 'hidden' : 'visible';
  const list = document.getElementById('answer-list');
  list.replaceChildren();
  question.options.forEach((option, optionIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option' + (state.answers[index] === optionIndex ? ' selected' : '');
    button.setAttribute('aria-pressed', state.answers[index] === optionIndex ? 'true' : 'false');
    const letter = document.createElement('span');
    letter.className = 'answer-letter';
    letter.textContent = 'ABCD'[optionIndex];
    const copy = document.createElement('span');
    copy.className = 'answer-copy';
    copy.textContent = option.text;
    button.append(letter, copy);
    button.addEventListener('click', () => chooseAnswer(optionIndex));
    list.append(button);
  });
}
function chooseAnswer(optionIndex) {
  if (state.locked) return;
  state.locked = true;
  const answeredIndex = state.currentIndex;
  state.result = null;
  state.testCompleted = false;
  state.answers[answeredIndex] = optionIndex;
  if (answeredIndex === QUESTIONS.length - 1) {
    state.result = calculateResult(state.answers);
    state.testCompleted = true;
    state.completedAt = new Date().toISOString();
    state.resultCode = ResultCode.encode(state.result, state.completedAt);
  } else {
    // 在过渡开始前保存下一题；BFCache 即使冻结计时器也不会恢复到旧题。
    state.currentIndex = answeredIndex + 1;
  }
  saveState();
  document.querySelectorAll('.answer-option').forEach((button, i) => {
    button.classList.toggle('selected', i === optionIndex);
    button.setAttribute('aria-pressed', i === optionIndex ? 'true' : 'false');
  });
  const card = document.getElementById('question-card');
  afterDelay(() => {
    card.classList.add('is-changing');
    afterDelay(() => {
      card.classList.remove('is-changing');
      if (state.testCompleted) {
        renderResult();
        navigate('result', 'replace');
      } else {
        renderQuestion();
        state.locked = false;
      }
    }, 120);
  }, 170);
}

function calculateResult(answers) {
  const raw = DIMENSIONS.map(() => 0);
  const mean = DIMENSIONS.map(() => 0);
  const min = DIMENSIONS.map(() => 0);
  const max = DIMENSIONS.map(() => 0);
  QUESTIONS.forEach((question, qi) => {
    const selected = question.options[answers[qi]];
    selected.score.forEach(([dimension, points]) => { raw[dimension] += points; });
    DIMENSIONS.forEach((_, dimension) => {
      const values = question.options.map(option => option.score.find(([d]) => d === dimension)?.[1] || 0);
      mean[dimension] += values.reduce((sum, value) => sum + value, 0) / values.length;
      min[dimension] += Math.min(...values);
      max[dimension] += Math.max(...values);
    });
  });
  // 以本题库的平均选择为 68 分；理论上下界分别映射到 26 和 100。
  // 这样各维分数与题目中得到该维分数的机会有关，且相同答案永远给出相同结果。
  const scores = raw.map((value, i) => Math.max(0, Math.min(100, Math.round(
    value >= mean[i]
      ? 68 + (value - mean[i]) / Math.max(1, max[i] - mean[i]) * 32
      : 68 - (mean[i] - value) / Math.max(1, mean[i] - min[i]) * 42
  ))));
  const top = scores.map((value, index) => ({ index, value })).sort((a, b) => b.value - a.value || a.index - b.index);
  const archetype = [...ARCHETYPES].sort((a, b) => distance(scores, a.vector) - distance(scores, b.vector))[0];
  const figures = FIGURES.map(figure => ({ ...figure, distance: distance(scores, figure.vector) }))
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name, 'zh-CN'));
  const rankedFigures = figures.map(figure => ({ ...figure, match: Math.round(Math.max(0, 100 - figure.distance * 1.08)) }));
  return { scores, top, archetype, figures: rankedFigures };
}
function distance(a, b) {
  return Math.sqrt(a.reduce((sum, value, i) => sum + (value - b[i]) ** 2, 0) / a.length);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
}
function snapshot(result) {
  const { scores, top, archetype, figures } = result;
  const figure = figures[0];
  const high = DIMENSIONS[top[0].index];
  const second = DIMENSIONS[top[1].index];
  const third = DIMENSIONS[top[2].index];
  const low = DIMENSIONS[top.at(-1).index];
  const portrait = `你和${figure.name}相似的，并不是具体经历，而是面对复杂局面时偏向的选择。${archetype.lead}${high.name}是你较鲜明的底色：${high.gift}${second.name}则让这种倾向更有层次。你也许不总能立刻说出自己要成为什么人，但在一次次取舍里，你正在写下属于自己的行事方式。`;
  return { scores, top, archetype, figures, figure, high, second, third, low, portrait };
}
async function copyResultCode() {
  const field = document.getElementById('result-code-value');
  const status = document.getElementById('result-code-status');
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(field.value);
      status.textContent = '结果码已复制';
      return;
    } catch (_) { /* 内置浏览器可能拒绝 Clipboard API，继续尝试选中文本。 */ }
  }
  field.focus();
  field.select();
  field.setSelectionRange(0, field.value.length);
  try {
    if (document.execCommand?.('copy')) {
      status.textContent = '结果码已复制';
      return;
    }
  } catch (_) { /* 保持选中状态供手动复制。 */ }
  status.textContent = '请长按复制结果码';
}

function renderResult() {
  const data = snapshot(state.result);
  const { scores, top, archetype, figure, portrait } = data;
  const resultCode = state.resultCode || ResultCode.encode(state.result, state.completedAt || new Date().toISOString());
  const tags = figure.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
  const dimensions = DIMENSIONS.map((dimension, i) => `
    <div class="dimension-row"><span class="dim-name">${dimension.name}</span><div class="dim-track" role="meter" aria-label="${dimension.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${scores[i]}"><div class="dim-fill" data-width="${scores[i]}"></div></div><span class="dim-value" data-number="${scores[i]}">0</span></div>`).join('');
  const keywords = top.slice(0, 3).map((item, i) => `<span><small>0${i + 1}</small>${DIMENSIONS[item.index].name}</span>`).join('');
  document.getElementById('result-content').innerHTML = `
    <div class="result-topline"><span>你的乱世人格匹配结果</span><button class="text-button" id="result-home-top" type="button">首页 ↗</button></div>
    <article class="result-hero">
      <p class="hero-small">命运如卷 · 见字如人</p>
      <p class="match-percent"><span data-number="${figure.match}">0</span><small>%</small></p>
      <p class="match-label">历史人物原型匹配度</p>
      <h1 class="figure-name" id="result-heading">${figure.name}</h1>
      <p class="figure-meta">${figure.era} · ${archetype.id}</p>
      <div class="tag-row">${tags}</div><div class="hero-rule"></div>
      <p class="voice">“${escapeHtml(archetype.voice)}”</p><p class="voice-credit">「人格原型文案」</p>
    </article>
    <div class="archetype-ribbon"><span>你的乱世人格原型</span><strong>${archetype.id}</strong></div>
    <section class="result-section"><h2><span class="section-num">01</span>人物自画像</h2><p>${escapeHtml(portrait)}</p><div class="strength-note"><strong>性格优势</strong><p>${escapeHtml(archetype.strength)}</p></div></section>
    <section class="result-section"><h2><span class="section-num">02</span>八维能力结构</h2><p class="section-intro">没有高低优劣，只有你更常使用的策略。</p>${dimensions}</section>
    <section class="result-section"><h2><span class="section-num">03</span>你的三个核心关键词</h2><div class="keyword-strip">${keywords}</div></section>
    <div class="result-actions"><button class="button button-primary button-wide" id="share-button" type="button">生成分享卡 <span aria-hidden="true">↗</span></button><button class="button button-secondary button-wide" id="restart-button" type="button">重新测试</button><div class="result-small-actions"><button class="text-button" id="result-home" type="button">回到首页</button><button class="text-button" id="review-button" type="button" aria-expanded="false" aria-controls="answer-review">回看答案</button></div></div>
    <div id="answer-review" class="answer-review" hidden></div>
    <div id="share-panel" class="share-panel" hidden></div>
    <section id="premium-area" class="premium-area">
      <div id="premium-locked" class="premium-locked">
        <div class="premium-heading"><span class="premium-lock-mark" aria-hidden="true">锁</span><span>深度档案 · 专属版本</span></div>
        <h2>完整人格档案</h2>
        <p class="premium-lead">你看到的只是人格轮廓。<br>真正决定你如何选择、合作、爱人和面对压力的，藏在更深的一层。</p>
        <p class="premium-length">完整人格档案 · 全文约 2000～3000 字</p>
        <div class="premium-tags"><span>事业</span><span>关系</span><span>爱情</span><span>金钱</span><span>压力</span><span>盲点</span><span>成长</span><span>历史人物</span></div>
        <div class="premium-preview"><h3>你的关系模式</h3><p>你在人际关系里，并不总是依赖一时的情绪行动。你更在意一个人如何处理承诺、分歧与小事……</p><div class="preview-blur" aria-hidden="true">关系中的信任、冲突和边界，会在完整档案里逐层展开。</div><div class="preview-shade"><span aria-hidden="true">锁</span>关系模式｜约 300 字深度解析</div></div>
        <div class="premium-preview-titles"><span>恋爱互动模式｜约 250 字</span><span>事业与团队位置｜约 400 字</span><span>压力下的真实反应｜约 250 字</span><span>金钱决策方式｜约 250 字</span><span>最大隐藏盲点｜约 200 字</span><span>成长方向｜约 200 字</span><span>历史人物深度匹配｜约 350 字</span></div>
        <div class="premium-cta"><div><small>购买后提交专属结果码</small><strong>¥${PremiumPayment.price.toFixed(1)}</strong></div><button class="button button-primary button-wide" id="premium-open" type="button">获取完整人格档案</button><p class="manual-purchase-note">购买后提交你的专属结果码，即可生成完整报告。购买与成交在小红书平台完成。</p></div>
      </div>
      <div class="result-code-area" id="result-code-area"><h2>我的结果码</h2><p>你的结果码</p><textarea id="result-code-value" readonly spellcheck="false" aria-label="你的结果码">${escapeHtml(resultCode)}</textarea><button class="button button-secondary button-wide" id="copy-result-code" type="button">复制结果码</button><p id="result-code-status" class="result-code-status" role="status" aria-live="polite"></p><p class="result-code-help">购买完整人格档案后，将此结果码提交给卖家，即可生成你的专属报告。</p><p class="result-code-caution">请勿自行修改结果码，否则可能无法识别。结果码用于传递测试结果，并非加密或付款凭据。</p></div>
    </section>
    <p class="disclaimer result-note">本测试仅供娱乐与自我观察，不属于专业心理评估。人物八维值是本测试内部的叙事参数，不是真实历史人物的心理测量数据；匹配度仅表示原型类比。</p>`;
  document.getElementById('result-home-top').addEventListener('click', goHome);
  document.getElementById('result-home').addEventListener('click', goHome);
  document.getElementById('restart-button').addEventListener('click', startNew);
  document.getElementById('review-button').addEventListener('click', () => {
    const panel = document.getElementById('answer-review');
    panel.hidden = !panel.hidden;
    document.getElementById('review-button').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) {
      panel.innerHTML = `<h2>你的 20 次选择</h2>${QUESTIONS.map((question, i) => `<div class="review-item"><strong>${String(i + 1).padStart(2, '0')} · ${escapeHtml(question.category)}</strong><p>${escapeHtml(question.title)}</p><span>${'ABCD'[state.answers[i]]} · ${escapeHtml(question.options[state.answers[i]].text)}</span></div>`).join('')}`;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  document.getElementById('share-button').addEventListener('click', () => renderShareCard(data));
  document.getElementById('premium-open').addEventListener('click', () => document.getElementById('result-code-area').scrollIntoView({ behavior:'smooth', block:'start' }));
  document.getElementById('copy-result-code').addEventListener('click', copyResultCode);
  animateNumbers();
  requestAnimationFrame(() => document.querySelectorAll('.dim-fill').forEach(el => { el.style.width = `${el.dataset.width}%`; }));
}

function animateNumbers() {
  const targets = document.querySelectorAll('#result-content [data-number]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(el => { el.textContent = el.dataset.number; });
    return;
  }
  const start = performance.now();
  const duration = 650;
  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    targets.forEach(el => { el.textContent = Math.round(Number(el.dataset.number) * eased); });
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderShareCard(data) {
  const { top, archetype, figure, scores } = data;
  const panel = document.getElementById('share-panel');
  const topTags = top.slice(0, 3).map(item => `<span>${DIMENSIONS[item.index].name}</span>`).join('');
  const topScores = top.slice(0, 3).map(item => `<span>${DIMENSIONS[item.index].name} ${scores[item.index]}</span>`).join('');
  panel.innerHTML = `<h2>你的乱世人格卡</h2><p>长按或截图保存，分享给朋友看看他们测出了谁。</p>
    <div class="share-card" role="img" aria-label="${figure.name}，${figure.match}%匹配，${archetype.id}人格分享卡">
      <div class="share-head"><div><div class="share-brand">乱世人格志</div><div class="share-subtitle">如果你生在乱世……</div></div><div class="share-stamp">人<br>格</div></div>
      <div class="share-body"><div class="share-percent">${figure.match}<small>%</small></div><div class="share-person">${figure.name}</div><div class="share-type">你的原型：<strong>${archetype.id}</strong></div><div class="share-tags">${topTags}</div><div class="share-topdims">${topScores}</div><div class="share-voice">“${escapeHtml(archetype.voice)}”</div><div class="share-credit">「人格原型文案」</div></div>
      <div class="share-foot"><div><strong>20 道题测出你的乱世人格</strong><span>搜索：乱世人格志</span></div></div>
    </div><button class="text-button share-close" id="share-close" type="button">收起分享卡 ↑</button>`;
  panel.hidden = false;
  document.getElementById('share-close').addEventListener('click', () => { panel.hidden = true; document.getElementById('share-button').focus(); });
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goHome() {
  if (state.locked) return;
  if (currentRoute() !== 'home' && history.length > 1) history.back();
  else navigate('home', 'replace');
}
function restoreVisibleRoute(route) {
  if (route === 'home') { showScreen('home', false); return; }
  if (state.testCompleted) {
    if (route !== 'result') writeRoute('result', 'replace');
    renderResult();
    showScreen('result', false);
  } else if (state.answers.some(answer => answer !== null) || route === 'quiz') {
    if (route !== 'quiz') writeRoute('quiz', 'replace');
    renderQuestion();
    showScreen('quiz', false);
  } else {
    if (route !== 'home') writeRoute('home', 'replace');
    showScreen('home', false);
  }
}
function initializeRoute() {
  const target = state.testCompleted ? 'result' : state.answers.some(answer => answer !== null) ? 'quiz' : 'home';
  const route = currentRoute();
  if (!route) writeRoute('home', 'replace');
  if (target !== 'home') writeRoute(target, route && route !== 'home' ? 'replace' : 'push');
  else if (route && route !== 'home') writeRoute('home', 'replace');
  restoreVisibleRoute(target);
}

document.getElementById('brand-home').addEventListener('click', goHome);
document.getElementById('start-button').addEventListener('click', startNew);
document.getElementById('resume-button').addEventListener('click', () => { renderQuestion(); navigate('quiz'); });
document.getElementById('saved-result-button').addEventListener('click', () => { renderResult(); navigate('result'); });
document.getElementById('quiz-home-button').addEventListener('click', goHome);
document.getElementById('previous-button').addEventListener('click', () => {
  if (state.locked || state.currentIndex === 0) return;
  state.currentIndex--;
  saveState();
  renderQuestion();
});
AccessGate.ready.then(() => {
  readSaved();
  initializeRoute();
  if (AccessGate.wasJustActivated()) startNew();
  window.__LUANSHI_APP_READY__ = true;
});
window.addEventListener('popstate', event => {
  resetTransientVisualState();
  restoreVisibleRoute(event.state?.[HISTORY_MARK] ? event.state.screen : 'home');
});
window.addEventListener('pagehide', resetTransientVisualState);
window.addEventListener('pageshow', event => {
  // BFCache 可保留 DOM、计时器与动画中间帧，先清理再按已保存的完成状态恢复。
  resetTransientVisualState();
  if (!event.persisted) return;
  try { if (localStorage.getItem(STORAGE_KEY)) readSaved(); } catch (_) { /* 继续使用内存状态。 */ }
  restoreVisibleRoute(currentRoute() || (state.testCompleted ? 'result' : 'home'));
});
window.__LUANSHI_APP_LOADED__ = true;
