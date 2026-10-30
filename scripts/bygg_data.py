"""Bygger src/lib/mobil/operatorer-data.ts ur researchfilerna."""
import json, re, subprocess
import os
ROT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R=os.path.join(ROT,'research')+'/'
d={}
for f in ['operatorer-stora.json','operatorer-mvno.json']:
    for o in json.load(open(R+f))['operatorer']: d[o['slug']]=o
foretag=json.load(open(R+'foretag.json'))

# Kompletteringar (kontrollerade på operatörernas egna sidor). En komplettering
# ersätter operatörens abonnemang helt och fyller i fält som saknades.
for fil in ['komplettering-a.json','komplettering-b.json']:
    if not os.path.exists(R+fil): continue
    for k in json.load(open(R+fil))['operatorer']:
        bas=d.setdefault(k['slug'],{'slug':k['slug'],'namn':k.get('namn',k['slug']),'abonnemang':[]})
        if k.get('abonnemang'): bas['abonnemang']=k['abonnemang']
        for falt,v in k.items():
            if falt in ('abonnemang','slug','noteringar'): continue
            if falt in ('kallor','osakert'):
                bas[falt]=list(dict.fromkeys((bas.get(falt) or [])+(v or [])))
            elif falt=='villkor':
                bas['villkor']={**(bas.get('villkor') or {}),**{a:b for a,b in (v or {}).items() if b}}
            elif v not in (None,'',[],{}):
                bas[falt]=v

def ren(t):
    if t is None: return None
    t=re.sub(r'\s*\[KONTROLLERA[^\]]*\]','',t)
    t=re.sub(r'^KAMPANJ( t\.o\.m\. [^:]+)?:\s*','',t)
    return t.strip() or None

NAT={'telia':'telia','tele2':'tele2','telenor':'telenor','tre':'tre','halebop':'telia','comviq':'tele2','vimla':'telenor','hallon':'tre','fello':'telia','chilimobil':'tre','lycamobile':'telenor','mybeat':'telenor','tellus':'tele2','fibio':'telenor','katshing':'tre','lingon':'tele2'}
GRUPP={'telia':'natagare','tele2':'natagare','telenor':'natagare','tre':'natagare','halebop':'varumarke','comviq':'varumarke','vimla':'varumarke','hallon':'varumarke','fello':'varumarke'}
NAMN={'tre':'Tre','lycamobile':'Lyca Mobile','mybeat':'My Beat','tellus':'Tellus Mobil','lingon':'Lingon Mobil'}
AGARE={'chilimobil':'Chilimobil Sweden AB','mybeat':'My Beat AB','tellus':'Tell Us Mobil AB','fibio':'Fibio Nordic AB','katshing':'Uppgift saknas','lingon':'Berry Telekom AB enligt sajtens sidfot','lycamobile':'Lyca Mobile (Lyca Group)','tre':'Hi3G Access AB','telia':'Telia Company','tele2':'Tele2','telenor':'Telenor','comviq':'Tele2','hallon':'Hi3G Access AB (Tre)','fello':'Telia Sverige AB','halebop':'Telia Company','vimla':'Telenor'}
WEBB={'telia':'https://www.telia.se/mobilabonnemang','tele2':'https://www.tele2.se/mobilabonnemang','telenor':'https://www.telenor.se/handla/mobilabonnemang/','tre':'https://www.tre.se/mobilabonnemang','halebop':'https://www.halebop.se/','comviq':'https://www.comviq.se/mobilabonnemang','vimla':'https://vimla.se/','hallon':'https://www.hallon.se/mobilabonnemang','fello':'https://www.fello.se/','chilimobil':'https://www.chilimobil.se/','lycamobile':'https://www.lycamobile.se/','mybeat':'https://www.mybeat.se/','tellus':'https://www.tellusmobil.se/','fibio':'https://www.fibio.se/','katshing':'https://www.katshing.se/','lingon':'https://www.lingonmobil.se/'}
HOPPA_OVER=set(['a3-bredband2'])
PREFIX={'tellus':['Tellus Mobil','Tellus'],'lycamobile':['Lyca'],'chilimobil':['Chilimobil'],'telia':['Telia'],'comviq':['Comviq Mobilabonnemang','Comviq'],'hallon':['Hallon'],'lingon':['Lingon Mobil'],'vimla':['Vimla'],'fello':['Fello'],'telenor':['Telenor'],'halebop':['Halebop']}
UTAN_JAMFORELSE={'halebop'}  # läggs ned 2026

