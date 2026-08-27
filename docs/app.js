import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as XLSX from 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm';

const advisors=[['板橋分行','SRM1','張瓊月',4400],['板橋分行','SRM1','宋婷婷',4400],['板橋分行','SRM1','刁蕙鈺',4400],['板橋分行','SRM1','溫志剛',4400],['板橋分行','SRM1','周韻如',4400],['板橋分行','SRM1','許凱婷',4400],['板橋分行','SRM1','宋柏陞',4400],['板橋分行','SRM1','李宗杰',4400],['板橋分行','SRM1','吳采妍',4400],['板橋分行','SRM2','李承紘',3400],['板橋分行','JRM','洪易佳',600],['華江分行','SRM1','詹采榆',4400],['華江分行','SRM1','廖敏慧',4400],['華江分行','SRM2','施雯晴',3400],['華江分行','SRM2','黃柏飛',3400],['華江分行','RM1','曹馨勻',2200],['華江分行','RM1','徐小凡',2200],['新板分行','HRM','楊璧菁',6000],['新板分行','SRM1','朱麗鳳',4400],['新板分行','SRM1','黃淑卿',4400],['新板分行','SRM2','艾祺倫',3400],['新板分行','SRM2','郭淑芬',3400],['新板分行','SRM2','林靜芸',3400],['新板分行','RM1','陳奕憲',2200],['新板分行','RM1','詹忠儒',2200],['新板分行','RM1','周至浩',2200],['新板分行','RM2','王泓權',1000],['新板分行','RM2','盧品豪',1000]].map(([branch,level,name,fund])=>({branch,level,name,fund}));
const insurance={HRM:300,SRM1:250,SRM2:200,RM1:150,RM2:100,JRM:50};
const branches=['板橋分行','華江分行','新板分行'];
const branchTargetRecordName='__分行季目標__';
const colors={HRM:'#cc8b3c',SRM1:'#0e7c66',SRM2:'#4f8c7a',RM1:'#86ad96',RM2:'#c6d7b7',JRM:'#e5b869'};
const config=window.SUPABASE_CONFIG||{};
const isConfigured=Boolean(config.url&&config.anonKey&&config.url.startsWith('https://'));
const hasManagerUploadAccount=Boolean(config.uploadAccountEmail&&String(config.uploadAccountEmail).includes('@'));
const supabase=isConfigured?createClient(config.url,config.anonKey):null;
let performance={};
let branchTargets={};
let currentUser=null;
let canWrite=false;

const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('zh-TW');
const fmtWhole=value=>{
  const number=Number(String(value??'').replace(/,/g,''));
  return Number.isFinite(number)?Math.round(number).toLocaleString('zh-TW',{maximumFractionDigits:0}):String(value??'—');
};
const key=(branch,name)=>`${branch}-${name}`;
const total=(items,field)=>items.reduce((sum,item)=>sum+(field==='fund'?item.fund:insurance[item.level]),0);
const hasValue=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
const progressTotal=(branch,field)=>advisors.filter(item=>item.branch===branch).reduce((sum,item)=>sum+asNumber(performance[key(item.branch,item.name)]?.[field]),0);
const defaultBranchTarget=(branch,field)=>field==='quarterTarget'?progressTotal(branch,'quarterTarget'):total(advisors.filter(item=>item.branch===branch),field==='fundTarget'?'fund':'insurance');
const branchTarget=(branch,field)=>hasValue(branchTargets[branch]?.[field])?asNumber(branchTargets[branch][field]):defaultBranchTarget(branch,field);
const branchRate=(progress,target)=>target>0?`${(progress/target*100).toFixed(2)}%`:'—';
const money=value=>`${fmtWhole(value)} 萬`;
const moneyPrecise=value=>`${formatAmount(asNumber(value))} 萬`;
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' })[char]);
const setMessage=(message,tone='')=>{const node=$('data-message');node.textContent=message;node.className=`data-message ${tone}`;};
const setSource=(message,tone='')=>{const node=$('source');node.textContent=message;node.className=`source ${tone}`;};

