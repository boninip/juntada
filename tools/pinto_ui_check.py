#!/usr/bin/env python3
"""Verificador del diseño común de Pinto (revisión ESTÁTICA: lee texto, no corre la app).
Uso: python3 pinto_ui_check.py <pinto-ui.css de referencia> <pinto-tokens.css de referencia> <app.html|css> [...]
Chequea por cada archivo de la app:
  1) las variables --pui-* de la referencia existen y con el mismo valor (en el archivo copiado, si la app incluye el bloque inline) -> usar con el .css copiado;
  2) cuenta colores hex sueltos fuera de los bloques de tokens (informa; no falla);
  3) detecta serif y gradientes decorativos (informa);
  4) contraste WCAG de los pares de texto de los tokens comunes (falla si < 4,5 en texto normal).
Código de salida 1 si hay FALTA/DISTINTO o contraste < 4,5."""
import re,sys
def vars_(t):
    d={}
    for m in re.finditer(r'(--[a-z0-9-]+)\s*:\s*([^;}]+)',t):d[m.group(1)]=m.group(2).strip()
    return d
def lum(h):
    h=h.lstrip('#');r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c:c/12.92 if c<=.03928 else ((c+.055)/1.055)**2.4
    return .2126*f(r)+.7152*f(g)+.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b);return (max(la,lb)+.05)/(min(la,lb)+.05)
ui=open(sys.argv[1],encoding='utf-8').read();tk=open(sys.argv[2],encoding='utf-8').read()
ref={k:v for k,v in vars_(ui).items() if k.startswith('--pui-')}
rc=0
# 4) contraste de tokens (claro y oscuro)
blocks={'claro':re.findall(r':root\{[^}]*\}',tk),'oscuro':re.findall(r':root\[data-eff=dark\]\{[^}]*\}',tk)}
pairs=[('--texto','--fondo'),('--texto','--tarjeta'),('--texto-sec','--fondo'),('--texto-sec','--tinte'),('--primario-txt','--fondo'),('--primario-txt','--tinte'),('--sobre-primario','--primario'),('--coral-txt','--fondo'),('--ok-txt','--ok-bg'),('--aviso-txt','--aviso-bg'),('--error-txt','--error-bg'),('--neutro-txt','--neutro-bg')]
for modo,bl in blocks.items():
    v=vars_(''.join(bl))
    for a,b in pairs:
        if a in v and b in v and v[a].startswith('#') and v[b].startswith('#'):
            c=cr(v[a],v[b]);tag='ok  ' if c>=4.5 else 'FALLA';
            if c<4.5:rc=1
            print(f'contraste [{modo}] {a} sobre {b}: {c:.2f} {tag}')
tokenvals=set(x.upper() for x in re.findall(r'#[0-9A-Fa-f]{6}\b',tk))
for f in sys.argv[3:]:
    t=open(f,encoding='utf-8').read();got=vars_(t)
    carga=bool(re.search(r'href="[^"]*pinto-ui\.css',t))
    for k,v in ref.items():
        if carga:break
        g=got.get(k)
        if g is None:print(f'{f} FALTA {k}');rc=1
        elif g!=v:print(f'{f} DISTINTO {k}: {g} (común {v})');rc=1
    sin_tokens=re.sub(r':root(\[data-eff=dark\])?\{[^}]*\}','',t)
    hexs=[x.upper() for x in re.findall(r'#[0-9A-Fa-f]{6}\b',sin_tokens)]
    print(f'{f}: {len(hexs)} hex sueltos ({len([x for x in hexs if x in tokenvals])} coinciden con un token, {len(set(x for x in hexs if x not in tokenvals))} valores distintos fuera del bloque)')
    print(f'{f}: serif={len(re.findall(r"font-family:[^;}]*(?<!sans-)serif",sin_tokens,re.I))}, gradientes={len(re.findall(r"linear-gradient|radial-gradient",sin_tokens))}')
    if carga:print(f'{f}: carga pinto-ui.css (las variables --pui-* vienen del archivo; verificar ese archivo contra la referencia)')
    elif all(k in got for k in ref):print(f'{f}: variables --pui-* OK ({len(ref)})')
sys.exit(rc)