def num(x):
    try: return None if x is None else float(x)
    except: return None

def plan_id(slug,namn):
    s=namn.lower().replace('å','a').replace('ä','a').replace('ö','o')
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
    return f'{slug}-{s}'[:70]

def malgrupp(namn,ovrigt):
    t=(namn+' '+(ovrigt or '')).lower(); m=[]
    if 'student' in t: m+=['student','ung']
    if 'ungdom' in t or 'under 18' in t or 'under 26' in t: m+=['ung']
    if 'under 18' in t: m+=['barn']
    if 'senior' in t or '55' in namn or '65+' in t or '55+' in t: m+=['senior']
    if 'barn' in t: m+=['barn']
    if 'familj' in t: m+=['familj']
    return sorted(set(m)) or None

plans=[]; ops=[]
for slug,o in d.items():
    if slug in HOPPA_OVER: continue
    ops.append(slug)
    if slug in UTAN_JAMFORELSE: continue
    for a in o['abonnemang']:
        if a.get('pris') is None: continue
        n=a['namn']
        nl=n.lower()
        if 'extra' in nl or 'per extra' in nl or 'familj' in nl and 'medlem' in nl: continue
        if 'week' in nl: continue
        if slug=='lycamobile' and 'endast data' in nl: continue
        if slug=='chilimobil' and ('duo' in nl or 'viaplay' in nl): continue
        if slug=='katshing' and 'familj' in nl: continue
        gb=None if a.get('obegransad') else num(a.get('gb'))
        if gb is None and not a.get('obegransad'): continue
        km=a.get('kampanjMan'); kp=a.get('kampanjpris')
        if kp is None or not km: kp=None; km=None
        rent=re.sub(r'\s*\[KONTROLLERA\]','',n).strip()
        for prefix in PREFIX.get(slug,[])+[NAMN.get(slug,o['namn'])]:
            if rent.startswith(prefix+' '): rent=rent[len(prefix)+1:]; break
        rent=re.sub(r'^Mobilabonnemang ','',rent).replace('Studentabonnemang','Student')
        p=dict(id=plan_id(slug,n),operator=slug,namn=rent,
            kundtyp='privat',gb=gb,pris=a['pris'],kampanjpris=kp,kampanjManader=km,kampanjText=ren(a.get('kampanjText')),
            bindning=None if re.search(r'[Bb]indning( ej angiven)?\s*\[KONTROLLERA',a.get('ovrigt') or '') else a.get('bindning'),euGb=num(a.get('euGb')),friaSamtal=True,femg=bool(o.get('femg')),
            hastighet=ren(a.get('hastighet')),notis=ren(a.get('ovrigt')),kalla=a.get('kalla') or WEBB.get(slug),
            malgrupp=malgrupp(n,a.get('ovrigt')),kontantkort=(slug=='lycamobile'))
        plans.append(p)

def ts(v):
    return json.dumps(v,ensure_ascii=False)

# Företagsabonnemang
fplans=[]; fops={}
for fo in foretag['operatorer']:
    fops[fo['slug']]=fo
    base=fo['slug'].replace('-foretag','')
    for a in fo['abonnemang']:
        if a.get('pris') is None: continue
        fplans.append(dict(id=plan_id(fo['slug'],a['namn']),operator=base if base in d else fo['slug'],namn=a['namn'],kundtyp='foretag',
            gb=None if a.get('obegransad') else num(a.get('gb')),pris=a['pris'],kampanjpris=None,kampanjManader=None,kampanjText=None,
            bindning=a.get('bindning'),euGb=num(a.get('euGb')),friaSamtal=True,femg=True,hastighet=None,notis=ren(a.get('ovrigt')),
            kalla=a.get('kalla'),malgrupp=None,kontantkort=False,_moms=fo.get('prisinfo')))