function render(){
  const fundTotal=total(advisors,'fund');
  const insuranceTotal=total(advisors,'insurance');
  const loaded=Object.keys(performance).length;
  $('metrics').innerHTML=`<article class="metric primary"><span>基金目標</span><strong>${(fundTotal/10000).toFixed(2)}<em> 億</em></strong><p>第四季專案基金</p></article><article class="metric"><span>保險佣收目標</span><strong>${fmt(insuranceTotal)}<em> 萬</em></strong><p>第四季專案保險</p></article><article class="metric"><span>納入人員</span><strong>${advisors.length}<em> 位</em></strong><p>跨 3 家分行、6 個職級</p></article><article class="metric"><span>雲端實績</span><strong>${loaded}<em> 筆</em></strong><p>${currentUser?'已由 Supabase 同步':'登入後讀取'}</p></article>`;
  $('branches').innerHTML=branches.map(branch=>{const people=advisors.filter(item=>item.branch===branch);return`<article class="branch"><div><b>${esc(branch.replace('分行',''))}</b><small>${people.length} 位人員</small></div><strong>${fmt(total(people,'fund'))} <em>萬</em></strong><p>基金目標</p><aside><span>保險佣收目標</span><b>${fmt(total(people,'insurance'))} 萬</b></aside></article>`}).join('');
  $('branch-performance').innerHTML=branches.map(branch=>{const quarterTarget=branchTarget(branch,'quarterTarget');const quarterProgress=progressTotal(branch,'quarterProgress');const fundTarget=branchTarget(branch,'fundTarget');const fundProgress=progressTotal(branch,'fundProgress');const insuranceTarget=branchTarget(branch,'insuranceTarget');const insuranceProgress=progressTotal(branch,'insuranceProgress');return`<tr><td class="name">${esc(branch)}</td><td>${fmtWhole(quarterTarget)}</td><td>${fmtWhole(quarterProgress)}</td><td class="rate">${branchRate(quarterProgress,quarterTarget)}</td><td>${money(fundTarget)}</td><td>${money(fundProgress)}</td><td class="rate">${branchRate(fundProgress,fundTarget)}</td><td>${money(insuranceTarget)}</td><td>${moneyPrecise(insuranceProgress)}</td><td class="rate">${branchRate(insuranceProgress,insuranceTarget)}</td></tr>`}).join('');
  $('branch-target-panel').hidden=!canWrite;
  $('branch-targets').innerHTML=branches.map(branch=>`<tr><td class="name">${esc(branch)}</td><td><input data-branch-target="quarterTarget" data-branch="${esc(branch)}" inputmode="decimal" value="${esc(branchTarget(branch,'quarterTarget'))}" aria-label="${esc(branch)}季責任額"></td><td><input data-branch-target="fundTarget" data-branch="${esc(branch)}" inputmode="decimal" value="${esc(branchTarget(branch,'fundTarget'))}" aria-label="${esc(branch)}基金目標"></td><td><input data-branch-target="insuranceTarget" data-branch="${esc(branch)}" inputmode="decimal" value="${esc(branchTarget(branch,'insuranceTarget'))}" aria-label="${esc(branch)}保險目標"></td></tr>`).join('');
  $('save-branch-targets').disabled=!canWrite;
  const selected=$('branch-filter').value;
  const name=$('name-filter').value.trim();
  const shown=advisors.filter(item=>(selected==='all'||item.branch===selected)&&item.name.includes(name));
  $('row-count').textContent=`${shown.length} / ${advisors.length} 筆`;
  $('staff').innerHTML=shown.map(item=>{const actual=performance[key(item.branch,item.name)]||{};return`<tr><td>${esc(item.branch)}</td><td><b class="level" style="color:${colors[item.level]}">${esc(item.level)}</b></td><td class="name">${esc(item.name)}</td><td>${esc(actual.quarterTarget||'—')}</td><td>${esc(actual.quarterProgress?fmtWhole(actual.quarterProgress):'—')}</td><td>${esc(actual.quarterRate||'—')}</td><td class="target">${fmt(item.fund)} 萬</td><td>${esc(actual.fundProgress?`${fmtWhole(actual.fundProgress)} 萬`:'—')}</td><td class="target">${fmt(insurance[item.level])} 萬</td><td>${esc(actual.insuranceProgress?moneyPrecise(actual.insuranceProgress):'—')}</td></tr>`}).join('');
}

