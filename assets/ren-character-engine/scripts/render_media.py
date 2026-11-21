#!/usr/bin/env python3
"""Optional raster/video export. Renderer itself only needs JavaScript.
Install Python playwright and a Chromium browser for this command. MP4 also
needs FFmpeg on PATH. No external network access is used while rendering.
"""
from __future__ import annotations
import argparse, json, math, os, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--scene', type=Path, default=ROOT / 'examples/presentation.json')
    p.add_argument('--out', type=Path, required=True, help='.png or .mp4')
    p.add_argument('--at', type=float, default=0.0, help='Seconds, for a still PNG')
    p.add_argument('--width', type=int, default=720)
    p.add_argument('--fps', type=int, help='Override scene fps for export')
    p.add_argument('--chrome', help='Chromium executable; otherwise auto-detect')
    p.add_argument('--audio', type=Path, help='Optional pre-aligned narration for MP4')
    p.add_argument('--matte', default='#f3e8d6', help='Matte behind transparent art in MP4')
    p.add_argument('--draft', action='store_true', help='Disable texture and gradients')
    args=p.parse_args()
    if not 128 <= args.width <= 4096:
        p.error('--width must be between 128 and 4096')
    if args.out.suffix.lower() not in ('.png', '.mp4'):
        p.error('--out must end in .png or .mp4')
    if args.audio and not args.audio.is_file():
        p.error('--audio file does not exist')
    scene=json.loads(args.scene.read_text(encoding='utf-8'))
    if args.fps is not None: scene['fps']=args.fps
    if args.draft: scene.setdefault('character',{})['detail']='draft'
    width=args.width + (args.width % 2)
    height=2*round(width*1.05/2)
    scene.setdefault('character',{}).update(width=width,height=height)
    args.out.parent.mkdir(parents=True,exist_ok=True)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as e:
        raise RuntimeError('Install optional renderer: python -m pip install playwright; python -m playwright install chromium') from e
    chrome=args.chrome or os.environ.get('CHROME_PATH') or next((shutil.which(x) for x in ['chromium','chromium-browser','google-chrome'] if shutil.which(x)),None)
    with sync_playwright() as pw:
        launch={'headless':True, 'args':['--disable-dev-shm-usage']}
        # Root-only sandbox flag for container environments; do not disable it on a normal desktop.
        if hasattr(os,'geteuid') and os.geteuid()==0: launch['args'].append('--no-sandbox')
        if chrome: launch['executable_path']=chrome
        browser=pw.chromium.launch(**launch)
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
        page.set_content('<style>html,body{margin:0;background:transparent}svg{display:block}</style><main id="stage"></main>')
        page.add_script_tag(path=str(ROOT / 'src/ren.js'))
        page.evaluate('(scene)=>Ren.validateScene(scene)',scene)
        # All content is local. Abort accidental external requests.
        page.route('**/*',lambda route:route.abort())
        if args.out.suffix.lower()=='.png':
            page.evaluate('([s,t])=>document.getElementById("stage").innerHTML=Ren.renderAt(s,t)',[scene,args.at])
            page.screenshot(path=str(args.out),omit_background=True)
        else:
            ffmpeg=shutil.which('ffmpeg')
            if not ffmpeg: raise RuntimeError('FFmpeg is needed for MP4; export SVG or PNG instead.')
            page.evaluate('(color)=>document.body.style.background=color',args.matte)
            with tempfile.TemporaryDirectory(prefix='ren-frames-') as d:
                d=Path(d);count=math.ceil(scene['duration']*scene['fps'])
                for n in range(count):
                    page.evaluate('([s,n])=>document.getElementById("stage").innerHTML=Ren.frame(s,n)',[scene,n])
                    page.screenshot(path=str(d / f'{n:06d}.png'),omit_background=False)
                    if n%scene['fps']==0: print(f'Frame {n}/{count}',flush=True)
                cmd=[ffmpeg,'-y','-hide_banner','-loglevel','error','-framerate',str(scene['fps']),'-i',str(d/'%06d.png')]
                if args.audio:
                    cmd+=['-i',str(args.audio),'-map','0:v:0','-map','1:a:0','-af','apad','-c:a','aac','-b:a','160k']
                else: cmd+=['-an']
                cmd+=['-t',str(scene['duration']),'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(args.out)]
                subprocess.run(cmd,check=True)
        browser.close()
    print(args.out.resolve())

if __name__=='__main__':
    try: main()
    except Exception as e:
        print(f'Render failed: {e}',file=sys.stderr);sys.exit(1)