print(len(plans),'privata', len(fplans),'företag')

# ---------------- Företag: handplockat ur foretag.json ----------------
F=[
 # operator, namn, gb, pris(ord), kampanjpris, kampanjMan, bindning, euGb, moms, notis, kalla
 ('telia','Företag Obegränsad Max',None,699,None,None,None,None,'okand','Telia anger ett kampanjpris på 499 kr/mån utan att kampanjens längd framgår. Smart Connect-växel och ett extra datasim ingår. Upp till 1 500 Mbit/s.','https://www.telia.se/foretag/mobilt/mobilabonnemang'),
 ('telia','Företag Obegränsad Premium',None,599,None,None,None,None,'okand','Kampanjpris 399 kr/mån enligt Telia, längd framgår inte. Ett extra datasim ingår. Upp till 1 500 Mbit/s.','https://www.telia.se/foretag/mobilt/mobilabonnemang'),
 ('telia','Företag Obegränsad',None,499,None,None,None,None,'okand','Kampanjpris 349 kr/mån enligt Telia, längd framgår inte. Upp till 300 Mbit/s.','https://www.telia.se/foretag/mobilt/mobilabonnemang'),
 ('telia','Företag 10 GB',10,349,None,None,None,None,'okand','Upp till 100 Mbit/s.','https://www.telia.se/foretag/mobilt/mobilabonnemang'),
 ('tele2','Företag 60 GB',60,399,269,24,24,None,'okand','Kampanjpriset gäller i 24 månader med 24 månaders bindningstid. 100 Mbit/s.','https://www.tele2.se/foretag/mobilabonnemang'),
 ('tele2','Företag Obegränsad',None,499,299,24,24,60,'okand','Kampanjpriset gäller i 24 månader med 24 månaders bindningstid. 300 Mbit/s.','https://www.tele2.se/foretag/mobilabonnemang'),
 ('tele2','Företag Obegränsad Max',None,599,349,24,24,None,'okand','Kampanjpriset gäller i 24 månader med bindningstid. 1 500 Mbit/s. Upp till nio kollegor kan få 50 kr/mån lägre pris.','https://www.tele2.se/foretag/mobilabonnemang'),
 ('tre','3Företag Obegränsad',None,249,None,None,None,None,'exkl','Upp till 300 Mbit/s.','https://www.tre.se/foretag/mobilabonnemang'),
 ('tre','3Företag Obegränsad Max',None,449,299,24,24,None,'exkl','Introduktionspris i 24 månader. Ett datakort med delad surf ingår. Upp till 1 000 Mbit/s.','https://www.tre.se/foretag/mobilabonnemang'),
 ('hallon','Företag 10 GB',10,129,None,None,0,None,'okand','Ingen bindningstid. Upp till 150 Mbit/s.','https://www.hallon.se/foretag'),
 ('hallon','Företag 30 GB',30,179,None,None,0,None,'okand','Ingen bindningstid.','https://www.hallon.se/foretag'),
 ('hallon','Företag 150 GB',150,269,None,None,0,None,'okand','Ingen bindningstid.','https://www.hallon.se/foretag'),
 ('telavox','Obegränsad Plus',None,298,None,None,None,None,'exkl','Ingen växel. Adminportal ingår.','https://telavox.com/sv/priser/'),
 ('telavox','Obegränsad Premium',None,399,None,None,None,None,'exkl','Växel ingår, med app för mobil och dator.','https://telavox.com/sv/priser/'),
 ('telavox','Obegränsad Max',None,549,None,None,None,None,'exkl','Växel med ärendehantering, CRM- och Teams-integration och samtalsinspelning.','https://telavox.com/sv/priser/'),
]
# Kalla ur foretag.json när den finns
for fo in foretag['operatorer']:
    for a in fo['abonnemang']:
        for i,row in enumerate(F):
            if a.get('kalla') and fo['slug'].startswith(row[0]) and a['namn'].split()[-1] in row[1] and a.get('pris') in (row[3],row[4]):
                F[i]=row[:10]+(a['kalla'],)
