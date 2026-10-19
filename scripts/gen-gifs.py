#!/usr/bin/env python3
"""Generates the exercise GIFs in public/gifs/ (side-view stick figure, drawn from joint targets).

Usage: python3 scripts/gen-gifs.py [exercise-id ...]   (needs Pillow)
Re-run after editing a pose; commit the regenerated GIFs.
"""
import math, os, sys
from PIL import Image, ImageDraw

W, H, SS = 360, 300, 3
GY = 280
BG, GROUND, PROP = (246, 244, 238), (214, 208, 192), (200, 192, 172)
NEAR, FAR, SKIN, SHIRT, KID = (31, 111, 92), (122, 168, 152), (240, 200, 160), (224, 138, 44), (232, 120, 140)
K = 1.3
T, S_, TO, UA, FA, NECK, HEAD = 46 * K, 46 * K, 66 * K, 31 * K, 29 * K, 10 * K, 13 * K
REACH = T + S_
TOE = (16, 0)


def v(a, n):  # angle from vertical-up in degrees, + toward the facing direction (right)
    r = math.radians(a)
    return (n * math.sin(r), -n * math.cos(r))


def add(p, d): return (p[0] + d[0], p[1] + d[1])
def lerp(a, b, t): return a + (b - a) * t
def lerp2(p, q, t): return (lerp(p[0], q[0], t), lerp(p[1], q[1], t))
def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)


def ik(s, t, a, b, bend=1):
    dx, dy = t[0] - s[0], t[1] - s[1]
    d = max(1e-6, min(math.hypot(dx, dy), a + b - 1e-3))
    ca = (a * a + d * d - b * b) / (2 * a * d)
    ang = math.atan2(dy, dx) + bend * math.acos(max(-1, min(1, ca)))
    return (s[0] + a * math.cos(ang), s[1] + a * math.sin(ang))


def foot(x, y=GY, toe=TOE): return ((x, y), toe)


def build(hip, sh, head, feet, hands, kb=(-1, -1), eb=(1, 1), knees=(None, None), mid=None, back=(), front=()):
    J = dict(hip=hip, sh=sh, head=head, mid=mid, back=back, front=front)
    for i, n in enumerate(('', '2')):
        a, toe = feet[i]
        J['knee' + n] = knees[i] or ik(hip, a, T, S_, kb[i])
        J['foot' + n], J['toe' + n] = a, toe
        J['el' + n] = ik(sh, hands[i], UA, FA, eb[i])
        J['hand' + n] = hands[i]
    return J


def arm_to(sh, ang, r=74): return add(sh, v(ang, r))
def head_of(sh, ang): return add(sh, v(ang, NECK + HEAD))


# ---------------------------------------------------------------- poses
def squat(t, kid=False):
    k = ease(t)
    hip = (lerp(176, 150, k), lerp(GY - 116, GY - 62, k))
    lean = lerp(0, 38, k)
    sh = add(hip, v(lean, TO))
    a = lerp(172, 94, k)
    hands = [arm_to(sh, a)] * 2
    front = ()
    if kid:
        hands = [add(sh, (46, 30))] * 2
        front = (lambda d, s, bone: kid_upright(d, s, add(sh, (50, 22))),)
    return build(hip, sh, head_of(sh, lean), [foot(180), foot(172)], hands, front=front)


def kid_upright(d, s, c):
    for p, q, w in (((c[0], c[1] - 10), (c[0], c[1] + 18), 16),):
        d.line([s(p), s(q)], fill=KID, width=w * SS)
    r = 10 * SS
    cc = s((c[0], c[1] - 22))
    d.ellipse([cc[0] - r, cc[1] - r, cc[0] + r, cc[1] + r], fill=SKIN, outline=KID, width=2 * SS)


def back_lunge(t):
    k = ease(t)
    hip = (lerp(176, 164, k), lerp(GY - 116, GY - 76, k))
    sh = add(hip, v(lerp(0, 6, k), TO))
    rear = (lerp(172, 112, k), lerp(GY, GY - 18, k))
    return build(hip, sh, head_of(sh, 6 * k), [foot(190), (rear, (14, 16) if k > 0.5 else TOE)],
                 [arm_to(sh, 172)] * 2, kb=(-1, -1))


