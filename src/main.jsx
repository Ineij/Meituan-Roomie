import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, ReceiptText, BrushCleaning, PackageOpen, ScrollText, Sparkles, Bell,
  ChevronRight, ArrowUpRight, CircleCheck, Clock3, TriangleAlert, Plus, X,
  WalletCards, CalendarDays, Users, Send, Check, ChevronDown, RotateCcw,
  CircleDollarSign, ShoppingBasket, Moon, UserRound, Box, Menu, MoreHorizontal,
  Zap, Wifi, Droplets, Trash2, Utensils, Bath, Sofa, PackageCheck, MessageCircle,
  WandSparkles, ArrowRight, ShieldCheck, ClipboardCheck
} from 'lucide-react';
import './styles.css';

const people = [
  { name: 'Jenny', initials: 'J', tone: 'mint' },
  { name: 'Alex', initials: 'A', tone: 'amber' },
  { name: 'Mia', initials: 'M', tone: 'rose' },
];

const initialExpenses = [
  { id: 1, icon: Zap, name: '九月电费', date: '9月 10日', amount: 240, payer: 'Jenny', detail: '2 / 3 已支付', status: 'pending', category: '生活账单' },
  { id: 2, icon: Wifi, name: '家庭宽带', date: '9月 6日', amount: 100, payer: 'Alex', detail: '已结清', status: 'settled', category: '生活账单' },
  { id: 3, icon: PackageOpen, name: '卷纸补货', date: '9月 3日', amount: 48, payer: 'Mia', detail: '已结清', status: 'settled', category: '公共用品' },
  { id: 4, icon: Droplets, name: '八月水费', date: '8月 28日', amount: 72, payer: 'Jenny', detail: '已结清', status: 'settled', category: '生活账单' },
];

const initialChores = [
  { id: 1, icon: Utensils, name: '厨房清洁', owner: 'Jenny', when: '今天 · 20:00', status: 'today', rotation: ['Jenny','Alex','Mia'] },
  { id: 2, icon: Bath, name: '浴室清洁', owner: 'Mia', when: '9月 18日 · 19:00', status: 'upcoming', rotation: ['Mia','Alex','Jenny'] },
  { id: 3, icon: Sofa, name: '客厅整理', owner: 'Alex', when: '9月 14日 · 18:00', status: 'upcoming', rotation: ['Alex','Mia','Jenny'] },
  { id: 4, icon: Trash2, name: '倒垃圾', owner: 'Alex', when: '昨天 · 21:00', status: 'overdue', rotation: ['Alex','Jenny','Mia'] },
];

const initialSupplies = [
  { id: 1, name: '卷纸', amount: '2 卷', detail: '约还能用 2 天', owner: 'Alex', level: 18, status: 'low' },
  { id: 2, name: '洗洁精', amount: '余量 30%', detail: '约还能用 8 天', owner: 'Jenny', level: 30, status: 'watch' },
  { id: 3, name: '垃圾袋', amount: '库存充足', detail: '约还能用 24 天', owner: 'Mia', level: 76, status: 'good' },
  { id: 4, name: '洗衣液', amount: '余量 55%', detail: '约还能用 16 天', owner: 'Alex', level: 55, status: 'good' },
];

const initialRules = [
  { id: 1, icon: Moon, title: '安静时间', summary: '23:00 – 08:00', description: '安静时间内请降低音量，使用耳机。', agreed: 3 },
  { id: 2, icon: Users, title: '访客约定', summary: '至少提前 2 小时告知', description: '访客到来前在群内说明到访时间与预计停留时长。', agreed: 3 },
  { id: 3, icon: CircleDollarSign, title: '公共采购', summary: '超过 ¥100 需 2 人同意', description: '大额公共采购在下单前发起投票，至少两位室友确认。', agreed: 3 },
];

function Avatar({ name, small=false }) {
  const person = people.find(p => p.name === name) || people[0];
  return <span className={`avatar ${person.tone} ${small?'small':''}`} title={name}>{person.initials}</span>;
}

const navItems = [
  { id:'home', label:'首页', icon:Home }, { id:'expenses', label:'费用', icon:ReceiptText },
  { id:'chores', label:'值日', icon:BrushCleaning }, { id:'supplies', label:'物品', icon:PackageOpen },
  { id:'rules', label:'公约', icon:ScrollText },
];

