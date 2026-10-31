// <tsl-animation-timeline fps="24" duration="480"> — port of Tessel.NET's AnimationTimeline (1.2.0): an editing
// timeline for video, audio and animation tools. Positions are whole frames, so one control covers a video editor
// (timecode ruler, long clips) and a pixel/sprite editor (frame-number ruler, one-frame cels, keyframe diamonds).
//
//   const tl = document.querySelector('tsl-animation-timeline');
//   tl.tracks = [{ name: 'Video 1', height: 44, clips: [{ name: 'Intro.mp4', start: 0, length: 120 }] }];
//   tl.markers = [{ frame: 120, name: 'Interview' }];
//   tl.addEventListener('clips-moved', (e) => console.log(e.detail));
//
// Model (plain objects; mutate them, then call `tl.refresh()`):
//   track  { name, color?, height?, visible?, locked?, clips: [] }
//   clip   { name, start, length, color?, keyframe?, selected?, waveform?: number[0..1], mediaStart?, mediaLength?, tag? }
//   marker { frame, name }
// Attributes: fps, duration, current-frame, pixels-per-frame, time-display (timecode|frames|seconds), hide-transport,
//   prevent-overlap, constrain-to-duration, auto-extend-duration, no-snapping, read-only, no-undo, header-width,
//   loop-start / loop-end / loop-enabled.
// Events: current-frame-changed, playback-state-changed, selection-changed, clips-moved, clips-resized,
//   clips-deleting (cancelable), clip-activated, history-changed.
// Mouse: drag the ruler to scrub (Shift = set loop region), click a marker to jump, click / Ctrl-click clips to select,
//   drag empty space to box-select, drag clips (also to other tracks) and trim their edges, double-click a clip, Delete
//   removes the selection, Ctrl + wheel zooms. Keyboard: Space, ←/→ (Ctrl = 10 frames), Home/End, Delete, Ctrl+A,
//   Ctrl +/-, Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z, Escape cancels a drag.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';
import { h, cx } from '../core/dom.js';

const RULER_H = 28;
const EDGE = 6;
const SNAP_PX = 6;
const TRACK_COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#db2777', '#7c3aed'];

