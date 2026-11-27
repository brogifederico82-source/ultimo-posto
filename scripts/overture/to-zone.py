#!/usr/bin/env python3
"""Trasforma i dati reali (data/mappa/overture/*.geojson, in metri) in zone di gioco.

Uso:  python3 scripts/overture/to-zone.py [cartella-anteprime]
Scrive src/quartiere-dati.js (funzione quartiereDati) e, se richiesto, le anteprime PNG.

Ogni tessera = SCALA metri. Priorità per tessera: edificio > strada > marciapiede > sentiero > spiazzo > prato.
Cosa è dato reale: impronte degli edifici, tracciato e classe delle strade, marciapiedi, aree verdi, nomi.
Cosa è dedotto (e va verificato sul campo): larghezza delle strade (tabella per classe, minimo 2 tessere),
prato nei lotti non mappati, alberi e lampioni (posizione simulata, densità plausibile), altezza degli edifici (non usata).
"""
import json, math, sys, os, random
import numpy as np
from shapely.geometry import shape, box, Point
from shapely.ops import unary_union
import shapely

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
DATI = os.path.join(ROOT, "data", "mappa", "overture")
CLAT, CLON = 41.9205, 12.5040               # centro dei dati in metri
KLAT = 111320.0
KLON = 111320.0 * math.cos(math.radians(CLAT))
SCALA = 3.0                                  # metri per tessera
W, H = 110, 90                               # tessere per zona


def pm(lon, lat):
    return ((lon - CLON) * KLON, (lat - CLAT) * KLAT)


def carica(nome):
    with open(os.path.join(DATI, nome + ".geojson")) as f:
        return json.load(f)["features"]


EDIFICI = carica("edifici")
STRADE = carica("strade")
SUOLO = carica("uso_suolo")
ACQUA = carica("acqua")
LUOGHI = carica("luoghi")

LARGHEZZA = {"trunk": 14, "primary": 12, "secondary": 10, "tertiary": 8, "residential": 6, "unclassified": 6, "living_street": 5}
VERDE = {"park", "garden", "grass", "flowerbed", "meadow", "village_green", "playground", "dog_park", "recreation_ground", "allotments"}

PUNTI = {  # ancore reali (lon, lat) verificate nei luoghi Overture
    "pola": ("Villa Alberoni · Sede storica LUISS", 12.51145, 41.91868),
    "parenzo": ("Facoltà di Giurisprudenza · Via Parenzo 11", 12.51309, 41.92180),
    "romania": ("LUISS · Viale Romania 32", 12.49332, 41.92503),
}
# griglia: la cella di Pola ha l'ancora alla tessera (40, 60); le celle si toccano senza sovrapposizioni
_ax, _ay = pm(PUNTI["pola"][1], PUNTI["pola"][2])
X0 = _ax - 40.5 * SCALA
Y0 = _ay + 60.5 * SCALA