function setControls(enabled){$('sync-button').disabled=!enabled;$('csv-file').disabled=!enabled;$('raw-file').disabled=!enabled;$('pas-file').disabled=!enabled;$('save-branch-targets').disabled=!enabled;$('csv-button').classList.toggle('is-disabled',!enabled);$('raw-file-button').classList.toggle('is-disabled',!enabled);$('pas-file-button').classList.toggle('is-disabled',!enabled);}
function recordMap(records){return Object.fromEntries(records.map(item=>[key(item.branch,item.advisor_name),{quarterTarget:item.quarter_target,quarterProgress:item.quarter_progress,quarterRate:item.quarter_rate,fundProgress:item.fund_progress,insuranceProgress:item.insurance_progress,sourceDate:item.source_date||''}]));}
function branchTargetMap(records){return Object.fromEntries(records.map(item=>[item.branch,{quarterTarget:item.quarter_target,fundTarget:item.fund_progress,insuranceTarget:item.insurance_progress}]));}

async function loadPerformance(){
  if(!supabase||!currentUser)return;
  setMessage('正在同步雲端實績資料…');
  const {data,error}=await supabase.from('performance_records').select('branch, advisor_name, quarter_target, quarter_progress, quarter_rate, fund_progress, insurance_progress, source_date').order('branch').order('advisor_name');
  if(error){setMessage(`無法讀取資料：${error.message}`,'error');return;}
  const allRecords=data||[];
  const targetRecords=allRecords.filter(item=>item.advisor_name===branchTargetRecordName);
  const advisorRecords=allRecords.filter(item=>item.advisor_name!==branchTargetRecordName);
  performance=recordMap(advisorRecords);
  branchTargets=branchTargetMap(targetRecords);
  const sourceDates=[...new Set(advisorRecords.map(item=>item.source_date).filter(Boolean))];
  setMessage(`已同步 ${advisorRecords.length} 筆雲端實績資料。${sourceDates.length?`季職達資料：${sourceDates.join('、')}`:''}`,'success');
  render();
}

async function checkRole(){const {data,error}=await supabase.rpc('my_performance_role');if(error){setMessage(`無法驗證權限：${error.message}`,'error');return null;}return data;}

async function applySession(session){
  currentUser=session?.user||null;performance={};branchTargets={};canWrite=false;
  $('login-panel').hidden=Boolean(currentUser);$('auth-button').hidden=Boolean(currentUser);$('signout-button').hidden=!currentUser;
  if(!currentUser){setControls(false);setSource('● 尚未登入');setMessage('登入後可讀取實績資料。');render();return;}
  const role=await checkRole();
  if(!role){setControls(false);setSource(`● ${currentUser.email} · 未授權`,'error');setMessage('此帳號尚未被管理者授權查看績效資料。','error');render();return;}
  canWrite=['admin','editor'].includes(role);setControls(canWrite);setSource(`● ${currentUser.email} · ${role==='viewer'?'唯讀':'已登入'}`,'success');await loadPerformance();
}

function parseCsvRows(text){
  const rows=[];let row=[];let cell='';let quoted=false;
  for(let index=0;index<text.length;index+=1){const char=text[index];const next=text[index+1];if(char==='"'&&quoted&&next==='"'){cell+='"';index+=1;}else if(char==='"'){quoted=!quoted;}else if(char===','&&!quoted){row.push(cell);cell='';}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&next==='\n')index+=1;row.push(cell);if(row.some(value=>value.trim()))rows.push(row);row=[];cell='';}else{cell+=char;}}
  row.push(cell);if(row.some(value=>value.trim()))rows.push(row);return rows;
}