fplans=[]
for op,namn,gb,pris,kp,km,b,eu,moms,notis,kalla in F:
    fplans.append(dict(id=plan_id(op+'-ftg',namn),operator=op,namn=namn,kundtyp='foretag',gb=gb,pris=pris,kampanjpris=kp,kampanjManader=km,kampanjText=None,bindning=b,euGb=eu,friaSamtal=True,femg=True,hastighet=None,notis=notis,kalla=kalla,malgrupp=None,kontantkort=False,moms=moms))

SKI_P={'vimla':82.5,'fello':81.7,'comviq':75.5,'halebop':74.1,'hallon':72.3,'telia':66.6,'telenor':63.9,'tele2':63.3,'tre':61.5}
SKI_F={'telia':70.1,'telenor':65.2,'tele2':65.1,'tre':65.0}

def vk(v):
    v={k:ren(x) for k,x in (v or {}).items() if isinstance(x,str)}
    ut={k:v.pop(k,None) for k in ('uppsagningstid','startavgift','ovrigt')}
    extra=[x for x in v.values() if x]
    if extra: ut['ovrigt']=' '.join([ut['ovrigt'] or '']+extra).strip()
    return ut

def opts(slug,o):
    namn=NAMN.get(slug,o['namn'].split(' (')[0])
    priv=[p for p in plans if p['operator']==slug]
    status=None; aktiv=True
    if slug=='halebop':
        aktiv=False; status='Telia meddelade i juni 2026 att Halebop avvecklas och att kunderna flyttas till Telia.'
    return dict(slug=slug,namn=namn,agare=AGARE.get(slug,ren(o.get('agare')) or 'Uppgift saknas'),grupp=GRUPP.get(slug,'mvno'),nat=NAT[slug],
      natNotis=None,femg=bool(o.get('femg')),esim=o.get('esim'),wifiSamtal=o.get('wifiSamtal'),kontantkort=o.get('kontantkort'),
      harForetag=slug in ('telia','tele2','telenor','tre','hallon'),webb=WEBB.get(slug,(o.get('kallor') or [''])[0]),
      kundtjanst=ren(o.get('kundtjanst')),om=ren(o.get('om')) or '',starkor=[ren(x) for x in (o.get('starkor') or []) if ren(x)],
      svagheter=[ren(x) for x in (o.get('svagheter') or []) if ren(x)],
      villkor=vk(o.get('villkor')),kallor=o.get('kallor') or [],kontrollerad=o.get('kontrollerad','2026-10-29'),
      osakert=o.get('osakert') or [],partner=False,aktiv=aktiv,status=status,skiPrivat=SKI_P.get(slug),skiForetag=SKI_F.get(slug),
      prisKontrollerade=len(priv)>0)

opl=[opts(s,d[s]) for s in ops]
# Telavox som företagsoperatör
opl.append(dict(slug='telavox',namn='Telavox',agare='Telavox AB',grupp='mvno',nat='telia',natNotis='Telavox anger inte på sina prissidor vilket nät abonnemangen använder.',femg=True,esim=None,wifiSamtal=None,kontantkort=False,harForetag=True,webb='https://telavox.com/sv/',kundtjanst=None,
  om='Telavox säljer mobilabonnemang till företag tillsammans med en molnbaserad växel. Priserna anges exkl. moms, och de dyrare nivåerna har växel, app för mobil och dator och integrationer med andra system.',
  starkor=['Växel ingår från Premium-nivån','Priser anges exkl. moms'],svagheter=['Inga abonnemang för privatpersoner','Vilket nät som används framgår inte av prissidan'],villkor={},kallor=['https://telavox.com/sv/priser/'],kontrollerad='2026-10-29',osakert=['Vilket mobilnät Telavox använder','Bindningstid'],partner=False,aktiv=True,status=None,skiPrivat=None,skiForetag=None,prisKontrollerade=False))

