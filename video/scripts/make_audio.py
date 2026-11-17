"""Synthesises the sound of the ad: sound effects and a 120 BPM music bed, with numpy only.

python3 scripts/make_audio.py  → public/sfx/*.wav and public/music/bed-<bars>.wav
"""
import os
import wave

import numpy as np

SR = 48000
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(7)
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")


def write(path, x, stereo=None):
    x = np.asarray(x, dtype=np.float64)
    if stereo is None:
        st = np.stack([x, x], axis=1)
    else:
        st = stereo
    peak = np.max(np.abs(st)) or 1
    st = st / peak * 0.89
    data = (st * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def t(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, a=0.002, d=0.2, curve=4.0):
    tt = np.arange(n) / SR
    att = np.clip(tt / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * np.clip(tt - a, 0, None) / max(d, 1e-4))
    return att * dec


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be an array (sweeps)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def noise(n):
    return rng.standard_normal(n)


# ───────────── sound effects ─────────────

def sfx():
    out = os.path.join(ROOT, "sfx")
    os.makedirs(out, exist_ok=True)

    # click: short bright tick
    n = int(0.05 * SR)
    x = highpass(noise(n), 2500) * env(n, 0.0005, 0.012) + np.sin(2 * np.pi * 2200 * t(0.05)) * env(n, 0.0005, 0.01) * 0.6
    write(f"{out}/click.wav", x)

    # pop: pitched bubble
    tt = t(0.14)
    f = 900 * np.exp(-tt * 18) + 380
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.07)
    write(f"{out}/pop.wav", x)

    # ding: notification, two partials
    tt = t(0.9)
    x = (np.sin(2 * np.pi * 1318.5 * tt) + 0.5 * np.sin(2 * np.pi * 1975.5 * tt) + 0.25 * np.sin(2 * np.pi * 2637 * tt)) * env(len(tt), 0.003, 0.5, 5)
    x2 = np.sin(2 * np.pi * 1760 * tt) * env(len(tt), 0.003, 0.4, 5)
    d = int(0.09 * SR)
    x[d:] += 0.8 * x2[: len(tt) - d]
    write(f"{out}/ding.wav", x)

    # whoosh: band-passed noise sweeping up then down
    tt = t(0.6)
    n = len(tt)
    sweep = 300 + 5200 * np.sin(np.pi * tt / tt[-1]) ** 2
    x = lowpass(highpass(noise(n), 200), sweep) * np.sin(np.pi * tt / tt[-1]) ** 1.5
    pan = np.linspace(-0.7, 0.7, n)
    write(f"{out}/whoosh.wav", None, np.stack([x * (1 - pan) / 2 + x * 0.3, x * (1 + pan) / 2 + x * 0.3], axis=1))

    # swish: short fast whoosh
    tt = t(0.28)
    n = len(tt)
    sweep = 800 + 7000 * (tt / tt[-1])
    x = lowpass(highpass(noise(n), 600), sweep) * np.sin(np.pi * tt / tt[-1]) ** 2
    write(f"{out}/swish.wav", x)

    # impact: sub boom + noise crack + tail
    tt = t(1.6)
    n = len(tt)
    f = 120 * np.exp(-tt * 9) + 38
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.9, 3.5)
    crack = lowpass(noise(n), 3500) * env(n, 0.0005, 0.08, 5) * 0.8
    tail = lowpass(noise(n), 900) * env(n, 0.01, 1.2, 4) * 0.25
    write(f"{out}/impact.wav", boom * 1.2 + crack + tail)

    # riser: noise + rising tone over one bar (2 s)
    tt = t(2.0)
    n = len(tt)
    prog = tt / tt[-1]
    x = lowpass(noise(n), 400 + 9000 * prog ** 2) * prog ** 2 * 0.8
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * prog ** 2) / SR) * prog ** 3 * 0.35
    write(f"{out}/riser.wav", x + tone)

    # type: a little burst of keyboard ticks (0.9 s)
    n = int(0.9 * SR)
    x = np.zeros(n)
    for k in range(12):
        p = int((k * 0.072 + rng.uniform(0, 0.02)) * SR)
        m = int(0.03 * SR)
        if p + m < n:
            x[p : p + m] += highpass(noise(m), 1800) * env(m, 0.0003, 0.008) * rng.uniform(0.5, 1)
    write(f"{out}/type.wav", x)

    # cut: camera switch, a short thump + tick
    tt = t(0.25)
    n = len(tt)
    x = np.sin(2 * np.pi * (90 * np.exp(-tt * 20) + 50) * tt) * env(n, 0.001, 0.08) + highpass(noise(n), 3000) * env(n, 0.0005, 0.01) * 0.5
    write(f"{out}/cut.wav", x)

    # lock: two mechanical clicks + confirm chime
    tt = t(0.7)
    n = len(tt)
    x = np.zeros(n)
    for p in (0, int(0.06 * SR)):
        m = int(0.04 * SR)
        x[p : p + m] += lowpass(noise(m), 2500) * env(m, 0.0003, 0.01)
    c = np.sin(2 * np.pi * 1046.5 * tt) * env(n, 0.003, 0.35, 5) * 0.5
    d = int(0.14 * SR)
    x[d:] += c[: n - d]
    write(f"{out}/lock.wav", x)


