'use client';

import { useMemo, useState } from 'react';

type Advisor = {
  branch: '板橋分行' | '華江分行' | '新板分行';
  level: 'HRM' | 'SRM1' | 'SRM2' | 'RM1' | 'RM2' | 'JRM';
  name: string;
  target: number;
};

const advisors: Advisor[] = [
  ['板橋分行', 'SRM1', '張瓊月', 4400], ['板橋分行', 'SRM1', '宋婷婷', 4400],
  ['板橋分行', 'SRM1', '刁蕙鈺', 4400], ['板橋分行', 'SRM1', '溫志剛', 4400],
  ['板橋分行', 'SRM1', '周韻如', 4400], ['板橋分行', 'SRM1', '許凱婷', 4400],
  ['板橋分行', 'SRM1', '宋柏陞', 4400], ['板橋分行', 'SRM1', '李宗杰', 4400],
  ['板橋分行', 'SRM1', '吳采妍', 4400], ['板橋分行', 'SRM2', '李承紘', 3400],
  ['板橋分行', 'JRM', '洪易佳', 600],
  ['華江分行', 'SRM1', '詹采榆', 4400], ['華江分行', 'SRM1', '廖敏慧', 4400],
  ['華江分行', 'SRM2', '施雯晴', 3400], ['華江分行', 'SRM2', '黃柏飛', 3400],
  ['華江分行', 'RM1', '曹馨勻', 2200], ['華江分行', 'RM1', '徐小凡', 2200],
  ['新板分行', 'HRM', '楊璧菁', 6000], ['新板分行', 'SRM1', '朱麗鳳', 4400],
  ['新板分行', 'SRM1', '黃淑卿', 4400], ['新板分行', 'SRM2', '艾祺倫', 3400],
  ['新板分行', 'SRM2', '郭淑芬', 3400], ['新板分行', 'SRM2', '林靜芸', 3400],
  ['新板分行', 'RM1', '陳奕憲', 2200], ['新板分行', 'RM1', '詹忠儒', 2200],
  ['新板分行', 'RM1', '周至浩', 2200], ['新板分行', 'RM2', '王泓權', 1000],
  ['新板分行', 'RM2', '盧品豪', 1000],
].map(([branch, level, name, target]) => ({ branch, level, name, target }));

const branches = ['板橋分行', '華江分行', '新板分行'] as const;
const levels = ['HRM', 'SRM1', 'SRM2', 'RM1', 'RM2', 'JRM'] as const;
const levelLabels: Record<Advisor['level'], string> = {
  HRM: '資深理財主管', SRM1: '資深理財經理 I', SRM2: '資深理財經理 II',
  RM1: '理財經理 I', RM2: '理財經理 II', JRM: '初階理財經理',
};
const colors: Record<Advisor['level'], string> = {
  HRM: '#cc8b3c', SRM1: '#0e7c66', SRM2: '#4f8c7a', RM1: '#86ad96', RM2: '#c6d7b7', JRM: '#e5b869',
};
const insuranceTargets: Record<Advisor['level'], number> = {
  HRM: 300, SRM1: 250, SRM2: 200, RM1: 150, RM2: 100, JRM: 50,
};

const sum = (items: Advisor[]) => items.reduce((total, item) => total + item.target, 0);
const fmt = (value: number) => value.toLocaleString('zh-TW');

