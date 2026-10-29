"""Bygger src/lib/mobil/operatorer-data.ts ur researchfilerna."""
import json, re
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

alla=plans+fplans
for p in alla:
    if p.get('malgrupp') is None: p.pop('malgrupp',None)
    if not p.get('kontantkort'): p.pop('kontantkort',None)
    if p.get('moms') is None: p.pop('moms',None)
for p in alla:
    if p['bindning'] is not None: p['bindning']=int(p['bindning'])
    for k in ['gb','euGb']:
        if p.get(k) is not None and float(p[k]).is_integer(): p[k]=int(p[k])
out=['// GENERERAD av scripts/bygg_data.py ur operatörernas egna webbplatser, kontrollerade 2026-10-29.\n// Ändra priser här eller i underlaget och kör skriptet igen. Varje rad har en källa (kalla).\n\nimport type { Abonnemang, Operator } from "./typer";\n\n']
out.append('export const OPERATORER_DATA: Operator[] = '+json.dumps(opl,ensure_ascii=False,indent=2)+';\n\n')
out.append('export const ABONNEMANG_DATA: Abonnemang[] = '+json.dumps(alla,ensure_ascii=False,indent=2)+';\n')
open(os.path.join(ROT,'src/lib/mobil/operatorer-data.ts'),'w').write(''.join(out))
print('ops',len(opl),'plans',len(alla))

# Formatera som resten av repot
import subprocess
subprocess.run(['npx','prettier','--write',os.path.join(ROT,'src/lib/mobil/operatorer-data.ts')],cwd=ROT,stdout=subprocess.DEVNULL)
