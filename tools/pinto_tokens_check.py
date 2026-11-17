#!/usr/bin/env python3
"""Compara los tokens de color de un archivo (html/css) contra pinto-tokens.css.
Uso: python3 pinto_tokens_check.py pinto-tokens.css <archivo> [...]
Revisión estática: lee texto; no prueba la app corriendo."""
import re,sys
def blocks(t):
    out={}
    for name,pat in (('claro',r':root\{[^}]*\}'),('oscuro',r':root\[data-eff=dark\]\{[^}]*\}')):
        ms=[m for m in re.findall(pat,t)]
        d={}
        for b in ms:
            for k,v in re.findall(r'(--[a-z0-9-]+):([^;}]+)',b): d[k]=v.strip().upper()
        out[name]=d
    return out
ref=blocks(open(sys.argv[1],encoding='utf-8').read())
rc=0
for f in sys.argv[2:]:
    got=blocks(open(f,encoding='utf-8').read())
    for mode in ('claro','oscuro'):
        for k,v in ref[mode].items():
            g=got[mode].get(k)
            if g is None: print(f'{f} [{mode}] FALTA {k}'); rc=1
            elif g!=v: print(f'{f} [{mode}] DISTINTO {k}: {g} (común {v})'); rc=1
    if rc==0: print(f'{f}: OK ({sum(len(v) for v in ref.values())} tokens iguales)')
sys.exit(rc)