export default function Home() {
  const [project, setProject] = useState<'fund' | 'insurance'>('fund');
  const [branch, setBranch] = useState('全部分行');
  const [level, setLevel] = useState('全部職級');
  const [search, setSearch] = useState('');

  const currentAdvisors = useMemo(() => project === 'fund' ? advisors : advisors.map((advisor) => ({
    ...advisor,
    target: insuranceTargets[advisor.level],
  })), [project]);
  const projectLabel = project === 'fund' ? '第四季基金專案' : '第四季保險佣收';
  const targetLabel = project === 'fund' ? '基金專案銷量目標' : '保險佣收目標';

  const filtered = useMemo(() => currentAdvisors.filter((advisor) =>
    (branch === '全部分行' || advisor.branch === branch) &&
    (level === '全部職級' || advisor.level === level) &&
    advisor.name.includes(search.trim()),
  ), [branch, currentAdvisors, level, search]);

  const totalTarget = sum(currentAdvisors);
  const branchSummaries = branches.map((name) => {
    const people = currentAdvisors.filter((advisor) => advisor.branch === name);
    return { name, people, target: sum(people) };
  });

  return (
    <main>
      <section className="hero">
        <div className="hero__topline">
          <div className="hero__identity"><span className="eyebrow">Q4 TARGETS · INTERNAL DASHBOARD</span><div className="project-switch" role="group" aria-label="選擇專案"><button className={project === 'fund' ? 'is-active' : ''} onClick={() => setProject('fund')}>基金專案</button><button className={project === 'insurance' ? 'is-active' : ''} onClick={() => setProject('insurance')}>保險佣收</button></div></div>
          <span className="data-status"><i />目標資料已載入</span>
        </div>
        <div className="hero__content">
          <div>
            <p className="hero__kicker">{projectLabel}</p>
            <h1>績效監控表</h1>
            <p className="hero__description">三家分行、28 位理財人員的責任目標總覽。實績欄位待上傳後，即可接續追蹤完成率。</p>
          </div>
          <div className="hero__target">
            <span>{targetLabel}合計</span>
            <strong>{(totalTarget / 10000).toFixed(2)} 億</strong>
            <small>NT$ {fmt(totalTarget)} 萬</small>
          </div>
        </div>
      </section>

      <section className="dashboard-shell">
        <div className="metric-grid" aria-label="專案摘要">
          <article className="metric-card metric-card--primary"><span>總責任目標</span><strong>{(totalTarget / 10000).toFixed(2)}<em> 億</em></strong><p>{projectLabel}合計</p></article>
          <article className="metric-card"><span>納入人員</span><strong>{currentAdvisors.length}<em> 位</em></strong><p>跨 3 家分行、6 個職級</p></article>
          <article className="metric-card"><span>最高每人目標</span><strong>{fmt(Math.max(...currentAdvisors.map((advisor) => advisor.target)))}<em> 萬</em></strong><p>{project === 'fund' ? 'HRM · 新板分行' : '依職級責任目標設定'}</p></article>
          <article className="metric-card"><span>實績資料</span><strong className="metric-card__pending">待匯入</strong><p>匯入後將自動計算達成率</p></article>
        </div>

        <div className="section-heading"><div><span className="eyebrow">BRANCH OVERVIEW</span><h2>分行責任目標</h2></div><p>以萬為單位</p></div>
        <div className="branch-grid">
          {branchSummaries.map(({ name, people, target }) => (
            <article className="branch-card" key={name}>
              <div className="branch-card__heading"><span>{name.replace('分行', '')}</span><small>{people.length} 位人員</small></div>
              <strong>{fmt(target)} <em>萬</em></strong>
              <div className="branch-card__bar"><i style={{ width: `${(target / Math.max(...branchSummaries.map((item) => item.target))) * 100}%` }} /></div>
              <p>{(target / 10000).toFixed(2)} 億責任目標</p>
            </article>
          ))}
        </div>

        <section className="allocation-panel" aria-labelledby="allocation-title">
          <div className="allocation-panel__header"><div><span className="eyebrow">ALLOCATION</span><h2 id="allocation-title">職級目標配置</h2></div><p>依各職級人數加總</p></div>
          <div className="allocation-list">
            {levels.map((jobLevel) => {
              const entries = currentAdvisors.filter((advisor) => advisor.level === jobLevel);
              const target = sum(entries);
              return <div className="allocation-row" key={jobLevel}>
                <div className="allocation-row__title"><i style={{ backgroundColor: colors[jobLevel] }} /><b>{jobLevel}</b><span>{levelLabels[jobLevel]}</span></div>
                <div className="allocation-row__bar"><i style={{ width: `${(target / totalTarget) * 100}%`, backgroundColor: colors[jobLevel] }} /></div>
                <span className="allocation-row__people">{entries.length} 位</span>
                <strong>{fmt(target)} 萬</strong>
              </div>;
            })}
          </div>
        </section>

        <section className="staff-section" aria-labelledby="staff-title">
          <div className="staff-section__header"><div><span className="eyebrow">PERSONNEL TARGETS</span><h2 id="staff-title">人員責任目標</h2></div><span>{filtered.length} / {currentAdvisors.length} 筆</span></div>
          <div className="filters" aria-label="篩選人員">
            <label>分行<select value={branch} onChange={(event) => setBranch(event.target.value)}><option>全部分行</option>{branches.map((name) => <option key={name}>{name}</option>)}</select></label>
            <label>職級<select value={level} onChange={(event) => setLevel(event.target.value)}><option>全部職級</option>{levels.map((name) => <option key={name}>{name}</option>)}</select></label>
            <label className="search-label">姓名<input aria-label="搜尋姓名" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="輸入姓名搜尋" /></label>
          </div>
          <div className="table-wrap"><table><thead><tr><th>分行</th><th>職級</th><th>理專姓名</th><th className="number">{targetLabel}</th><th className="number">實績</th></tr></thead><tbody>
            {filtered.map((advisor) => <tr key={`${advisor.branch}-${advisor.name}`}><td>{advisor.branch}</td><td><span className="level-pill" style={{ color: colors[advisor.level] }}>{advisor.level}</span></td><td className="staff-name">{advisor.name}</td><td className="number target-value">{fmt(advisor.target)} 萬</td><td className="number"><span className="pending-pill">待匯入</span></td></tr>)}
          </tbody></table></div>
          {filtered.length === 0 && <p className="empty-state">找不到符合條件的人員。</p>}
        </section>
      </section>
      <footer>資料版本：第四季基金專案與保險佣收責任目標 · 僅供內部管理使用</footer>
    </main>
  );
}
