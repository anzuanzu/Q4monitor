const advisors = [
  ['板橋分行','SRM1','張瓊月',4400],['板橋分行','SRM1','宋婷婷',4400],['板橋分行','SRM1','刁蕙鈺',4400],['板橋分行','SRM1','溫志剛',4400],['板橋分行','SRM1','周韻如',4400],['板橋分行','SRM1','許凱婷',4400],['板橋分行','SRM1','宋柏陞',4400],['板橋分行','SRM1','李宗杰',4400],['板橋分行','SRM1','吳采妍',4400],['板橋分行','SRM2','李承紘',3400],['板橋分行','JRM','洪易佳',600],
  ['華江分行','SRM1','詹采榆',4400],['華江分行','SRM1','廖敏慧',4400],['華江分行','SRM2','施雯晴',3400],['華江分行','SRM2','黃柏飛',3400],['華江分行','RM1','曹馨勻',2200],['華江分行','RM1','徐小凡',2200],
  ['新板分行','HRM','楊璧菁',6000],['新板分行','SRM1','朱麗鳳',4400],['新板分行','SRM1','黃淑卿',4400],['新板分行','SRM2','艾祺倫',3400],['新板分行','SRM2','郭淑芬',3400],['新板分行','SRM2','林靜芸',3400],['新板分行','RM1','陳奕憲',2200],['新板分行','RM1','詹忠儒',2200],['新板分行','RM1','周至浩',2200],['新板分行','RM2','王泓權',1000],['新板分行','RM2','盧品豪',1000],
].map(([branch, level, name, fund]) => ({ branch, level, name, fund }));

const insurance = { HRM: 300, SRM1: 250, SRM2: 200, RM1: 150, RM2: 100, JRM: 50 };
const branches = ['板橋分行', '華江分行', '新板分行'];
const levels = ['HRM', 'SRM1', 'SRM2', 'RM1', 'RM2', 'JRM'];
const colors = { HRM:'#cc8b3c', SRM1:'#0e7c66', SRM2:'#4f8c7a', RM1:'#86ad96', RM2:'#c6d7b7', JRM:'#e5b869' };
const labels = { HRM:'資深理財主管', SRM1:'資深理財經理 I', SRM2:'資深理財經理 II', RM1:'理財經理 I', RM2:'理財經理 II', JRM:'初階理財經理' };
let project = 'fund';

const fmt = (number) => number.toLocaleString('zh-TW');
const total = (items) => items.reduce((sum, item) => sum + item.target, 0);
function data() { return advisors.map((advisor) => ({ ...advisor, target: project === 'fund' ? advisor.fund : insurance[advisor.level] })); }
function render() {
  const items = data(); const target = total(items); const label = project === 'fund' ? '第四季基金專案' : '第四季保險佣收'; const targetLabel = project === 'fund' ? '基金專案銷量目標' : '保險佣收目標';
  document.getElementById('project-kicker').textContent = label;
  document.getElementById('project-total-label').textContent = `${targetLabel}合計`;
  document.getElementById('hero-total').textContent = `${(target / 10000).toFixed(2)} 億`;
  document.getElementById('hero-total-detail').textContent = `NT$ ${fmt(target)} 萬`;
  document.getElementById('metrics').innerHTML = `<article class="metric primary"><span>總責任目標</span><strong>${(target / 10000).toFixed(2)}<em> 億</em></strong><p>${label}合計</p></article><article class="metric"><span>納入人員</span><strong>${items.length}<em> 位</em></strong><p>跨 3 家分行、6 個職級</p></article><article class="metric"><span>最高每人目標</span><strong>${fmt(Math.max(...items.map(x => x.target)))}<em> 萬</em></strong><p>依職級責任目標設定</p></article><article class="metric"><span>實績資料</span><strong class="pending">待匯入</strong><p>匯入後將自動計算達成率</p></article>`;
  const summary = branches.map(branch => ({ branch, items: items.filter(x => x.branch === branch) })); const maxBranch = Math.max(...summary.map(x => total(x.items)));
  document.getElementById('branches').innerHTML = summary.map(({ branch, items }) => { const value = total(items); return `<article class="branch"><div><b>${branch.replace('分行','')}</b><small>${items.length} 位人員</small></div><strong>${fmt(value)} <em>萬</em></strong><i><span style="width:${value / maxBranch * 100}%"></span></i><p>${(value / 10000).toFixed(2)} 億責任目標</p></article>`; }).join('');
  document.getElementById('levels').innerHTML = levels.map(level => { const group = items.filter(x => x.level === level); const value = total(group); return `<div class="level"><div><i style="background:${colors[level]}"></i><b>${level}</b><span>${labels[level]}</span></div><progress max="${target}" value="${value}"></progress><small>${group.length} 位</small><strong>${fmt(value)} 萬</strong></div>`; }).join('');
  const selected = document.getElementById('branch-filter').value; const shown = selected === 'all' ? items : items.filter(x => x.branch === selected); document.getElementById('row-count').textContent = `${shown.length} / ${items.length} 筆`;
  document.getElementById('staff-groups').innerHTML = branches.filter(branch => selected === 'all' || branch === selected).map(branch => { const people = shown.filter(x => x.branch === branch); return `<section class="staff-group"><h3>${branch}<span>合計 ${fmt(total(people))} 萬</span></h3><table><thead><tr><th>職級</th><th>理專姓名</th><th>${targetLabel}</th></tr></thead><tbody>${people.map(x => `<tr><td><b style="color:${colors[x.level]}">${x.level}</b></td><td>${x.name}</td><td>${fmt(x.target)} 萬</td></tr>`).join('')}</tbody></table></section>`; }).join('');
}
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => { project = button.dataset.project; document.querySelectorAll('[data-project]').forEach(x => x.classList.toggle('active', x === button)); render(); }));
document.getElementById('branch-filter').addEventListener('change', render);
render();
