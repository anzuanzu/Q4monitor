'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';

type Level = 'HRM' | 'SRM1' | 'SRM2' | 'RM1' | 'RM2' | 'JRM';
type Advisor = { branch: '板橋分行' | '華江分行' | '新板分行'; level: Level; name: string; fundTarget: number };
type Performance = { quarterTarget: string; quarterProgress: string; quarterRate: string; fundProgress: string; insuranceProgress: string };

const advisors: Advisor[] = [
  ['板橋分行','SRM1','張瓊月',4400],['板橋分行','SRM1','宋婷婷',4400],['板橋分行','SRM1','刁蕙鈺',4400],['板橋分行','SRM1','溫志剛',4400],['板橋分行','SRM1','周韻如',4400],['板橋分行','SRM1','許凱婷',4400],['板橋分行','SRM1','宋柏陞',4400],['板橋分行','SRM1','李宗杰',4400],['板橋分行','SRM1','吳采妍',4400],['板橋分行','SRM2','李承紘',3400],['板橋分行','JRM','洪易佳',600],
  ['華江分行','SRM1','詹采榆',4400],['華江分行','SRM1','廖敏慧',4400],['華江分行','SRM2','施雯晴',3400],['華江分行','SRM2','黃柏飛',3400],['華江分行','RM1','曹馨勻',2200],['華江分行','RM1','徐小凡',2200],
  ['新板分行','HRM','楊璧菁',6000],['新板分行','SRM1','朱麗鳳',4400],['新板分行','SRM1','黃淑卿',4400],['新板分行','SRM2','艾祺倫',3400],['新板分行','SRM2','郭淑芬',3400],['新板分行','SRM2','林靜芸',3400],['新板分行','RM1','陳奕憲',2200],['新板分行','RM1','詹忠儒',2200],['新板分行','RM1','周至浩',2200],['新板分行','RM2','王泓權',1000],['新板分行','RM2','盧品豪',1000],
].map(([branch, level, name, fundTarget]) => ({ branch, level, name, fundTarget }));

const insuranceTargets: Record<Level, number> = { HRM: 300, SRM1: 250, SRM2: 200, RM1: 150, RM2: 100, JRM: 50 };
const branches = ['板橋分行', '華江分行', '新板分行'] as const;
const colors: Record<Level, string> = { HRM:'#cc8b3c', SRM1:'#0e7c66', SRM2:'#4f8c7a', RM1:'#86ad96', RM2:'#c6d7b7', JRM:'#e5b869' };
const fmt = (value: number) => value.toLocaleString('zh-TW');
const key = (branch: string, name: string) => `${branch}-${name}`;
const targetTotal = (metric: 'fundTarget' | 'insuranceTarget', items = advisors) => items.reduce((sum, advisor) => sum + (metric === 'fundTarget' ? advisor.fundTarget : insuranceTargets[advisor.level]), 0);

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return {} as Record<string, Performance>;
  const headers = lines[0].split(',').map((header) => header.trim().replaceAll('"', ''));
  const getIndex = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const branchIndex = getIndex('分行', 'branch'); const nameIndex = getIndex('理專姓名', '姓名', 'advisor_name', 'name');
  const quarterTargetIndex = getIndex('季責任額', 'quarter_target'); const quarterProgressIndex = getIndex('季進度(含在途)', 'quarter_progress'); const quarterRateIndex = getIndex('季達成率', 'quarter_completion_rate'); const fundProgressIndex = getIndex('基金進度', 'fund_progress'); const insuranceProgressIndex = getIndex('保險進度', 'insurance_progress');
  if (branchIndex < 0 || nameIndex < 0) return {} as Record<string, Performance>;
  return lines.slice(1).reduce<Record<string, Performance>>((records, line) => {
    const cells = line.split(',').map((cell) => cell.trim().replaceAll('"', ''));
    if (!cells[branchIndex] || !cells[nameIndex]) return records;
    records[key(cells[branchIndex], cells[nameIndex])] = { quarterTarget: cells[quarterTargetIndex] || '', quarterProgress: cells[quarterProgressIndex] || '', quarterRate: cells[quarterRateIndex] || '', fundProgress: cells[fundProgressIndex] || '', insuranceProgress: cells[insuranceProgressIndex] || '' };
    return records;
  }, {});
}

