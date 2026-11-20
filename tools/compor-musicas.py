"""3 trilhas originais para tocar em loop na live do TikCity (sintetizadas, sem direitos de terceiros).
Uso: python compor-musicas.py PASTA_SAIDA   -> gera musica-1.wav, musica-2.wav, musica-3.wav (loops perfeitos)"""
import sys, wave, numpy as np
SR = 44100
OUT = sys.argv[1]

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a=0.005, d=0.25, sus=0.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * (sus + (1 - sus) * np.exp(-t / d))
    r = min(n, int(SR * 0.03)); e[-r:] *= np.linspace(1, 0, r)
    return e

class Mix:
    def __init__(s, dur): s.N = int(SR * dur); s.m = np.zeros((s.N + SR * 4, 2)); s.dur = dur
    def add(s, sig, at, g=1.0, pan=0.0):
        i = int(at * SR); j = min(len(s.m), i + len(sig)); x = sig[: j - i] * g
        s.m[i:j, 0] += x * (1 - pan) ** 0.5 * 0.9; s.m[i:j, 1] += x * (1 + pan) ** 0.5 * 0.9
    def loop(s):  # cauda volta para o início -> loop sem emenda
        o = s.m[: s.N].copy(); tail = s.m[s.N:]; o[: len(tail)] += tail; return o

# ---- instrumentos ----
def tone(f, n, harm):
    t = np.arange(n) / SR; return sum(a * np.sin(2 * np.pi * f * k * t) for k, a in harm)
def keys(m, dur, d=0.6):  # piano elétrico macio
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    s = tone(f, n, [(1, 1), (2, 0.25), (3, 0.08)]) * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t))
    s += 0.2 * np.sin(2 * np.pi * f * 7 * t) * np.exp(-t / 0.03)
    return s * env(n, 0.004, d, 0.15)
def marimba(m, dur=0.4, d=0.14):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.03) + 0.12 * np.sin(2 * np.pi * 10 * f * t) * np.exp(-t / 0.01)
    return s * env(n, 0.002, d)
def bell(m, dur=1.2, d=0.5):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t / 0.3))) * env(n, 0.002, d)
def pad(ms, dur):
    n = int(SR * dur); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for det in (-0.12, 0.12):
            f = hz(m + det); s += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    a = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    return s / len(ms) * a
def bass(m, dur, d=0.4):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t)) * env(n, 0.008, d, 0.3)
def pluckbass(m, dur):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.08)) * env(n, 0.004, 0.22)
rng = np.random.default_rng(7)
def kick(soft=1.0):
    n = int(SR * 0.3); t = np.arange(n) / SR; f = 110 * np.exp(-t / 0.035) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.1) * soft
def noise(n): return rng.standard_normal(n)
def hat(d=0.012):
    n = int(SR * 0.08); x = noise(n); x = x - np.convolve(x, np.ones(4) / 4, 'same')
    return x * np.exp(-np.arange(n) / SR / d) * 0.5
def snare(d=0.06):
    n = int(SR * 0.25); t = np.arange(n) / SR
    return (noise(n) * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t / d)
def rim():
    n = int(SR * 0.06); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1700 * t) + 0.5 * noise(n) * 0.3) * np.exp(-t / 0.008)
def shaker():
    n = int(SR * 0.09); x = noise(n); x = x - np.convolve(x, np.ones(3) / 3, 'same')
    return x * np.hanning(n) * 0.35

def melody_line(chords, seed, bars_per, steps, rest_p=0.3, lo=67, hi=86):
    """linha de melodia: anda por notas do acorde/escala, frases de 2 compassos"""
    r = np.random.default_rng(seed); cur = 76; out = []
    for c in chords:
        tones = sorted({n + 12 * o for n in c for o in (0, 1, 2) if lo <= n + 12 * o <= hi})
        bar = []
        for k in range(steps):
            if r.random() < rest_p and k % 2 == 1: bar.append(None); continue
            near = sorted(tones, key=lambda x: abs(x - cur) + r.random() * 4)
            cur = near[0] if r.random() < 0.6 else near[min(2, len(near) - 1)]
            bar.append(cur)
        out.append(bar)
    return out