def hip_lift(t):
    k = ease(t)
    shp = (52, GY - 10)
    phi = math.radians(lerp(0, 34, k))
    hip = (shp[0] + TO * math.cos(phi), shp[1] - TO * math.sin(phi))
    head = (shp[0] - (NECK + HEAD), shp[1] + 2)
    return build(hip, shp, head, [foot(212, GY, None), foot(222, GY, None)], [(shp[0] + 74, GY - 8)] * 2, kb=(-1, -1), eb=(-1, -1))


def calf_raise(t):
    k = ease(t)
    al = math.radians(lerp(0, 75, k))
    toe_p = (196, GY)
    ankle = (toe_p[0] - 16 * math.cos(al), toe_p[1] - 16 * math.sin(al))
    hip = (ankle[0], ankle[1] - 116)
    sh = add(hip, v(0, TO))
    f = (ankle, (16 * math.cos(al), 16 * math.sin(al)))
    return build(hip, sh, head_of(sh, 0), [f, ((ankle[0] - 6, ankle[1]), f[1])], [arm_to(sh, 172)] * 2)


def pushup(t):
    k = ease(t)
    toe = (45, GY)
    th = math.radians(lerp(21, 10, k))
    sh = (toe[0] + 214 * math.cos(th), toe[1] - 214 * math.sin(th) - 8)
    hip = lerp2((toe[0] + 6, toe[1] - 6), sh, 0.55)
    head = (sh[0] + 28 * math.cos(th) + 5, sh[1] - 28 * math.sin(th) - 8)
    hand = (262, GY)
    return build(hip, sh, head, [((toe[0] + 6, toe[1] - 5), (-8, 5)), ((toe[0] + 2, toe[1] - 5), (-8, 5))],
                 [hand, (hand[0] - 5, hand[1])], eb=(-1, -1))


def wall_pushup(t):
    k = ease(t)
    wall = 304
    fx = wall - 84
    a = lerp(4, 18, k)
    sh = add((fx, GY), v(a, 205))
    hip = add((fx, GY), v(a, 119))
    hand = (wall - 6, sh[1] + 6)
    wallprop = lambda d, s, bone: d.rectangle([s((wall, 40)), s((wall + 14, GY + 6))], fill=PROP)
    return build(hip, sh, add(sh, v(a, 30)), [foot(fx), foot(fx - 8)], [hand, (hand[0] - 3, hand[1])],
                 kb=(-1, -1), eb=(-1, -1), back=(wallprop,))


def chair_dip(t):
    k = ease(t)
    hand = (98, GY - 56)
    sh = (102, lerp(GY - 132, GY - 98, k))
    hip = (sh[0] + 14, sh[1] + 84)
    chair = lambda d, s, bone: (d.rectangle([s((34, GY - 52)), s((104, GY - 44))], fill=PROP),
                                d.rectangle([s((40, GY - 44)), s((48, GY))], fill=PROP),
                                d.rectangle([s((90, GY - 44)), s((98, GY))], fill=PROP))
    return build(hip, sh, add(sh, (6, -(NECK + HEAD))), [foot(196), foot(204)], [hand, (hand[0] - 4, hand[1])],
                 kb=(-1, -1), eb=(1, 1), back=(chair,))


def superman(t):
    k = ease(t)
    hip = (150, GY - 12)
    sh = (236, GY - 12 - 10 * k)
    head = (sh[0] + 30, sh[1] - 4 - 4 * k)
    ank = (hip[0] - 116, GY - 12 - 22 * k)
    hand = (sh[0] + 72, GY - 12 - 26 * k)
    return build(hip, sh, head, [(ank, None), ((ank[0] - 3, ank[1] + 4), None)], [hand, (hand[0] - 3, hand[1] + 4)],
                 kb=(1, 1), eb=(1, 1))


def plank_pose(t, raise_arm=False, kid=False, sag=0.0):
    toe = (45, GY)
    sh = (240, GY - 48 - 2 * math.sin(math.pi * t))
    ank = (toe[0] + 6, toe[1] - 6)
    hip = lerp2(ank, sh, 0.58)
    hip = (hip[0], hip[1] + sag * 6 * math.sin(math.pi * t))
    hand = (278, GY - 8)
    hands = [hand, (hand[0] - 3, hand[1])]
    if raise_arm:
        hands[1] = (sh[0], sh[1] - 74)
    front = ()
    if kid:
        c = lerp2(hip, sh, 0.5)
        def kidlying(d, s, bone, c=c):
            d.line([s((c[0] - 18, c[1] - 24)), s((c[0] + 14, c[1] - 24))], fill=KID, width=16 * SS)
            r = 9 * SS
            cc = s((c[0] + 26, c[1] - 26))
            d.ellipse([cc[0] - r, cc[1] - r, cc[0] + r, cc[1] + r], fill=SKIN, outline=KID, width=2 * SS)
        front = (kidlying,)
    return build(hip, sh, (sh[0] + 26, sh[1] - 12), [(ank, (-8, 5)), ((ank[0] - 3, ank[1]), (-8, 5))], hands,
                 eb=(-1, -1), front=front)


