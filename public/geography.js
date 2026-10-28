const GEO_REGIONS={'Norte':['AC','AP','AM','PA','RO','RR','TO'],'Nordeste':['AL','BA','CE','MA','PB','PE','PI','RN','SE'],'Centro-Oeste':['DF','GO','MT','MS'],'Sudeste':['ES','MG','RJ','SP'],'Sul':['PR','RS','SC']};
const geoStates=new Set(),geoBranches=new Set(),geoOverrides=new Map();let geoCatalog=[];
const geoKey=b=>b.company&&b.revenda?b.company+'|'+b.revenda:b.name;
const geoNormalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const GEO_CITIES={'BELEM':'PA','ANANINDEUA':'PA','SAO LUIS':'MA','BACABAL':'MA','TERESINA':'PI','URUCUI':'PI','MACAPA':'AP','CUIABA':'MT','SINOP':'MT','RONDONOPOLIS':'MT','AGUA BOA':'MT','PORTO VELHO':'RO','JI PARANA':'RO','VILHENA':'RO'};
function geoUF(b){const key=geoKey(b);if(geoOverrides.has(key))return geoOverrides.get(key);const name=' '+geoNormalize(b.name)+' ';const match=Object.entries(GEO_CITIES).find(([city])=>name.includes(' '+city+' '));if(match)return match[1];const state=BRAZIL_MAP.find(s=>name.includes(' '+geoNormalize(s.name)+' ')||name.includes(' '+s.uf+' '));return state?.uf||''}
function geoMatches(b){return (!geoStates.size||geoStates.has(geoUF(b)))&&(!geoBranches.size||geoBranches.has(geoKey(b)))}
function geoLabel(){const states=geoStates.size?[...geoStates].sort().join(', '):'Todo o Brasil';return states+(geoBranches.size?' · '+geoBranches.size+' filial(is) selecionada(s)':'')}
function geoImport(data){geoBranches.clear();geoCatalog=[...new Map(data.items.flatMap(i=>i.branches).map(b=>[geoKey(b),b])).values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))}
function geoChange(){visible=50;if(state)render();else geoRender()}
function geoToggle(uf){geoStates.has(uf)?geoStates.delete(uf):geoStates.add(uf);geoBranches.clear();geoChange()}
function geoRender(){
 document.querySelectorAll('[data-uf]').forEach(el=>{const active=geoStates.has(el.dataset.uf);el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active))});
 document.querySelectorAll('[data-region]').forEach(el=>el.setAttribute('aria-pressed',String(GEO_REGIONS[el.dataset.region].every(uf=>geoStates.has(uf)))));
 const eligible=geoCatalog.filter(b=>!geoStates.size||geoStates.has(geoUF(b)));const unknown=geoCatalog.filter(b=>!geoUF(b));
 $('geoSummary').textContent=geoLabel()+(state?' · '+eligible.length+' filiais disponíveis':' · Selecione os estados de interesse');
 $('branchChoices').innerHTML=state?'<strong>Filiais disponíveis</strong><p>Sem marcar filiais, todas as disponíveis entram na análise.</p>'+eligible.map(b=>'<label><input type="checkbox" data-branch="'+esc(geoKey(b))+'" '+(geoBranches.has(geoKey(b))?'checked':'')+'><span>'+esc(b.name)+' <small>'+esc(geoUF(b)||'UF não identificada')+'</small></span></label>').join('')+(eligible.length?'':'<p>Nenhuma filial identificada nesses estados.</p>')+(unknown.length?'<details class="geo-unknown"><summary>Associar estado de '+unknown.length+' filial(is) não identificada(s)</summary><p>Essas filiais entram em Todo o Brasil; associe uma UF para incluí-las nos estados.</p>'+unknown.map(b=>'<label>'+esc(b.name)+'<select data-assignment="'+esc(geoKey(b))+'"><option value="">Escolha a UF</option>'+BRAZIL_MAP.map(s=>'<option value="'+s.uf+'">'+s.name+'</option>').join('')+'</select></label>').join('')+'</details>':''):'Importe uma planilha para selecionar as filiais.';
 $('branchChoices').querySelectorAll('[data-branch]').forEach(el=>el.onchange=()=>{el.checked?geoBranches.add(el.dataset.branch):geoBranches.delete(el.dataset.branch);geoChange()});
 $('branchChoices').querySelectorAll('[data-assignment]').forEach(el=>el.onchange=()=>{if(el.value)geoOverrides.set(el.dataset.assignment,el.value);geoBranches.clear();geoChange()});
}
function geoInit(){
 $('brazilMap').innerHTML='<svg viewBox="0 0 560 540" role="group" aria-label="Mapa do Brasil: selecione um ou mais estados">'+BRAZIL_MAP.map(s=>'<path d="'+s.path+'" data-uf="'+s.uf+'" tabindex="0" role="button" aria-label="'+s.name+' ('+s.uf+')" aria-pressed="false"><title>'+s.name+' ('+s.uf+')</title></path>').join('')+'</svg>';
 $('stateButtons').innerHTML=BRAZIL_MAP.slice().sort((a,b)=>a.uf.localeCompare(b.uf)).map(s=>'<button type="button" data-uf="'+s.uf+'" aria-label="'+s.name+'" title="'+s.name+'" aria-pressed="false">'+s.uf+'</button>').join('');
 document.querySelectorAll('[data-uf]').forEach(el=>{el.onclick=()=>geoToggle(el.dataset.uf);if(el.tagName.toLowerCase()==='path')el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();geoToggle(el.dataset.uf)}}});
 $('regionButtons').innerHTML=Object.keys(GEO_REGIONS).map(r=>'<button type="button" data-region="'+r+'" aria-pressed="false">'+r+'</button>').join('');
 document.querySelectorAll('[data-region]').forEach(el=>el.onclick=()=>{const ufs=GEO_REGIONS[el.dataset.region],remove=ufs.every(uf=>geoStates.has(uf));ufs.forEach(uf=>remove?geoStates.delete(uf):geoStates.add(uf));geoBranches.clear();geoChange()});
 $('geoReset').onclick=()=>{geoStates.clear();geoBranches.clear();geoChange()};geoRender();
}
document.addEventListener('DOMContentLoaded',geoInit);