function App(){
  const [page,setPage]=useState('home');
  const [drawer,setDrawer]=useState(null);
  const [modal,setModal]=useState(null);
  const [toast,setToast]=useState('');
  const [agentApplied,setAgentApplied]=useState(()=>localStorage.getItem('roomie-agent-applied')==='true');
  const [expenses,setExpenses]=useState(()=>JSON.parse(localStorage.getItem('roomie-expenses')||'null')||initialExpenses);
  const [chores,setChores]=useState(()=>JSON.parse(localStorage.getItem('roomie-chores')||'null')||initialChores);
  const [supplies,setSupplies]=useState(initialSupplies);
  const [rules,setRules]=useState(initialRules);
  const [activities,setActivities]=useState([
    {person:'Alex', text:'支付了电费 ¥86.40', time:'12 分钟前', type:'money'},
    {person:'Mia', text:'完成了浴室清洁', time:'1 小时前', type:'chore'},
    {person:'Jenny', text:'发起了新的安静时间提议', time:'昨天', type:'rule'},
    {person:'Alex', text:'补充了卷纸库存', time:'昨天', type:'supply'},
  ]);
  useEffect(()=>localStorage.setItem('roomie-expenses',JSON.stringify(expenses)),[expenses]);
  useEffect(()=>localStorage.setItem('roomie-chores',JSON.stringify(chores)),[chores]);
  const flash=(msg)=>{setToast(msg);setTimeout(()=>setToast(''),3000)};
  const go=(target)=>{setPage(target);window.scrollTo({top:0,behavior:'smooth'})};
  const markDone=(id)=>{
    const task=chores.find(c=>c.id===id); setChores(v=>v.map(c=>c.id===id?{...c,status:'completed',when:'刚刚完成'}:c));
    setActivities(v=>[{person:task.owner,text:`完成了${task.name}`,time:'刚刚',type:'chore'},...v]);flash(`已完成：${task.name}`);
  };
  const remind=(item)=>{setSupplies(v=>v.map(s=>s.id===item.id?{...s,reminded:true}:s));flash(`已提醒 ${item.owner} 补充${item.name}`)};
  const applyAgent=()=>{
    setDrawer(null);setAgentApplied(true);localStorage.setItem('roomie-agent-applied','true');
    setChores(v=>v.map(c=>c.id===2?{...c,owner:'Alex',when:'9月 18日 · 19:00'}:c));
    setExpenses(v=>v.map(e=>e.id===1?{...e,detail:'按居住天数分摊'}:e));
    setActivities(v=>[{person:'Roomie',text:'更新了 Mia 出差期间的共同计划',time:'刚刚',type:'ai'},...v]);flash('家庭计划已更新');
  };
  const resetDemo=()=>{localStorage.removeItem('roomie-agent-applied');localStorage.removeItem('roomie-expenses');localStorage.removeItem('roomie-chores');setAgentApplied(false);setExpenses(initialExpenses);setChores(initialChores);flash('演示数据已重置')};
  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={()=>go('home')}><span className="brand-mark"><span></span><span></span><span></span></span><strong>Roomie</strong></button>
      <nav>{navItems.map(n=><button key={n.id} className={page===n.id?'active':''} onClick={()=>go(n.id)}><n.icon size={19}/><span>{n.label}</span>{n.id==='home'&&<i className="nav-dot"/>}</button>)}</nav>
      <div className="side-bottom">
        <button className="ask-nav" onClick={()=>setModal('ask')}><Sparkles size={18}/><span>问问 Roomie</span></button>
        <button className="reset-link" onClick={resetDemo}><RotateCcw size={14}/> 重置演示</button>
        <div className="sidebar-home"><div className="home-symbol">3<span>02</span></div><div><b>302 HOME</b><small>3 位室友 · 一起生活 183 天</small></div></div>
      </div>
    </aside>
    <main>
      <header className="topbar">
        <button className="mobile-brand" onClick={()=>go('home')}><span className="brand-mark"><span></span><span></span><span></span></span>Roomie</button>
        <div className="home-switch"><span className="status-pulse"/>302 HOME <ChevronDown size={14}/></div>
        <div className="top-actions"><button aria-label="通知"><Bell size={19}/><i>2</i></button><div className="member-stack">{people.map(p=><Avatar key={p.name} name={p.name} small/>)}</div><Avatar name="Jenny"/></div>
      </header>
      <div className="content">
        {page==='home'&&<HomePage go={go} setDrawer={setDrawer} setModal={setModal} agentApplied={agentApplied} chores={chores} activities={activities}/>} 
        {page==='expenses'&&<ExpensesPage expenses={expenses} setModal={setModal}/>} 
        {page==='chores'&&<ChoresPage chores={chores} markDone={markDone}/>} 
        {page==='supplies'&&<SuppliesPage supplies={supplies} remind={remind} setModal={setModal}/>} 
        {page==='rules'&&<RulesPage rules={rules} setModal={setModal}/>} 
      </div>
    </main>
    <nav className="bottom-nav">{navItems.map(n=><button key={n.id} className={page===n.id?'active':''} onClick={()=>go(n.id)}><n.icon size={20}/><span>{n.label}</span></button>)}<button onClick={()=>setModal('ask')}><Sparkles size={20}/><span>问问</span></button></nav>
    {drawer==='agent'&&<AgentDrawer close={()=>setDrawer(null)} confirm={applyAgent}/>} 
    {drawer==='health'&&<HealthDrawer close={()=>setDrawer(null)} propose={()=>{setDrawer(null);flash('调整提议已发送给室友')}}/>}
    {modal==='expense'&&<ExpenseModal close={()=>setModal(null)} add={(expense)=>{setExpenses(v=>[expense,...v]);setModal(null);flash('费用已添加，等待室友确认')}}/>}
    {modal==='ask'&&<AskModal close={()=>setModal(null)} create={(data)=>{setExpenses(v=>[data,...v]);setModal(null);flash('已创建公共费用')}}/>}
    {modal==='supply'&&<SupplyModal close={()=>setModal(null)} add={(item)=>{setSupplies(v=>[item,...v]);setModal(null);flash('公共物品已登记')}}/>}
    {modal==='rule'&&<RuleModal close={()=>setModal(null)} propose={(rule)=>{setRules(v=>[rule,...v]);setModal(null);flash('公约变更已发起，等待 Mia 确认')}}/>}
    {toast&&<div className="toast"><CircleCheck size={18}/>{toast}</div>}
  </div>
}