# Visningstexter: underlaget innehåller citat och arbetsanteckningar. Det som visas
# på sajten skrivs här i ren form. Underlaget i research/ ändras inte.
VISNING={
 'telia':dict(kundtjanst='90 200',uppsagningstid='1 månad',startavgift='299 kr, ingen vid köp online'),
 'tele2':dict(kundtjanst='90 222, vardagar 08–19 och lördag 09–15',uppsagningstid='1 månad för de flesta abonnemang'),
 'telenor':dict(kundtjanst='020-222 222 och appen Mitt Telenor',uppsagningstid='1 månad, tidigast till bindningstidens slut'),
 'tre':dict(kundtjanst='0735-300 344 för abonnemang, vardagar 09–18',uppsagningstid='30 dagar',startavgift='0 kr online, 250 kr i butik'),
 'halebop':dict(kundtjanst='Chatt dygnet runt',uppsagningstid='1 månad'),
 'comviq':dict(kundtjanst='0772-21 21 21, vardagar 09–17. Chatt alla dagar 07–22',uppsagningstid='Ingen, du betalar innevarande fakturaperiod'),
 'vimla':dict(kundtjanst='Chatt vardagar 09.00–16.30 och ärenden via Mitt Vimla. Ingen telefonsupport',uppsagningstid='Ingen. Avtalet upphör sista dagen i den månad du säger upp',startavgift='Ingen'),
 'hallon':dict(kundtjanst='Chatt vardagar 09–16 och kundservice@hallon.se. Ingen telefonsupport',uppsagningstid='Ingen. Abonnemanget upphör vid nästa månadsskifte'),
 'fello':dict(kundtjanst='Chatt på support.fello.se och hello@fello.se',uppsagningstid='1 månad',startavgift=None),
 'chilimobil':dict(kundtjanst='kundservice@chilimobil.se. Ingen telefonsupport',uppsagningstid='Till månadsskiftet. Säger du upp efter den 15:e gäller månadsskiftet efter',startavgift='Ingen'),
 'lycamobile':dict(uppsagningstid='Ingen. Stäng av den automatiska förnyelsen i My Lyca'),
 'mybeat':dict(kundtjanst='019-55 55 500, support@mybeat.se och chatt',startavgift=None),
 'tellus':dict(kundtjanst='0771-20 10 00 och hej@tellusmobil.se, vardagar 09–17',uppsagningstid='Ingen. Abonnemanget upphör sista dagen i den månad du säger upp',startavgift='0 kr'),
 'fibio':dict(kundtjanst='010-550 02 00 och kundservice@fibio.se, vardagar 10–17',startavgift='Ingen'),
 'lingon':dict(kundtjanst='060-60 66 203, 10–17 med lunchstängt 12–13, och support@lingon.net'),
}
LISTRADER={
 'Utsedd till mobiloperatören med Sveriges nöjdaste kunder 2022–2025 enligt Svenskt Kvalitetsindex (enligt vimla.se)':'Sveriges nöjdaste mobilkunder 2022–2025 enligt Svenskt Kvalitetsindex',
 'Outnyttjad data sparas (enligt paketsidorna)':'Outnyttjad surf sparas till nästa månad',
 'Startavgift 299 kr enligt prislistan, slopas bara vid köp online':'Startavgift 299 kr, utom vid köp online',
 "Ingen seniorrabatt (Telia skriver själva: 'Vi har inte några mobilabonnemang med seniorrabatt')":'Ingen seniorrabatt',
 "Ingen angiven maxhastighet, bara nivåerna '3Snabbare'/'3Snabbast'":'Ingen angiven maxhastighet, bara nivåerna 3Snabbare och 3Snabbast',
 'Hastigheten är begränsad: max 150 Mbit/s enligt 5G-sidan, 100 Mbit/s enligt prislistan':'Hastigheten är begränsad till 100 eller 150 Mbit/s (operatörens sidor anger olika)',
}
for o in opl:
    v=VISNING.get(o['slug'],{})
    if 'kundtjanst' in v: o['kundtjanst']=v['kundtjanst']
    for k in ('uppsagningstid','startavgift'):
        if k in v: o['villkor'][k]=v[k]
    o['starkor']=[LISTRADER.get(x,x) for x in o['starkor']]
    o['svagheter']=[LISTRADER.get(x,x) for x in o['svagheter']]