def plank(t): return plank_pose(t)
def side_plank(t):
    k = ease(t)
    p = plank_pose(t, raise_arm=True)
    p['hip'] = (p['hip'][0], p['hip'][1] + lerp(16, 0, k))
    p['knee'] = ik(p['hip'], p['foot'], T, S_, -1)
    p['knee2'] = ik(p['hip'], p['foot2'], T, S_, -1)
    return p
def kid_plank(t): return plank_pose(t, kid=True)


def dead_bug(t):
    k = ease(t)
    shp = (100, GY - 12)
    hip = (shp[0] + TO, GY - 12)
    head = (shp[0] - (NECK + HEAD), shp[1])
    ang = -90 * k
    hand_near = add(shp, v(ang, 76))
    hand_far = (shp[0] + 4, shp[1] - 74)
    table = (hip[0] + 60, GY - 72)
    ext = (hip[0] + 112, GY - 30)
    return build(hip, shp, head, [(table, None), (lerp2(table, ext, k), None)], [hand_near, hand_far], kb=(-1, -1), eb=(-1, -1))


def quad(t, kind='bird', cat=0.0):
    hip, sh = (155, GY - 60), (240, GY - 76)
    k = ease(t)
    hand = (240, GY - 2)
    knee = (155, GY - 4)
    ank = (95, GY - 6)
    hands = [hand, (hand[0] - 4, hand[1])]
    ankles = [ank, (ank[0] - 3, ank[1])]
    head = (sh[0] + 26, sh[1] - 8)
    mid = None
    if kind == 'bird':
        hands[1] = lerp2(hands[1], (316, GY - 84), k)
        ankles[1] = lerp2(ankles[1], (37, GY - 74), k)
        head = (sh[0] + 28, sh[1] - 10 * k)
    else:
        arch = lerp(-20, 12, k)
        mid = ((hip[0] + sh[0]) / 2, (hip[1] + sh[1]) / 2 + arch)
        head = (sh[0] + 24, sh[1] + lerp(16, -12, k))
    return build(hip, sh, head, [(ankles[0], None), (ankles[1], None)], hands, kb=(-1, -1), eb=(-1, -1),
                 knees=(knee, (knee[0] - 3, knee[1])) if kind != 'bird' else (knee, None), mid=mid)


def bird_dog(t): return quad(t, 'bird')
def cat_cow(t): return quad(t, 'cat', 0)


def hamstring(t):
    k = ease(t)
    hip = (95, GY - 8)
    lean = lerp(-5, 45, k)
    sh = add(hip, v(lean, TO))
    ank = (213, GY - 8)
    hand = lerp2(add(sh, (30, 44)), (ank[0] - 6, GY - 16), k)
    return build(hip, sh, add(sh, v(lean + 5, NECK + HEAD)), [(ank, None), ((100, GY - 4), None)], [hand, (hand[0] - 4, hand[1])],
                 kb=(1, 1), eb=(-1, -1), knees=(None, (140, GY - 44)))


def hip_flexor(t):
    k = ease(t)
    hip = (lerp(112, 124, k), GY - 62)
    sh = add(hip, v(lerp(2, -6, k), TO))
    knee_back = (100, GY - 8)
    hand = (hip[0] + 26, hip[1] - 4)
    return build(hip, sh, head_of(sh, lerp(2, -6, k)), [foot(185), ((knee_back[0] - 60, GY - 8), None)],
                 [hand, (hand[0] - 3, hand[1])], kb=(-1, -1), eb=(1, 1), knees=(None, knee_back))


def chest_shoulder(t):
    k = ease(t)
    post = 150
    hip = (lerp(172, 190, k), GY - 116)
    lean = lerp(0, 14, k)
    sh = add(hip, v(lean, TO))
    hand = (post + 4, sh[1] - 40)
    postprop = lambda d, s, bone: d.rectangle([s((post - 2, 40)), s((post + 10, GY + 6))], fill=PROP)
    return build(hip, sh, head_of(sh, lean), [foot(170), foot(200)], [hand, (hand[0] - 4, hand[1])],
                 kb=(-1, -1), eb=(1, 1), back=(postprop,))