function PageIntro({eyebrow,title,description,action}){return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>}

function HomePage({go,setDrawer,setModal,agentApplied,chores,activities}){
  const todayTask=chores.find(c=>c.id===1);
  return <>
    <section className="home-hero">
      <div className="greeting"><span className="eyebrow">2026年 9月 12日 · 星期六</span><h1>下午好，Jenny。</h1><p>三个人，一个家。少一点扯皮，多一点好好生活。</p></div>
      <div className="hero-meta"><span className="live-dot"/>家里整体运转良好</div>
    </section>
    <section className="home-grid">
      <div className="today-panel">
        <div className="section-heading"><div><span className="eyebrow">TODAY</span><h2>{agentApplied?'2':'3'} 件事需要你留意</h2></div><span className="date-tile"><b>12</b><small>SEP</small></span></div>
        <div className="attention-list">
          <button onClick={()=>go('expenses')}><span className="task-icon money"><CircleDollarSign size={20}/></span><span className="task-copy"><b>九月电费</b><small>¥86.40 · 等待你支付</small></span><span className="status-tag warning">待支付</span><ChevronRight size={18}/></button>
          {todayTask.status!=='completed'&&<button onClick={()=>go('chores')}><span className="task-icon chore"><BrushCleaning size={20}/></span><span className="task-copy"><b>厨房清洁</b><small>今天截止 · 20:00</small></span><span className="status-tag today">今天</span><ChevronRight size={18}/></button>}
          <button onClick={()=>go('supplies')}><span className="task-icon supply"><PackageOpen size={20}/></span><span className="task-copy"><b>卷纸快用完了</b><small>剩 2 卷 · 约还能用 2 天</small></span><span className="status-tag low">库存低</span><ChevronRight size={18}/></button>
        </div>
      </div>
      <button className={`insight-card ${agentApplied?'applied':''}`} onClick={()=>!agentApplied&&setDrawer('agent')}>
        <div className="insight-top"><span className="ai-orbit"><Sparkles size={18}/></span><span>{agentApplied?'调整已确认':'ROOMIE 发现一项变化'}</span><MoreHorizontal size={18}/></div>
        <div className="trip-visual"><div className="route"><span className="point home-point"><Home size={15}/></span><span className="route-line"><i/></span><span className="point away-point"><span>10</span><small>天</small></span></div><div className="trip-labels"><span>9月 15日<br/><small>离开 302 HOME</small></span><span>9月 25日<br/><small>回家</small></span></div></div>
        <h2>{agentApplied?'Mia 的出差安排已协调':'Mia 将在 9月 15–25日出差'}</h2>
        <p>{agentApplied?'值日与电费分摊已按大家确认的方案更新。':'这会影响 1 次值日和 1 笔公共费用。Roomie 准备了一套公平的调整建议。'}</p>
        <span className="insight-cta">{agentApplied?<><Check size={17}/> 查看已更新计划</>:<>查看调整建议 <ArrowRight size={17}/></>}</span>
      </button>
    </section>
    <section className="health-section">
      <div className="section-heading"><div><span className="eyebrow">HOME HEALTH</span><h2>合租状态</h2></div><button className="text-button" onClick={()=>setDrawer('health')}>查看 Roomie 洞察 <ArrowUpRight size={16}/></button></div>
      <button className="health-card" onClick={()=>setDrawer('health')}>
        <div className="score-wrap"><div className="score-ring" style={{'--score':92}}><span><b>92</b><small>/ 100</small></span></div><div><b>状态很好</b><p>过去 14 天，302 HOME 的共同生活保持顺畅。</p></div></div>
        <div className="health-metrics">
          <Metric icon={CircleDollarSign} label="费用" value={96}/><Metric icon={BrushCleaning} label="值日" value={82} down/><Metric icon={PackageCheck} label="物品" value={94}/><Metric icon={Users} label="共识" value={97}/>
        </div><ChevronRight className="health-arrow" size={20}/>
      </button>
    </section>
    <section className="lower-grid">
      <div className="activity-section"><div className="section-heading"><div><span className="eyebrow">LIVE TOGETHER</span><h2>最近动态</h2></div><button className="icon-btn"><MoreHorizontal size={19}/></button></div><div className="timeline">{activities.map((a,i)=><div className="activity" key={i}><Avatar name={a.person==='Roomie'?'Jenny':a.person}/><div><b>{a.person}</b> {a.text}<small>{a.time}</small></div><span className={`activity-dot ${a.type}`}/></div>)}</div></div>
      <div className="quick-agent"><span className="ai-orbit dark"><WandSparkles size={20}/></span><h3>家里有变化？</h3><p>告诉 Roomie。它会先梳理影响，再请大家确认。</p><button onClick={()=>setModal('ask')}>问问 Roomie <ArrowRight size={16}/></button></div>
    </section>
  </>
}