alla=plans+fplans
for p in alla:
    if p.get('malgrupp') is None: p.pop('malgrupp',None)
    if not p.get('kontantkort'): p.pop('kontantkort',None)
    if p.get('moms') is None: p.pop('moms',None)
for p in alla:
    if p['bindning'] is not None: p['bindning']=int(p['bindning'])
    for k in ['gb','euGb']:
        if p.get(k) is not None and float(p[k]).is_integer(): p[k]=int(p[k])
# Prisändringar: jämför med förra körningens priser (research/senaste-priser.json)
# och logga varje skillnad i research/prisandringar.json. Första körningen loggar
# inget, den sparar bara utgångsläget. Nyckeln är operatör, namn och kundtyp,
# eftersom id kan bytas när underlaget kompletteras.
SENASTE=os.path.join(ROT,'research/senaste-priser.json')
LOGG=os.path.join(ROT,'research/prisandringar.json')
FALT=('pris','kampanjpris','kampanjManader','startavgift')
kontr={o['slug']:o['kontrollerad'] for o in opl}
def pnyckel(p): return f"{p['operator']}|{p['namn']}|{p['kundtyp']}"
nu={pnyckel(p):{**{f:p.get(f) for f in FALT},'kalla':p.get('kalla'),'operator':p['operator'],'namn':p['namn'],'kundtyp':p['kundtyp']} for p in alla}
logg=json.load(open(LOGG)) if os.path.exists(LOGG) else []
if os.path.exists(SENASTE):
    forra=json.load(open(SENASTE)); nya=[]
    for k,v in nu.items():
        d=kontr.get(v['operator'],'')
        bas=dict(datum=d,operator=v['operator'],namn=v['namn'],kundtyp=v['kundtyp'],kalla=v['kalla'])
        if k not in forra: nya.append({**bas,'typ':'nytt','falt':None,'fran':None,'till':v['pris']}); continue
        for f in FALT:
            if forra[k].get(f)!=v.get(f): nya.append({**bas,'typ':'andrat','falt':f,'fran':forra[k].get(f),'till':v.get(f)})
    for k,v in forra.items():
        if k not in nu: nya.append(dict(datum=max(kontr.values()),operator=v['operator'],namn=v['namn'],kundtyp=v['kundtyp'],kalla=v.get('kalla'),typ='borttaget',falt=None,fran=v.get('pris'),till=None))
    logg=sorted(logg+nya,key=lambda e:(e['datum'],e['operator'],e['namn']),reverse=True)
    json.dump(logg,open(LOGG,'w'),ensure_ascii=False,indent=1); print('prisändringar',len(nya),'nya,',len(logg),'totalt')
elif not os.path.exists(LOGG):
    json.dump([],open(LOGG,'w'))
json.dump(nu,open(SENASTE,'w'),ensure_ascii=False,indent=1)
p_logg=os.path.join(ROT,'src/lib/mobil/prisandringar.ts')
open(p_logg,'w').write('// GENERERAD av scripts/bygg_data.py ur research/prisandringar.json. Ändra inte för hand.\n\n'
  'export type Prisandring = { datum: string; operator: string; namn: string; kundtyp: "privat" | "foretag"; kalla: string | null; typ: "nytt" | "andrat" | "borttaget"; falt: "pris" | "kampanjpris" | "kampanjManader" | "startavgift" | null; fran: number | null; till: number | null };\n\n'
  'export const PRISANDRINGAR: Prisandring[] = '+json.dumps(logg,ensure_ascii=False,indent=2)+';\n')
subprocess.run(['npx','prettier','--write',p_logg],cwd=ROT,stdout=subprocess.DEVNULL)