function normalizeHeader(value){return String(value??'').replace(/^\uFEFF/,'').replace(/[（）]/g,char=>char==='（'?'(':')').replace(/\s/g,'').trim();}
function normalizeAdvisorName(value){return String(value??'').replace(/\s/g,'').trim();}

function recordsFromRows(rows){
  const [headerRow,...dataRows]=rows;
  if(!headerRow)throw new Error('找不到欄位標題。');
  const index=Object.fromEntries(headerRow.map((name,position)=>[normalizeHeader(name),position]));
  const required=['分行','理專姓名','季責任額','季進度(含在途)','季達成率','基金進度','保險進度'];
  if(required.some(name=>index[name]===undefined))throw new Error('檔案欄位不完整，請使用頁面提示的欄位名稱。');
  return dataRows.map(row=>({branch:String(row[index['分行']]??'').trim(),advisor_name:String(row[index['理專姓名']]??'').trim(),quarter_target:String(row[index['季責任額']]??'').trim(),quarter_progress:String(row[index['季進度(含在途)']]??'').trim(),quarter_rate:String(row[index['季達成率']]??'').trim(),fund_progress:String(row[index['基金進度']]??'').trim(),insurance_progress:String(row[index['保險進度']]??'').trim()})).filter(row=>row.branch&&row.advisor_name);
}

async function parsePerformanceFile(file){
  const extension=file.name.split('.').pop()?.toLowerCase();
  if(extension==='csv')return recordsFromRows(parseCsvRows(await file.text()));
  if(extension==='xlsx'){
    const workbook=XLSX.read(await file.arrayBuffer(),{type:'array'});
    const sheetName=workbook.SheetNames[0];
    if(!sheetName)throw new Error('Excel 檔沒有工作表。');
    return recordsFromRows(XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{header:1,defval:'',raw:false}));
  }
  throw new Error('僅支援 .xlsx 與 .csv 檔案。');
}

function asNumber(value){
  const number=typeof value==='number'?value:Number(String(value??'').replace(/,/g,''));
  return Number.isFinite(number)?number:0;
}

function formatAmount(value){return new Intl.NumberFormat('zh-TW',{maximumFractionDigits:2}).format(Math.round((value+Number.EPSILON)*100)/100);}
function formatRate(progress,target){return target>0?`${(progress/target*100).toFixed(2)}%`:'—';}

async function parsePasFundFile(file){
  const extension=file.name.split('.').pop()?.toLowerCase();
  if(!['html','htm'].includes(extension))throw new Error('PAS 基金報表僅支援 .html 或 .htm。');
  const document=new DOMParser().parseFromString(await file.text(),'text/html');
  const table=document.querySelector('#previewTable');
  if(!table)throw new Error('找不到 PAS 報表資料表。');
  const headers=[...table.querySelectorAll('thead th')].map(cell=>normalizeHeader(cell.textContent));
  const nameIndex=headers.indexOf('理專名稱');
  const levelIndex=headers.indexOf('職級');
  const excludedIndex=headers.findIndex(header=>header==='主軸基金(排除專案基金)');
  if(nameIndex<0||levelIndex<0||excludedIndex<0)throw new Error('找不到「理專名稱」或「主軸基金(排除專案基金)」欄位。');
  const fundIndexes=headers.map((header,index)=>index).filter(index=>index>levelIndex&&index!==excludedIndex&&!headers[index].includes('合計'));
  if(!fundIndexes.length)throw new Error('找不到可加總的其他基金欄位。');
  // 基金報表一律以姓名比對，不採用來源檔的分行欄位。
  const advisorByName=new Map(advisors.map(advisor=>[normalizeAdvisorName(advisor.name),advisor]));
  const records=[];
  for(const row of table.querySelectorAll('tbody tr')){
    const cells=[...row.querySelectorAll('td')];
    const name=normalizeAdvisorName(cells[nameIndex]?.textContent);
    const advisor=advisorByName.get(name);
    if(!advisor)continue;
    const totalFund=fundIndexes.reduce((sum,index)=>sum+asNumber(cells[index]?.textContent),0);
    const current=performance[key(advisor.branch,advisor.name)]||{};
    records.push({branch:advisor.branch,advisor_name:advisor.name,quarter_target:current.quarterTarget||'',quarter_progress:current.quarterProgress||'',quarter_rate:current.quarterRate||'',fund_progress:formatAmount(totalFund/10000),insurance_progress:current.insuranceProgress||'',source_date:current.sourceDate||''});
  }
  if(!records.length)throw new Error('找不到可與目前名單比對的理專姓名。');
  return records;
}