function Metric({icon:Icon,label,value,down}){return <div className="metric"><Icon size={17}/><span>{label}</span><b>{value}</b>{down&&<small>↓ 14</small>}<i><em style={{width:`${value}%`}}/></i></div>}

function ExpensesPage({expenses,setModal}){return <>
  <PageIntro eyebrow="SHARED LEDGER" title="公共账本" description="谁先垫付、谁该承担，一眼说清。" action={<button className="primary" onClick={()=>setModal('expense')}><Plus size={18}/> 添加费用</button>}/>
  <div className="stat-strip"><Stat label="本月公共支出" value="¥1,826" note="较上月低 8%"/><Stat label="等待结算" value="¥328" note="3 笔进行中"/><Stat label="你应收回" value="¥96" note="来自 Alex 与 Mia" accent/></div>
  <section className="data-section"><div className="section-heading"><div><h2>九月账单</h2><p>8 笔记录 · 更新于今天 14:32</p></div><button className="filter-btn">全部类别 <ChevronDown size={15}/></button></div><div className="expense-list list-card">{expenses.map(e=>{const Icon=e.icon||ShoppingBasket;return <button className="expense-row" key={e.id}><span className="row-icon"><Icon size={19}/></span><span className="row-main"><b>{e.name}</b><small>{e.date} · {e.category}</small></span><span className="payer"><Avatar name={e.payer} small/><span><small>付款人</small><b>{e.payer}</b></span></span><span className="amount"><b>¥{Number(e.amount).toFixed(2)}</b><small className={e.status==='pending'?'pending-text':''}>{e.detail}</small></span><ChevronRight size={18}/></button>})}</div></section>
  <div className="fairness-note"><ShieldCheck size={21}/><div><b>每一笔分摊都有依据</b><p>Roomie 会保留付款人、参与人和分摊方式。任何调整都需要相关室友确认。</p></div></div>
  </>}