out=['// GENERERAD av scripts/bygg_data.py ur operatörernas egna webbplatser, kontrollerade 2026-10-29.\n// Ändra priser här eller i underlaget och kör skriptet igen. Varje rad har en källa (kalla).\n\nimport type { Abonnemang, Operator } from "./typer";\n\n']
out.append('export const OPERATORER_DATA: Operator[] = '+json.dumps(opl,ensure_ascii=False,indent=2)+';\n\n')
out.append('export const ABONNEMANG_DATA: Abonnemang[] = '+json.dumps(alla,ensure_ascii=False,indent=2)+';\n')
open(os.path.join(ROT,'src/lib/mobil/operatorer-data.ts'),'w').write(''.join(out))
print('ops',len(opl),'plans',len(alla))

# Formatera som resten av repot
import subprocess
subprocess.run(['npx','prettier','--write',os.path.join(ROT,'src/lib/mobil/operatorer-data.ts')],cwd=ROT,stdout=subprocess.DEVNULL)

# ---------------- Mobilt bredband ----------------
# Underlag: research/mobilt-bredband.json (operatörernas egna sidor och prislistor).
# Meningar som är markerade [KONTROLLERA] visas inte för besökaren.
def ren_notis(t):
    if not t: return None
    delar=re.split(r'(?<=[.!?])\s+',t.strip())
    # Interna anteckningar om var uppgiften hittades visas inte heller.
    intern=('[KONTROLLERA]','API','orderdata','beställningen','leder om','PDF')
    kvar=[d for d in delar if not any(x in d for x in intern)]
    s=' '.join(kvar).strip()
    return s or None

bb=json.load(open(os.path.join(ROT,'research/mobilt-bredband.json')))
STUGA={'Mobilt bredband för sommarstugan','Stugbredband / Bredband Start','Mobilt bredband Flexibelt'}
bredband=[]
for e in bb['erbjudanden']:
    if e.get('pris') is None and e['namn'] not in STUGA: continue
    if e['operator']=='tre' and e['namn']=='3Bredband Flex': continue
    kat='extra' if e.get('krav') else ('stuga' if e['namn'] in STUGA else 'jamfor')
    bredband.append(dict(id=plan_id(e['operator']+'-bb',e['namn']),operator=e['operator'],namn=e['namn'],typ=e['typ'],kategori=kat,
        gb=e.get('gb'),hastighet=e.get('hastighet'),pris=e.get('pris'),kampanjpris=e.get('kampanjpris'),kampanjManader=e.get('kampanjManader'),
        bindning=e.get('bindning'),uppsagning=e.get('uppsagning'),startavgift=e.get('startavgift'),router=e.get('routerkostnad'),
        femg=bool(e.get('femg')),kalla=e['kalla'],notis=ren_notis(e.get('notis'))))
for b in bredband:
    for k in ['gb','bindning','uppsagning','kampanjManader']:
        if b.get(k) is not None and float(b[k]).is_integer(): b[k]=int(b[k])
out=['// GENERERAD av scripts/bygg_data.py ur research/mobilt-bredband.json, kontrollerad '+bb['kontrollerad']+'.\n\nimport type { Bredband } from "./typer";\n\n',
     'export const BREDBAND_KONTROLLERAD = "'+bb['kontrollerad']+'";\n\n',
     'export const BREDBAND_DATA: Bredband[] = '+json.dumps(bredband,ensure_ascii=False,indent=2)+';\n\n',
     'export const BREDBAND_FAKTA: { pastaende: string; kalla: string }[] = '+json.dumps(bb['fakta'],ensure_ascii=False,indent=2)+';\n']
p=os.path.join(ROT,'src/lib/mobil/bredband-data.ts'); open(p,'w').write(''.join(out))
subprocess.run(['npx','prettier','--write',p],cwd=ROT,stdout=subprocess.DEVNULL)
print('bredband',len(bredband))

# ---------------- Mobil med abonnemang ----------------
# Underlag: research/mobil-med-abonnemang.json (operatörernas, Apples, Samsungs och Googles egna sidor).
tm=json.load(open(os.path.join(ROT,'research/mobil-med-abonnemang.json')))
def tel_slug(namn):
    s=namn.lower().replace('apple ','').replace('samsung ','').replace('google ','')
    s=re.sub(r'\s+\d+\s*gb$','',s)
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
    return s
