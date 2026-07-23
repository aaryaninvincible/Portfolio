import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Trophy } from 'lucide-react';
import { playSound, toggleGameMute, getGameMuteState } from '../lib/audio';
import { subscribeToLeaderboard, submitHighScore } from '../lib/realtime';
import type { LeaderboardEntry } from '../types';

export const MiniGames: React.FC = () => {
    const [activeGame, setActiveGame] = useState<'flappy' | 'dino' | 'dodge' | 'snake' | 'breaker'>('flappy');
    const [isMuted, setIsMuted] = useState(getGameMuteState());
    const [globalScores, setGlobalScores] = useState<LeaderboardEntry[]>([]);
    
    // Score submission states
    const [lastScore, setLastScore] = useState<number>(0);
    const [showSubmit, setShowSubmit] = useState<boolean>(false);
    const [playerName, setPlayerName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

    const activeGameRef = useRef(activeGame);
    useEffect(() => {
        activeGameRef.current = activeGame;
    }, [activeGame]);

    // Subscribe to global scores when active game changes
    useEffect(() => {
        const unsubscribe = subscribeToLeaderboard(activeGame, (scores) => {
            setGlobalScores(scores);
        });
        return () => unsubscribe();
    }, [activeGame]);

    useEffect(() => {
        const animationFrames: number[] = [];
        
        const flappyCanvas = document.getElementById('flappyCanvas') as HTMLCanvasElement;
        const dinoCanvas = document.getElementById('dinoCanvas') as HTMLCanvasElement;
        const dodgeCanvas = document.getElementById('dodgeCanvas') as HTMLCanvasElement;
        const snakeCanvas = document.getElementById('snakeCanvas') as HTMLCanvasElement;
        const breakerCanvas = document.getElementById('breakerCanvas') as HTMLCanvasElement;
        if (!flappyCanvas || !dinoCanvas || !dodgeCanvas || !snakeCanvas || !breakerCanvas) return;

        // Shared game state focus helper
        const safeFocus = (id: typeof activeGame) => {
            if (activeGameRef.current !== id) {
                setActiveGame(id);
            }
        };

        const onGameOver = (_gameId: typeof activeGame, score: number) => {
            playSound('crash');
            setLastScore(Math.floor(score));
            setShowSubmit(true);
            setShowLeaderboard(true);
        };

        // --- FLAPPY ---
        function setupFlappy() {
            const ctx = flappyCanvas.getContext('2d');
            if (!ctx) return null;
            const scoreEl = document.getElementById('flappyScore');
            const startBtn = document.getElementById('flappyStart');
            const pauseBtn = document.getElementById('flappyPause');
            const tapBtn = document.getElementById('flappyTap');

            const W = flappyCanvas.width;
            const H = flappyCanvas.height;
            let running = false, started = false, paused = false, over = false, score = 0, last = 0, spawn = 0;
            let bird = { x: 70, y: H / 2, vy: 0, r: 10 };
            let pipes: any[] = [];
            let afId: number;

            function reset() {
                score = 0; over = false; paused = false; started = false; spawn = 0;
                bird = { x: 70, y: H / 2, vy: 0, r: 10 }; pipes = [];
                if (scoreEl) scoreEl.textContent = 'Score: 0';
                if (pauseBtn) pauseBtn.textContent = 'Pause';
            }

            function flap() {
                if (document.getElementById('scoreSubmitOverlay')) return;
                safeFocus('flappy');
                if (!started || over) {
                    start();
                } else if (paused) {
                    resume();
                }
                bird.vy = -220;
                playSound('jump');
            }

            function end() {
                running = false; over = true; paused = false;
                if (pauseBtn) pauseBtn.textContent = 'Pause';
                onGameOver('flappy', score);
            }

            function start() {
                safeFocus('flappy'); reset(); running = true; started = true; setShowSubmit(false);
                last = performance.now();
                afId = requestAnimationFrame(loop);
                animationFrames.push(afId);
            }

            function pause() {
                if (!running || over) return;
                running = false; paused = true;
                if (pauseBtn) pauseBtn.textContent = 'Resume';
            }

            function resume() {
                if (!paused || over) return;
                paused = false; running = true;
                if (pauseBtn) pauseBtn.textContent = 'Pause';
                last = performance.now();
                afId = requestAnimationFrame(loop);
                animationFrames.push(afId);
            }

            function togglePause() { if (paused) resume(); else pause(); }

            function update(dt: number) {
                spawn -= dt;
                if (spawn <= 0) {
                    const gap = 85;
                    const top = 20 + Math.random() * (H - gap - 40);
                    pipes.push({ x: W + 20, top, gap, passed: false });
                    spawn = 1.4;
                }

                bird.vy += 450 * dt; bird.y += bird.vy * dt;

                for (const p of pipes) {
                    p.x -= 120 * dt;
                    if (!p.passed && p.x + 36 < bird.x) {
                        p.passed = true; score += 1;
                        playSound('score');
                        if (scoreEl) scoreEl.textContent = `Score: ${score}`;
                    }

                    const hitX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + 36;
                    const hitTop = bird.y - bird.r < p.top;
                    const hitBottom = bird.y + bird.r > p.top + p.gap;
                    if (hitX && (hitTop || hitBottom)) end();
                }

                pipes = pipes.filter(p => p.x + 36 > -10);
                if (bird.y + bird.r > H || bird.y - bird.r < 0) end();
            }

            function draw() {
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);
                
                // Draw Grid (Retro scanline style)
                ctx.strokeStyle = '#222'; ctx.lineWidth = 0.5;
                for (let i = 0; i < W; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
                for (let j = 0; j < H; j += 20) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke(); }

                // Pipes
                ctx.fillStyle = '#ff7300';
                pipes.forEach(p => {
                    ctx.fillRect(p.x, 0, 36, p.top);
                    ctx.fillRect(p.x, p.top + p.gap, 36, H);
                });
                
                // Bird
                ctx.beginPath();
                ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
                ctx.fillStyle = '#ff9600'; ctx.fill(); ctx.closePath();

                if (!running && over) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Game Over', 130, H / 2);
                } else if (!running && paused) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Paused', 150, H / 2);
                } else if (!running && !started) {
                    ctx.fillStyle = '#ff7300'; ctx.font = 'bold 15px "Orbitron", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('FLAPPY BIRD', W / 2, H / 2 - 12);
                    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
                    ctx.fillText('Tap Start below or Tap Screen to Flap', W / 2, H / 2 + 15);
                    ctx.textAlign = 'left';
                }
            }

            function loop(ts: number) {
                if (!running) { draw(); return; }
                const dt = Math.min(0.033, (ts - last) / 1000);
                last = ts;
                update(dt); draw();
                if (running) { afId = requestAnimationFrame(loop); animationFrames.push(afId); }
            }

            const handleFlapAction = (e: Event) => {
                if (e.cancelable) e.preventDefault();
                flap();
            };

            startBtn?.addEventListener('click', start);
            pauseBtn?.addEventListener('click', togglePause);
            tapBtn?.addEventListener('pointerdown', handleFlapAction);
            tapBtn?.addEventListener('touchstart', handleFlapAction, { passive: false });
            flappyCanvas.addEventListener('pointerdown', handleFlapAction);
            flappyCanvas.addEventListener('touchstart', handleFlapAction, { passive: false });
            reset(); draw();
            return {
                action: flap,
                pause,
                resume,
                isPaused: () => paused,
                isRunning: () => running,
                cleanup: () => {
                    startBtn?.removeEventListener('click', start);
                    pauseBtn?.removeEventListener('click', togglePause);
                    tapBtn?.removeEventListener('pointerdown', handleFlapAction);
                    tapBtn?.removeEventListener('touchstart', handleFlapAction);
                    flappyCanvas.removeEventListener('pointerdown', handleFlapAction);
                    flappyCanvas.removeEventListener('touchstart', handleFlapAction);
                }
            };
        }

        // --- DINO ---
        function setupDino() {
            const ctx = dinoCanvas.getContext('2d');
            if (!ctx) return null;
            const scoreEl = document.getElementById('dinoScore');
            const startBtn = document.getElementById('dinoStart');
            const pauseBtn = document.getElementById('dinoPause');
            const jumpBtn = document.getElementById('dinoJump');
            const W = dinoCanvas.width; const H = dinoCanvas.height;
            let afId: number;

            let running = false, started = false, paused = false, over = false, score = 0, last = 0, spawn = 0;
            let dino = { x: 45, y: 165, w: 22, h: 35, vy: 0 };
            let obstacles: any[] = [];
            const ground = 200;

            function reset() {
                running = false; started = false; paused = false; over = false; score = 0; spawn = 0;
                dino = { x: 45, y: 165, w: 22, h: 35, vy: 0 }; obstacles = [];
                if (scoreEl) scoreEl.textContent = 'Score: 0';
                if (pauseBtn) pauseBtn.textContent = 'Pause';
            }

            function jump() {
                if (document.getElementById('scoreSubmitOverlay')) return;
                safeFocus('dino');
                if (!started || over) {
                    start();
                } else if (paused) {
                    resume();
                }
                if (dino.y + dino.h >= ground) {
                    dino.vy = -340;
                    playSound('jump');
                }
            }

            function start() {
                safeFocus('dino'); reset(); running = true; started = true; setShowSubmit(false);
                last = performance.now(); afId = requestAnimationFrame(loop);
                animationFrames.push(afId);
            }

            function end() {
                running = false; over = true; paused = false;
                if (pauseBtn) pauseBtn.textContent = 'Pause';
                onGameOver('dino', score);
            }
            
            function pause() { if (!running || over) return; running = false; paused = true; if (pauseBtn) pauseBtn.textContent = 'Resume'; }
            function resume() { if (!paused || over) return; paused = false; running = true; if (pauseBtn) pauseBtn.textContent = 'Pause'; last = performance.now(); afId = requestAnimationFrame(loop); }
            function togglePause() { if (paused) resume(); else pause(); }

            function update(dt: number) {
                spawn -= dt;
                if (spawn <= 0) {
                    obstacles.push({ x: W + 10, y: 170, w: 16 + Math.random() * 10, h: 30 });
                    spawn = 1.0 + Math.random() * 0.8;
                }
                dino.vy += 800 * dt; dino.y += dino.vy * dt;
                if (dino.y + dino.h > ground) { dino.y = ground - dino.h; dino.vy = 0; }

                for (const ob of obstacles) {
                    ob.x -= 210 * dt;
                    const hit = dino.x < ob.x + ob.w && dino.x + dino.w > ob.x && dino.y < ob.y + ob.h && dino.y + dino.h > ob.y;
                    if (hit) end();
                }
                obstacles = obstacles.filter(ob => ob.x + ob.w > -5);
                const oldScore = Math.floor(score);
                score += dt * 10;
                if (Math.floor(score) % 100 === 0 && Math.floor(score) > oldScore) {
                    playSound('score');
                }
                if (scoreEl) scoreEl.textContent = `Score: ${Math.floor(score)}`;
            }

            function draw() {
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#ff7300'; ctx.fillRect(0, ground, W, 4); // Ground line

                // Dino
                ctx.fillStyle = '#ff9600'; ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
                
                // Obstacles
                ctx.fillStyle = '#ff5500';
                obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, ob.w, ob.h));

                if (!running && over) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Crashed!', 140, H / 2);
                } else if (!running && paused) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Paused', 150, H / 2);
                } else if (!running && !started) {
                    ctx.fillStyle = '#ff7300'; ctx.font = 'bold 15px "Orbitron", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('CHROME DINO RUN', W / 2, H / 2 - 12);
                    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
                    ctx.fillText('Tap Start below or Tap Screen to Jump', W / 2, H / 2 + 15);
                    ctx.textAlign = 'left';
                }
            }

            function loop(ts: number) {
                if (!running) { draw(); return; }
                const dt = Math.min(0.033, (ts - last) / 1000);
                last = ts; update(dt); draw();
                if (running) { afId = requestAnimationFrame(loop); animationFrames.push(afId); }
            }

            const handleJumpAction = (e: Event) => {
                if (e.cancelable) e.preventDefault();
                jump();
            };

            startBtn?.addEventListener('click', start);
            pauseBtn?.addEventListener('click', togglePause);
            jumpBtn?.addEventListener('pointerdown', handleJumpAction);
            jumpBtn?.addEventListener('touchstart', handleJumpAction, { passive: false });
            dinoCanvas.addEventListener('pointerdown', handleJumpAction);
            dinoCanvas.addEventListener('touchstart', handleJumpAction, { passive: false });
            reset(); draw();
            return {
                action: jump,
                pause,
                resume,
                isPaused: () => paused,
                isRunning: () => running,
                cleanup: () => {
                    startBtn?.removeEventListener('click', start);
                    pauseBtn?.removeEventListener('click', togglePause);
                    jumpBtn?.removeEventListener('pointerdown', handleJumpAction);
                    jumpBtn?.removeEventListener('touchstart', handleJumpAction);
                    dinoCanvas.removeEventListener('pointerdown', handleJumpAction);
                    dinoCanvas.removeEventListener('touchstart', handleJumpAction);
                }
            };
        }

        // --- DODGE ---
        function setupDodge() {
            const ctx = dodgeCanvas.getContext('2d');
            if (!ctx) return null;
            const scoreEl = document.getElementById('dodgeScore');
            const startBtn = document.getElementById('dodgeStart');
            const pauseBtn = document.getElementById('dodgePause');
            const leftBtn = document.getElementById('dodgeLeft');
            const rightBtn = document.getElementById('dodgeRight');
            const W = dodgeCanvas.width; const H = dodgeCanvas.height;
            let afId: number;

            let running = false, started = false, paused = false, over = false, score = 0, last = 0, spawn = 0;
            let player = { x: W / 2 - 16, y: H - 24, w: 32, h: 12 };
            let blocks: any[] = [];
            let moveLeft = false, moveRight = false;

            function reset() {
                running = false; started = false; paused = false; over = false; score = 0; spawn = 0;
                player = { x: W / 2 - 16, y: H - 24, w: 32, h: 12 }; blocks = []; moveLeft = false; moveRight = false;
                if (scoreEl) scoreEl.textContent = 'Score: 0';
                if (pauseBtn) pauseBtn.textContent = 'Pause';
            }

            function start() {
                safeFocus('dodge'); reset(); running = true; started = true; setShowSubmit(false);
                last = performance.now(); afId = requestAnimationFrame(loop);
                animationFrames.push(afId);
            }

            function end() {
                running = false; over = true; paused = false;
                if (pauseBtn) pauseBtn.textContent = 'Pause';
                onGameOver('dodge', score);
            }
            
            function pause() { if (!running || over) return; running = false; paused = true; if (pauseBtn) pauseBtn.textContent = 'Resume'; }
            function resume() { if (!paused || over) return; paused = false; running = true; if (pauseBtn) pauseBtn.textContent = 'Pause'; last = performance.now(); afId = requestAnimationFrame(loop); }
            function togglePause() { if (paused) resume(); else pause(); }

            function update(dt: number) {
                if (moveLeft) player.x -= 240 * dt;
                if (moveRight) player.x += 240 * dt;
                player.x = Math.max(0, Math.min(W - player.w, player.x));

                spawn -= dt;
                if (spawn <= 0) {
                    const bw = 16 + Math.random() * 20;
                    blocks.push({ x: Math.random() * (W - bw), y: -15, w: bw, h: 12 + Math.random() * 16, v: 100 + Math.random() * 140 });
                    spawn = 0.35 + Math.random() * 0.3;
                }

                for (const b of blocks) {
                    b.y += b.v * dt;
                    const hit = player.x < b.x + b.w && player.x + player.w > b.x && player.y < b.y + b.h && player.y + player.h > b.y;
                    if (hit) end();
                }
                blocks = blocks.filter(b => b.y < H + 20);
                const oldScore = Math.floor(score);
                score += dt * 15;
                if (Math.floor(score) % 150 === 0 && Math.floor(score) > oldScore) {
                    playSound('score');
                }
                if (scoreEl) scoreEl.textContent = `Score: ${Math.floor(score)}`;
            }

            function draw() {
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);

                // Blocks
                ctx.fillStyle = '#ff5500';
                blocks.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
                
                // Player
                ctx.fillStyle = '#ff9600';
                ctx.fillRect(player.x, player.y, player.w, player.h);

                if (!running && over) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Boom!', 150, H / 2);
                } else if (!running && paused) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Paused', 150, H / 2);
                } else if (!running && !started) {
                    ctx.fillStyle = '#ff7300'; ctx.font = 'bold 15px "Orbitron", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('ASTEROID DODGE', W / 2, H / 2 - 12);
                    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
                    ctx.fillText('Tap Start / Drag Screen to Dodge', W / 2, H / 2 + 15);
                    ctx.textAlign = 'left';
                }
            }

            function loop(ts: number) {
                if (!running) { draw(); return; }
                const dt = Math.min(0.033, (ts - last) / 1000);
                last = ts; update(dt); draw();
                if (running) { afId = requestAnimationFrame(loop); animationFrames.push(afId); }
            }

            function pressLeft(on: boolean) { safeFocus('dodge'); moveLeft = on; }
            function pressRight(on: boolean) { safeFocus('dodge'); moveRight = on; }

            const handleStart = () => start();
            const handleTogglePause = () => togglePause();
            const handleLeftDown = (e: PointerEvent) => { e.preventDefault(); pressLeft(true); };
            const handleLeftUp = () => pressLeft(false);
            const handleRightDown = (e: PointerEvent) => { e.preventDefault(); pressRight(true); };
            const handleRightUp = () => pressRight(false);
            const handleCanvasDown = (e: PointerEvent) => {
                if (document.getElementById('scoreSubmitOverlay')) return;
                safeFocus('dodge'); const rect = dodgeCanvas.getBoundingClientRect(); const x = e.clientX - rect.left;
                player.x = Math.max(0, Math.min(W - player.w, (x / rect.width) * W - player.w / 2));
                if (!started || over) start(); else if (paused) resume();
            };
            const handleCanvasMove = (e: PointerEvent) => {
                if (document.getElementById('scoreSubmitOverlay')) return;
                if (!running) return; const rect = dodgeCanvas.getBoundingClientRect(); const x = e.clientX - rect.left;
                player.x = Math.max(0, Math.min(W - player.w, (x / rect.width) * W - player.w / 2));
            };

            startBtn?.addEventListener('click', handleStart);
            pauseBtn?.addEventListener('click', handleTogglePause);
            leftBtn?.addEventListener('pointerdown', handleLeftDown as any);
            leftBtn?.addEventListener('touchstart', handleLeftDown as any, { passive: false });
            leftBtn?.addEventListener('pointerup', handleLeftUp);
            leftBtn?.addEventListener('touchend', handleLeftUp);
            leftBtn?.addEventListener('pointerleave', handleLeftUp);
            leftBtn?.addEventListener('pointercancel', handleLeftUp);
            rightBtn?.addEventListener('pointerdown', handleRightDown as any);
            rightBtn?.addEventListener('touchstart', handleRightDown as any, { passive: false });
            rightBtn?.addEventListener('pointerup', handleRightUp);
            rightBtn?.addEventListener('touchend', handleRightUp);
            rightBtn?.addEventListener('pointerleave', handleRightUp);
            rightBtn?.addEventListener('pointercancel', handleRightUp);
            dodgeCanvas.addEventListener('pointerdown', handleCanvasDown as any);
            dodgeCanvas.addEventListener('touchstart', handleCanvasDown as any, { passive: false });
            dodgeCanvas.addEventListener('pointermove', handleCanvasMove as any);
            dodgeCanvas.addEventListener('touchmove', handleCanvasMove as any, { passive: false });

            reset(); draw();
            return {
                leftDown: () => pressLeft(true),
                leftUp: () => pressLeft(false),
                rightDown: () => pressRight(true),
                rightUp: () => pressRight(false),
                pause,
                resume,
                isPaused: () => paused,
                isRunning: () => running,
                cleanup: () => {
                    startBtn?.removeEventListener('click', handleStart);
                    pauseBtn?.removeEventListener('click', handleTogglePause);
                    leftBtn?.removeEventListener('pointerdown', handleLeftDown as any);
                    leftBtn?.removeEventListener('pointerup', handleLeftUp);
                    leftBtn?.removeEventListener('pointerleave', handleLeftUp);
                    leftBtn?.removeEventListener('pointercancel', handleLeftUp);
                    rightBtn?.removeEventListener('pointerdown', handleRightDown as any);
                    rightBtn?.removeEventListener('pointerup', handleRightUp);
                    rightBtn?.removeEventListener('pointerleave', handleRightUp);
                    rightBtn?.removeEventListener('pointercancel', handleRightUp);
                    dodgeCanvas.removeEventListener('pointerdown', handleCanvasDown as any);
                    dodgeCanvas.removeEventListener('pointermove', handleCanvasMove as any);
                }
            };
        }

        // --- SNAKE ---
        function setupSnake() {
            const ctx = snakeCanvas.getContext('2d');
            if (!ctx) return null;
            const scoreEl = document.getElementById('snakeScore');
            const startBtn = document.getElementById('snakeStart');
            const pauseBtn = document.getElementById('snakePause');
            const W = snakeCanvas.width; const H = snakeCanvas.height;
            const gridSize = 10;
            let afId: number;

            let running = false, paused = false, over = false, score = 0, last = 0, speed = 0.12, timer = 0;
            let snake = [{ x: 5 * gridSize, y: 5 * gridSize }];
            let dir = { x: gridSize, y: 0 };
            let nextDir = { x: gridSize, y: 0 };
            let food = { x: 10 * gridSize, y: 10 * gridSize };

            function reset() {
                running = false; paused = false; over = false; score = 0; speed = 0.12; timer = 0;
                snake = [{ x: 5 * gridSize, y: 5 * gridSize }];
                dir = { x: gridSize, y: 0 }; nextDir = { x: gridSize, y: 0 };
                placeFood();
                if (scoreEl) scoreEl.textContent = 'Score: 0';
                if (pauseBtn) pauseBtn.textContent = 'Pause';
            }

            function placeFood() {
                food.x = Math.floor(Math.random() * (W / gridSize)) * gridSize;
                food.y = Math.floor(Math.random() * (H / gridSize)) * gridSize;
            }

            function start() {
                if (document.getElementById('scoreSubmitOverlay')) return;
                safeFocus('snake'); reset(); running = true; setShowSubmit(false);
                last = performance.now(); afId = requestAnimationFrame(loop);
                animationFrames.push(afId);
            }

            function end() {
                running = false; over = true; paused = false;
                if (pauseBtn) pauseBtn.textContent = 'Pause';
                onGameOver('snake', score);
            }
            
            function pause() { if (!running || over) return; running = false; paused = true; if (pauseBtn) pauseBtn.textContent = 'Resume'; }
            function resume() { if (!paused || over) return; paused = false; running = true; if (pauseBtn) pauseBtn.textContent = 'Pause'; last = performance.now(); afId = requestAnimationFrame(loop); }
            function togglePause() { if (paused) resume(); else pause(); }

            function update(dt: number) {
                timer += dt;
                if (timer >= speed) {
                    timer = 0;
                    dir = nextDir;
                    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
                    
                    if (head.x < 0 || head.x >= W || head.y < 0 || head.y >= H) { end(); return; }
                    for (let i = 0; i < snake.length; i++) {
                        if (head.x === snake[i].x && head.y === snake[i].y) { end(); return; }
                    }
                    
                    snake.unshift(head);
                    if (head.x === food.x && head.y === food.y) {
                        score += 10;
                        playSound('score');
                        speed = Math.max(0.04, speed - 0.003);
                        if (scoreEl) scoreEl.textContent = `Score: ${score}`;
                        placeFood();
                    } else {
                        snake.pop();
                    }
                }
            }

            function draw() {
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);
                
                // Food
                ctx.fillStyle = '#ff3c00';
                ctx.fillRect(food.x, food.y, gridSize, gridSize);
                
                // Snake
                ctx.fillStyle = '#ff7300';
                snake.forEach((s, idx) => {
                    ctx.fillStyle = idx === 0 ? '#ff9600' : '#ff7300';
                    ctx.fillRect(s.x, s.y, gridSize - 1, gridSize - 1);
                });

                if (!running && over) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Game Over', 130, H / 2);
                } else if (!running && paused) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Paused', 150, H / 2);
                } else if (!running) {
                    ctx.fillStyle = '#ff7300'; ctx.font = 'bold 15px "Orbitron", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('CYBER SNAKE', W / 2, H / 2 - 12);
                    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
                    ctx.fillText('Tap Start below to begin', W / 2, H / 2 + 15);
                    ctx.textAlign = 'left';
                }
            }

            function loop(ts: number) {
                if (!running) { draw(); return; }
                const dt = Math.min(0.033, (ts - last) / 1000);
                last = ts; update(dt); draw();
                if (running) { afId = requestAnimationFrame(loop); animationFrames.push(afId); }
            }

            function up() { if (dir.y === 0) { nextDir = { x: 0, y: -gridSize }; playSound('jump'); } }
            function down() { if (dir.y === 0) { nextDir = { x: 0, y: gridSize }; playSound('jump'); } }
            function left() { if (dir.x === 0) { nextDir = { x: -gridSize, y: 0 }; playSound('jump'); } }
            function right() { if (dir.x === 0) { nextDir = { x: gridSize, y: 0 }; playSound('jump'); } }

            let touchStartX = 0, touchStartY = 0;
            const handleSnakeTouchStart = (e: TouchEvent) => {
                if (e.cancelable) e.preventDefault();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                if (!running && !over) start(); else if (paused) resume();
            };
            const handleSnakeTouchEnd = (e: TouchEvent) => {
                if (e.cancelable) e.preventDefault();
                const dx = e.changedTouches[0].clientX - touchStartX;
                const dy = e.changedTouches[0].clientY - touchStartY;
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 15) {
                    if (dx > 0) right(); else left();
                } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 15) {
                    if (dy > 0) down(); else up();
                }
            };

            const upBtn = document.getElementById('snakeUp');
            const downBtn = document.getElementById('snakeDown');
            const leftBtn = document.getElementById('snakeLeft');
            const rightBtn = document.getElementById('snakeRight');

            const handleUpClick = (e: Event) => { if (e.cancelable) e.preventDefault(); safeFocus('snake'); if (!running && !over) start(); else if (paused) resume(); up(); };
            const handleDownClick = (e: Event) => { if (e.cancelable) e.preventDefault(); safeFocus('snake'); if (!running && !over) start(); else if (paused) resume(); down(); };
            const handleLeftClick = (e: Event) => { if (e.cancelable) e.preventDefault(); safeFocus('snake'); if (!running && !over) start(); else if (paused) resume(); left(); };
            const handleRightClick = (e: Event) => { if (e.cancelable) e.preventDefault(); safeFocus('snake'); if (!running && !over) start(); else if (paused) resume(); right(); };

            upBtn?.addEventListener('pointerdown', handleUpClick);
            upBtn?.addEventListener('touchstart', handleUpClick, { passive: false });
            downBtn?.addEventListener('pointerdown', handleDownClick);
            downBtn?.addEventListener('touchstart', handleDownClick, { passive: false });
            leftBtn?.addEventListener('pointerdown', handleLeftClick);
            leftBtn?.addEventListener('touchstart', handleLeftClick, { passive: false });
            rightBtn?.addEventListener('pointerdown', handleRightClick);
            rightBtn?.addEventListener('touchstart', handleRightClick, { passive: false });

            snakeCanvas.addEventListener('touchstart', handleSnakeTouchStart, { passive: false });
            snakeCanvas.addEventListener('touchend', handleSnakeTouchEnd, { passive: false });

            startBtn?.addEventListener('click', start);
            pauseBtn?.addEventListener('click', togglePause);

            reset(); draw();
            return {
                up,
                down,
                left,
                right,
                pause,
                resume,
                isPaused: () => paused,
                isRunning: () => running,
                cleanup: () => {
                    upBtn?.removeEventListener('pointerdown', handleUpClick);
                    upBtn?.removeEventListener('touchstart', handleUpClick);
                    downBtn?.removeEventListener('pointerdown', handleDownClick);
                    downBtn?.removeEventListener('touchstart', handleDownClick);
                    leftBtn?.removeEventListener('pointerdown', handleLeftClick);
                    leftBtn?.removeEventListener('touchstart', handleLeftClick);
                    rightBtn?.removeEventListener('pointerdown', handleRightClick);
                    rightBtn?.removeEventListener('touchstart', handleRightClick);
                    snakeCanvas.removeEventListener('touchstart', handleSnakeTouchStart);
                    snakeCanvas.removeEventListener('touchend', handleSnakeTouchEnd);
                    startBtn?.removeEventListener('click', start);
                    pauseBtn?.removeEventListener('click', togglePause);
                }
            };
        }

        // --- BREAKER ---
        function setupBreaker() {
            const ctx = breakerCanvas.getContext('2d');
            if (!ctx) return null;
            const scoreEl = document.getElementById('breakerScore');
            const startBtn = document.getElementById('breakerStart');
            const pauseBtn = document.getElementById('breakerPause');
            const leftBtn = document.getElementById('breakerLeft');
            const rightBtn = document.getElementById('breakerRight');
            const W = breakerCanvas.width; const H = breakerCanvas.height;
            let afId: number;

            let running = false, started = false, paused = false, over = false, score = 0, last = 0;
            let paddle = { x: W / 2 - 30, y: H - 16, w: 60, h: 10 };
            let ball = { x: W / 2, y: H - 30, vx: 120, vy: -150, r: 5 };
            let bricks: any[] = [];
            let moveLeft = false, moveRight = false;

            function initBricks() {
                bricks = [];
                const rows = 3, cols = 7;
                const bw = 44, bh = 12, padding = 4, offsetTop = 20, offsetLeft = (W - (cols * (bw + padding) - padding)) / 2;
                const colors = ['#ff7300', '#00f3ff', '#ab47bc'];
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        bricks.push({
                            x: offsetLeft + c * (bw + padding),
                            y: offsetTop + r * (bh + padding),
                            w: bw, h: bh,
                            color: colors[r],
                            alive: true
                        });
                    }
                }
            }

            function reset() {
                running = false; started = false; paused = false; over = false; score = 0;
                paddle = { x: W / 2 - 30, y: H - 16, w: 60, h: 10 };
                ball = { x: W / 2, y: H - 30, vx: (Math.random() > 0.5 ? 1 : -1) * 130, vy: -150, r: 5 };
                initBricks();
                if (scoreEl) scoreEl.textContent = 'Score: 0';
                if (pauseBtn) pauseBtn.textContent = 'Pause';
            }

            function start() {
                safeFocus('breaker'); reset(); running = true; started = true; setShowSubmit(false);
                last = performance.now(); afId = requestAnimationFrame(loop);
                animationFrames.push(afId);
            }

            function end() {
                running = false; over = true; paused = false;
                if (pauseBtn) pauseBtn.textContent = 'Pause';
                onGameOver('breaker', score);
            }

            function pause() { if (!running || over) return; running = false; paused = true; if (pauseBtn) pauseBtn.textContent = 'Resume'; }
            function resume() { if (!paused || over) return; paused = false; running = true; if (pauseBtn) pauseBtn.textContent = 'Pause'; last = performance.now(); afId = requestAnimationFrame(loop); }
            function togglePause() { if (paused) resume(); else pause(); }

            function update(dt: number) {
                if (moveLeft) paddle.x -= 260 * dt;
                if (moveRight) paddle.x += 260 * dt;
                paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

                ball.x += ball.vx * dt;
                ball.y += ball.vy * dt;

                // Wall collisions
                if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; playSound('jump'); }
                if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx *= -1; playSound('jump'); }
                if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; playSound('jump'); }

                // Paddle collision
                if (ball.y + ball.r >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w && ball.vy > 0) {
                    ball.vy = -Math.abs(ball.vy);
                    const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
                    ball.vx = hitPos * 180;
                    playSound('jump');
                }

                // Brick collisions
                let remaining = 0;
                for (const b of bricks) {
                    if (!b.alive) continue;
                    remaining++;
                    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
                        b.alive = false;
                        ball.vy *= -1;
                        score += 20;
                        playSound('score');
                        if (scoreEl) scoreEl.textContent = `Score: ${score}`;
                        break;
                    }
                }

                if (remaining === 0) { end(); return; }
                if (ball.y - ball.r > H) { end(); }
            }

            function draw() {
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);

                for (const b of bricks) {
                    if (b.alive) {
                        ctx.fillStyle = b.color;
                        ctx.fillRect(b.x, b.y, b.w, b.h);
                    }
                }

                ctx.fillStyle = '#ff7300';
                ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.closePath();

                if (!running && over) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Game Over', 130, H / 2);
                } else if (!running && paused) {
                    ctx.fillStyle = '#fff'; ctx.font = '16px "Orbitron", sans-serif';
                    ctx.fillText('Paused', 150, H / 2);
                } else if (!running && !started) {
                    ctx.fillStyle = '#ff7300'; ctx.font = 'bold 15px "Orbitron", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('NEON BRICK BREAKER', W / 2, H / 2 - 12);
                    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
                    ctx.fillText('Tap Start / Drag Paddle to Play', W / 2, H / 2 + 15);
                    ctx.textAlign = 'left';
                }
            }

            function loop(ts: number) {
                if (!running) { draw(); return; }
                const dt = Math.min(0.033, (ts - last) / 1000);
                last = ts; update(dt); draw();
                if (running) { afId = requestAnimationFrame(loop); animationFrames.push(afId); }
            }

            function pressLeft(on: boolean) { safeFocus('breaker'); moveLeft = on; }
            function pressRight(on: boolean) { safeFocus('breaker'); moveRight = on; }

            const handleLeftDown = (e: Event) => { if (e.cancelable) e.preventDefault(); pressLeft(true); };
            const handleLeftUp = () => pressLeft(false);
            const handleRightDown = (e: Event) => { if (e.cancelable) e.preventDefault(); pressRight(true); };
            const handleRightUp = () => pressRight(false);

            const handleCanvasMove = (e: PointerEvent | TouchEvent) => {
                if (document.getElementById('scoreSubmitOverlay')) return;
                safeFocus('breaker');
                const clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
                const rect = breakerCanvas.getBoundingClientRect();
                const x = clientX - rect.left;
                paddle.x = Math.max(0, Math.min(W - paddle.w, (x / rect.width) * W - paddle.w / 2));
                if (!started || over) start(); else if (paused) resume();
            };

            startBtn?.addEventListener('click', start);
            pauseBtn?.addEventListener('click', togglePause);
            leftBtn?.addEventListener('pointerdown', handleLeftDown);
            leftBtn?.addEventListener('touchstart', handleLeftDown, { passive: false });
            leftBtn?.addEventListener('pointerup', handleLeftUp);
            leftBtn?.addEventListener('touchend', handleLeftUp);
            rightBtn?.addEventListener('pointerdown', handleRightDown);
            rightBtn?.addEventListener('touchstart', handleRightDown, { passive: false });
            rightBtn?.addEventListener('pointerup', handleRightUp);
            rightBtn?.addEventListener('touchend', handleRightUp);

            breakerCanvas.addEventListener('pointermove', handleCanvasMove as any);
            breakerCanvas.addEventListener('touchmove', handleCanvasMove as any, { passive: false });
            breakerCanvas.addEventListener('pointerdown', handleCanvasMove as any);

            reset(); draw();
            return {
                leftDown: () => pressLeft(true),
                leftUp: () => pressLeft(false),
                rightDown: () => pressRight(true),
                rightUp: () => pressRight(false),
                pause,
                resume,
                isPaused: () => paused,
                isRunning: () => running,
                cleanup: () => {
                    startBtn?.removeEventListener('click', start);
                    pauseBtn?.removeEventListener('click', togglePause);
                    leftBtn?.removeEventListener('pointerdown', handleLeftDown);
                    leftBtn?.removeEventListener('touchstart', handleLeftDown);
                    leftBtn?.removeEventListener('pointerup', handleLeftUp);
                    leftBtn?.removeEventListener('touchend', handleLeftUp);
                    rightBtn?.removeEventListener('pointerdown', handleRightDown);
                    rightBtn?.removeEventListener('touchstart', handleRightDown);
                    rightBtn?.removeEventListener('pointerup', handleRightUp);
                    rightBtn?.removeEventListener('touchend', handleRightUp);
                    breakerCanvas.removeEventListener('pointermove', handleCanvasMove as any);
                    breakerCanvas.removeEventListener('touchmove', handleCanvasMove as any);
                    breakerCanvas.removeEventListener('pointerdown', handleCanvasMove as any);
                }
            };
        }

        const flappy = setupFlappy();
        const dino = setupDino();
        const dodge = setupDodge();
        const snake = setupSnake();
        const breaker = setupBreaker();
        const games: any = { flappy, dino, dodge, snake, breaker };

        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            const current = activeGameRef.current;
            if (e.code === 'Space') {
                if (current === 'dino' && games.dino) games.dino.action();
                else if (current === 'flappy' && games.flappy) games.flappy.action();
            }
            if ((current === 'dodge' || current === 'breaker') && e.code === 'ArrowLeft' && games[current]) games[current].leftDown();
            if ((current === 'dodge' || current === 'breaker') && e.code === 'ArrowRight' && games[current]) games[current].rightDown();
            if (current === 'dino' && e.code === 'ArrowUp' && games.dino) games.dino.action();
            
            if (current === 'snake' && games.snake) {
                if (e.code === 'ArrowUp') games.snake.up();
                if (e.code === 'ArrowDown') games.snake.down();
                if (e.code === 'ArrowLeft') games.snake.left();
                if (e.code === 'ArrowRight') games.snake.right();
            }
            if (e.code === 'KeyP') {
                if (games[current]) {
                    if (games[current].isPaused()) games[current].resume();
                    else games[current].pause();
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const current = activeGameRef.current;
            if ((current === 'dodge' || current === 'breaker') && e.code === 'ArrowLeft' && games[current]) games[current].leftUp();
            if ((current === 'dodge' || current === 'breaker') && e.code === 'ArrowRight' && games[current]) games[current].rightUp();
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            animationFrames.forEach(id => cancelAnimationFrame(id));
            Object.keys(games).forEach(k => { 
                if (games[k]) {
                    games[k].pause(); 
                    if (games[k].cleanup) games[k].cleanup();
                }
            });
        };
    }, [activeGame]);

    const handleGameChange = (gameId: typeof activeGame) => {
        setActiveGame(gameId);
        setShowSubmit(false);
    };

    const handleMuteToggle = () => {
        const isMutedNow = toggleGameMute();
        setIsMuted(isMutedNow);
    };

    const submitScore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerName.trim() || lastScore <= 0 || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await submitHighScore(activeGame, playerName.trim(), lastScore);
            setPlayerName('');
            setShowSubmit(false);
            setShowLeaderboard(true);
            // Re-fetch handled automatically by Firebase onValue subscription
        } catch (error) {
            console.error('Leaderboard submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-full sm:max-w-2xl mx-auto space-y-6 no-cursor-follower flex flex-col items-center">
            {/* Game Selector & Mute Toggle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center w-full">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2 w-full sm:w-auto justify-center">
                    {(['flappy', 'dino', 'dodge', 'snake', 'breaker'] as const).map((g) => (
                        <button
                            key={g}
                            onClick={() => handleGameChange(g)}
                            className={`rounded-lg py-2.5 px-3 font-mono text-xs tracking-wider uppercase border transition-all text-center flex items-center justify-center font-bold ${
                                activeGame === g
                                    ? 'bg-primary text-black border-primary font-black shadow-[0_0_12px_rgba(255,115,0,0.4)]'
                                    : 'bg-white/10 border-white/15 text-slate-300 hover:border-white/30 hover:text-white'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                        className={`glass rounded-lg px-4 py-2 text-xs font-mono flex items-center justify-center gap-2 border-white/10 hover:border-primary/40 transition-all ${
                            showLeaderboard
                                ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_10px_rgba(255,115,0,0.15)]'
                                : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        <Trophy size={14} className={showLeaderboard ? 'text-primary' : 'text-slate-400'} />
                        <span>{showLeaderboard ? 'Hide Scores' : 'Leaderboard'}</span>
                    </button>
                    <button
                        onClick={handleMuteToggle}
                        className="glass rounded-lg px-4 py-2 text-xs font-mono flex items-center justify-center gap-2 text-slate-300 border-white/10 hover:border-primary/40"
                    >
                        {isMuted ? <VolumeX size={14} className="text-secondary" /> : <Volume2 size={14} className="text-primary" />}
                        <span>{isMuted ? 'Muted' : 'Mute'}</span>
                    </button>
                </div>
            </div>

            {/* Game Box */}
            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/10 bg-black/80 relative overflow-hidden flex flex-col items-center">
                {/* Flappy Card */}
                <div className={`w-full flex flex-col items-center ${activeGame === 'flappy' ? '' : 'hidden'}`}>
                    <div className="flex justify-between w-full max-w-[360px] mb-3 text-xs font-mono text-slate-400">
                        <span>TAP / SPACE to flap</span>
                        <span id="flappyScore" className="text-secondary font-bold">Score: 0</span>
                    </div>
                    <canvas id="flappyCanvas" className="border border-white/10 rounded-xl cursor-crosshair bg-black w-full max-w-[360px]" width="360" height="220" style={{ touchAction: 'none' }}></canvas>
                    <div className="flex gap-4 mt-4 w-full max-w-[360px] justify-center">
                        <button id="flappyStart" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono bg-primary text-black rounded-lg hover:shadow-[0_0_15px_rgba(255,115,0,0.5)] transition-all">Start</button>
                        <button id="flappyPause" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono glass border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">Pause</button>
                    </div>
                    <button id="flappyTap" className="w-full max-w-[360px] mt-3 py-3 text-xs sm:text-sm uppercase tracking-widest font-black font-orbitron bg-gradient-to-r from-primary to-accent text-black rounded-xl shadow-[0_0_15px_rgba(255,115,0,0.4)] active:scale-95 transition-all select-none touch-none flex items-center justify-center gap-2">⚡ TAP TO FLAP BIRD</button>
                </div>

                {/* Dino Card */}
                <div className={`w-full flex flex-col items-center ${activeGame === 'dino' ? '' : 'hidden'}`}>
                    <div className="flex justify-between w-full max-w-[360px] mb-3 text-xs font-mono text-slate-400">
                        <span>TAP / SPACE to jump</span>
                        <span id="dinoScore" className="text-accent font-bold">Score: 0</span>
                    </div>
                    <canvas id="dinoCanvas" className="border border-white/10 rounded-xl cursor-crosshair bg-black w-full max-w-[360px] touch-none" width="360" height="220" style={{ touchAction: 'none' }}></canvas>
                    <div className="flex gap-4 mt-4 w-full max-w-[360px] justify-center">
                        <button id="dinoStart" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono bg-primary text-black rounded-lg hover:shadow-[0_0_15px_rgba(255,115,0,0.5)] transition-all">Start</button>
                        <button id="dinoPause" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono glass border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">Pause</button>
                    </div>
                    <button id="dinoJump" className="w-full max-w-[360px] mt-3 py-3 text-xs sm:text-sm uppercase tracking-widest font-black font-orbitron bg-gradient-to-r from-accent to-secondary text-black rounded-xl shadow-[0_0_15px_rgba(0,243,255,0.4)] active:scale-95 transition-all select-none touch-none flex items-center justify-center gap-2">🚀 TAP TO JUMP DINO</button>
                </div>

                {/* Dodge Card */}
                <div className={`w-full flex flex-col items-center ${activeGame === 'dodge' ? '' : 'hidden'}`}>
                    <div className="flex justify-between w-full max-w-[360px] mb-3 text-xs font-mono text-slate-400">
                        <span>DRAG / TAP to dodge</span>
                        <span id="dodgeScore" className="text-primary font-bold">Score: 0</span>
                    </div>
                    <canvas id="dodgeCanvas" className="border border-white/10 rounded-xl cursor-crosshair bg-black w-full max-w-[360px] touch-none" width="360" height="220" style={{ touchAction: 'none' }}></canvas>
                    <div className="flex gap-3 mt-4 w-full max-w-[360px] justify-center">
                        <button id="dodgeStart" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono bg-primary text-black rounded-lg hover:shadow-[0_0_15px_rgba(255,115,0,0.5)] transition-all">Start</button>
                        <button id="dodgePause" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono glass border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">Pause</button>
                    </div>
                    <div className="flex gap-3 w-full max-w-[360px] justify-center mt-3">
                        <button id="dodgeLeft" className="flex-1 py-3 text-xs sm:text-sm font-black font-orbitron bg-accent/20 text-accent border border-accent/60 rounded-xl active:scale-95 transition-all select-none touch-none flex items-center justify-center gap-1">◀ LEFT</button>
                        <button id="dodgeRight" className="flex-1 py-3 text-xs sm:text-sm font-black font-orbitron bg-accent/20 text-accent border border-accent/60 rounded-xl active:scale-95 transition-all select-none touch-none flex items-center justify-center gap-1">RIGHT ▶</button>
                    </div>
                </div>

                {/* Snake Card */}
                <div className={`w-full flex flex-col items-center ${activeGame === 'snake' ? '' : 'hidden'}`}>
                    <div className="flex justify-between w-full max-w-[360px] mb-3 text-xs font-mono text-slate-400">
                        <span>SWIPE or TAP D-Pad</span>
                        <span id="snakeScore" className="text-secondary font-bold">Score: 0</span>
                    </div>
                    <canvas id="snakeCanvas" className="border border-white/10 rounded-xl bg-black w-full max-w-[360px] touch-none" width="360" height="220" style={{ touchAction: 'none' }}></canvas>
                    <div className="flex gap-4 mt-4 w-full max-w-[360px] justify-center">
                        <button id="snakeStart" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono bg-primary text-black rounded-lg hover:shadow-[0_0_15px_rgba(255,115,0,0.5)] transition-all">Start</button>
                        <button id="snakePause" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono glass border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">Pause</button>
                    </div>
                    {/* Mobile & Touch Controls */}
                    <div className="grid grid-cols-3 gap-2 mt-4 w-44 justify-items-center touch-none select-none">
                        <div />
                        <button id="snakeUp" className="h-12 w-12 bg-primary/20 text-primary border-2 border-primary/60 rounded-xl flex items-center justify-center font-black text-lg active:scale-90 transition-transform">↑</button>
                        <div />
                        <button id="snakeLeft" className="h-12 w-12 bg-primary/20 text-primary border-2 border-primary/60 rounded-xl flex items-center justify-center font-black text-lg active:scale-90 transition-transform">←</button>
                        <div className="h-12 w-12 flex items-center justify-center text-sm font-mono text-slate-400">🎮</div>
                        <button id="snakeRight" className="h-12 w-12 bg-primary/20 text-primary border-2 border-primary/60 rounded-xl flex items-center justify-center font-black text-lg active:scale-90 transition-transform">→</button>
                        <div />
                        <button id="snakeDown" className="h-12 w-12 bg-primary/20 text-primary border-2 border-primary/60 rounded-xl flex items-center justify-center font-black text-lg active:scale-90 transition-transform">↓</button>
                        <div />
                    </div>
                </div>

                {/* Breaker Card */}
                <div className={`w-full flex flex-col items-center ${activeGame === 'breaker' ? '' : 'hidden'}`}>
                    <div className="flex justify-between w-full max-w-[360px] mb-3 text-xs font-mono text-slate-400">
                        <span>DRAG / TAP to move paddle</span>
                        <span id="breakerScore" className="text-primary font-bold">Score: 0</span>
                    </div>
                    <canvas id="breakerCanvas" className="border border-white/10 rounded-xl bg-black w-full max-w-[360px] touch-none" width="360" height="220" style={{ touchAction: 'none' }}></canvas>
                    <div className="flex gap-3 mt-4 w-full max-w-[360px] justify-center">
                        <button id="breakerStart" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono bg-primary text-black rounded-lg hover:shadow-[0_0_15px_rgba(255,115,0,0.5)] transition-all">Start</button>
                        <button id="breakerPause" className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold font-mono glass border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">Pause</button>
                    </div>
                    <div className="flex gap-3 w-full max-w-[360px] justify-center mt-3">
                        <button id="breakerLeft" className="flex-1 py-3 text-xs sm:text-sm font-black font-orbitron bg-accent/20 text-accent border border-accent/60 rounded-xl active:scale-95 transition-all select-none touch-none flex items-center justify-center gap-1">◀ LEFT</button>
                        <button id="breakerRight" className="flex-1 py-3 text-xs sm:text-sm font-black font-orbitron bg-accent/20 text-accent border border-accent/60 rounded-xl active:scale-95 transition-all select-none touch-none flex items-center justify-center gap-1">RIGHT ▶</button>
                    </div>
                </div>

                {/* Submit Score Modal overlay if game over */}
                {showSubmit && lastScore > 0 && (
                    <div id="scoreSubmitOverlay" className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 z-30">
                        <Trophy size={48} className="text-accent animate-bounce mb-3" />
                        <h3 className="font-orbitron text-xl font-bold text-light mb-1">New Score: {lastScore}!</h3>
                        <p className="text-xs text-slate-400 mb-5 text-center font-mono">Submit to the global live leaderboard</p>
                        <form onSubmit={submitScore} className="w-full max-w-[280px] space-y-3">
                            <input
                                type="text"
                                className="input-shell text-center"
                                placeholder="Enter your name"
                                maxLength={15}
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-black py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 font-orbitron"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Score'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSubmit(false)}
                                    className="w-1/2 glass border-white/10 text-white py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Global Leaderboard - DISPLAY OUTSIDE THE GAME BOX */}
            {showLeaderboard && (
                <div className="glass p-5 rounded-2xl border border-white/10 bg-black/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="text-primary" size={18} />
                        <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-light">
                            🏆 Global Leaderboard (<span className="text-primary capitalize">{activeGame}</span>)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase">
                                    <th className="pb-2 pl-2 w-16">Rank</th>
                                    <th className="pb-2">Player</th>
                                    <th className="pb-2 pr-2 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {globalScores.map((entry, index) => (
                                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-2.5 pl-2 font-orbitron text-slate-300 flex items-center gap-1">
                                            {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                        </td>
                                        <td className="py-2.5 font-bold text-light">{entry.name}</td>
                                        <td className="py-2.5 pr-2 text-right text-primary font-bold">{entry.score}</td>
                                    </tr>
                                ))}
                                {globalScores.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                                            No high scores yet. Play to set one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
