#!/bin/bash
# CLI make 출력 바이트 기준 측정 — 캐시 적중 전제(폭탄마). 사용: baseline.sh <출력폴더>
set -u
OUT="$1"; mkdir -p "$OUT"
SRC="$HOME/Downloads/yt-test/Bomber (Re-Recording) [XifmeRdJCjo].mp3"
LY="$HOME/Downloads/yt-test/bomber-lyrics.txt"; EX="$HOME/Downloads/yt-test/bomber-namu.txt"
cd /Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code
uv run thebooth make "$SRC" -o "$OUT/a.mp3" > "$OUT/a.log" 2>&1; echo "a EXIT=$?"
uv run thebooth make "$SRC" -o "$OUT/b.mp3" -k -2 --mr-method subtract --vocals "$OUT/b-voc.mp3" > "$OUT/b.log" 2>&1; echo "b EXIT=$?"
uv run thebooth make "$SRC" -o "$OUT/c.mp3" -m melband-roformer-karaoke --guide --guide-level -9 --gender f2m -k 1 --lyrics "$LY" --lyrics-extra "$EX" --video "$OUT/c.mp4" > "$OUT/c.log" 2>&1; echo "c EXIT=$?"
(cd "$OUT" && shasum -a 256 *.mp3 *.mp4 *.ass)