const TBTN = 'flex size-8 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-text-secondary transition-colors duration-fast '
  + 'hover:bg-control-hover hover:text-text active:bg-control-pressed disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-accent';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export class TesselAnimationTimeline extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['fps', 'duration', 'current-frame', 'pixels-per-frame', 'time-display', 'hide-transport', 'header-width', 'loop-start', 'loop-end', 'loop-enabled', 'read-only'];

  constructor() {
    super();
    this._tracks = [];
    this._markers = [];
    this._frame = 0;
    this._playing = false;
    this._rate = 1;
    this._undo = [];
    this._redo = [];
    this._ppf = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._render(); return; }
    this._built = true;
    this._buildShell();
    this._ro = new ResizeObserver(() => this._render());
    this._ro.observe(this);
    this._render();
  }

  disconnectedCallback() {
    this._ro?.disconnect();
    this.pause();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'current-frame') this._frame = clamp(Number(newV) || 0, 0, this.duration);
    if (name === 'pixels-per-frame') this._ppf = null;
    this._render();
  }

  // ------------------------------------------------------------------ public API

  get fps() { return Math.max(1, Number(this.getAttribute('fps')) || 24); }
  set fps(v) { this.setAttribute('fps', String(v)); }
  get duration() { return Math.max(1, Number(this.getAttribute('duration')) || 240); }
  set duration(v) { this.setAttribute('duration', String(v)); }
  get currentFrame() { return Math.round(this._frame); }
  set currentFrame(v) { this._setFrame(v); }
  get pixelsPerFrame() { return this._ppf ?? (Number(this.getAttribute('pixels-per-frame')) || 4); }
  set pixelsPerFrame(v) { this._ppf = clamp(v, 0.05, 80); this._render(); }
  get timeDisplay() { return this.getAttribute('time-display') || 'timecode'; }
  get isPlaying() { return this._playing; }
  get tracks() { return this._tracks; }
  set tracks(list) { this._tracks = list || []; this._undo = []; this._redo = []; this._historyChanged(); this._render(); }
  get markers() { return this._markers; }
  set markers(list) { this._markers = list || []; this._render(); }
  get selectedClips() { return this._allClips().filter(({ clip }) => clip.selected).map(({ clip }) => clip); }
  get canUndo() { return this._undo.length > 0 && !this.hasAttribute('no-undo'); }
  get canRedo() { return this._redo.length > 0 && !this.hasAttribute('no-undo'); }
  get undoDescription() { return this._undo.at(-1)?.description ?? ''; }
  get redoDescription() { return this._redo.at(-1)?.description ?? ''; }

  /** Redraws after the model was changed from the outside. */
  refresh() { this._render(); }

  formatTime(frame) {
    const fps = this.fps;
    const f = Math.round(frame);
    if (this.timeDisplay === 'frames') return String(f);
    if (this.timeDisplay === 'seconds') return `${(f / fps).toFixed(2)}s`;
    const p = (n) => String(n).padStart(2, '0');
    const secs = Math.floor(f / fps);
    return `${p(Math.floor(secs / 3600))}:${p(Math.floor(secs / 60) % 60)}:${p(secs % 60)}:${p(f % Math.round(fps))}`;
  }

  play() {
    if (this._playing) return;
    if (this._frame >= this.duration) this._setFrame(0);
    this._playing = true;
    this._last = performance.now();
    const tick = (now) => {
      if (!this._playing) return;
      const dt = (now - this._last) / 1000;
      this._last = now;
      let next = this._frame + dt * this.fps * this._rate;
      const loopOn = this.hasAttribute('loop-enabled');
      const ls = Number(this.getAttribute('loop-start')) || 0;
      const le = Number(this.getAttribute('loop-end')) || this.duration;
      if (loopOn && next >= le) next = ls;
      if (next >= this.duration) { this._setFrame(this.duration); this.pause(); return; }
      this._setFrame(next, { follow: true });
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    this.emit('playback-state-changed', { playing: true });
    this._renderTransport();
  }

  pause() {
    if (!this._playing) return;
    this._playing = false;
    cancelAnimationFrame(this._raf);
    this.emit('playback-state-changed', { playing: false });
    this._renderTransport();
  }

  stop() { this.pause(); this._setFrame(0); }
  togglePlayback() { if (this._playing) this.pause(); else this.play(); }
  stepForward(n = 1) { this._setFrame(this.currentFrame + n); }
  stepBackward(n = 1) { this._setFrame(this.currentFrame - n); }
  zoomIn() { this._zoom(1.25); }
  zoomOut() { this._zoom(0.8); }
  zoomToFit() {
    const w = this._scroll.clientWidth - 24;
    this.pixelsPerFrame = clamp(w / this.duration, 0.05, 80);
  }

  /**
   * Adds `clip` to `track` under the same rules as dragging (overlap prevention, project length). Returns false when
   * there is no room.
   */
  addClip(track, clip) {
    clip.length = Math.max(1, clip.length || 1);
    clip.start = Math.max(0, clip.start || 0);
    if (!this._fits(track, clip.start, clip.length, new Set())) {
      if (!this.hasAttribute('auto-extend-duration') || this.hasAttribute('prevent-overlap') && this._overlaps(track, clip.start, clip.length, new Set())) return false;
    }
    if (clip.start + clip.length > this.duration && this.hasAttribute('auto-extend-duration')) {
      this._durationBefore = this.duration;
      this._extendTo(clip.start + clip.length);
    }
    track.clips.push(clip);
    this._record('Add clip', { add: [{ clip, track }] });
    this._render();
    return true;
  }

  /** Removes the selected clips (honouring `clips-deleting`). */
  deleteSelection() {
    if (this.hasAttribute('read-only')) return;
    const entries = this._allClips().filter(({ clip, track }) => clip.selected && !track.locked);
    if (!entries.length || !this.emit('clips-deleting', { clips: entries.map((e) => e.clip) })) return;
    for (const { clip, track } of entries) track.clips.splice(track.clips.indexOf(clip), 1);
    this._record('Delete clips', { remove: entries });
    this._selectionChanged();
    this._render();
  }

  undo() { this._step(this._undo, this._redo, true); }
  redo() { this._step(this._redo, this._undo, false); }
  clearHistory() { this._undo = []; this._redo = []; this._historyChanged(); }

  /** Puts your own step on the undo stack: `undo()` and `redo()` must reverse/replay it. */
  recordHistory(description, undo, redo) {
    this._push({ description, undo, redo });
  }

  // ------------------------------------------------------------------ internals

  _allClips() {
    return this._tracks.flatMap((track) => track.clips.map((clip) => ({ clip, track })));
  }

  _trackOf(clip) { return this._tracks.find((t) => t.clips.includes(clip)); }

  _setFrame(v, { follow = false } = {}) {
    const next = clamp(v, 0, this.duration);
    if (next === this._frame) return;
    const before = this.currentFrame;
    this._frame = next;
    if (this.currentFrame !== before || !follow) this.setAttribute('current-frame', String(this.currentFrame));
    this._paintPlayhead(follow);
    if (this.currentFrame !== before) this.emit('current-frame-changed', { frame: this.currentFrame, time: this.formatTime(this.currentFrame) });
  }

  _zoom(factor, anchorPx) {
    const old = this.pixelsPerFrame;
    const next = clamp(old * factor, 0.05, 80);
    const anchor = anchorPx ?? this._scroll.clientWidth / 2;
    const frameAtAnchor = (this._scroll.scrollLeft + anchor) / old;
    this._ppf = next;
    this._render();
    this._scroll.scrollLeft = frameAtAnchor * next - anchor;
  }

  _extendTo(frames) { this.setAttribute('duration', String(Math.ceil(frames))); }

  _overlaps(track, start, length, ignore) {
    return track.clips.some((c) => !ignore.has(c) && start < c.start + c.length && start + length > c.start);
  }

  _fits(track, start, length, ignore) {
    if (start < 0) return false;
    if (this.hasAttribute('constrain-to-duration') && start + length > this.duration) return false;
    if (this.hasAttribute('prevent-overlap') && this._overlaps(track, start, length, ignore)) return false;
    return true;
  }

  // ---- history

  _push(entry) {
    if (this.hasAttribute('no-undo')) return;
    this._undo.push(entry);
    if (this._undo.length > 200) this._undo.shift();
    this._redo = [];
    this._historyChanged();
  }

  _historyChanged() {
    this.emit('history-changed', { canUndo: this.canUndo, canRedo: this.canRedo, undoDescription: this.undoDescription, redoDescription: this.redoDescription });
    this._renderTransport();
  }

  _step(from, to, undoing) {
    if (this.hasAttribute('no-undo')) return;
    const entry = from.pop();
    if (!entry) return;
    (undoing ? entry.undo : entry.redo)();
    to.push(entry);
    this._historyChanged();
    this._render();
  }

  /**
   * Records an edit. `snap` = [{ clip, from: {start,length,track}, to: {…} }] for move/trim; `add` / `remove` for
   * inserted / deleted clips (also restoring an auto-extended duration on undo).
   */
  _record(description, { snap = [], add = [], remove = [] }) {
    const duration = this._durationBefore ?? this.duration;
    this._durationBefore = undefined;
    const apply = (use) => {
      for (const { clip, from, to } of snap) {
        const state = use === 'from' ? from : to;
        const cur = this._trackOf(clip);
        if (cur !== state.track) { cur?.clips.splice(cur.clips.indexOf(clip), 1); state.track.clips.push(clip); }
        clip.start = state.start;
        clip.length = state.length;
        if ('mediaStart' in state) clip.mediaStart = state.mediaStart;
      }
    };
    const after = this.duration;
    this._push({
      description,
      undo: () => {
        apply('from');
        for (const { clip, track } of add) track.clips.splice(track.clips.indexOf(clip), 1);
        for (const { clip, track } of remove) track.clips.push(clip);
        if (duration !== after) this.setAttribute('duration', String(duration));
      },
      redo: () => {
        apply('to');
        for (const { clip, track } of add) track.clips.push(clip);
        for (const { clip, track } of remove) track.clips.splice(track.clips.indexOf(clip), 1);
        if (duration !== after) this.setAttribute('duration', String(after));
      },
    });
  }

  // ---- DOM

  _buildShell() {
    this._transport = h('div', 'flex flex-wrap items-center gap-1 border-b border-border px-2 py-1');
    this._headers = h('div', 'flex-none overflow-hidden border-r border-border bg-surface-alt');
    this._ruler = h('div', 'sticky top-0 z-20 cursor-pointer border-b border-border bg-surface-alt');
    this._lanes = h('div', 'relative');
    this._playhead = h('div', 'pointer-events-none absolute inset-y-0 z-10 w-px bg-danger');
    this._marquee = h('div', 'pointer-events-none absolute z-10 border border-accent bg-accent/15', { hidden: true });
    this._content = h('div', 'relative', null, this._ruler, this._lanes, this._playhead, this._marquee);
    this._scroll = h('div', 'relative min-w-0 flex-1 overflow-auto scrollbar-thin', { tabindex: '0', 'aria-label': 'Animation timeline' }, this._content);
    this._corner = h('div', 'flex flex-none items-center border-b border-border px-3 text-caption font-medium text-text-secondary', { style: { height: `${RULER_H}px` } });
    this._headerWrap = h('div', 'flex w-[var(--hw)] flex-none flex-col border-r border-border bg-surface-alt overflow-hidden', null, this._corner, this._headers);
    this._body = h('div', 'flex min-h-0 flex-1', null, this._headerWrap, this._scroll);
    this.shadowRoot.appendChild(h('div', 'flex h-full min-h-[200px] flex-col overflow-hidden rounded-lg border border-border bg-surface select-none', null, this._transport, this._body));

    this._scroll.addEventListener('scroll', () => { this._headers.scrollTop = this._scroll.scrollTop; });
    this._scroll.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      this._zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - this._scroll.getBoundingClientRect().left);
    }, { passive: false });
    this._scroll.addEventListener('keydown', (e) => this._onKey(e));
    this._ruler.addEventListener('pointerdown', (e) => this._rulerDown(e));
    this._lanes.addEventListener('pointerdown', (e) => this._lanesDown(e));
    this._lanes.addEventListener('dblclick', (e) => {
      const el = e.target.closest?.('[data-clip]');
      if (el) this.emit('clip-activated', { clip: el._clip, track: el._track });
    });
  }

  _frameAt(clientX) {
    const r = this._content.getBoundingClientRect();
    return (clientX - r.left) / this.pixelsPerFrame;
  }

  _render() {
    if (!this._built) return;
    const ppf = this.pixelsPerFrame;
    const width = Math.ceil(this.duration * ppf) + 40;
    const hw = Number(this.getAttribute('header-width')) || 160;
    this._headerWrap.style.setProperty('--hw', `${hw}px`);
    this._corner.textContent = this.formatTime(this._frame);
    this._corner.id = 'tsl-tl-time';
    this._content.style.width = `${width}px`;
    this._renderTransport();
    this._renderRuler(ppf, width);
    this._renderTracks(ppf, width);
    this._paintPlayhead(false);
  }

  _renderTransport() {
    if (!this._transport) return;
    this._transport.hidden = this.hasAttribute('hide-transport');
    const btn = (icon, label, onClick, { on = false, disabled = false } = {}) => {
      const b = h('button', cx(TBTN, on && 'bg-accent-subtle text-accent'), { type: 'button', title: label, 'aria-label': label, 'aria-pressed': on ? 'true' : null, disabled }, createIcon(icon, 16));
      b.addEventListener('click', onClick);
      return b;
    };
    const sep = () => h('span', 'mx-1 h-5 w-px bg-border');
    this._transport.replaceChildren(
      btn('back', 'Previous frame', () => this.stepBackward()),
      btn(this._playing ? 'pause' : 'play', this._playing ? 'Pause' : 'Play', () => this.togglePlayback(), { on: this._playing }),
      btn('forward', 'Next frame', () => this.stepForward()),
      btn('chrome-maximize', 'Stop', () => this.stop()),
      sep(),
      btn('sync', 'Loop', () => this.toggleAttribute('loop-enabled'), { on: this.hasAttribute('loop-enabled') }),
      btn('pin', 'Snapping', () => { this.toggleAttribute('no-snapping'); this._renderTransport(); }, { on: !this.hasAttribute('no-snapping') }),
      sep(),
      btn('undo', this.undoDescription ? `Undo ${this.undoDescription}` : 'Undo', () => this.undo(), { disabled: !this.canUndo }),
      btn('redo', this.redoDescription ? `Redo ${this.redoDescription}` : 'Redo', () => this.redo(), { disabled: !this.canRedo }),
      h('span', 'flex-1'),
      h('span', 'font-mono text-code tabular-nums text-text', { 'data-time': '' }, this.formatTime(this._frame)),
      sep(),
      btn('remove', 'Zoom out', () => this.zoomOut()),
      btn('add', 'Zoom in', () => this.zoomIn()),
      btn('view-all', 'Zoom to fit', () => this.zoomToFit()),
    );
  }

  /** Ticks every `step` frames, chosen so labels stay ~70px apart. */
  _tickStep(ppf) {
    const fps = Math.round(this.fps);
    const candidates = this.timeDisplay === 'frames'
      ? [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]
      : [1, 2, 5, 10, fps, fps * 2, fps * 5, fps * 10, fps * 30, fps * 60, fps * 300, fps * 600, fps * 1800, fps * 3600];
    return candidates.find((c) => c * ppf >= 70) ?? candidates.at(-1);
  }

  _renderRuler(ppf, width) {
    const step = this._tickStep(ppf);
    this._ruler.style.height = `${RULER_H}px`;
    this._ruler.style.width = `${width}px`;
    const kids = [];
    const minor = step >= 5 ? step / 5 : 0;
    for (let f = 0; f <= this.duration; f += minor || step) {
      const major = f % step === 0;
      const x = f * ppf;
      kids.push(h('span', cx('pointer-events-none absolute bottom-0 w-px', major ? 'h-3.5 bg-border-strong' : 'h-1.5 bg-border'), { style: { left: `${x}px` } }));
      if (major) kids.push(h('span', 'pointer-events-none absolute top-1 pl-1 text-2xs tabular-nums text-text-tertiary', { style: { left: `${x}px` } }, this.formatTime(f)));
    }
    const ls = Number(this.getAttribute('loop-start'));
    const le = Number(this.getAttribute('loop-end'));
    if (le > ls) {
      kids.push(h('span', cx('pointer-events-none absolute inset-y-0 border-x-2 border-accent', this.hasAttribute('loop-enabled') ? 'bg-accent/25' : 'bg-accent/10'), { style: { left: `${ls * ppf}px`, width: `${(le - ls) * ppf}px` } }));
    }
    for (const m of this._markers) {
      const flag = h('button', 'absolute bottom-0 flex h-4 -translate-x-px cursor-pointer items-center gap-1 whitespace-nowrap rounded-r-sm border-0 bg-warning px-1.5 text-2xs font-medium text-surface', { type: 'button', title: m.name, style: { left: `${m.frame * ppf}px` } }, m.name || '');
      flag.addEventListener('pointerdown', (e) => e.stopPropagation());
      flag.addEventListener('click', () => this._setFrame(m.frame));
      kids.push(flag);
    }
    this._ruler.replaceChildren(...kids);
  }

  _renderTracks(ppf, width) {
    this._headers.replaceChildren(...this._tracks.map((track, ti) => {
      const color = track.color || TRACK_COLORS[ti % TRACK_COLORS.length];
      const toggle = (icon, label, on, key) => {
        const b = h('button', cx('flex size-6 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 hover:bg-control-hover', on ? 'text-text-secondary' : 'text-text-tertiary opacity-60'), { type: 'button', title: label, 'aria-pressed': String(on), 'aria-label': label }, createIcon(icon, 14));
        b.addEventListener('click', () => { track[key] = key === 'visible' ? track.visible === false : !track.locked; this._render(); });
        return b;
      };
      return h('div', 'flex items-center gap-2 border-b border-border px-2', { style: { height: `${track.height || 44}px` } },
        h('span', 'h-5 w-1 flex-none rounded-pill', { style: { background: color } }),
        h('span', 'min-w-0 flex-1 truncate text-body text-text', null, track.name),
        toggle('view', 'Toggle visibility', track.visible !== false, 'visible'),
        toggle('lock', 'Lock track', !!track.locked, 'locked'));
    }));
    const total = this._tracks.reduce((s, t) => s + (t.height || 44), 0);
    this._lanes.style.height = `${total}px`;
    this._lanes.style.width = `${width}px`;
    this._lanes.replaceChildren(...this._tracks.map((track, ti) => {
      const color = track.color || TRACK_COLORS[ti % TRACK_COLORS.length];
      const lane = h('div', cx('relative border-b border-border', track.locked && 'bg-subtle/60', track.visible === false && 'opacity-40'), { style: { height: `${track.height || 44}px` }, 'data-lane': String(ti) });
      lane._track = track;
      for (const clip of track.clips) lane.appendChild(this._buildClip(clip, track, color, ppf));
      return lane;
    }));
    // The ruler and the lanes stack in the scroll content; the lanes start below the ruler.
    this._lanes.style.marginTop = '0px';
  }

  _buildClip(clip, track, color, ppf) {
    const x = clip.start * ppf;
    const w = Math.max(2, clip.length * ppf);
    if (clip.keyframe) {
      const kf = h('div', cx('absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 cursor-pointer border-2 border-surface', clip.selected && 'ring-2 ring-accent'), { 'data-clip': '', style: { left: `${x + w / 2}px`, background: clip.color || color } });
      kf._clip = clip; kf._track = track;
      return kf;
    }
    const el = h('div', cx('absolute inset-y-1 flex cursor-grab items-center overflow-hidden rounded-sm border text-caption font-medium text-white', clip.selected ? 'border-white ring-2 ring-accent' : 'border-black/20'),
      { 'data-clip': '', title: `${clip.name} (${this.formatTime(clip.start)} – ${this.formatTime(clip.start + clip.length)})`, style: { left: `${x}px`, width: `${w}px`, background: clip.color || color } });
    el._clip = clip; el._track = track;
    if (clip.waveform?.length) el.appendChild(this._waveform(clip, w));
    el.appendChild(h('span', 'pointer-events-none relative truncate px-1.5 drop-shadow', null, clip.name));
    if (!track.locked) {
      el.appendChild(h('span', 'absolute inset-y-0 left-0 w-1.5 cursor-ew-resize', { 'data-edge': 'start' }));
      el.appendChild(h('span', 'absolute inset-y-0 right-0 w-1.5 cursor-ew-resize', { 'data-edge': 'end' }));
    }
    return el;
  }

  _waveform(clip, widthPx) {
    const peaks = clip.waveform;
    const mediaLength = clip.mediaLength || clip.length;
    const from = Math.floor(((clip.mediaStart || 0) / mediaLength) * peaks.length);
    const to = Math.min(peaks.length, Math.ceil((((clip.mediaStart || 0) + clip.length) / mediaLength) * peaks.length));
    const bars = Math.max(1, Math.floor(widthPx / 3));
    const wrap = h('div', 'pointer-events-none absolute inset-0 flex items-center gap-px px-px opacity-60');
    for (let i = 0; i < bars; i++) {
      const p = peaks[from + Math.floor((i / bars) * (to - from))] ?? 0;
      wrap.appendChild(h('span', 'flex-1 rounded-pill bg-white', { style: { height: `${Math.max(6, p * 90)}%` } }));
    }
    return wrap;
  }

  _paintPlayhead(follow) {
    if (!this._playhead) return;
    const x = this._frame * this.pixelsPerFrame;
    this._playhead.style.left = `${x}px`;
    const time = this._transport?.querySelector('[data-time]');
    if (time) time.textContent = this.formatTime(this._frame);
    if (this._corner) this._corner.textContent = this.formatTime(this._frame);
    if (follow && this._playing) {
      const { scrollLeft, clientWidth } = this._scroll;
      if (x > scrollLeft + clientWidth - 24 || x < scrollLeft) this._scroll.scrollLeft = Math.max(0, x - 40);
    }
  }

  // ---- pointer interaction

  _rulerDown(e) {
    if (e.button !== 0) return;
    this._ruler.setPointerCapture(e.pointerId);
    const shift = e.shiftKey;
    const anchor = Math.round(this._frameAt(e.clientX));
    const move = (ev) => {
      const f = clamp(Math.round(this._frameAt(ev.clientX)), 0, this.duration);
      if (shift) {
        this.setAttribute('loop-start', String(Math.min(anchor, f)));
        this.setAttribute('loop-end', String(Math.max(anchor, f)));
      } else this._setFrame(f);
    };
    move(e);
    const up = () => { this._ruler.removeEventListener('pointermove', move); this._ruler.removeEventListener('pointerup', up); };
    this._ruler.addEventListener('pointermove', move);
    this._ruler.addEventListener('pointerup', up);
  }

  _lanesDown(e) {
    if (e.button !== 0) return;
    this._scroll.focus({ preventScroll: true });
    const clipEl = e.target.closest?.('[data-clip]');
    if (!clipEl) { this._marqueeStart(e); return; }
    const { _clip: clip, _track: track } = clipEl;
    const additive = e.ctrlKey || e.metaKey || e.shiftKey;
    if (additive) { clip.selected = !clip.selected; this._selectionChanged(); this._render(); return; }
    if (!clip.selected) {
      for (const { clip: c } of this._allClips()) c.selected = c === clip;
      this._selectionChanged();
    }
    if (track.locked || this.hasAttribute('read-only')) { this._render(); return; }
    const edge = e.target.dataset?.edge;
    this._dragStart(e, edge ? 'trim-' + edge : 'move', clip);
  }

  _selectionChanged() {
    this.emit('selection-changed', { clips: this.selectedClips });
  }

  _marqueeStart(e) {
    const rect0 = this._content.getBoundingClientRect();
    const additive = e.ctrlKey || e.metaKey || e.shiftKey;
    const startX = e.clientX - rect0.left;
    const startY = e.clientY - rect0.top;
    const base = additive ? new Set(this.selectedClips) : new Set();
    this._lanes.setPointerCapture(e.pointerId);
    let moved = false;
    const move = (ev) => {
      const x = ev.clientX - rect0.left, y = ev.clientY - rect0.top;
      if (!moved && Math.hypot(x - startX, y - startY) < 3) return;
      moved = true;
      const box = { l: Math.min(x, startX), r: Math.max(x, startX), t: Math.min(y, startY), b: Math.max(y, startY) };
      this._marquee.hidden = false;
      Object.assign(this._marquee.style, { left: `${box.l}px`, top: `${box.t}px`, width: `${box.r - box.l}px`, height: `${box.b - box.t}px` });
      let top = RULER_H;
      for (const track of this._tracks) {
        const hgt = track.height || 44;
        for (const clip of track.clips) {
          const hit = !track.locked && clip.start * this.pixelsPerFrame < box.r && (clip.start + clip.length) * this.pixelsPerFrame > box.l && top < box.b && top + hgt > box.t;
          clip.selected = base.has(clip) || hit;
        }
        top += hgt;
      }
      this._render();
    };
    const up = () => {
      this._lanes.removeEventListener('pointermove', move);
      this._lanes.removeEventListener('pointerup', up);
      this._marquee.hidden = true;
      if (!moved && !additive) { for (const { clip } of this._allClips()) clip.selected = false; this._render(); }
      this._selectionChanged();
    };
    this._lanes.addEventListener('pointermove', move);
    this._lanes.addEventListener('pointerup', up);
  }

  /** Snaps `frame` to the playhead, markers, the loop region and other clips' edges when within a few pixels. */
  _snap(frame, ignore) {
    if (this.hasAttribute('no-snapping')) return frame;
    const targets = [this.currentFrame, ...this._markers.map((m) => m.frame)];
    const ls = Number(this.getAttribute('loop-start')), le = Number(this.getAttribute('loop-end'));
    if (le > ls) targets.push(ls, le);
    for (const { clip } of this._allClips()) if (!ignore.has(clip)) targets.push(clip.start, clip.start + clip.length);
    let best = frame, bestDist = SNAP_PX / this.pixelsPerFrame;
    for (const t of targets) { const d = Math.abs(t - frame); if (d <= bestDist) { best = t; bestDist = d; } }
    return best;
  }

  _dragStart(e, mode, anchorClip) {
    const entries = this._allClips().filter(({ clip }) => clip.selected);
    const group = new Set(entries.map((x) => x.clip));
    const orig = new Map(entries.map(({ clip, track }) => [clip, { start: clip.start, length: clip.length, track, mediaStart: clip.mediaStart }]));
    const startFrame = this._frameAt(e.clientX);
    const startLane = this._tracks.indexOf(this._trackOf(anchorClip));
    const laneEl = this._lanes;
    laneEl.setPointerCapture(e.pointerId);
    this._durationBefore = this.duration;
    let moved = false;
    let cancelled = false;

    const restore = () => {
      for (const [clip, o] of orig) {
        const cur = this._trackOf(clip);
        if (cur !== o.track) { cur.clips.splice(cur.clips.indexOf(clip), 1); o.track.clips.push(clip); }
        clip.start = o.start; clip.length = o.length;
        if (o.mediaStart !== undefined) clip.mediaStart = o.mediaStart;
      }
    };

    const move = (ev) => {
      if (cancelled) return;
      const dx = this._frameAt(ev.clientX) - startFrame;
      if (!moved && Math.abs(dx) * this.pixelsPerFrame < 3 && Math.abs(ev.clientY - e.clientY) < 3) return;
      moved = true;
      restore();
      if (mode === 'move') this._applyMove(orig, group, dx, ev, startLane, anchorClip);
      else this._applyTrim(orig, group, mode, dx);
      this._render();
    };
    const key = (ev) => { if (ev.key === 'Escape') { cancelled = true; restore(); this._render(); end(); } };
    const end = () => {
      laneEl.removeEventListener('pointermove', move);
      laneEl.removeEventListener('pointerup', up);
      this._scroll.removeEventListener('keydown', key);
    };
    const up = () => {
      end();
      if (!moved || cancelled) { this._render(); return; }
      const snap = [...orig].map(([clip, from]) => ({ clip, from, to: { start: clip.start, length: clip.length, track: this._trackOf(clip), mediaStart: clip.mediaStart } }))
        .filter(({ clip, from }) => clip.start !== from.start || clip.length !== from.length || this._trackOf(clip) !== from.track);
      if (!snap.length) { this._durationBefore = undefined; return; }
      this._record(mode === 'move' ? 'Move clips' : 'Trim clips', { snap });
      const detail = { clips: snap.map((s) => ({ clip: s.clip, oldStart: s.from.start, oldLength: s.from.length, oldTrack: s.from.track, newTrack: s.to.track })) };
      this.emit(mode === 'move' ? 'clips-moved' : 'clips-resized', detail);
      this._render();
    };
    this._scroll.addEventListener('keydown', key);
    laneEl.addEventListener('pointermove', move);
    laneEl.addEventListener('pointerup', up);
  }

  _applyMove(orig, group, dx, ev, startLane, anchorClip) {
    const o0 = orig.get(anchorClip);
    // Snap the anchor clip's leading or trailing edge, then apply the same delta to the whole selection.
    const lead = this._snap(o0.start + dx, group);
    const trail = this._snap(o0.start + o0.length + dx, group) - o0.length;
    let delta = (Math.abs(lead - (o0.start + dx)) <= Math.abs(trail - (o0.start + dx)) ? lead : trail) - o0.start;
    delta = Math.round(delta);
    let minStart = Infinity, maxEnd = -Infinity;
    for (const [, o] of orig) { minStart = Math.min(minStart, o.start); maxEnd = Math.max(maxEnd, o.start + o.length); }
    delta = Math.max(delta, -minStart);
    if (this.hasAttribute('constrain-to-duration')) delta = Math.min(delta, this.duration - maxEnd);

    // Lane under the pointer (clamped) → how many lanes the whole group shifts.
    const r = this._lanes.getBoundingClientRect();
    let y = ev.clientY - r.top, lane = 0, acc = 0;
    for (let i = 0; i < this._tracks.length; i++) { acc += this._tracks[i].height || 44; if (y < acc) { lane = i; break; } lane = i; }
    let laneDelta = lane - startLane;
    const tIdx = (clip) => this._tracks.indexOf(orig.get(clip).track);
    const usable = (d) => [...orig.keys()].every((c) => { const t = this._tracks[tIdx(c) + d]; return t && !t.locked; });
    if (!usable(laneDelta)) laneDelta = 0;

    const place = (d, ld) => {
      for (const [clip, o] of orig) {
        const dest = this._tracks[tIdx(clip) + ld];
        const cur = this._trackOf(clip);
        if (cur !== dest) { cur.clips.splice(cur.clips.indexOf(clip), 1); dest.clips.push(clip); }
        clip.start = o.start + d;
      }
    };
    const valid = (d, ld) => [...orig.keys()].every((c) => {
      const dest = this._tracks[tIdx(c) + ld];
      return this._fits(dest, orig.get(c).start + d, c.length, group);
    });
    // Back off toward the original position until the move is legal (no overlap / inside the project).
    let d = delta, ld = laneDelta;
    if (!valid(d, ld)) {
      while (d !== 0 && !valid(d, ld)) d += d > 0 ? -1 : 1;
      if (!valid(d, ld)) { ld = 0; while (d !== 0 && !valid(d, ld)) d += d > 0 ? -1 : 1; }
    }
    if (this.hasAttribute('auto-extend-duration') && maxEnd + d > this.duration) this._extendTo(maxEnd + d);
    place(d, ld);
  }

  _applyTrim(orig, group, mode, dx) {
    for (const [clip, o] of orig) {
      const track = this._trackOf(clip);
      const hasMedia = clip.mediaLength != null;
      const mediaStart = o.mediaStart || 0;
      if (mode === 'trim-start') {
        let start = Math.round(this._snap(o.start + dx, group));
        const minStart = hasMedia ? o.start - mediaStart : 0; // cannot trim beyond the start of the media
        start = clamp(start, Math.max(0, minStart), o.start + o.length - 1);
        if (this.hasAttribute('prevent-overlap')) {
          const prevEnd = Math.max(0, ...track.clips.filter((c) => !group.has(c) && c.start + c.length <= o.start + 0.0001).map((c) => c.start + c.length));
          start = Math.max(start, prevEnd);
        }
        clip.length = o.start + o.length - start;
        if (hasMedia) clip.mediaStart = mediaStart + (start - o.start);
        clip.start = start;
      } else {
        let end = Math.round(this._snap(o.start + o.length + dx, group));
        end = Math.max(end, o.start + 1);
        if (hasMedia) end = Math.min(end, o.start + (clip.mediaLength - mediaStart)); // …or past its end
        if (this.hasAttribute('constrain-to-duration')) end = Math.min(end, this.duration);
        if (this.hasAttribute('prevent-overlap')) {
          const next = Math.min(Infinity, ...track.clips.filter((c) => !group.has(c) && c.start >= o.start + o.length - 0.0001).map((c) => c.start));
          end = Math.min(end, next);
        }
        if (this.hasAttribute('auto-extend-duration') && end > this.duration) this._extendTo(end);
        clip.length = end - o.start;
      }
    }
  }

  _onKey(e) {
    const ctrl = e.ctrlKey || e.metaKey;
    const k = e.key;
    if (k === ' ') { e.preventDefault(); this.togglePlayback(); }
    else if (k === 'ArrowRight') { e.preventDefault(); this.stepForward(ctrl ? 10 : 1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); this.stepBackward(ctrl ? 10 : 1); }
    else if (k === 'Home') { e.preventDefault(); this._setFrame(0); }
    else if (k === 'End') { e.preventDefault(); this._setFrame(this.duration); }
    else if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); this.deleteSelection(); }
    else if (ctrl && (k === 'a' || k === 'A')) {
      e.preventDefault();
      for (const { clip, track } of this._allClips()) clip.selected = !track.locked;
      this._selectionChanged();
      this._render();
    } else if (ctrl && (k === '+' || k === '=')) { e.preventDefault(); this.zoomIn(); }
    else if (ctrl && (k === '-' || k === '_')) { e.preventDefault(); this.zoomOut(); }
    else if (ctrl && (k === 'z' || k === 'Z')) { e.preventDefault(); if (e.shiftKey) this.redo(); else this.undo(); }
    else if (ctrl && (k === 'y' || k === 'Y')) { e.preventDefault(); this.redo(); }
  }
}

/** Peak bars (0-1) from raw mono samples, for `clip.waveform`. */
export function waveformFromSamples(samples, bins = 200) {
  const out = new Array(bins).fill(0);
  const per = Math.max(1, Math.floor(samples.length / bins));
  for (let i = 0; i < bins; i++) {
    let peak = 0;
    for (let j = i * per; j < Math.min(samples.length, (i + 1) * per); j++) peak = Math.max(peak, Math.abs(samples[j]));
    out[i] = Math.min(1, peak);
  }
  return out;
}

define('tsl-animation-timeline', TesselAnimationTimeline);