async function parseQuarterRawFile(file){
  if(file.name.split('.').pop()?.toLowerCase()!=='xlsx')throw new Error('季職達原始檔僅支援 .xlsx。');
  const workbook=XLSX.read(await file.arrayBuffer(),{type:'array'});
  const sheetName=workbook.SheetNames[0];
  if(!sheetName)throw new Error('Excel 檔沒有工作表。');
  const worksheet=workbook.Sheets[sheetName];
  const rows=XLSX.utils.sheet_to_json(worksheet,{header:1,defval:'',raw:true});
  const sourceDate=String(worksheet.A3?.v??'').trim();
  if(!sourceDate)throw new Error('找不到 A3 的資料日期。');
  // 季職達原始檔也僅以姓名比對，不採用來源檔的分行欄位。
  const advisorByName=new Map(advisors.map(advisor=>[normalizeAdvisorName(advisor.name),advisor]));
  const records=[];
  for(const row of rows){
    const advisor=advisorByName.get(normalizeAdvisorName(row[5]));
    if(!advisor)continue;
    const quarterTarget=asNumber(row[9])*3;
    const quarterProgress=asNumber(row[59])+asNumber(row[39])+asNumber(row[40]);
    const insuranceProgress=asNumber(row[40])+asNumber(row[56]);
    const current=performance[key(advisor.branch,advisor.name)]||{};
    records.push({branch:advisor.branch,advisor_name:advisor.name,quarter_target:formatAmount(quarterTarget),quarter_progress:formatAmount(quarterProgress),quarter_rate:formatRate(quarterProgress,quarterTarget),fund_progress:current.fundProgress||'',insurance_progress:formatAmount(insuranceProgress/10000),source_date:sourceDate});
  }
  const missing=advisors.filter(advisor=>!records.some(record=>record.advisor_name===advisor.name));
  if(missing.length)throw new Error(`原始檔缺少 ${missing.length} 位人員：${missing.map(item=>item.name).join('、')}`);
  return {sourceDate,records};
}

async function uploadPerformanceFile(file){
  if(!supabase||!currentUser||!canWrite)return;
  try{
    const records=await parsePerformanceFile(file);
    const permitted=new Set(advisors.map(item=>key(item.branch,item.name)));
    const invalid=records.filter(item=>!permitted.has(key(item.branch,item.advisor_name)));
    if(invalid.length)throw new Error(`CSV 有 ${invalid.length} 筆不在既有人員名單中的資料。`);
    if(!records.length)throw new Error('找不到可上傳的績效資料。');
    setMessage(`正在寫入 ${records.length} 筆雲端實績資料…`);
    const recordsWithSourceDate=records.map(record=>({...record,source_date:performance[key(record.branch,record.advisor_name)]?.sourceDate||''}));
    const {error}=await supabase.from('performance_records').upsert(recordsWithSourceDate,{onConflict:'branch,advisor_name'});
    if(error)throw error;
    await loadPerformance();
  }catch(error){setMessage(`上傳失敗：${error.message||'請確認 Excel 或 CSV 格式。'}`,'error');}
  $('csv-file').value='';
}

async function uploadQuarterRawFile(file){
  if(!supabase||!currentUser||!canWrite)return;
  try{
    setMessage('正在讀取季職達原始檔…');
    const {sourceDate,records}=await parseQuarterRawFile(file);
    setMessage(`正在以 ${sourceDate} 更新 ${records.length} 位人員的季職達資料…`);
    const {error}=await supabase.from('performance_records').upsert(records,{onConflict:'branch,advisor_name'});
    if(error)throw error;
    await loadPerformance();
  }catch(error){setMessage(`季職達原始檔上傳失敗：${error.message||'請確認 Excel 格式。'}`,'error');}
  $('raw-file').value='';
}

