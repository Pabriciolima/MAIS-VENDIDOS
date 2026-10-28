const GEO_REGIONS={'Norte':['AC','AP','AM','PA','RO','RR','TO'],'Nordeste':['AL','BA','CE','MA','PB','PE','PI','RN','SE'],'Centro-Oeste':['DF','GO','MT','MS'],'Sudeste':['ES','MG','RJ','SP'],'Sul':['PR','RS','SC']};
const geoStates=new Set(),geoBranches=new Set(),geoOverrides=new Map();let geoCatalog=[];
const geoKey=b=>b.company&&b.revenda?b.company+'|'+b.revenda:b.name;
const geoNormalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const GEO_CITIES={'BELEM':'PA','ANANINDEUA':'PA','SAO LUIS':'MA','BACABAL':'MA','TERESINA':'PI','URUCUI':'PI','MACAPA':'AP','CUIABA':'MT','SINOP':'MT','RONDONOPOLIS':'MT','AGUA BOA':'MT','PORTO VELHO':'RO','JI PARANA':'RO','VILHENA':'RO'};
const GEO_LOCATIONS={"AGUA BOA": {"name": "Água Boa", "uf": "MT", "lat": -14.051, "lon": -52.1601}, "ANANINDEUA": {"name": "Ananindeua", "uf": "PA", "lat": -1.36391, "lon": -48.3743}, "BACABAL": {"name": "Bacabal", "uf": "MA", "lat": -4.22447, "lon": -44.7832}, "BELEM": {"name": "Belém", "uf": "PA", "lat": -1.4554, "lon": -48.4898}, "CUIABA": {"name": "Cuiabá", "uf": "MT", "lat": -15.601, "lon": -56.0974}, "JI PARANA": {"name": "Ji-Paraná", "uf": "RO", "lat": -10.8777, "lon": -61.9322}, "MACAPA": {"name": "Macapá", "uf": "AP", "lat": 0.034934, "lon": -51.0694}, "PORTO VELHO": {"name": "Porto Velho", "uf": "RO", "lat": -8.76077, "lon": -63.8999}, "RONDONOPOLIS": {"name": "Rondonópolis", "uf": "MT", "lat": -16.4673, "lon": -54.6372}, "SAO LUIS": {"name": "São Luís", "uf": "MA", "lat": -2.53874, "lon": -44.2825}, "SINOP": {"name": "Sinop", "uf": "MT", "lat": -11.8604, "lon": -55.5091}, "TERESINA": {"name": "Teresina", "uf": "PI", "lat": -5.09194, "lon": -42.8034}, "URUCUI": {"name": "Uruçuí", "uf": "PI", "lat": -7.23944, "lon": -44.5577}, "VILHENA": {"name": "Vilhena", "uf": "RO", "lat": -12.7502, "lon": -60.1488}};
function geoCity(b){const name=" "+geoNormalize(b.name).replace(/\bS LUIS\b/g,"SAO LUIS")+" ";return Object.keys(GEO_LOCATIONS).find(city=>name.includes(" "+city+" "))}
function geoUF(b){const key=geoKey(b);if(geoOverrides.has(key))return geoOverrides.get(key);const name=' '+geoNormalize(b.name).replace(/\bS LUIS\b/g,'SAO LUIS')+' ';const match=Object.entries(GEO_CITIES).find(([city])=>name.includes(' '+city+' '));if(match)return match[1];const state=BRAZIL_MAP.find(s=>name.includes(' '+geoNormalize(s.name)+' ')||name.includes(' '+s.uf+' '));return state?.uf||''}
function geoMatches(b){return (!geoStates.size||geoStates.has(geoUF(b)))&&(!geoBranches.size||geoBranches.has(geoKey(b)))}
function geoLabel(){const states=geoStates.size?[...geoStates].sort().join(', '):'Todo o Brasil';return states+(geoBranches.size?' · '+geoBranches.size+' filial(is) selecionada(s)':'')}
function geoImport(data){geoBranches.clear();geoCatalog=[...new Map(data.items.flatMap(i=>i.branches).map(b=>[geoKey(b),b])).values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))}
function geoChange(){visible=50;if(state)render();else geoRender()}
function geoToggle(uf){geoStates.has(uf)?geoStates.delete(uf):geoStates.add(uf);geoBranches.clear();geoChange()}
function geoMarkerData(){
 const locations=new Map();
 for(const b of geoCatalog){if(!geoMatches(b))continue;const city=geoCity(b),point=GEO_LOCATIONS[city];if(!point||geoUF(b)!==point.uf)continue;let entry=locations.get(city);if(!entry){entry={...point,branches:[]};locations.set(city,entry)}entry.branches.push(b.name)}
 return [...locations.values()];
}
function geoRenderMarkers(){
 const layer=$('geoMarkers');if(!layer)return;
 const points=geoMarkerData();
 layer.innerHTML=points.map(p=>{const x=(p.lon+74)*13,y=(6-p.lat)*13,label=p.name+' / '+p.uf+' · '+p.branches.join(' / ')+' · Localização da cidade';return '<g class="geo-marker" tabindex="0" role="img" aria-label="'+esc(label)+'" transform="translate('+x+','+y+')"><title>'+esc(label)+'</title><circle class="geo-marker-halo" r="10"/><circle class="geo-marker-dot" r="4.5"/><g class="geo-marker-tip" pointer-events="none"><rect x="-76" y="-33" width="152" height="23" rx="5"/><text x="0" y="-18" text-anchor="middle">'+esc(p.name+' / '+p.uf)+'</text></g></g>'}).join('');
 const missing=geoCatalog.filter(b=>geoMatches(b)&&(!geoCity(b)||geoUF(b)!==GEO_LOCATIONS[geoCity(b)]?.uf)).length;
 $('geoMarkerInfo').textContent=points.length+' cidade(s) no mapa'+(missing?' · '+missing+' filial(is) sem coordenadas reconhecidas':'')+'. Pontos indicam as cidades, não o endereço exato das unidades.';
}
function geoRender(){
 geoRenderMarkers();
 document.querySelectorAll('[data-uf]').forEach(el=>{const active=geoStates.has(el.dataset.uf);el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active))});
 document.querySelectorAll('[data-region]').forEach(el=>el.setAttribute('aria-pressed',String(GEO_REGIONS[el.dataset.region].every(uf=>geoStates.has(uf)))));
 const eligible=geoCatalog.filter(b=>!geoStates.size||geoStates.has(geoUF(b)));const unknown=geoCatalog.filter(b=>!geoUF(b));
 $('geoSummary').textContent=geoLabel()+(state?' · '+eligible.length+' filiais disponíveis':' · Selecione os estados de interesse');
 $('branchChoices').innerHTML=state?'<strong>Filiais disponíveis</strong><p>Sem marcar filiais, todas as disponíveis entram na análise.</p>'+eligible.map(b=>'<label><input type="checkbox" data-branch="'+esc(geoKey(b))+'" '+(geoBranches.has(geoKey(b))?'checked':'')+'><span>'+esc(b.name)+' <small>'+esc(geoUF(b)||'UF não identificada')+'</small></span></label>').join('')+(eligible.length?'':'<p>Nenhuma filial identificada nesses estados.</p>')+(unknown.length?'<details class="geo-unknown"><summary>Associar estado de '+unknown.length+' filial(is) não identificada(s)</summary><p>Essas filiais entram em Todo o Brasil; associe uma UF para incluí-las nos estados.</p>'+unknown.map(b=>'<label>'+esc(b.name)+'<select data-assignment="'+esc(geoKey(b))+'"><option value="">Escolha a UF</option>'+BRAZIL_MAP.map(s=>'<option value="'+s.uf+'">'+s.name+'</option>').join('')+'</select></label>').join('')+'</details>':''):'Importe uma planilha para selecionar as filiais.';
 $('branchChoices').querySelectorAll('[data-branch]').forEach(el=>el.onchange=()=>{el.checked?geoBranches.add(el.dataset.branch):geoBranches.delete(el.dataset.branch);geoChange()});
 $('branchChoices').querySelectorAll('[data-assignment]').forEach(el=>el.onchange=()=>{if(el.value)geoOverrides.set(el.dataset.assignment,el.value);geoBranches.clear();geoChange()});
}
function geoInit(){
 $('brazilMap').innerHTML='<svg viewBox="0 0 560 540" role="group" aria-label="Mapa do Brasil: selecione um ou mais estados">'+BRAZIL_MAP.map(s=>'<path d="'+s.path+'" data-uf="'+s.uf+'" tabindex="0" role="button" aria-label="'+s.name+' ('+s.uf+')" aria-pressed="false"><title>'+s.name+' ('+s.uf+')</title></path>').join('')+'<g id="geoMarkers"></g></svg><p id="geoMarkerInfo" class="geo-marker-info" role="status" aria-live="polite"></p>';
 $('stateButtons').innerHTML=BRAZIL_MAP.slice().sort((a,b)=>a.uf.localeCompare(b.uf)).map(s=>'<button type="button" data-uf="'+s.uf+'" aria-label="'+s.name+'" title="'+s.name+'" aria-pressed="false">'+s.uf+'</button>').join('');
 document.querySelectorAll('[data-uf]').forEach(el=>{el.onclick=()=>geoToggle(el.dataset.uf);if(el.tagName.toLowerCase()==='path')el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();geoToggle(el.dataset.uf)}}});
 $('regionButtons').innerHTML=Object.keys(GEO_REGIONS).map(r=>'<button type="button" data-region="'+r+'" aria-pressed="false">'+r+'</button>').join('');
 document.querySelectorAll('[data-region]').forEach(el=>el.onclick=()=>{const ufs=GEO_REGIONS[el.dataset.region],remove=ufs.every(uf=>geoStates.has(uf));ufs.forEach(uf=>remove?geoStates.delete(uf):geoStates.add(uf));geoBranches.clear();geoChange()});
 $('geoReset').onclick=()=>{geoStates.clear();geoBranches.clear();geoChange()};geoRender();
}
document.addEventListener('DOMContentLoaded',geoInit);