function Stat({label,value,note,accent}){return <div className={`stat ${accent?'accent':''}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>}

function ChoresPage({chores,markDone}){return <>
  <PageIntro eyebrow="CLEANING ROTATION" title="清洁轮值" description="每个人都知道这次是谁、下次轮到谁。" action={<button className="secondary"><CalendarDays size={18}/> 查看月历</button>}/>
  <div className="rotation-banner"><div><span className="eyebrow">本周轮值</span><h3>分工保持平衡</h3><p>3 人各负责 1–2 项，下一轮会自动顺延。</p></div><div className="rotation-people">{people.map((p,i)=><React.Fragment key={p.name}><div><Avatar name={p.name}/><span>{p.name}</span></div>{i<2&&<ArrowRight size={18}/>}</React.Fragment>)}</div></div>
  <section className="data-section"><div className="section-heading"><div><h2>本周任务</h2><p>9月 7日 — 9月 13日</p></div><span className="completion">2 / 6 已完成</span></div><div className="chore-grid">{chores.map(c=>{const Icon=c.icon;return <article className={`chore-card ${c.status}`} key={c.id}><div className="chore-top"><span className="row-icon"><Icon size={21}/></span><Status status={c.status}/></div><h3>{c.name}</h3><div className="chore-owner"><Avatar name={c.owner}/><div><small>本次负责人</small><b>{c.owner}</b></div></div><div className="due"><Clock3 size={16}/>{c.when}</div><div className="rotation-mini"><span>当前</span>{c.rotation.map((r,i)=><React.Fragment key={r}><Avatar name={r} small/>{i<c.rotation.length-1&&<ChevronRight size={13}/>}</React.Fragment>)}<span>下一轮</span></div>{c.status==='today'?<button className="primary full" onClick={()=>markDone(c.id)}><Check size={17}/> 标记完成</button>:c.status==='completed'?<button className="done-button"><CircleCheck size={17}/> 已完成</button>:<button className="ghost full">查看任务</button>}</article>})}</div></section>
  </>}

function Status({status}){const map={today:['今天截止','today'],upcoming:['即将开始','neutral'],completed:['已完成','success'],overdue:['已逾期','danger']};return <span className={`status-tag ${map[status][1]}`}>{map[status][0]}</span>}

function SuppliesPage({supplies,remind,setModal}){return <>
  <PageIntro eyebrow="SHARED SUPPLIES" title="公共物品" description="在真正用完之前，让正确的人知道。" action={<button className="primary" onClick={()=>setModal('supply')}><Plus size={18}/> 登记物品</button>}/>
  <div className="supply-summary"><div><ShoppingBasket size={21}/><span><b>1 件需要补充</b><small>卷纸预计 2 天后用完</small></span></div><div className="owners">本月采购负责人 {people.map(p=><Avatar key={p.name} name={p.name} small/>)}</div></div>
  <div className="supply-grid">{supplies.map(s=><article className="supply-card" key={s.id}><div className="supply-head"><div className="supply-glyph"><Box size={22}/></div><Status status={s.status==='low'?'overdue':s.status==='watch'?'today':'completed'}/></div><h3>{s.name}</h3><strong>{s.amount}</strong><p>{s.detail}</p><div className="stock-track"><i style={{width:`${s.level}%`}}/></div><div className="owner-line"><span>负责人</span><span><Avatar name={s.owner} small/><b>{s.owner}</b></span></div>{s.status==='low'?<button disabled={s.reminded} className="primary full" onClick={()=>remind(s)}><Bell size={17}/>{s.reminded?'已提醒':'提醒 '+s.owner}</button>:<button className="ghost full">更新库存</button>}</article>)}</div>
  </>}

function RulesPage({rules,setModal}){return <>
  <PageIntro eyebrow="ROOMMATE AGREEMENTS" title="我们的公约" description="不是谁管理谁，而是我们共同说好的生活方式。" action={<button className="primary" onClick={()=>setModal('rule')}><Plus size={18}/> 发起变更</button>}/>
  <div className="consensus-banner"><div className="consensus-mark"><Users size={23}/></div><div><span className="eyebrow">共同形成，而非单方制定</span><h3>3 位室友 · 3 条生效公约</h3></div><span className="consensus-score"><Check size={15}/> 共识良好</span></div>
  <div className="rules-list">{rules.map(r=>{const Icon=r.icon||ScrollText;return <article className="rule-card" key={r.id}><span className="rule-icon"><Icon size={22}/></span><div className="rule-copy"><h3>{r.title}</h3><strong>{r.summary}</strong><p>{r.description}</p></div><div className="rule-votes"><div className="member-stack">{people.map(p=><span key={p.name} className="agreed-avatar"><Avatar name={p.name} small/><Check size={10}/></span>)}</div><b>{r.agreed} / 3 已同意</b><small>{r.agreed===3?'全员确认 · 已生效':'等待 Mia 确认'}</small></div><button className="icon-btn"><ChevronRight size={19}/></button></article>})}</div>
  <article className="proposal-card"><div className="proposal-header"><Avatar name="Alex"/><div><b>Alex 发起了一项变更</b><small>今天 11:20</small></div><span className="status-tag today">表决中</span></div><div className="proposal-change"><span><small>原安静时间</small><s>23:00</s></span><ArrowRight size={20}/><span><small>建议调整为</small><strong>24:00</strong></span></div><div className="vote-row"><span>Jenny <Check size={14}/></span><span>Alex <Check size={14}/></span><span className="waiting">Mia 等待中</span><b>2 / 3 已同意</b></div></article>
  </>}

function Overlay({children,close,wide=false}){useEffect(()=>{const h=e=>e.key==='Escape'&&close();document.addEventListener('keydown',h);document.body.classList.add('no-scroll');return()=>{document.removeEventListener('keydown',h);document.body.classList.remove('no-scroll')}},[]);return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className={wide?'modal wide':'modal'}>{children}</div></div>}

function AgentDrawer({close,confirm}){const [loading,setLoading]=useState(false);const act=()=>{setLoading(true);setTimeout(confirm,900)};return <div className="drawer-layer" onMouseDown={e=>e.target===e.currentTarget&&close()}><aside className="drawer"><button className="close-btn" onClick={close}><X size={20}/></button><div className="drawer-kicker"><Sparkles size={17}/> ROOMIE COORDINATION</div><h2>Mia 的出差安排</h2><p className="drawer-sub">9月 15日 → 9月 25日 · 离家 10 天</p><div className="impact-line"><span>Roomie 找到</span><b>2 项可能需要调整</b></div><section className="adjust-block"><div className="adjust-title"><span className="task-icon chore"><BrushCleaning size={18}/></span><div><b>浴室清洁</b><small>值日轮换</small></div><span className="ai-label">Roomie 建议</span></div><div className="before-after"><div><small>原计划 · 9月 18日</small><span><Avatar name="Mia"/>Mia</span></div><ArrowRight size={20}/><div><small>调整后 · 9月 18日</small><span><Avatar name="Alex"/>Alex</span></div></div><div className="swap-note"><RotateCcw size={16}/><span>与 Alex 9月 28日的任务互换，<b>每个人的总工作量保持不变。</b></span></div></section><section className="adjust-block"><div className="adjust-title"><span className="task-icon money"><CircleDollarSign size={18}/></span><div><b>九月电费</b><small>当前按三人均分</small></div><span className="ai-label">Roomie 建议</span></div><h4>按在家天数分摊</h4><div className="split-list"><Split name="Jenny" days={30} value="¥90.00"/><Split name="Alex" days={30} value="¥90.00"/><Split name="Mia" days={20} value="¥60.00"/></div></section><div className="drawer-trust"><ShieldCheck size={18}/><p><b>Roomie 不会替室友做决定。</b><br/>确认后才会同步更新值日与费用记录，所有人都能看到变更。</p></div><div className="drawer-actions"><span><b>2 项调整</b><small>准备就绪</small></span><button className="secondary" onClick={close}>保持原计划</button><button className="primary" onClick={act} disabled={loading}>{loading?<><span className="spinner"/>正在更新</>:<>确认调整 <Check size={17}/></>}</button></div></aside></div>}
function Split({name,days,value}){return <div><span><Avatar name={name} small/><b>{name}</b></span><small>{days} 天在家</small><strong>{value}</strong></div>}

function HealthDrawer({close,propose}){return <div className="drawer-layer" onMouseDown={e=>e.target===e.currentTarget&&close()}><aside className="drawer"><button className="close-btn" onClick={close}><X size={20}/></button><div className="drawer-kicker"><Sparkles size={17}/> ROOMIE INSIGHT</div><h2>值日完成率正在下降</h2><p className="drawer-sub">基于过去 14 天的共同记录</p><div className="trend-visual"><div className="trend-value"><b>96%</b><ArrowRight/><strong>82%</strong></div><div className="bars">{[94,96,93,88,86,82].map((v,i)=><i key={i} style={{height:`${v-45}%`}} className={i>3?'warn':''}/>)}</div></div><section className="insight-copy"><h3>Roomie 发现</h3><p>最近延迟完成的任务大多安排在<strong>周六上午</strong>。这可能与大家周末起床时间较晚有关。</p><h3>建议调整</h3><div className="suggestion-box"><CalendarDays size={20}/><div><b>把周末值日移到周日晚上</b><span>周六 10:00 → 周日 19:00</span></div></div></section><div className="drawer-trust"><ShieldCheck size={18}/><p>发起后将邀请所有室友表决；达到 2 / 3 同意后才会生效。</p></div><div className="drawer-actions"><span/><button className="secondary" onClick={close}>稍后再说</button><button className="primary" onClick={propose}>发起调整提议</button></div></aside></div>}

function ModalHead({icon:Icon,title,subtitle,close}){return <div className="modal-head"><span className="modal-icon"><Icon size={20}/></span><div><h2>{title}</h2><p>{subtitle}</p></div><button className="close-btn" onClick={close}><X size={20}/></button></div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}

function ExpenseModal({close,add}){const [name,setName]=useState('');const [amount,setAmount]=useState('');const [split,setSplit]=useState('equal');const [payer,setPayer]=useState('Jenny');const total=Number(amount)||0;const days=[30,30,15];const totalDays=75;return <Overlay close={close}><ModalHead icon={ReceiptText} title="添加公共费用" subtitle="记录后，参与者会收到待确认分摊。" close={close}/><div className="form-grid"><Field label="费用名称"><input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例如：九月燃气费"/></Field><Field label="金额"><div className="money-input"><span>¥</span><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/></div></Field><Field label="付款人"><select value={payer} onChange={e=>setPayer(e.target.value)}>{people.map(p=><option key={p.name}>{p.name}</option>)}</select></Field><Field label="参与人"><div className="check-row">{people.map(p=><span className="checked" key={p.name}><Check size={13}/>{p.name}</span>)}</div></Field></div><div className="split-section"><span className="field-label">分摊方式</span><div className="segmented"><button className={split==='equal'?'active':''} onClick={()=>setSplit('equal')}>平均分摊</button><button className={split==='days'?'active':''} onClick={()=>setSplit('days')}>按在家天数</button><button className={split==='custom'?'active':''} onClick={()=>setSplit('custom')}>自定义比例</button></div><div className="calculation">{people.map((p,i)=>{const val=split==='days'?total*days[i]/totalDays:total/3;return <div key={p.name}><span><Avatar name={p.name} small/><b>{p.name}</b></span>{split==='days'&&<small>{days[i]} 天</small>}<strong>¥{val.toFixed(2)}</strong></div>})}</div></div><div className="modal-actions"><button className="secondary" onClick={close}>取消</button><button className="primary" disabled={!name||!amount} onClick={()=>add({id:Date.now(),icon:ShoppingBasket,name,date:'今天',amount:total,payer,detail:'0 / 3 已支付',status:'pending',category:'公共支出'})}>确认添加</button></div></Overlay>}

function AskModal({close,create}){const examples=['昨天我买了 48 元卷纸，我们三个平分。','Mia 下周出差十天。','帮我和 Alex 换一下周三的值日。','洗洁精快没了。'];const [text,setText]=useState('');const [stage,setStage]=useState('input');const analyze=()=>{if(!text)return;setStage('loading');setTimeout(()=>setStage('preview'),1000)};return <Overlay close={close} wide><ModalHead icon={Sparkles} title="问问 Roomie" subtitle="告诉我家里发生了什么。我会先理解，再请你确认。" close={close}/>{stage==='input'&&<><div className="prompt-box"><textarea autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="例如：昨天我买了 48 元卷纸，我们三个平分。"/><button className="send-btn" disabled={!text} onClick={analyze}><Send size={18}/></button></div><div className="example-prompts"><span>试试这样说</span>{examples.map(x=><button key={x} onClick={()=>setText(x)}>{x}</button>)}</div><StepTrack active={1}/></>}{stage==='loading'&&<div className="ai-loading"><span className="ai-orbit"><Sparkles size={20}/></span><h3>正在梳理这件事的影响…</h3><p>识别对象、参与人和需要确认的共同规则</p><div className="loading-line"><i/></div></div>}{stage==='preview'&&<><div className="understood"><span className="eyebrow">ROOMIE 理解为</span><div className="receipt-preview"><span className="row-icon"><PackageOpen size={20}/></span><div><small>公共采购</small><h3>卷纸 · ¥48.00</h3></div><span className="ai-label">待确认</span></div><div className="preview-fields"><div><small>付款人</small><b><Avatar name="Jenny" small/>Jenny</b></div><div><small>参与人</small><b>Jenny / Alex / Mia</b></div><div><small>分摊</small><b>¥16.00 / 人</b></div></div></div><StepTrack active={3}/><div className="modal-actions"><button className="secondary" onClick={()=>setStage('input')}>返回修改</button><button className="primary" onClick={()=>create({id:Date.now(),icon:PackageOpen,name:'卷纸',date:'昨天',amount:48,payer:'Jenny',detail:'0 / 3 已支付',status:'pending',category:'公共用品'})}>确认创建</button></div></>}</Overlay>}
function StepTrack({active}){return <div className="step-track">{['理解','预览','确认','执行'].map((s,i)=><div className={i+1<=active?'active':''} key={s}><i>{i+1<active?<Check size={12}/>:i+1}</i><span>{s}</span></div>)}</div>}
function SupplyModal({close,add}){const [name,setName]=useState('');return <Overlay close={close}><ModalHead icon={PackageOpen} title="登记公共物品" subtitle="指定负责人，让补充提醒找到正确的人。" close={close}/><Field label="物品名称"><input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例如：厨房纸巾"/></Field><div className="form-grid"><Field label="当前库存"><select><option>库存充足</option><option>需要留意</option><option>库存低</option></select></Field><Field label="负责人"><select>{people.map(p=><option key={p.name}>{p.name}</option>)}</select></Field></div><div className="modal-actions"><button className="secondary" onClick={close}>取消</button><button className="primary" disabled={!name} onClick={()=>add({id:Date.now(),name,amount:'库存充足',detail:'刚刚更新',owner:'Jenny',level:85,status:'good'})}>确认登记</button></div></Overlay>}
function RuleModal({close,propose}){const [time,setTime]=useState('24:00');return <Overlay close={close}><ModalHead icon={ScrollText} title="发起公约变更" subtitle="其他室友确认后，新的共同规则才会生效。" close={close}/><Field label="变更公约"><select><option>安静时间</option><option>访客约定</option><option>公共采购</option></select></Field><div className="rule-change-form"><div><small>当前</small><b>23:00 – 08:00</b></div><ArrowRight size={20}/><div><small>建议改为</small><b><input value={time} onChange={e=>setTime(e.target.value)}/> – 08:00</b></div></div><Field label="为什么要改？"><textarea placeholder="向室友简单说明原因…" defaultValue="周末大家普遍睡得更晚，希望晚一小时进入安静时间。"/></Field><div className="modal-actions"><button className="secondary" onClick={close}>取消</button><button className="primary" onClick={()=>propose({id:Date.now(),icon:Moon,title:'周末安静时间',summary:`周末 ${time} – 08:00`,description:'周末延后一小时进入安静时间。',agreed:2})}>发起表决</button></div></Overlay>}

createRoot(document.getElementById('root')).render(<App/>);