async function uploadPasFundFile(file){
  if(!supabase||!currentUser||!canWrite)return;
  try{
    setMessage('正在讀取 PAS 基金報表…');
    const records=await parsePasFundFile(file);
    setMessage(`正在更新 ${records.length} 位人員的基金進度…`);
    const {error}=await supabase.from('performance_records').upsert(records,{onConflict:'branch,advisor_name'});
    if(error)throw error;
    await loadPerformance();
    setMessage(`已更新 ${records.length} 位人員的基金進度；金額已排除「主軸基金(排除專案基金)」欄位與合計銷量，單位為萬元。`,'success');
  }catch(error){setMessage(`PAS 基金報表上傳失敗：${error.message||'請確認 HTML 報表格式。'}`,'error');}
  $('pas-file').value='';
}

async function saveBranchTargets(){
  if(!supabase||!currentUser||!canWrite)return;
  try{
    const records=branches.map(branch=>{
      const value=field=>asNumber(document.querySelector(`[data-branch="${branch}"][data-branch-target="${field}"]`)?.value);
      return {branch,advisor_name:branchTargetRecordName,quarter_target:String(value('quarterTarget')),quarter_progress:'',quarter_rate:'',fund_progress:String(value('fundTarget')),insurance_progress:String(value('insuranceTarget')),source_date:''};
    });
    setMessage('正在儲存各分行季目標…');
    const {error}=await supabase.from('performance_records').upsert(records,{onConflict:'branch,advisor_name'});
    if(error)throw error;
    await loadPerformance();
    setMessage('已儲存各分行季責任額、基金目標與保險目標。','success');
  }catch(error){setMessage(`分行目標儲存失敗：${error.message||'請確認輸入數字。'}`,'error');}
}

async function signIn(event){
  event.preventDefault();
  await signInWithPassword($('email').value.trim(),$('password').value,$('login-message'));
}

async function signInWithPassword(email,password,messageNode){
  if(!email||!password){messageNode.textContent='請輸入帳號與密碼。';return;}
  messageNode.textContent='正在驗證…';
  const {data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error){messageNode.textContent=`登入失敗：${error.message}`;return;}
  messageNode.textContent='';await applySession(data.session);
}

async function signInWithManagerPassword(event){
  event.preventDefault();
  await signInWithPassword(String(config.uploadAccountEmail),$('manager-password').value,$('manager-login-message'));
}

async function init(){
  render();
  $('branch-filter').addEventListener('change',render);$('name-filter').addEventListener('input',render);$('sync-button').addEventListener('click',loadPerformance);$('save-branch-targets').addEventListener('click',()=>void saveBranchTargets());$('raw-file').addEventListener('change',event=>{const [file]=event.target.files;if(file)void uploadQuarterRawFile(file);});$('pas-file').addEventListener('change',event=>{const [file]=event.target.files;if(file)void uploadPasFundFile(file);});$('csv-file').addEventListener('change',event=>{const [file]=event.target.files;if(file)void uploadPerformanceFile(file);});
  if(!isConfigured){$('setup-panel').hidden=false;$('login-panel').hidden=true;$('auth-button').disabled=true;$('auth-button').textContent='尚未設定 Supabase';setSource('● 等待 Supabase 連線設定');setMessage('尚未連接雲端資料庫。');return;}
  $('manager-login-form').hidden=!hasManagerUploadAccount;
  $('auth-button').addEventListener('click',()=>{$('login-panel').hidden=false;(hasManagerUploadAccount?$('manager-password'):$('email')).focus();});$('login-form').addEventListener('submit',event=>void signIn(event));$('manager-login-form').addEventListener('submit',event=>void signInWithManagerPassword(event));$('signout-button').addEventListener('click',async()=>{await supabase.auth.signOut();await applySession(null);});
  supabase.auth.onAuthStateChange((_event,session)=>{void applySession(session);});
  const {data:{session}}=await supabase.auth.getSession();await applySession(session);
}
void init();