export default function Home() {
  const [branch, setBranch] = useState('全部分行');
  const [search, setSearch] = useState('');
  const [performance, setPerformance] = useState<Record<string, Performance>>({});
  const [source, setSource] = useState('尚未載入實績資料');

  useEffect(() => {
    fetch('/data/performance.csv').then((response) => response.ok ? response.text() : '').then((text) => {
      const records = parseCsv(text);
      if (Object.keys(records).length) { setPerformance(records); setSource(`已讀取預設資料 · ${Object.keys(records).length} 筆`); }
    }).catch(() => undefined);
  }, []);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const records = parseCsv(String(reader.result || '')); setPerformance(records); setSource(records && Object.keys(records).length ? `已讀取 ${file.name} · ${Object.keys(records).length} 筆` : '找不到可對應的實績資料'); };
    reader.readAsText(file, 'utf-8');
  };

  const filtered = useMemo(() => advisors.filter((advisor) => (branch === '全部分行' || advisor.branch === branch) && advisor.name.includes(search.trim())), [branch, search]);
  const fundTotal = targetTotal('fundTarget'); const insuranceTotal = targetTotal('insuranceTarget');
  const loadedCount = Object.keys(performance).length;

  return <main>
    <section className="hero"><div className="hero__topline"><span className="eyebrow">Q4 TARGETS · INTERNAL DASHBOARD</span><span className="data-status"><i />{source}</span></div><div className="hero__content"><div><p className="hero__kicker">第四季整合績效監控</p><h1>責任目標與實績</h1><p className="hero__description">基金與保險目標整合在同一張人員表；可直接載入季責任額、季進度（含在途）、季達成率及專案進度的真實績效 CSV。</p></div><label className="upload-button">讀取績效 CSV<input type="file" accept=".csv,text/csv" onChange={handleFile} /></label></div></section>
    <section className="dashboard-shell">
      <div className="metric-grid" aria-label="專案摘要"><article className="metric-card metric-card--primary"><span>基金目標</span><strong>{(fundTotal / 10000).toFixed(2)}<em> 億</em></strong><p>第四季專案基金</p></article><article className="metric-card"><span>保險佣收目標</span><strong>{fmt(insuranceTotal)}<em> 萬</em></strong><p>第四季專案保險</p></article><article className="metric-card"><span>納入人員</span><strong>{advisors.length}<em> 位</em></strong><p>跨 3 家分行、6 個職級</p></article><article className="metric-card"><span>已載入實績</span><strong>{loadedCount}<em> 筆</em></strong><p>以分行與姓名對應</p></article></div>
      <div className="section-heading"><div><span className="eyebrow">BRANCH OVERVIEW</span><h2>分行責任目標</h2></div><p>基金／保險均以萬元為單位</p></div>
      <div className="branch-grid">{branches.map((name) => { const people = advisors.filter((advisor) => advisor.branch === name); return <article className="branch-card" key={name}><div className="branch-card__heading"><span>{name.replace('分行','')}</span><small>{people.length} 位人員</small></div><strong>{fmt(targetTotal('fundTarget', people))} <em>萬</em></strong><p>基金目標</p><div className="dual-target"><span>保險佣收目標</span><b>{fmt(targetTotal('insuranceTarget', people))} 萬</b></div></article>; })}</div>
      <section className="staff-section" aria-labelledby="staff-title"><div className="staff-section__header"><div><span className="eyebrow">INTEGRATED PERSONNEL TABLE</span><h2 id="staff-title">人員整合目標與實績</h2></div><span>{filtered.length} / {advisors.length} 筆</span></div><div className="filters"><label>分行<select value={branch} onChange={(event) => setBranch(event.target.value)}><option>全部分行</option>{branches.map((name) => <option key={name}>{name}</option>)}</select></label><label className="search-label">姓名<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="輸入姓名搜尋" /></label><label className="csv-tip">CSV 欄位：分行、理專姓名、季責任額、季進度(含在途)、季達成率、基金進度、保險進度</label></div><div className="table-wrap"><table><thead><tr><th>分行</th><th>職級</th><th>理專姓名</th><th className="number">季責任額</th><th className="number">季進度（含在途）</th><th className="number">季達成率</th><th className="number target-header">基金目標</th><th className="number">基金進度</th><th className="number target-header">保險目標</th><th className="number">保險進度</th></tr></thead><tbody>{filtered.map((advisor) => { const actual = performance[key(advisor.branch, advisor.name)]; return <tr key={key(advisor.branch, advisor.name)}><td>{advisor.branch}</td><td><span className="level-pill" style={{ color: colors[advisor.level] }}>{advisor.level}</span></td><td className="staff-name">{advisor.name}</td><td className="number actual-value">{actual?.quarterTarget || '—'}</td><td className="number actual-value">{actual?.quarterProgress || '—'}</td><td className="number actual-value">{actual?.quarterRate || '—'}</td><td className="number target-value">{fmt(advisor.fundTarget)} 萬</td><td className="number actual-value">{actual?.fundProgress || '—'}</td><td className="number target-value">{fmt(insuranceTargets[advisor.level])} 萬</td><td className="number actual-value">{actual?.insuranceProgress || '—'}</td></tr>; })}</tbody></table></div>{filtered.length === 0 && <p className="empty-state">找不到符合條件的人員。</p>}</section>
    </section><footer>資料版本：第四季基金專案與保險佣收責任目標 · 實績可由 CSV 檔案讀取</footer>
  </main>;
}