def finish(mix, name, gain=0.5):
    x = mix.loop()
    x = np.tanh(x * 1.2) / np.tanh(1.2); x *= gain / np.max(np.abs(x))
    with wave.open(f"{OUT}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
    print(name, round(mix.dur, 1), "s")

# =============== 1) PRAÇA ENSOLARADA: bossa / lo-fi suave, 92 bpm ===============
def musica1():
    B = 60 / 92; bars = 32; mx = Mix(bars * 4 * B)
    prog = [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65],  # Cmaj7 Am7 Dm7 G7
            [64, 67, 71, 74], [57, 60, 64, 67], [65, 69, 72, 76], [55, 59, 62, 65]]  # Em7 Am7 Fmaj7 G7
    roots = [36, 33, 38, 31, 40, 33, 41, 31]
    mel = melody_line([prog[i % 8] for i in range(bars)], 11, 1, 8, 0.4)
    for b in range(bars):
        t0 = b * 4 * B; c = prog[b % 8]; r = roots[b % 8]
        # violão/teclado em ritmo de bossa
        for st in (0, 1.5, 3):
            mx.add(sum(keys(m, B * 1.4, 0.5) for m in c) / 3, t0 + st * B, 0.22, -0.2)
        mx.add(bass(r, B * 1.4), t0, 0.5); mx.add(bass(r + 7, B * 0.9), t0 + 2 * B, 0.4); mx.add(bass(r, B * 0.5), t0 + 3.5 * B, 0.3)
        if b >= 2:
            for k in range(4):
                mx.add(kick(0.7), t0 + k * B, 0.5 if k % 2 == 0 else 0.25)
                mx.add(rim(), t0 + (k + 0.75) * B if k % 2 else t0 + (k + 0.5) * B, 0.12, 0.3)
            for k in range(8): mx.add(shaker(), t0 + k * B / 2, 0.22 if k % 2 else 0.12, 0.4)
        if 4 <= b < 28 and not (12 <= b < 16):
            for k, m in enumerate(mel[b]):
                if m: mx.add(marimba(m, 0.6, 0.25), t0 + k * B / 2, 0.2, 0.25)
        if 12 <= b < 16 or b >= 28:
            for k, m in enumerate(mel[b]):
                if m and k % 2 == 0: mx.add(bell(m + 12, 1.5, 0.6), t0 + k * B / 2, 0.07, 0.3)
    finish(mx, "musica-1-praca-ensolarada")

# =============== 2) CIDADE DE BRINQUEDO: alegre, marimba e palmas, 112 bpm ===============
def musica2():
    B = 60 / 112; bars = 40; mx = Mix(bars * 4 * B)
    prog = [[60, 64, 67], [67, 71, 74], [69, 72, 76], [65, 69, 72]]  # C G Am F
    roots = [48, 43, 45, 41]
    mel = melody_line([prog[i % 4] for i in range(bars)], 23, 1, 8, 0.25, 69, 88)
    mel = [mel[b % 8] for b in range(bars)]  # tema repete a cada 8 compassos (fica na cabeça)
    for b in range(bars):
        t0 = b * 4 * B; c = prog[b % 4]; r = roots[b % 4]; sec = (b // 8) % 5
        for k in range(8):
            mx.add(marimba(c[k % 3] + (12 if k % 4 == 3 else 0), 0.35, 0.1), t0 + k * B / 2, 0.13, -0.35)
        for k in range(4):
            mx.add(pluckbass(r - 12 + (7 if k == 2 else 0), B * 0.9), t0 + k * B, 0.45)
        if sec != 0:
            for k in range(4):
                mx.add(kick(0.8), t0 + k * B, 0.45)
                mx.add(hat(), t0 + k * B + B / 2, 0.25, 0.3)
                if k in (1, 3): mx.add(snare(0.05), t0 + k * B, 0.18, -0.1)
        if sec in (1, 2, 4):
            for k, m in enumerate(mel[b]):
                if m: mx.add(marimba(m, 0.5, 0.2), t0 + k * B / 2, 0.22, 0.25)
        if sec == 3:
            for k, m in enumerate(mel[b]):
                if m and k % 2 == 0: mx.add(bell(m, 1.2, 0.45), t0 + k * B / 2, 0.1, 0.2)
            mx.add(pad([n - 12 for n in c], 4 * B), t0, 0.08)
    finish(mx, "musica-2-cidade-de-brinquedo")

# =============== 3) FIM DE TARDE: chillhop calmo, 78 bpm ===============
def musica3():
    B = 60 / 78; bars = 24; mx = Mix(bars * 4 * B)
    prog = [[65, 69, 72, 76], [64, 67, 71, 74], [62, 65, 69, 72], [60, 64, 67, 71]]  # Fmaj7 Em7 Dm7 Cmaj7
    roots = [41, 40, 38, 36]
    mel = melody_line([prog[i % 4] for i in range(bars)], 5, 1, 8, 0.5, 67, 84)
    for b in range(bars):
        t0 = b * 4 * B; c = prog[b % 4]; r = roots[b % 4]
        mx.add(pad(c, 4 * B + 0.3), t0, 0.12)
        mx.add(sum(keys(m, 2.5 * B, 0.9) for m in c) / 3, t0, 0.2, -0.15)
        mx.add(sum(keys(m, 1.5 * B, 0.7) for m in c[1:]) / 3, t0 + 2.5 * B, 0.14, -0.15)
        mx.add(bass(r, 2.4 * B, 0.7), t0, 0.5); mx.add(bass(r + 12 if b % 2 else r + 7, 1.4 * B, 0.5), t0 + 2.5 * B, 0.35)
        if 2 <= b < 22:
            mx.add(kick(0.8), t0, 0.55); mx.add(kick(0.6), t0 + 1.75 * B, 0.35); mx.add(kick(0.8), t0 + 2.5 * B, 0.45)
            mx.add(snare(0.09), t0 + B, 0.17, -0.1); mx.add(snare(0.09), t0 + 3 * B, 0.17, -0.1)
            for k in range(8): mx.add(hat(0.02), t0 + k * B / 2 + (0.06 if k % 2 else 0), 0.16 if k % 2 else 0.24, 0.3)
        if 4 <= b < 20:
            for k, m in enumerate(mel[b]):
                if m: mx.add(bell(m, 1.4, 0.5), t0 + k * B / 2, 0.11, 0.3)
    finish(mx, "musica-3-fim-de-tarde")

musica1(); musica2(); musica3()
