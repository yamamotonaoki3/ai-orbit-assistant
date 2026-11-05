import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import OrbitalAura from './OrbitalAura';
import {
  INITIAL_SETTINGS, MENUS, progress, recommend,
  type AppSettings, type MenuId,
} from './data';
import avatarArt from './assets/assistant.webp';

const STEP = (Math.PI * 2) / MENUS.length;

function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('ai-orbit-settings-v1');
    return raw ? { ...INITIAL_SETTINGS, ...JSON.parse(raw) as Partial<AppSettings> } : INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
}

function closestFrontIndex(angle: number) {
  let front = 0;
  let depth = -Infinity;
  for (let i = 0; i < MENUS.length; i++) {
    const candidate = Math.sin(angle + STEP * i);
    if (candidate > depth) { front = i; depth = candidate; }
  }
  return front;
}

function OrbitScene({
  selected, playing, onSelected, onPlayingChange, message,
}: {
  selected: MenuId;
  playing: boolean;
  onSelected: (id: MenuId) => void;
  onPlayingChange: (playing: boolean) => void;
  message: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const angle = useRef(Math.PI / 2);
  const targetAngle = useRef<number | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const lastX = useRef(0);
  const lastFront = useRef(0);
  const playingRef = useRef(playing);
  const onSelectedRef = useRef(onSelected);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { onSelectedRef.current = onSelected; }, [onSelected]);

  const alignMenu = (index: number) => {
    const desired = Math.PI / 2 - STEP * index;
    const difference = Math.atan2(Math.sin(desired - angle.current), Math.cos(desired - angle.current));
    targetAngle.current = angle.current + difference;
  };

  // ユーザーが明示的に選んだ場合のみ、その項目を正面へスナップさせる
  useEffect(() => {
    if (!playing) alignMenu(Math.max(0, MENUS.findIndex((m) => m.id === selected)));
  }, [selected, playing]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) onPlayingChange(false);
  }, [onPlayingChange]);

  useEffect(() => {
    let raf = 0;
    let previous = performance.now();
    const renderFrame = (now: number) => {
      const delta = Math.min(60, now - previous);
      previous = now;
      if (!dragging.current) {
        if (targetAngle.current !== null) {
          const diff = targetAngle.current - angle.current;
          angle.current += diff * Math.min(1, delta * 0.012);
          if (Math.abs(diff) < 0.002) {
            angle.current = targetAngle.current;
            targetAngle.current = null;
          }
        } else if (playingRef.current) {
          angle.current += delta * 0.00012;
        }
      }
      const width = stage.current?.getBoundingClientRect().width || 820;
      const radius = Math.min(270, Math.max(128, width * 0.34));
      const depthRadius = Math.min(165, radius * 0.65);
      MENUS.forEach((_, index) => {
        const node = cardRefs.current[index];
        if (!node) return;
        const a = angle.current + STEP * index;
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * depthRadius;
        const scale = 0.77 + (z / depthRadius + 1) * 0.17;
        node.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${Math.sin(a * 2) * 24}px, ${z}px) scale(${scale})`;
        node.style.opacity = String(0.52 + ((z / depthRadius + 1) * 0.24));
        node.style.zIndex = String(20 + Math.round(z + depthRadius));
      });
      if (playingRef.current && !dragging.current) {
        const front = closestFrontIndex(angle.current);
        if (lastFront.current !== front) {
          lastFront.current = front;
          onSelectedRef.current(MENUS[front].id);
        }
      }
      raf = requestAnimationFrame(renderFrame);
    };
    raf = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const choose = (index: number) => {
    if (moved.current) return;
    onPlayingChange(false);
    onSelected(MENUS[index].id);
    alignMenu(index);
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    dragging.current = true;
    moved.current = false;
    startX.current = event.clientX;
    lastX.current = event.clientX;
    targetAngle.current = null;
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const distance = event.clientX - startX.current;
    if (Math.abs(distance) > 7) moved.current = true;
    angle.current += (event.clientX - lastX.current) * 0.009;
    lastX.current = event.clientX;
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (moved.current) {
      const front = closestFrontIndex(angle.current);
      onPlayingChange(false);
      onSelected(MENUS[front].id);
      alignMenu(front);
      // ドラッグ終了直後のクリックを選択として扱わない
      window.setTimeout(() => { moved.current = false; }, 100);
    }
  };

  const stepMenu = (direction: number) => {
    moved.current = false;
    const index = MENUS.findIndex((item) => item.id === selected);
    choose((index + direction + MENUS.length) % MENUS.length);
  };

  return (
    <div className="scene-panel">
      <div className="scene-bg" aria-hidden="true">
        <div className="sky-glow" />
        <div className="world-arch world-arch--one" />
        <div className="world-arch world-arch--two" />
        <div className="platform" />
      </div>
      <div className="scene-headline"><span className="status-light"/> AI NAVIGATOR <span className="headline-sub">INTERACTIVE DEMO</span></div>
      <div className="canvas-decoration" aria-hidden="true"><Suspense fallback={null}><OrbitalAura /></Suspense></div>
      <img className="assistant-art" src={avatarArt} alt="笑顔のAIアシスタントキャラクター" draggable="false" />
      <div
        className="orbit-stage"
        ref={stage}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        aria-label="回転式メニューナビゲーション"
      >
        {MENUS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`orbit-card ${selected === item.id ? 'orbit-card--active' : ''}`}
            ref={(node) => { cardRefs.current[index] = node; }}
            aria-pressed={selected === item.id}
            onClick={() => choose(index)}
          >
            <span className="orbit-icon">{item.icon}</span>
            <span className="orbit-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="scene-bottom">
        <div className="assistant-speech" aria-live="polite">
          <div className="speech-tag">✦ AIアシスタント</div>
          {message}
        </div>
        <div className="orbit-controls">
          <button aria-label="前のメニュー" onClick={() => stepMenu(-1)}>〈</button>
          <span className="dots" aria-hidden="true">{MENUS.map(m => <span key={m.id} className={m.id === selected ? 'dot dot--active' : 'dot'} />)}</span>
          <button aria-label="次のメニュー" onClick={() => stepMenu(1)}>〉</button>
          <button className="spin-toggle" onClick={() => onPlayingChange(!playing)}>{playing ? '一時停止' : '自動回転'}</button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, sub }: { label: string; checked: boolean; onChange: (value: boolean) => void; sub?: string }) {
  return <label className="toggle-row">
    <span><strong>{label}</strong>{sub && <small>{sub}</small>}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="toggle-visual" aria-hidden="true" />
  </label>;
}

function Item({ children }: { children: ReactNode }) {
  return <section className="panel-section">{children}</section>;
}

function DetailPanel({ selected, settings, update, onJump }: {
  selected: MenuId;
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onJump: (menu: MenuId) => void;
}) {
  const recommendation = recommend(settings);
  const menu = MENUS.find((m) => m.id === selected)!;
  const done = progress(settings);

  return <div className="detail-shell">
    <div className="sheet-handle" />
    <div className="detail-heading">
      <div className="heading-symbol">{menu.icon}</div>
      <div className="detail-heading-copy"><span className="eyebrow">SELECTED MODULE</span><h1>{menu.label}</h1><p>{menu.description}</p></div>
      <div className="progress-ring" style={{ '--progress': `${done}%` } as React.CSSProperties}><span><small>設定完了度</small><b>{done}%</b></span></div>
    </div>

    {selected === 'profile' && <>
      <Item><h2>✦ 基本プロフィール</h2><div className="profile-grid"><div className="profile-pic">✦</div><div className="form-fields">
        <label htmlFor="display-name">ユーザー名</label>
        <input id="display-name" value={settings.displayName} placeholder="名前を入力してください" onChange={e => update('displayName', e.target.value)} maxLength={30} />
        <label htmlFor="bio">自己紹介</label>
        <textarea id="bio" rows={3} value={settings.bio} onChange={e => update('bio', e.target.value)} maxLength={160} />
      </div></div></Item>
      <Item><div className="section-head"><h2>♧ 通知設定</h2><button className="link-button" onClick={() => onJump('notifications')}>変更する ›</button></div>
        <div className="summary-pills"><span>メール <b>{settings.emailNotifications ? 'ON' : 'OFF'}</b></span><span>プッシュ <b>{settings.pushNotifications ? 'ON' : 'OFF'}</b></span><span>リマインド <b>{settings.reminders ? 'ON' : 'OFF'}</b></span></div></Item>
    </>}

    {selected === 'notifications' && <Item><h2>♧ 通知の設定</h2><Toggle label="メール通知" checked={settings.emailNotifications} onChange={v => update('emailNotifications', v)} sub="お知らせをメールで受け取ります" /><Toggle label="プッシュ通知" checked={settings.pushNotifications} onChange={v => update('pushNotifications', v)} sub="重要なお知らせを通知します（デモ表示）" /><Toggle label="タスクリマインド" checked={settings.reminders} onChange={v => update('reminders', v)} sub="期限が近いタスクをお知らせ（デモ表示）" /></Item>}

    {selected === 'tasks' && <Item><h2>☑ タスク管理</h2><p className="muted">チェックすると画面の案内が更新されます。</p><Toggle label="最初のタスクを登録する" checked={settings.firstTaskDone} onChange={v => update('firstTaskDone', v)} sub="デモ用の完了状態を保存します" /></Item>}

    {selected === 'security' && <Item><h2>◇ セキュリティ</h2><Toggle label="2段階認証の設定完了" checked={settings.twoFactor} onChange={v => update('twoFactor', v)} sub="本物の認証ではなく、UIの動作確認用スイッチです" /><p className="security-note">実際のログインや認証を有効にする機能ではありません。</p></Item>}

    {selected === 'analytics' && <Item><h2>▥ 分析ダッシュボード</h2><p className="muted">グラフはデザイン確認用のサンプルです。</p><div className="sample-chart"><span style={{height:'45%'}}/><span style={{height:'66%'}}/><span style={{height:'39%'}}/><span style={{height:'83%'}}/><span style={{height:'72%'}}/><span style={{height:'95%'}}/><span style={{height:'60%'}}/></div><div className="chart-caption"><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span><span>日</span></div></Item>}

    <Item><div className="section-head"><h2>✦ AIおすすめToDo</h2><span className="live-pill">LIVE</span></div>
      <div className="recommendation-card"><div className="recommend-icon">★</div><div><strong>{recommendation.title}</strong><p>{recommendation.text}</p></div><button className="small-action" onClick={() => onJump(recommendation.target)}>開く ›</button></div>
      <div className="todo-list">
        <div className={settings.emailNotifications || settings.pushNotifications ? 'todo done' : 'todo'}><span>{settings.emailNotifications || settings.pushNotifications ? '☑' : '□'}</span> 通知設定の確認</div>
        <div className={settings.displayName.trim() ? 'todo done' : 'todo'}><span>{settings.displayName.trim() ? '☑' : '□'}</span> プロフィールの入力</div>
        <div className={settings.twoFactor ? 'todo done' : 'todo'}><span>{settings.twoFactor ? '☑' : '□'}</span> セキュリティ設定の確認</div>
        <div className={settings.firstTaskDone ? 'todo done' : 'todo'}><span>{settings.firstTaskDone ? '☑' : '□'}</span> 最初のタスクを登録</div>
      </div>
    </Item>
    <div className="detail-footnote">🔒 このデモは外部AI APIと通信しません。入力内容はこのブラウザ内にのみ保存されます。</div>
  </div>;
}

export default function App() {
  const [selected, setSelected] = useState<MenuId>('profile');
  const [playing, setPlaying] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const message = useMemo(() => recommend(settings).text, [settings]);
  useEffect(() => {
    try { localStorage.setItem('ai-orbit-settings-v1', JSON.stringify(settings)); } catch { /* 容量制限等では記録しない */ }
  }, [settings]);
  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => setSettings(prev => ({ ...prev, [key]: value }));
  const jump = (menu: MenuId) => { setSelected(menu); setPlaying(false); };

  return <div className="app-layout">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">A</span><span>AIアシスタント</span><span className="brand-caption">ORBIT DEMO</span></div>
      <nav className="topnav" aria-label="メインメニュー"><button className="nav-active" onClick={() => jump('profile')}>⌂ ホーム</button><button onClick={() => jump('tasks')}>☑ タスク</button><button onClick={() => jump('analytics')}>▥ 分析</button></nav>
      <div className="user-status"><span className="level-star">✦</span><div><strong>Lv.12</strong><div className="xp-track"><div /></div></div><span className="app-badge">MVP / FREE</span></div>
    </header>

    <main className="dashboard">
      <OrbitScene selected={selected} playing={playing} onSelected={setSelected} onPlayingChange={setPlaying} message={message} />
      <DetailPanel selected={selected} settings={settings} update={update} onJump={jump} />
    </main>
    <footer className="footer"><div>⌘ 操作ガイド　<span>スマホ：左右スワイプで回転　｜　PC：ドラッグ・クリックで選択</span></div><button onClick={() => { setSettings(INITIAL_SETTINGS); setSelected('profile'); setPlaying(false); }}>↺ デモを初期化</button></footer>
  </div>;
}