EXERCISES = {
    'squat': (squat, 1), 'back-lunge': (back_lunge, 1), 'hip-lift': (hip_lift, 1), 'calf-raise': (calf_raise, 1),
    'pushup': (pushup, 1), 'wall-pushup': (wall_pushup, 1), 'chair-dip': (chair_dip, 1), 'superman': (superman, 1),
    'plank': (plank, 2), 'side-plank': (side_plank, 1), 'dead-bug': (dead_bug, 1), 'bird-dog': (bird_dog, 1),
    'hamstring': (hamstring, 2), 'hip-flexor': (hip_flexor, 2), 'chest-shoulder': (chest_shoulder, 2),
    'cat-cow': (cat_cow, 1), 'carry-squat': (lambda t: squat(t, kid=True), 1), 'kid-plank': (kid_plank, 2),
}


# ---------------------------------------------------------------- render
def draw(J):
    img = Image.new('RGB', (W * SS, H * SS), BG)
    d = ImageDraw.Draw(img)
    s = lambda p: (p[0] * SS, p[1] * SS)

    def bone(p, q, col, w=11):
        d.line([s(p), s(q)], fill=col, width=int(w * SS))
        r = w * SS / 2
        for c in (p, q):
            d.ellipse([c[0] * SS - r, c[1] * SS - r, c[0] * SS + r, c[1] * SS + r], fill=col)

    d.line([s((20, GY + 6)), s((W - 20, GY + 6))], fill=GROUND, width=4 * SS)
    for f in J['back']: f(d, s, bone)
    bone(J['hip'], J['knee2'], FAR); bone(J['knee2'], J['foot2'], FAR)
    if J['toe2']: bone(J['foot2'], add(J['foot2'], J['toe2']), FAR, 8)
    bone(J['sh'], J['el2'], FAR, 9); bone(J['el2'], J['hand2'], FAR, 9)
    if J['mid']:
        bone(J['hip'], J['mid'], SHIRT, 18); bone(J['mid'], J['sh'], SHIRT, 18)
    else:
        bone(J['hip'], J['sh'], SHIRT, 18)
    bone(J['hip'], J['knee'], NEAR); bone(J['knee'], J['foot'], NEAR)
    if J['toe']: bone(J['foot'], add(J['foot'], J['toe']), NEAR, 8)
    bone(J['sh'], J['el'], NEAR, 9); bone(J['el'], J['hand'], NEAR, 9)
    hc, r = J['head'], HEAD
    d.ellipse([s((hc[0] - r, hc[1] - r)), s((hc[0] + r, hc[1] + r))], fill=SKIN, outline=NEAR, width=2 * SS)
    for f in J['front']: f(d, s, bone)
    return img.resize((W, H), Image.LANCZOS)


def render(name, fn, hold, outdir):
    n = 16
    seq = [i / n for i in range(n + 1)] + [1 - i / n for i in range(1, n)]
    frames = [draw(fn(t)) for t in seq]
    durs = [70] * len(frames)
    durs[0] = 350
    durs[n] = 500 if hold == 1 else 1200
    pal = [f.convert('P', palette=Image.ADAPTIVE, colors=24) for f in frames]
    path = os.path.join(outdir, f'{name}.gif')
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=durs, loop=0, optimize=True, disposal=1)
    return frames[0], frames[n], path


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'public', 'gifs')
    os.makedirs(out, exist_ok=True)
    names = sys.argv[1:] or list(EXERCISES)
    sheet = []
    for nm in names:
        fn, hold = EXERCISES[nm]
        a, b, path = render(nm, fn, hold, out)
        sheet.append((nm, a, b))
        print(nm, os.path.getsize(path) // 1024, 'KB')
    if os.environ.get('SHEET'):
        cols = 3
        rows = (len(sheet) + cols - 1) // cols
        im = Image.new('RGB', (cols * 2 * 180, rows * 150), 'white')
        for i, (nm, a, b) in enumerate(sheet):
            x, y = (i % cols) * 360, (i // cols) * 150
            im.paste(a.resize((180, 150)), (x, y)); im.paste(b.resize((180, 150)), (x + 180, y))
            ImageDraw.Draw(im).text((x + 4, y + 2), nm, fill=(0, 0, 0))
        im.save(os.environ['SHEET'])