def cella_di(lon, lat):
    x, y = pm(lon, lat)
    return int((x - X0) // (W * SCALA)), int((Y0 - y) // (H * SCALA))


def centro_cella(c, r):
    return (X0 + (c + 0.5) * W * SCALA, Y0 - (r + 0.5) * H * SCALA)


def tessera_in_cella(c, r, lon, lat):
    x, y = pm(lon, lat)
    return int((x - (X0 + c * W * SCALA)) // SCALA), int(((Y0 - r * H * SCALA) - y) // SCALA)


CPOLA = cella_di(PUNTI["pola"][1], PUNTI["pola"][2])
CPAR = cella_di(PUNTI["parenzo"][1], PUNTI["parenzo"][2])
CROM = cella_di(PUNTI["romania"][1], PUNTI["romania"][2])
_cs = [CPOLA, CPAR, CROM]
COL0, COL1 = min(c for c, r in _cs), max(c for c, r in _cs)
RIG0, RIG1 = min(r for c, r in _cs), max(r for c, r in _cs)
# una cella di margine attorno alle sedi, ma solo dove ci sono dati (il riquadro dei dati è lon 12.478-12.522, lat 41.912-41.948)
MINX, MAXX = pm(12.478, 41.912)[0], pm(12.522, 41.948)[0]
MINY, MAXY = pm(12.478, 41.912)[1], pm(12.522, 41.948)[1]
CELLE = []
for c in range(COL0 - 1, COL1 + 2):
    for r in range(RIG0 - 1, RIG1 + 2):
        cx, cy = centro_cella(c, r)
        if cx - W * SCALA / 2 >= MINX and cx + W * SCALA / 2 <= MAXX and cy - H * SCALA / 2 >= MINY and cy + H * SCALA / 2 <= MAXY:
            CELLE.append((c, r))


# cella aggiuntiva a nord di pq-1-0: contiene LUISS Sport (Via Tommaso Salvini 2) e la sede di Via di Villa Emiliani 14
CNORD = (COL0, RIG0 - 2)
_cx, _cy = centro_cella(*CNORD)
if _cx - W * SCALA / 2 >= MINX and _cx + W * SCALA / 2 <= MAXX and _cy - H * SCALA / 2 >= MINY and _cy + H * SCALA / 2 <= MAXY:
    CELLE.append(CNORD)


def id_cella(c, r):
    if (c, r) == CNORD:
        return "pq-%d-n" % (c - COL0 + 1)
    if (c, r) == CPOLA:
        return "pola"
    if (c, r) == CPAR:
        return "parenzo"
    return "pq-%d-%d" % (c - COL0 + 1, r - RIG0 + 1)


TONI = ["#c99a63", "#b4684f", "#d9c49a", "#c9826e", "#b98b6a"]


def geom(f):
    return shape(f["geometry"])


def rettangolo_massimo(celle):
    """Rettangolo pieno di area massima (metodo dell'istogramma) in un insieme di celle (i, j)."""
    xs = [c[0] for c in celle]; ys = [c[1] for c in celle]
    x0, y0 = min(xs), min(ys)
    ww, hh = max(xs) - x0 + 1, max(ys) - y0 + 1
    g = [[(x0 + i, y0 + j) in celle for i in range(ww)] for j in range(hh)]
    alt = [0] * ww
    best = None
    for j in range(hh):
        for i in range(ww):
            alt[i] = alt[i] + 1 if g[j][i] else 0
        pila = []
        for i in range(ww + 1):
            cur = alt[i] if i < ww else 0
            start = i
            while pila and pila[-1][1] >= cur:
                s0, a = pila.pop()
                area = a * (i - s0)
                if a > 0 and (best is None or area > best[0]):
                    best = (area, x0 + s0, y0 + j - a + 1, i - s0, a)
                start = s0
            pila.append((start, cur))
    return None if best is None else best[1:]


def costruisci(id_zona, spec):
    rnd = random.Random(id_zona)
    cx, cy = spec["centro_m"]
    # centri delle tessere (metri); riga 0 = nord
    xs = cx + (np.arange(W) + 0.5 - W / 2) * SCALA
    ys = cy + (H / 2 - (np.arange(H) + 0.5)) * SCALA
    X, Y = np.meshgrid(xs, ys)
    area = box(cx - W / 2 * SCALA - 30, cy - H / 2 * SCALA - 30, cx + W / 2 * SCALA + 30, cy + H / 2 * SCALA + 30)

    def dentro(g):
        return shapely.contains_xy(g, X, Y) if g is not None and not g.is_empty else np.zeros((H, W), bool)

    # terreno di base: prato
    T = np.full((H, W), ".", dtype="<U1")

    # verde mappato (conferma il prato) e spiazzi pedonali/piazze
    verde = unary_union([geom(f) for f in SUOLO if f["properties"]["classe"] in VERDE and geom(f).intersects(area)])
    piazze = unary_union([geom(f) for f in SUOLO if f["properties"]["classe"] in ("pedestrian", "plaza") and geom(f).intersects(area)])
    mV = dentro(verde)
    mP = dentro(piazze)

    # strade per classe
    carr, marc, sent = [], [], []
    nomi_strade = {}
    for f in STRADE:
        p = f["properties"]
        g = geom(f)
        if not g.intersects(area):
            continue
        c, sc = p["classe"], p["sottoclasse"]
        if c in LARGHEZZA:
            carr.append(g.buffer(LARGHEZZA[c] / 2.0, cap_style=2))
            if p["nome"]:
                nomi_strade.setdefault(p["nome"], []).append(g)
        elif c == "service":
            marc.append(g.buffer(1.7, cap_style=2))
        elif c == "pedestrian":
            marc.append(g.buffer(2.5, cap_style=2))
        elif c == "footway" and sc == "sidewalk":
            marc.append(g.buffer(1.7, cap_style=2))
        elif c in ("footway", "path", "steps", "track", "cycleway"):
            if sc == "crosswalk":
                carr.append(g.buffer(1.7, cap_style=2))   # le strisce stanno sulla carreggiata
            else:
                sent.append(g.buffer(1.7, cap_style=2))
    mCarr = dentro(unary_union(carr)) if carr else np.zeros((H, W), bool)
    mMarc = dentro(unary_union(marc)) if marc else np.zeros((H, W), bool)
    mSent = dentro(unary_union(sent)) if sent else np.zeros((H, W), bool)

    # edifici: una tessera è edificio se la copre per almeno il 35%
    B = np.full((H, W), -1, dtype=int)
    lista = []
    for f in EDIFICI:
        g = geom(f)
        if not g.intersects(area):
            continue
        lista.append((f, g))
    for idx, (f, g) in enumerate(lista):
        minx, miny, maxx, maxy = g.bounds
        i0 = max(0, int((minx - (cx - W / 2 * SCALA)) // SCALA))
        i1 = min(W - 1, int((maxx - (cx - W / 2 * SCALA)) // SCALA))
        j0 = max(0, int(((cy + H / 2 * SCALA) - maxy) // SCALA))
        j1 = min(H - 1, int(((cy + H / 2 * SCALA) - miny) // SCALA))
        for j in range(j0, j1 + 1):
            for i in range(i0, i1 + 1):
                if B[j, i] != -1:
                    continue
                x0 = cx - W / 2 * SCALA + i * SCALA
                yt = cy + H / 2 * SCALA - j * SCALA
                cella = box(x0, yt - SCALA, x0 + SCALA, yt)
                if g.intersection(cella).area >= 0.35 * SCALA * SCALA:
                    B[j, i] = idx

    # composizione per priorità
    T[mV] = "."
    # spiazzo intorno agli edifici (1 tessera) e piazze
    edi = B >= 0
    for dj in (-1, 0, 1):
        for di in (-1, 0, 1):
            sh = np.roll(np.roll(edi, dj, 0), di, 1)
            T[sh & ~edi & ~mV] = "p"
    T[mP] = "p"
    T[mSent] = "a"
    T[mMarc] = "p"
    T[mCarr] = "r"
    T[edi] = "B"

    # acqua: stagni come fontana 2x2
    stagni = []
    for f in ACQUA:
        g = geom(f)
        if g.intersects(area) and g.area > 20 and f["properties"].get("classe") != "swimming_pool":
            c = g.centroid
            i = int((c.x - (cx - W / 2 * SCALA)) // SCALA)
            j = int(((cy + H / 2 * SCALA) - c.y) // SCALA)
            if 0 <= i < W - 2 and 0 <= j < H - 2:
                stagni.append((i, j))

    # edifici -> rettangoli
    chiavi = []
    for nome, lo, la in spec.get("chiave", []):
        px, py = pm(lo, la)
        best, bd = None, 1e9
        for idx, (f, g) in enumerate(lista):
            d = g.distance(Point(px, py))
            if d < bd or (abs(d - bd) < 1e-6 and g.area > lista[best][1].area):
                best, bd = idx, d
        chiavi.append((best, nome))
    chiave_idx = {b: n for b, n in chiavi}
    edifici = []
    for idx in sorted(set(B[B >= 0].tolist())):
        celle = {(int(i), int(j)) for j, i in zip(*np.where(B == idx))}
        totale = len(celle)
        while celle:
            r = rettangolo_massimo(celle)
            if r is None:
                break
            i0, j0, w, h = r
            if w * h < 2 and totale >= 2:
                break                                  # niente "casette" da una tessera ai bordi
            for k in range(w):
                for m in range(h):
                    celle.discard((i0 + k, j0 + m))
            edifici.append({"x": i0, "y": j0, "w": w, "h": h, "b": idx})
    principali = {}
    for n, e in enumerate(edifici):
        a = e["w"] * e["h"]
        if e["b"] not in principali or a > edifici[principali[e["b"]]]["w"] * edifici[principali[e["b"]]]["h"]:
            principali[e["b"]] = n
    for n, e in enumerate(edifici):
        f, g = lista[e["b"]]
        pr = f["properties"]
        primo = principali[e["b"]] == n
        e["n"] = (chiave_idx.get(e["b"]) or pr.get("nome") or "") if primo else ""
        e["k"] = "f" if e["b"] in chiave_idx else "r"
        e["c"] = TONI[(e["b"] * 7 + 3) % len(TONI)]
    for e in edifici:
        del e["b"]

    # percorribile: non edificio
    def libero(i, j):
        return 0 <= i < W and 0 <= j < H and T[j, i] != "B"

    # alberi nei prati (non vicino a strade e non adiacenti ad edifici)
    alberi = []
    occ = np.zeros((H, W), bool)
    # regioni di prato: i grandi parchi (ville storiche) sono più alberati
    from collections import deque
    regione = np.zeros((H, W), int)
    for j in range(H):
        for i in range(W):
            if T[j, i] == "." and regione[j, i] == 0:
                dq = deque([(i, j)]); cella = [(i, j)]; regione[j, i] = -1
                while dq:
                    a, b = dq.popleft()
                    for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        x, y = a + da, b + db
                        if 0 <= x < W and 0 <= y < H and T[y, x] == "." and regione[y, x] == 0:
                            regione[y, x] = -1; dq.append((x, y)); cella.append((x, y))
                for (x, y) in cella:
                    regione[y, x] = len(cella)
    for j in range(2, H - 2):
        for i in range(2, W - 2):
            if T[j, i] != "." or occ[j, i]:
                continue
            vicino = T[j - 1:j + 2, i - 1:i + 2]
            if (vicino == "B").any() or (vicino == "r").any() or (vicino == "p").any():
                continue
            if rnd.random() < (0.16 if mV[j, i] else (0.14 if regione[j, i] >= 150 else 0.07)):
                tipo = "pine" if rnd.random() < spec.get("pini", 0.2) else "tree"
                if tipo == "pine" and (j + 3 >= H or i + 3 >= W):
                    continue
                s = 3 if tipo == "pine" else 1
                if occ[j:j + s, i:i + s].any() or (T[j:j + s, i:i + s] != ".").any():
                    continue
                occ[max(0, j - 1):j + s + 1, max(0, i - 1):i + s + 1] = True
                alberi.append([i, j, tipo])

    # lampioni: sul marciapiede accanto alla strada, ogni ~9 tessere
    lampioni = []
    for j in range(1, H - 1):
        for i in range(1, W - 1):
            if T[j, i] != "p" or (j * 31 + i * 17) % 9 != 0:
                continue
            if (T[j - 1:j + 2, i - 1:i + 2] == "r").any() and not any(abs(i - a) + abs(j - b) < 7 for a, b in lampioni):
                lampioni.append((i, j))

    # cartelli con il nome delle strade
    insegne = []
    for nome, gs in nomi_strade.items():
        g = unary_union(gs)
        c = Point(cx, cy)
        if g.distance(c) > min(W, H) * SCALA / 2:
            continue
        pt = g.interpolate(g.project(c))
        i = int((pt.x - (cx - W / 2 * SCALA)) // SCALA)
        j = int(((cy + H / 2 * SCALA) - pt.y) // SCALA)
        for di, dj in [(2, 0), (-2, 0), (0, 2), (0, -2), (3, 0), (-3, 0), (0, 3), (0, -3), (2, 2), (-2, -2)]:
            ii, jj = i + di, j + dj
            if 1 <= ii < W - 1 and 1 <= jj < H - 1 and T[jj, ii] in ("p", ".") and (T[jj - 1:jj + 2, ii - 1:ii + 2] != "B").all():
                insegne.append([ii, jj, nome])
                break
    insegne = insegne[:12]

    # ancore della storia
    key_tiles = set()
    kidx = chiavi[0][0] if chiavi else None
    if kidx is not None:
        key_tiles = {(int(i), int(j)) for j, i in zip(*np.where(B == kidx))}

    def dist_strada(i, j):
        m = 99
        for dj in range(-12, 13):
            for di in range(-12, 13):
                a, b = i + di, j + dj
                if 0 <= a < W and 0 <= b < H and T[b, a] == "r":
                    m = min(m, abs(di) + abs(dj))
        return m

    porta = None
    ritorno = None
    cand = []
    for (i, j) in key_tiles:
        for di, dj in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            a, b = i + di, j + dj
            if libero(a, b) and (a, b) not in key_tiles and T[b, a] in ("p", "."):
                cand.append((dist_strada(a, b) * 10 + (0 if dj == 1 else 3) + abs(a - W // 2) * 0.05, a, b, di, dj))
    cand.sort()
    if cand:
        _, a, b, di, dj = cand[0]
        porta = (a, b)
        for tipi_ok in (("p", "."), ("p", ".", "r", "a")):
            for ddi, ddj in ((di, dj), (0, 1), (0, -1), (1, 0), (-1, 0), (di * 2, dj * 2), (1, 1), (-1, 1), (1, -1), (-1, -1)):
                r = (a + ddi, b + ddj)
                if libero(*r) and r not in key_tiles and T[r[1], r[0]] in tipi_ok and r != porta:
                    ritorno = r
                    break
            if ritorno:
                break
    arrivo = None
    if porta:
        best = None
        for j in range(2, H - 2):
            for i in range(2, W - 2):
                if T[j, i] in ("p", ".") and (T[j - 1:j + 2, i - 1:i + 2] == "r").any():
                    d = abs(i - porta[0]) + abs(j - porta[1])
                    if 4 <= d <= 40 and (i, j) != ritorno and (best is None or d < best[0]):
                        best = (d, i, j)
        if best:
            arrivo = (best[1], best[2])
    # punto d'ingresso generico: marciapiede (o prato) più vicino al centro, libero da alberi
    occupati_alberi = {(a[0], a[1]) for a in alberi}
    ingresso, bd = None, 1e9
    for j in range(H):
        for i in range(W):
            if T[j, i] in ("p", ".") and (i, j) not in occupati_alberi and not any(a[2] == "pine" and a[0] <= i < a[0] + 3 and a[1] <= j < a[1] + 3 for a in alberi):
                near = (T[max(0, j - 1):j + 2, max(0, i - 1):i + 2] == "r").any()
                d = (i - W / 2) ** 2 + (j - H / 2) ** 2 - (3000 if near else 0)
                if d < bd:
                    bd, ingresso = d, (i, j)
    vicina = None
    if nomi_strade:
        vicina = min(nomi_strade.items(), key=lambda kv: unary_union(kv[1]).distance(Point(cx, cy)))[0]
    return dict(ingresso=ingresso, strada_vicina=vicina, T=T, edifici=edifici, alberi=alberi, lampioni=lampioni, insegne=insegne, stagni=stagni,
                porta=porta, ritorno=ritorno if porta else None, arrivo=arrivo, B=B, mV=mV)


def connesso(Z):
    T = Z["T"]
    if not (Z["arrivo"] and Z["porta"]):
        return None
    from collections import deque
    blocked = {(a[0], a[1]) for a in Z["alberi"] if a[2] == "tree"}
    seen = {Z["arrivo"]}
    q = deque([Z["arrivo"]])
    while q:
        i, j = q.popleft()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = i + di, j + dj
            if 0 <= a < W and 0 <= b < H and (a, b) not in seen and T[b, a] != "B" and (a, b) not in blocked:
                seen.add((a, b))
                q.append((a, b))
    reach = {k: (v in seen) for k, v in (("porta", Z["porta"]), ("ritorno", Z["ritorno"]))}
    return reach, len(seen), int((T != "B").sum())


# ---------------------------------------------------------------------------------------------------------------------
# Strade vive: nomi delle vie per tessera, strisce pedonali, auto e motorini parcheggiati, passanti, panchine, cartelli.
# Tutto deterministico (seme = id della cella). Cosa è dato reale: nomi e tracciato delle vie, segmenti "crosswalk",
# aree verdi con nome, luoghi LUISS con indirizzo. Cosa è dedotto: quali tessere hanno auto/motorini/passanti (densità plausibile).
# ---------------------------------------------------------------------------------------------------------------------
from shapely import STRtree

CLASSI_CARR = set(LARGHEZZA) | {"service"}
CLASSI_PED = {"pedestrian", "footway", "path", "steps", "track", "cycleway"}
PARCHI_NOMINATI = {"park", "garden", "playground", "dog_park", "recreation_ground", "village_green"}
ALFABETO = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
COL_AUTO = ["#e8e6e0", "#e8e6e0", "#c9ccd1", "#c9ccd1", "#8a9097", "#8a9097", "#3a3f47", "#26292e", "#2f4a7a", "#8f2f33", "#3d6b4f", "#b5aea0", "#d4b64e"]
COL_MOTO = ["#e8bc45", "#c9473f", "#3f6fb0", "#2f2f33", "#d9d6cd", "#5d9b6b"]

# Luoghi istituzionali LUISS (id Overture) con nome e indirizzo come nei dati. Nessuna attività privata, nessun professionista.
LUOGHI_LUISS = {
    "bd92cae0-3649-4430-8d3b-73b5c369938d": ("Biblioteca LUISS Guido Carli", "Via di Santa Costanza"),
    "8b41f5ee-5ae4-4bc1-a088-07b0d0b899fe": ("LUISS Sport", "Via Tommaso Salvini, 2"),
    "4fcc2712-f8f6-4f7b-aa9c-0be39ec12548": ("LUISS University", "Via di Villa Emiliani, 14"),
    "6e17f801-d77b-485b-b7c3-71383f2e0650": ("LUISS University", "Via Gualtiero Castellini"),
}


def nome_ok(n):
    if not isinstance(n, str):
        return False
    n = n.strip()
    if not n or " - " in n or "(" in n or n.startswith(("Metro", "Ferrovia", "Bahnstrecke", "Corridoio", "Raccordo", "Prolungamento", "Predisposizione")):
        return False
    return all(ord(ch) < 0x250 or ch in "’–" for ch in n)


_LIN = None


def linee():
    global _LIN
    if _LIN is None:
        carr, ped = [], []
        for f in STRADE:
            p = f["properties"]
            c, sc = p["classe"], p["sottoclasse"]
            if not nome_ok(p["nome"]) or not isinstance(c, str):
                continue
            g = geom(f)
            if c in CLASSI_CARR and sc not in ("parking_aisle", "driveway"):
                carr.append((g, p["nome"].strip()))
            elif c in CLASSI_PED:
                ped.append((g, p["nome"].strip()))
        _LIN = (carr, ped, STRtree([g for g, _ in carr]), STRtree([g for g, _ in ped]))
    return _LIN


def centri_tessere(spec):
    cx, cy = spec["centro_m"]
    xs = cx + (np.arange(W) + 0.5 - W / 2) * SCALA
    ys = cy + (H / 2 - (np.arange(H) + 0.5)) * SCALA
    return np.meshgrid(xs, ys)


def piu_vicino(albero, voci, pts, massimo):
    ind, dist = albero.query_nearest(pts, max_distance=massimo, return_distance=True, all_matches=False)
    nomi = np.full(len(pts), None, dtype=object)
    d = np.full(len(pts), 1e9)
    for k, i in enumerate(ind[0]):
        nomi[i] = voci[ind[1][k]][1]
        d[i] = dist[k]
    return nomi, d


def nomi_tessere(Z, spec):
    """Per ogni tessera il nome della via (o del parco) in cui ci si trova. Ritorna (elenco nomi, stringa RLE, via dominante, quota di parco nominato)."""
    carr, ped, tc, tp = linee()
    X, Y = centri_tessere(spec)
    pts = shapely.points(X.ravel(), Y.ravel())
    nc, dc = piu_vicino(tc, carr, pts, 30)
    npd, dp = piu_vicino(tp, ped, pts, 30)
    T = Z["T"]
    cx, cy = spec["centro_m"]
    area = box(cx - W / 2 * SCALA - 30, cy - H / 2 * SCALA - 30, cx + W / 2 * SCALA + 30, cy + H / 2 * SCALA + 30)
    # parchi con nome, dal più grande al più piccolo (il più piccolo, cioè più specifico, vince)
    parchi = [(geom(f), f["properties"]["nome"].strip()) for f in SUOLO
              if f["properties"]["classe"] in PARCHI_NOMINATI and nome_ok(f["properties"].get("nome")) and geom(f).intersects(area)]
    parchi.sort(key=lambda a: -a[0].area)
    nome_parco = np.full((H, W), None, dtype=object)
    for g, n in parchi:
        m = shapely.contains_xy(g, X, Y)
        nome_parco[m] = n
    out = np.full(H * W, None, dtype=object)
    Tf = T.ravel()
    pf = nome_parco.ravel()
    for k in range(H * W):
        t = Tf[k]
        if t == "B":
            out[k] = "?"
        elif t == "r":
            out[k] = nc[k] or npd[k]
        elif t == "p":
            out[k] = nc[k] if dc[k] <= 20 else (npd[k] if dp[k] <= 12 else pf[k])
        else:
            out[k] = pf[k] or (nc[k] if dc[k] <= 25 else (npd[k] if dp[k] <= 15 else None))
    # quota di verde nominato e via dominante
    nonB = (Tf != "B")
    quota = float(np.mean([pf[k] is not None for k in range(H * W) if nonB[k]])) if nonB.any() else 0.0
    conteggio = {}
    for k in range(H * W):
        if out[k] not in (None, "?"):
            conteggio[out[k]] = conteggio.get(out[k], 0) + 1
    ordine = [n for n, _ in sorted(conteggio.items(), key=lambda kv: -kv[1])][:len(ALFABETO)]
    stradale = {}
    for k in range(H * W):
        if Tf[k] == "r" and out[k] in ordine:
            stradale[out[k]] = stradale.get(out[k], 0) + 1
    dominante = max(stradale.items(), key=lambda kv: kv[1])[0] if stradale else (ordine[0] if ordine else None)
    codice = {n: ALFABETO[i] for i, n in enumerate(ordine)}
    seq = []
    prev = "_"
    for k in range(H * W):
        v = out[k]
        if v == "?":
            ch = prev                      # le tessere-edificio non si calpestano: seguono la precedente (RLE più corto)
        else:
            ch = codice.get(v, "_") if v is not None else "_"
        seq.append(ch)
        prev = ch
    rle = []
    i = 0
    while i < len(seq):
        j = i
        while j < len(seq) and seq[j] == seq[i]:
            j += 1
        rle.append(seq[i] + str(j - i))
        i = j
    return ordine, "".join(rle), dominante, quota, nome_parco


def strisce_pedonali(Z, spec):
    """Segmenti 'crosswalk' veri -> rettangoli (x, y, w, h) orientati lungo l'attraversamento, sempre su tessere stradali."""
    cx, cy = spec["centro_m"]
    x0m, y0m = cx - W / 2 * SCALA, cy + H / 2 * SCALA
    T = Z["T"]
    out = []
    for f in STRADE:
        p = f["properties"]
        if p["classe"] != "footway" or p["sottoclasse"] != "crosswalk":
            continue
        g = geom(f)
        if g.is_empty or g.geom_type != "LineString":
            continue
        mx, my = g.interpolate(0.5, normalized=True).coords[0]
        i, j = int((mx - x0m) // SCALA), int((y0m - my) // SCALA)
        if not (3 <= i < W - 3 and 3 <= j < H - 3):
            continue
        (ax, ay), (bx, by) = g.coords[0], g.coords[-1]
        dx, dy = bx - ax, by - ay
        lung = max(2, int(round(g.length / SCALA)) + 1)
        L = min(6, max(3, lung))
        if abs(dy) >= abs(dx):          # si cammina da nord a sud: strisce lunghe in verticale
            w, h = 2, L
            xx, yy = i - 1, j - L // 2
        else:
            w, h = L, 2
            xx, yy = i - L // 2, j - 1
        if xx < 1 or yy < 1 or xx + w >= W - 1 or yy + h >= H - 1:
            continue
        zona = T[yy:yy + h, xx:xx + w]
        if (zona == "B").any() or (zona == "r").sum() < max(2, w * h // 2):
            continue
        if any(not (xx + w <= a or a + c <= xx or yy + h <= b or b + d <= yy) for a, b, c, d in out):
            continue
        out.append((xx, yy, w, h))
    return out


def componente(Z, occ, partenza):
    """Tessere raggiungibili a piedi da 'partenza' (4-connessione) fuori dalle tessere occupate."""
    from collections import deque
    seen = np.zeros((H, W), bool)
    if partenza is None:
        return seen
    i, j = partenza
    if occ[j, i]:
        return seen
    seen[j, i] = True
    q = deque([(i, j)])
    while q:
        a, b = q.popleft()
        for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            x, y = a + da, b + db
            if 0 <= x < W and 0 <= y < H and not seen[y, x] and not occ[y, x]:
                seen[y, x] = True
                q.append((x, y))
    return seen


def luoghi_luiss(spec, Z):
    """Cartelli informativi accanto agli edifici veri dei luoghi LUISS (solo nome e indirizzo, come nei dati)."""
    cx, cy = spec["centro_m"]
    x0m, y0m = cx - W / 2 * SCALA, cy + H / 2 * SCALA
    T = Z["T"]
    out = []
    for f in LUOGHI:
        p = f["properties"]
        if p["id"] not in LUOGHI_LUISS:
            continue
        mx, my = f["geometry"]["coordinates"]
        i, j = int((mx - x0m) // SCALA), int((y0m - my) // SCALA)
        if not (0 <= i < W and 0 <= j < H):
            continue
        nome, ind = LUOGHI_LUISS[p["id"]]
        best = None
        for jj in range(2, H - 2):
            for ii in range(2, W - 2):
                if T[jj, ii] not in ("p", "."):
                    continue
                if not (T[jj - 1:jj + 2, ii - 1:ii + 2] == "B").any():
                    continue
                if any(a[0] == ii and a[1] == jj for a in Z["alberi"] if a[2] == "tree"):
                    continue
                d = (ii - i) ** 2 + (jj - j) ** 2
                if best is None or d < best[0]:
                    best = (d, ii, jj)
        if best and best[0] <= 14 ** 2:
            out.append([best[1], best[2], nome, ind])
    return out


def vita(id_zona, spec, Z, nome_parco, quota_parco, partenza):
    rnd = random.Random("vita-" + id_zona)
    T = Z["T"]
    # tessere occupate: edifici, alberi solidi, fontane
    occ = (T == "B")
    for a in Z["alberi"]:
        if a[2] == "tree":
            occ[a[1], a[0]] = True
    for (a, b) in Z["stagni"]:
        occ[b:b + 2, a:a + 2] = True
    prot = [tuple(p) for p in (Z["porta"], Z["ritorno"], Z["arrivo"], Z.get("cancello"), Z.get("ingresso")) if p]
    prot += [(s[0], s[1]) for s in Z["insegne"]]
    luoghi = luoghi_luiss(spec, Z)
    prot += [(l[0], l[1]) for l in luoghi]
    zebre = strisce_pedonali(Z, spec)

    def vicino_prot(x, y, raggio):
        return any(max(abs(x - a), abs(y - b)) <= raggio for a, b in prot)

    def su_zebra(x, y, margine=1):
        return any(a - margine <= x < a + w + margine and b - margine <= y < b + h + margine for a, b, w, h in zebre)

    def anello_ok(celle):
        cs = set(celle)
        xs = [c[0] for c in celle]
        ys = [c[1] for c in celle]
        ring = set()
        for y in range(min(ys) - 1, max(ys) + 2):
            for x in range(min(xs) - 1, max(xs) + 2):
                if (x, y) in cs:
                    continue
                if 0 <= x < W and 0 <= y < H and not occ[y, x]:
                    ring.add((x, y))
        if not ring:
            return True
        start = next(iter(ring))
        seen = {start}
        q = [start]
        while q:
            a, b = q.pop()
            for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (a + da, b + db)
                if n in ring and n not in seen:
                    seen.add(n)
                    q.append(n)
        return len(seen) == len(ring)

    R = (T == "r")
    marg = lambda y, x: T[y, x] in ("p", ".")
    auto = []
    for y in range(3, H - 3):
        x = 3
        while x < W - 5:
            scelta = None
            if R[y, x] and R[y, x + 1]:
                # curva nord (cars guardano a ovest, rotazione 180): richiede carreggiata di almeno 2 tessere sotto
                if marg(y - 1, x) and marg(y - 1, x + 1) and T[y - 1, x - 1] != "r" and T[y - 1, x + 2] != "r" and R[y + 1, x] and R[y + 1, x + 1]:
                    scelta = (x, y, 2, 1, 180)
                # curva sud (guardano a est): carreggiata di almeno 3 tessere
                elif marg(y + 1, x) and marg(y + 1, x + 1) and T[y + 1, x - 1] != "r" and T[y + 1, x + 2] != "r" and R[y - 1, x] and R[y - 1, x + 1] and R[y - 2, x] and R[y - 2, x + 1]:
                    scelta = (x, y, 2, 1, 0)
            if scelta and rnd.random() < 0.7:
                _, _, w, h, rot = scelta
                celle = [(x, y), (x + 1, y)]
                if (not any(occ[b, a] for a, b in celle) and not any(vicino_prot(a, b, 3) or su_zebra(a, b) for a, b in celle) and anello_ok(celle)):
                    auto.append([x, y, rot, rnd.randrange(len(COL_AUTO))])
                    for a, b in celle:
                        occ[b, a] = True
                    x += 2 + rnd.randint(0, 2)
                    continue
            x += 1
    # auto lungo le strade verticali
    for x in range(3, W - 3):
        y = 3
        while y < H - 5:
            scelta = None
            if R[y, x] and R[y + 1, x]:
                if marg(y, x - 1) and marg(y + 1, x - 1) and T[y - 1, x - 1] != "r" and T[y + 2, x - 1] != "r" and R[y, x + 1] and R[y + 1, x + 1]:
                    scelta = 90        # curva ovest: guardano a sud
                elif marg(y, x + 1) and marg(y + 1, x + 1) and T[y - 1, x + 1] != "r" and T[y + 2, x + 1] != "r" and R[y, x - 1] and R[y + 1, x - 1] and R[y, x - 2] and R[y + 1, x - 2]:
                    scelta = 270       # curva est: guardano a nord
            if scelta and rnd.random() < 0.7:
                celle = [(x, y), (x, y + 1)]
                if (not any(occ[b, a] for a, b in celle) and not any(vicino_prot(a, b, 3) or su_zebra(a, b) for a, b in celle) and anello_ok(celle)):
                    auto.append([x, y, scelta, rnd.randrange(len(COL_AUTO))])
                    for a, b in celle:
                        occ[b, a] = True
                    y += 2 + rnd.randint(0, 2)
                    continue
            y += 1
    auto = auto[:110]

    # motorini sul marciapiede, a ridosso della strada, radi
    moto = []
    for y in range(3, H - 3):
        for x in range(3, W - 3):
            if T[y, x] != "p" or occ[y, x] or rnd.random() > 0.05 or len(moto) >= 8:
                continue
            vicini_r = [(dx, dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if T[y + dy, x + dx] == "r"]
            if len(vicini_r) != 1:
                continue
            if vicino_prot(x, y, 3) or su_zebra(x, y) or any(abs(x - m[0]) + abs(y - m[1]) < 5 for m in moto):
                continue
            if not anello_ok([(x, y)]):
                continue
            dx, dy = vicini_r[0]
            rot = rnd.choice((0, 180)) if dy else rnd.choice((90, 270))
            moto.append([x, y, rot, rnd.randrange(len(COL_MOTO))])
            occ[y, x] = True

    # panchine nelle zone verdi (accanto ai sentieri veri e alle fontane)
    panchine = []
    nonB = int((T != "B").sum())
    verde = float(((T == ".") | (T == "a")).sum()) / max(1, nonB)
    albero_occ = {(a[0], a[1]) for a in Z["alberi"] if a[2] == "tree"}
    pini = [a for a in Z["alberi"] if a[2] == "pine"]

    def libero_verde(x, y):
        return 1 <= x < W - 1 and 1 <= y < H - 1 and T[y, x] == "." and not occ[y, x] and not any(a[0] <= x < a[0] + 3 and a[1] <= y < a[1] + 3 for a in pini)

    if verde >= 0.45 or Z["stagni"]:
        cand = []
        for y in range(3, H - 3):
            for x in range(3, W - 4):
                if T[y, x] == "a" and T[y, x + 1] == "a" and T[y, x - 1] == "a":
                    for dy in (-1, 1):
                        if libero_verde(x, y + dy) and libero_verde(x + 1, y + dy):
                            cand.append((x, y + dy, 0))
                            break
        for (a, b) in Z["stagni"]:
            for dx, dy in ((-3, 0), (3, 0), (-1, 3), (-1, -2)):
                if libero_verde(a + dx, b + dy) and libero_verde(a + dx + 1, b + dy):
                    cand.append((a + dx, b + dy, 0))
        rnd.shuffle(cand)
        for x, y, rot in cand:
            if len(panchine) >= (10 if verde >= 0.45 else 3):
                break
            if any(abs(x - p[0]) + abs(y - p[1]) < 14 for p in panchine) or vicino_prot(x, y, 2):
                continue
            if occ[y, x] or occ[y, x + 1]:
                continue
            panchine.append([x, y, rot])
            occ[y, x] = occ[y, x + 1] = True

    # cartelli dei parchi con nome: sul prato vicino a marciapiede/strada, uno per parco, max 2 per cella
    cartelli_parco = []
    visti = set()
    cmx, cmy = W / 2, H / 2
    cand = []
    for y in range(2, H - 2):
        for x in range(2, W - 2):
            n = nome_parco[y, x]
            if n is None or T[y, x] != "." or occ[y, x] or (x, y) in albero_occ:
                continue
            if not ((T[y - 1:y + 2, x - 1:x + 2] == "p") | (T[y - 1:y + 2, x - 1:x + 2] == "r")).any():
                continue
            cand.append((abs(x - cmx) + abs(y - cmy), x, y, n))
    cand.sort()
    for _, x, y, n in cand:
        if n in visti or len(cartelli_parco) >= 2 or vicino_prot(x, y, 2):
            continue
        visti.add(n)
        cartelli_parco.append([x, y, n])
        occ[y, x] = True

    # passanti: solo dove c'è abbastanza marciapiede e non nei grandi parchi
    pedoni = []
    camm = componente(Z, occ, partenza)
    sp = (T == "p") | (T == "a")
    ok = sp & ~occ & camm
    n_sp = int(ok.sum())
    quanti = 0 if (quota_parco > 0.55 or verde > 0.7) else min(6, n_sp // 220)
    tentativi = 0
    while len(pedoni) < quanti and tentativi < 600:
        tentativi += 1
        x, y = rnd.randrange(3, W - 3), rnd.randrange(3, H - 3)
        if not ok[y, x] or vicino_prot(x, y, 3):
            continue
        for dx, dy in rnd.sample([(1, 0), (0, 1), (-1, 0), (0, -1)], 4):
            lung = 0
            while lung < 10 and 0 <= x + dx * (lung + 1) < W and 0 <= y + dy * (lung + 1) < H and ok[y + dy * (lung + 1), x + dx * (lung + 1)]:
                lung += 1
            if lung >= 5:
                ex, ey = x + dx * lung, y + dy * lung
                if any(abs(x - p[0]) + abs(y - p[1]) < 12 for p in pedoni):
                    break
                pedoni.append([x, y, ex, ey, rnd.randrange(100), round(rnd.uniform(0.8, 1.3), 2)])
                break

    return dict(auto=auto, moto=moto, strisce=[list(z) for z in zebre], panchine=panchine, parchi=cartelli_parco, pedoni=pedoni, luoghi=luoghi, verde=round(verde, 2))


def esporta(risultati, vicini):
    out = {}
    for idz, (spec, Z) in risultati.items():
        out[idz] = {
            "nome": spec["nome"], "w": W, "h": H, "scala": SCALA, "centro": [round(CLON + spec["centro_m"][0] / KLON, 6), round(CLAT + spec["centro_m"][1] / KLAT, 6)],
            "righe": ["".join(r) for r in Z["T"]],
            "edifici": Z["edifici"], "alberi": Z["alberi"], "lampioni": [list(p) for p in Z["lampioni"]],
            "insegne": Z["insegne"], "stagni": [list(p) for p in Z["stagni"]],
            "porta": [int(v) for v in Z["porta"]] if Z["porta"] else None, "ritorno": [int(v) for v in Z["ritorno"]] if Z["ritorno"] else None,
            "arrivo": [int(v) for v in Z["arrivo"]] if Z["arrivo"] else None,
            "cancello": [int(v) for v in Z["cancello"]] if Z.get("cancello") else None,
            "ingresso": [int(v) for v in Z["ingresso"]] if Z.get("ingresso") else None,
            "vicini": vicini[idz],
            "nomi": Z.get("nomi", []), "via": Z.get("via", ""),
            "auto": Z.get("auto", []), "moto": Z.get("moto", []), "strisce": Z.get("strisce", []), "panchine": Z.get("panchine", []),
            "parchi": Z.get("parchi", []), "pedoni": Z.get("pedoni", []), "luoghi": Z.get("luoghi", []), "tag": Z.get("tag", []),
        }
    js = ("// File generato da scripts/overture/to-zone.py (dati: Overture Maps, release 2026-11-18.0). Non modificare a mano.\n"
          "// Righe: . prato, p spiazzo/marciapiede, r strada, a sentiero, B edificio. Celle da %dx%d tessere, %.0f m per tessera, contigue.\n"
          "function quartiereDati(){return " % (W, H, SCALA) + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";}\n")
    with open(os.path.join(ROOT, "src", "quartiere-dati.js"), "w") as f:
        f.write(js)
    return len(js)


def anteprima(risultati, cartella):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.patches import Rectangle
    os.makedirs(cartella, exist_ok=True)
    col = {".": "#7fae69", "p": "#cfc4ad", "r": "#5d6166", "a": "#b9a283", "B": "#b4684f"}
    for idz, (spec, Z) in risultati.items():
        fig, ax = plt.subplots(figsize=(11, 9))
        img = np.zeros((H, W, 3))
        for k, c in col.items():
            m = Z["T"] == k
            img[m] = [int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        ax.imshow(img, interpolation="nearest")
        for e in Z["edifici"]:
            ax.add_patch(Rectangle((e["x"] - .5, e["y"] - .5), e["w"], e["h"], fc=e["c"], ec="#4a2a20", lw=.5))
            if e["k"] == "f":
                ax.add_patch(Rectangle((e["x"] - .5, e["y"] - .5), e["w"], e["h"], fc="#7a3b2b", ec="k", lw=1.2))
        for a in Z["alberi"]:
            ax.plot(a[0] + (1 if a[2] == "pine" else 0), a[1] + (1 if a[2] == "pine" else 0), "o", color="#2f6b3a", ms=5 if a[2] == "pine" else 3)
        for l in Z["lampioni"]:
            ax.plot(l[0], l[1], "*", color="#ffd84a", ms=5)
        for s in Z["insegne"]:
            ax.plot(s[0], s[1], "s", color="#2a56a8", ms=4)
            ax.text(s[0] + 1, s[1], s[2], fontsize=6)
        for nome, pt, c in (("porta", Z["porta"], "#ff2d2d"), ("arrivo", Z["arrivo"], "#00b3ff")):
            if pt:
                ax.plot(pt[0], pt[1], "D", color=c, ms=8)
                ax.text(pt[0] + 1, pt[1] - 1, nome, fontsize=8, color=c)
        ax.set_title(spec["nome"] + " — raster %dx%d, %.0f m/tessera" % (W, H, SCALA))
        ax.set_xticks([]); ax.set_yticks([])
        fig.tight_layout()
        fig.savefig(os.path.join(cartella, "zona-" + idz + ".png"), dpi=100)
        plt.close(fig)


def libera_vicino(Z, t, raggio=8):
    """Tessera percorribile (marciapiede o prato) più vicina a t."""
    T = Z["T"]
    for r in range(raggio):
        for dj in range(-r, r + 1):
            for di in range(-r, r + 1):
                if max(abs(di), abs(dj)) != r:
                    continue
                i, j = t[0] + di, t[1] + dj
                if 0 <= i < W and 0 <= j < H and T[j, i] in ("p", ".") and not any(a[0] == i and a[1] == j for a in Z["alberi"]):
                    return (i, j)
    return None


if __name__ == "__main__":
    ris = {}
    vicini = {}
    idx = {cr: id_cella(*cr) for cr in CELLE}
    print("celle", len(CELLE), "colonne", COL0 - 1, "-", COL1 + 1, "righe", RIG0 - 1, "-", RIG1 + 1, "pola", CPOLA, "parenzo", CPAR, "romania", CROM)
    for (c, r) in CELLE:
        idz = idx[(c, r)]
        cx, cy = centro_cella(c, r)
        spec = {"centro_m": (cx, cy), "nome": "", "pini": 0.2}
        if idz == "pola":
            spec.update(nome="Viale Pola 12 · Villa Alberoni", chiave=[PUNTI["pola"]], pini=0.35)
        elif idz == "parenzo":
            spec.update(nome="Via Parenzo 11 · Giurisprudenza", chiave=[PUNTI["parenzo"]], pini=0.1)
        Z = costruisci(idz, spec)
        ordine, rle, dominante, quota, nome_parco = nomi_tessere(Z, spec)
        Z["nomi"], Z["via"] = ordine, rle
        if not spec["nome"]:
            if quota > 0.45:
                # cella in gran parte dentro un parco con nome: il parco più frequente dà il nome alla zona
                conta = {}
                for n in nome_parco.ravel():
                    if n is not None:
                        conta[n] = conta.get(n, 0) + 1
                spec["nome"] = max(conta.items(), key=lambda kv: kv[1])[0]
            else:
                spec["nome"] = "Parioli · " + (dominante or Z["strada_vicina"] or "isolati")
        ex = vita(idz, spec, Z, nome_parco, quota, Z.get("ingresso"))
        Z.update(ex)
        tag = []
        if any(("luiss" in str(f["properties"].get("nome")).lower()) for f in SUOLO if f["properties"]["classe"] == "university" and geom(f).intersects(box(spec["centro_m"][0] - W * SCALA / 2, spec["centro_m"][1] - H * SCALA / 2, spec["centro_m"][0] + W * SCALA / 2, spec["centro_m"][1] + H * SCALA / 2))):
            tag.append("luiss")
        if ex["luoghi"] and "luiss" not in tag:
            tag.append("luiss")
        if quota > 0.2 or ex["verde"] > 0.5:
            tag.append("verde")
        Z["tag"] = tag
        if (c, r) == CROM:
            t = tessera_in_cella(c, r, PUNTI["romania"][1], PUNTI["romania"][2])
            Z["cancello"] = libera_vicino(Z, t)
        vicini[idz] = {d: idx.get((c + dc, r + dr)) for d, (dc, dr) in {"n": (0, -1), "s": (0, 1), "e": (1, 0), "w": (-1, 0)}.items() if idx.get((c + dc, r + dr))}
        ris[idz] = (spec, Z)
        cn = connesso(Z)
        print(idz, spec["nome"], "| edifici", len(Z["edifici"]), "alberi", len(Z["alberi"]), "lampioni", len(Z["lampioni"]), "insegne", len(Z["insegne"]),
              "porta", Z["porta"], "arrivo", Z["arrivo"], "cancello", Z.get("cancello"), "conn", cn)
    print("byte scritti", esporta(ris, vicini))
    if len(sys.argv) > 1:
        anteprima(ris, sys.argv[1])