tillv={k['telefon']:k for k in tm['kontantpriser']}
modeller=[]
for e in tm['erbjudanden']:
    if not any(m['namn']==e['telefon'] for m in modeller):
        k=tillv.get(e['telefon'],{})
        modeller.append(dict(slug=tel_slug(e['telefon']),namn=e['telefon'],
            marke=e['telefon'].split(' ')[0],tillverkarpris=k.get('pris'),
            tillverkarkalla=k.get('kalla') if k.get('pris') else None,
            tillverkarnotis=ren_notis(k.get('notis'))))
telefoner=[]
for e in tm['erbjudanden']:
    ab=e.get('abonnemangKravs') or {}
    telefoner.append(dict(operator=e['operator'],modell=tel_slug(e['telefon']),telefon=e['telefon'],
        perManad=e.get('telefonPerManad'),manader=e.get('manader'),telefonTotalt=e.get('telefonTotalt'),
        kontantpris=e.get('kontantpris'),kontantprisAvser=ren_notis(e.get('kontantprisAvser')),
        abonnemang=ab.get('namn'),abonnemangGb=ab.get('gb'),abonnemangPris=ab.get('prisPerManad'),
        abonnemangOrdinarie=ab.get('ordinariePris'),abonnemangNot=ren_notis(ab.get('not')),
        valfrittAbonnemang=bool(e.get('billigareAbonnemang')),bindning=e.get('bindning'),
        minstaTotal=e.get('totalt') or e.get('totaltMinstaRaknat'),operatorAngerTotal=e.get('totalt') is not None,
        inbyte=ren_notis(e.get('restvarde')),kalla=e['kalla'],notis=ren_notis(e.get('notis'))))
out=['// GENERERAD av scripts/bygg_data.py ur research/mobil-med-abonnemang.json, kontrollerad '+tm['kontrollerad']+'.\n\nimport type { Telefonerbjudande, Telefonmodell } from "./typer";\n\n',
     'export const TELEFON_KONTROLLERAD = "'+tm['kontrollerad']+'";\n\n',
     'export const TELEFONMODELLER: Telefonmodell[] = '+json.dumps(modeller,ensure_ascii=False,indent=2)+';\n\n',
     'export const TELEFONERBJUDANDEN: Telefonerbjudande[] = '+json.dumps(telefoner,ensure_ascii=False,indent=2)+';\n\n',
     'export const TELEFON_FAKTA: { pastaende: string; kalla: string }[] = '+json.dumps([f for f in tm['fakta'] if '[KONTROLLERA]' not in f['pastaende']],ensure_ascii=False,indent=2)+';\n']
p=os.path.join(ROT,'src/lib/mobil/telefon-data.ts'); open(p,'w').write(''.join(out))
subprocess.run(['npx','prettier','--write',p],cwd=ROT,stdout=subprocess.DEVNULL)
print('telefoner',len(telefoner),'modeller',[m['slug'] for m in modeller])

# Uppsägning per operatör (research/uppsagning.json) till src/lib/mobil/uppsagning-data.ts.
upp=json.load(open(os.path.join(ROT,'research/uppsagning.json')))
p_upp=os.path.join(ROT,'src/lib/mobil/uppsagning-data.ts')
open(p_upp,'w').write('// GENERERAD av scripts/bygg_data.py ur research/uppsagning.json. Ändra inte för hand.\n\n'
  'export type Uppsagning = { kanaler: string[]; upphor: string | null; telefon_avbetalning: string | null; kontantkort_saldo: string | null; nummerflytt: string | null; sarskilt: string | null; kalla: string[] };\n\n'
  f'export const UPPSAGNING_KONTROLLERAD = "{upp["kontrollerad"]}";\n\n'
  'export const UPPSAGNING: Record<string, Uppsagning> = '+json.dumps(upp['operatorer'],ensure_ascii=False,indent=2)+';\n')
subprocess.run(['npx','prettier','--write',p_upp],cwd=ROT,stdout=subprocess.DEVNULL)
