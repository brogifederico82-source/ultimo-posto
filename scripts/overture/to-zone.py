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

LARGHEZZA = {"trunk": 14, "primary": 12, "secondary": 10, "tertiary": 8, "residential": 6, "unclassified": 6, "living_street": 5}
VERDE = {"park", "garden", "grass", "flowerbed", "meadow", "village_green", "playground", "dog_park", "recreation_ground", "allotments"}

ZONE = {
    "pola": {
        "nome": "Viale Pola 12 · Villa Alberoni",
        "centro": (12.51168, 41.91849),
        "chiave": [  # (nome, lon, lat) edifici da evidenziare
            ("Villa Alberoni · Sede storica LUISS", 12.51145, 41.91868),
        ],
        "porta": "Villa Alberoni",
        "strada": "Viale Pola",
        "pini": 0.35,
    },
    "parenzo": {
        "nome": "Via Parenzo 11 · Giurisprudenza",
        "centro": (12.51309, 41.92180),
        "chiave": [
            ("Facoltà di Giurisprudenza · Via Parenzo 11", 12.51309, 41.92180),
        ],
        "porta": "Facoltà di Giurisprudenza",
        "strada": "Via Parenzo",
        "pini": 0.1,
    },
}

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
    cx, cy = pm(*spec["centro"])
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
        if g.intersects(area) and g.area > 20:
            c = g.centroid
            i = int((c.x - (cx - W / 2 * SCALA)) // SCALA)
            j = int(((cy + H / 2 * SCALA) - c.y) // SCALA)
            if 0 <= i < W - 2 and 0 <= j < H - 2:
                stagni.append((i, j))

    # edifici -> rettangoli
    chiavi = []
    for nome, lo, la in spec["chiave"]:
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
                tipo = "pine" if rnd.random() < spec["pini"] else "tree"
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
    return dict(T=T, edifici=edifici, alberi=alberi, lampioni=lampioni, insegne=insegne, stagni=stagni,
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


def esporta(risultati):
    out = {}
    for idz, (spec, Z) in risultati.items():
        out[idz] = {
            "nome": spec["nome"], "w": W, "h": H, "scala": SCALA, "centro": [spec["centro"][1], spec["centro"][0]],
            "righe": ["".join(r) for r in Z["T"]],
            "edifici": Z["edifici"], "alberi": Z["alberi"], "lampioni": [list(p) for p in Z["lampioni"]],
            "insegne": Z["insegne"], "stagni": [list(p) for p in Z["stagni"]],
            "porta": [int(v) for v in Z["porta"]] if Z["porta"] else None, "ritorno": [int(v) for v in Z["ritorno"]] if Z["ritorno"] else None,
            "arrivo": [int(v) for v in Z["arrivo"]] if Z["arrivo"] else None,
        }
    js = ("// File generato da scripts/overture/to-zone.py (dati: Overture Maps, release 2026-11-18.0). Non modificare a mano.\n"
          "// Righe: . prato, p spiazzo/marciapiede, r strada, a sentiero, B edificio.\n"
          "function quartiereDati(){return " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";}\n")
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


if __name__ == "__main__":
    ris = {}
    for idz, spec in ZONE.items():
        Z = costruisci(idz, spec)
        ris[idz] = (spec, Z)
        c = connesso(Z)
        print(idz, "edifici-rettangoli", len(Z["edifici"]), "alberi", len(Z["alberi"]), "lampioni", len(Z["lampioni"]),
              "insegne", len(Z["insegne"]), "stagni", len(Z["stagni"]), "porta", Z["porta"], "arrivo", Z["arrivo"], "connessione", c)
    print("byte scritti", esporta(ris))
    if len(sys.argv) > 1:
        anteprima(ris, sys.argv[1])