# ───────────── music bed ─────────────

NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)

# A minor-ish progression, one chord per bar: Am, F, C, G
PROG = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]
BASS = [45, 41, 48, 43]


def kick():
    tt = t(0.45)
    f = 150 * np.exp(-tt * 28) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.0008, 0.32, 4) * 1.0


def clap():
    n = int(0.3 * SR)
    x = np.zeros(n)
    for k, p in enumerate((0, 0.012, 0.024)):
        m = int(0.25 * SR)
        s = int(p * SR)
        x[s : s + m][: n - s] += highpass(lowpass(noise(m), 4000), 900)[: n - s] * env(m, 0.0005, 0.06 if k < 2 else 0.18)[: n - s]
    return x * 0.5


def hat(open_=False):
    n = int((0.2 if open_ else 0.06) * SR)
    return highpass(noise(n), 7000) * env(n, 0.0005, 0.12 if open_ else 0.02) * 0.25


def saw(freq, sec):
    tt = t(sec)
    ph = (freq * tt) % 1
    return 2 * ph - 1


def pad_chord(notes, sec):
    x = np.zeros(int(sec * SR))
    for m in notes:
        for det in (-0.12, 0.0, 0.12):
            x += saw(NOTE(m) * 2 ** (det / 12), sec)
    x = lowpass(x, 1400) / (len(notes) * 3)
    a = np.minimum(1, t(sec) / 0.25) * np.minimum(1, (sec - t(sec)) / 0.3)
    return x * a


def pluck(m, sec=0.25):
    tt = t(sec)
    x = saw(NOTE(m), sec)
    x = lowpass(x, 600 + 4000 * np.exp(-tt * 18))
    return x * env(len(tt), 0.001, 0.18, 4)


def bass_note(m, sec):
    tt = t(sec)
    x = np.sin(2 * np.pi * NOTE(m) * tt) + 0.35 * saw(NOTE(m), sec)
    x = lowpass(x, 500)
    return x * np.minimum(1, tt / 0.005) * np.minimum(1, (sec - tt) / 0.02)


def add(buf, x, at):
    s = int(at * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(x))
    buf[s:e] += x[: e - s]


def bed(bars, intensity_by_bar, name):
    """intensity: 0 = pad only, 1 = + hats/plucks, 2 = full beat. Returns stereo."""
    sec = bars * 4 * BEAT + 2.0
    L = np.zeros(int(sec * SR))
    R = np.zeros(int(sec * SR))
    k, c, ho, hc = kick(), clap(), hat(True), hat()
    for b in range(bars):
        lvl = intensity_by_bar(b)
        t0 = b * 4 * BEAT
        ch = PROG[b % 4]
        pad = pad_chord(ch, 4 * BEAT) * 0.32
        add(L, pad, t0)
        add(R, pad, t0)
        if lvl >= 1:
            for s in range(8):
                tt0 = t0 + s * BEAT / 2
                h = ho if s % 2 else hc
                add(L, h * 0.8, tt0)
                add(R, h, tt0)
            arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[3] + 12, ch[2] + 24]
            for s, m in enumerate(arp):
                p = pluck(m) * 0.22
                add(L, p * (0.6 if s % 2 else 1), t0 + s * BEAT / 2)
                add(R, p * (1 if s % 2 else 0.6), t0 + s * BEAT / 2)
        if lvl >= 2:
            for s in range(4):
                add(L, k, t0 + s * BEAT)
                add(R, k, t0 + s * BEAT)
            for s in (1, 3):
                add(L, c, t0 + s * BEAT)
                add(R, c, t0 + s * BEAT)
            for s in range(8):
                bn = bass_note(BASS[b % 4] - 12 + (12 if s in (3, 7) else 0), BEAT / 2 * 0.9) * 0.45
                add(L, bn, t0 + s * BEAT / 2)
                add(R, bn, t0 + s * BEAT / 2)
    # gentle glue: soft clip
    st = np.stack([L, R], axis=1)
    st = np.tanh(st * 1.4) / np.tanh(1.4)
    # fade out the extra tail
    n = len(st)
    fade = np.ones(n)
    tail = int(2.0 * SR)
    fade[-tail:] = np.linspace(1, 0, tail)
    st *= fade[:, None]
    os.makedirs(os.path.join(ROOT, "music"), exist_ok=True)
    write(os.path.join(ROOT, "music", f"{name}.wav"), None, st)


if __name__ == "__main__":
    import sys

    sfx()
    print("sfx ok")
    # The ad: hook bars 0-2 hats only, drop at bar 3, full until the end, breakdown on the outro.
    bed(34, lambda b: 1 if b < 3 else (2 if b < 31 else 1), "ad")
    bed(12, lambda b: 1 if b < 2 else (2 if b < 11 else 1), "short")
    print("music ok")
