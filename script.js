/* ZENOVA v2.2 — modular vanilla JavaScript */
"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

class StorageManager {
  constructor() { this.key = "zenova-tictactoe-v22"; }
  load() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch { return {}; } }
  save(data) { try { localStorage.setItem(this.key, JSON.stringify(data)); } catch {} }
}

class AudioManager {
  constructor() { this.enabled = true; this.ctx = null; }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }
  tone(freq, duration = .08, type = "sine", gain = .03) {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(gain, this.ctx.currentTime);
      amp.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + duration);
      osc.connect(amp).connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }
  click() { this.tone(260, .045, "triangle", .02); }
  move() { this.tone(520, .07, "sine", .03); }
  win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, .16, "sine", .04), i * 85)); }
  draw() { [330, 294, 262].forEach((f, i) => setTimeout(() => this.tone(f, .13, "triangle", .03), i * 90)); }
}

class AIPlayer {
  constructor() { this.difficulty = "hard"; }
  empty(board) { return board.map((v, i) => v ? null : i).filter(i => i !== null); }
  choose(board, ai = "O", human = "X") {
    if (this.difficulty === "easy") return this.random(board);
    if (this.difficulty === "medium") return this.medium(board, ai, human);
    return this.minimaxRoot(board, ai, human);
  }
  random(board) { const e = this.empty(board); return e[Math.floor(Math.random() * e.length)]; }
  winner(board) {
    for (const [a,b,c] of GameEngine.lines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    return null;
  }
  medium(board, ai, human) {
    for (const i of this.empty(board)) { board[i] = ai; const win = this.winner(board) === ai; board[i] = null; if (win) return i; }
    for (const i of this.empty(board)) { board[i] = human; const win = this.winner(board) === human; board[i] = null; if (win) return i; }
    if (!board[4]) return 4;
    return this.random(board);
  }
  minimaxRoot(board, ai, human) {
    let bestScore = -Infinity, bestMove = this.empty(board)[0];
    for (const i of this.empty(board)) {
      board[i] = ai;
      const score = this.minimax(board, 0, false, ai, human);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestMove = i; }
    }
    return bestMove;
  }
  minimax(board, depth, maximizing, ai, human) {
    const winner = this.winner(board);
    if (winner === ai) return 10 - depth;
    if (winner === human) return depth - 10;
    const empty = this.empty(board);
    if (!empty.length) return 0;
    if (maximizing) {
      let best = -Infinity;
      for (const i of empty) { board[i] = ai; best = Math.max(best, this.minimax(board, depth + 1, false, ai, human)); board[i] = null; }
      return best;
    }
    let best = Infinity;
    for (const i of empty) { board[i] = human; best = Math.min(best, this.minimax(board, depth + 1, true, ai, human)); board[i] = null; }
    return best;
  }
}

class GameEngine {
  static lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  constructor() { this.ai = new AIPlayer(); this.reset(); }
  reset() { this.board = Array(9).fill(null); this.current = "X"; this.history = []; this.over = false; }
  move(index) {
    if (this.over || this.board[index]) return { ok: false };
    const player = this.current;
    this.board[index] = player;
    this.history.push({ index, player });
    return { ok: true, player, index, ...this.result() };
  }
  next() { this.current = this.current === "X" ? "O" : "X"; }
  undo(mode = "pvp") {
    if (!this.history.length) return false;
    let count = mode === "ai" && this.history.length > 1 ? 2 : 1;
    while (count-- && this.history.length) {
      const move = this.history.pop();
      this.board[move.index] = null;
    }
    this.current = "X";
    for (const move of this.history) this.current = move.player === "X" ? "O" : "X";
    this.over = false;
    return true;
  }
  result() {
    for (const line of GameEngine.lines) {
      const [a,b,c] = line;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) return { winner: this.board[a], line };
    }
    if (this.board.every(Boolean)) return { draw: true };
    return {};
  }
}

class Confetti {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext("2d"); this.parts = []; addEventListener("resize", () => this.resize()); this.resize(); }
  resize() { this.canvas.width = innerWidth; this.canvas.height = innerHeight; }
  burst() {
    for (let i = 0; i < 150; i++) this.parts.push({ x: innerWidth/2, y: innerHeight*.38, vx:(Math.random()-.5)*10, vy:-Math.random()*11-3, g:.25, r:2+Math.random()*5, a:1, spin:Math.random()*.3 });
    this.loop();
  }
  loop() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    const colors = ["#9c7cff","#52e5ff","#ff78bb","#82f7b0","#ffffff"];
    this.parts.forEach(p => { p.vy += p.g; p.x += p.vx; p.y += p.vy; p.a -= .008; this.ctx.save(); this.ctx.globalAlpha=Math.max(0,p.a); this.ctx.translate(p.x,p.y); this.ctx.rotate(p.spin+=.12); this.ctx.fillStyle=colors[Math.floor(Math.random()*colors.length)]; this.ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.8); this.ctx.restore(); });
    this.parts = this.parts.filter(p => p.a > 0 && p.y < innerHeight + 20);
    if (this.parts.length) requestAnimationFrame(() => this.loop());
  }
}

class UIController {
  constructor(engine, storage, audio) {
    this.game = engine; this.storage = storage; this.audio = audio; this.confetti = new Confetti($("#confetti")); this.timer = null; this.toastTimer = null;
    const saved = storage.load();
    this.state = Object.assign({ scores:{X:0,O:0,D:0}, names:{X:"PLAYER X",O:"PLAYER O"}, sound:true, dark:true, timer:false, contrast:false, difficulty:"hard", mode:"pvp" }, saved);
    this.state.scores = Object.assign({X:0,O:0,D:0}, this.state.scores || {});
    this.state.names = Object.assign({X:"PLAYER X",O:"PLAYER O"}, this.state.names || {});
    this.mode = this.state.mode === "ai" ? "ai" : "pvp";
    this.state.mode = this.mode;
    this.renderCells(); this.bind(); this.applySettings(); this.render();
    setTimeout(() => $("#splash").classList.add("hide"), 850);
  }

  bind() {
    $$(".mode").forEach(btn => btn.addEventListener("click", () => { this.audio.click(); this.setMode(btn.dataset.mode); }));
    $("#playAgain").onclick = () => { this.audio.click(); this.resetRound(); };
    $("#undoBtn").onclick = () => { if (this.game.undo(this.mode)) { this.audio.click(); this.clearWinBeam(); this.render(); this.toast("Last move undone"); } };
    $("#resetScores").onclick = () => { this.state.scores={X:0,O:0,D:0}; this.persist(); this.renderScores(); this.audio.click(); this.toast("Scores reset"); };
    $("#settingsBtn").onclick = () => { this.audio.click(); this.openSettings(); };
    $("#soundBtn").onclick = () => { this.state.sound=!this.state.sound; this.audio.enabled=this.state.sound; this.persist(); this.syncSettings(); if(this.state.sound)this.audio.click(); this.updateSoundButton(); };
    $("#aboutBtn").onclick = () => { this.audio.click(); $("#aboutModal").hidden=false; };
    $$('[data-close]').forEach(btn => btn.onclick = () => $("#"+btn.dataset.close).hidden=true);
    $("#saveSettings").onclick = () => this.saveSettings();
    $("#homeBtn").onclick = () => { this.audio.click(); this.resetRound(); window.scrollTo({top:0,behavior:"smooth"}); };
    $("#board").addEventListener("click", e => { const cell=e.target.closest(".cell"); if(cell)this.play(+cell.dataset.index); });
    $("#board").addEventListener("keydown", e => this.handleBoardKey(e));
  }

  handleBoardKey(e) {
    const cell=e.target.closest(".cell"); if(!cell)return;
    let index=+cell.dataset.index;
    if(e.key==="ArrowRight"){e.preventDefault();index=(index+1)%9;this.focusCell(index);}
    else if(e.key==="ArrowLeft"){e.preventDefault();index=(index+8)%9;this.focusCell(index);}
    else if(e.key==="ArrowDown"){e.preventDefault();index=(index+3)%9;this.focusCell(index);}
    else if(e.key==="ArrowUp"){e.preventDefault();index=(index+6)%9;this.focusCell(index);}
    else if(e.key==="Enter"||e.key===" "){e.preventDefault();this.play(index);}
  }

  setMode(mode) {
    const next = mode === "ai" ? "ai" : "pvp";
    if (next === this.mode) return;
    this.mode = next; this.state.mode = next; this.persist(); this.resetRound(); this.updateModeUI();
    this.toast(next === "ai" ? "Player vs Nova enabled" : "Player vs Player enabled");
  }

  resetRound() { this.stopTimer(); this.game.reset(); this.clearWinBeam(); this.render(); if(this.state.timer)this.startTimer(); }

  renderCells() {
    const board=$("#board"); board.innerHTML="";
    for(let i=0;i<9;i++){ const cell=document.createElement("button"); cell.className="cell"; cell.dataset.index=i; cell.setAttribute("role","gridcell"); cell.setAttribute("aria-label",`Cell ${i+1}, empty`); board.appendChild(cell); }
  }
  focusCell(i){ $(`.cell[data-index="${i}"]`)?.focus(); }

  play(index) {
    if(this.game.over) return;
    if(this.mode === "ai" && this.game.current === "O") return;
    if(this.game.board[index]){ const c=$(`.cell[data-index="${index}"]`); c.classList.remove("invalid"); void c.offsetWidth; c.classList.add("invalid"); this.audio.click(); this.toast("That cell is already occupied"); return; }
    const result=this.game.move(index); if(!result.ok)return;
    this.audio.move(); this.render(); if(this.finish(result))return;
    this.game.next(); this.renderTurn(); this.startTimer();
    if(this.mode === "ai" && this.game.current === "O") { this.stopTimer(); setTimeout(()=>this.aiMove(),320); }
  }

  aiMove(){
    if(this.mode!=="ai"||this.game.over||this.game.current!=="O")return;
    this.game.ai.difficulty=this.state.difficulty;
    const index=this.game.ai.choose([...this.game.board]);
    const result=this.game.move(index); if(!result.ok)return;
    this.audio.move(); this.render(); if(this.finish(result))return;
    this.game.next(); this.renderTurn(); this.startTimer();
  }

  finish(result){
    if(result.winner){ this.game.over=true; this.state.scores[result.winner]++; this.persist(); this.renderScores(); this.highlight(result.line); this.stopTimer(); this.audio.win(); this.confetti.burst(); this.toast(`${this.displayName(result.winner)} wins!`); return true; }
    if(result.draw){ this.game.over=true; this.state.scores.D++; this.persist(); this.renderScores(); this.stopTimer(); this.audio.draw(); this.toast("It's a draw — great battle!"); return true; }
    return false;
  }

  render(){ this.renderCellsState(); this.renderTurn(); this.renderHistory(); this.renderScores(); this.updateModeUI(); }
  renderCellsState(){ this.game.board.forEach((value,i)=>{const c=$(`.cell[data-index="${i}"]`); c.className="cell"+(value?` filled ${value.toLowerCase()}`:""); c.textContent=value||""; c.setAttribute("aria-label",value?`Cell ${i+1}, ${value}`:`Cell ${i+1}, empty`);}); }
  renderTurn(){ const name=this.game.current==="X"?this.displayName("X"):(this.mode==="ai"?"NOVA":this.displayName("O")); $("#turnText").textContent=`${name.toUpperCase()}'S TURN`; const dot=$(".turn-dot"); dot.style.background=this.game.current==="X"?"var(--x)":"var(--o)"; dot.style.boxShadow=`0 0 12px ${this.game.current==="X"?"var(--x)":"var(--o)"}`; }
  renderScores(){ $("#scoreX").textContent=this.state.scores.X; $("#scoreO").textContent=this.state.scores.O; $("#scoreD").textContent=this.state.scores.D; $("#nameX").textContent=this.state.names.X; $("#nameO").textContent=this.mode==="ai"?"NOVA":this.state.names.O; }
  renderHistory(){ const h=$("#historyList"); h.innerHTML=this.game.history.length?this.game.history.map((m,n)=>`<span class="history-chip"><b>${n+1}.</b> ${m.player} → ${m.index+1}</span>`).join(""):"<span class=\"empty-history\">Your moves will appear here.</span>"; $("#moveCount").textContent=`${this.game.history.length} MOVE${this.game.history.length===1?"":"S"}`; }

  highlight(line){
    this.clearWinBeam();
    line.forEach(i=>$(`.cell[data-index="${i}"]`).classList.add("win"));
    requestAnimationFrame(()=>{
      const first=$(`.cell[data-index="${line[0]}"]`).getBoundingClientRect();
      const last=$(`.cell[data-index="${line[2]}"]`).getBoundingClientRect();
      const shell=$(".board-shell").getBoundingClientRect();
      const p1={x:first.left+first.width/2,y:first.top+first.height/2};
      const p2={x:last.left+last.width/2,y:last.top+last.height/2};
      const dx=p2.x-p1.x, dy=p2.y-p1.y;
      const beam=$("#winBeam");
      beam.style.left=`${(p1.x+p2.x)/2-shell.left}px`;
      beam.style.top=`${(p1.y+p2.y)/2-shell.top}px`;
      beam.style.width=`${Math.max(30,Math.hypot(dx,dy)-first.width*.14)}px`;
      beam.style.setProperty("--beam-angle",`${Math.atan2(dy,dx)}rad`);
      beam.classList.add("show");
    });
  }
  clearWinBeam(){ const beam=$("#winBeam"); beam.classList.remove("show"); beam.style.cssText=""; $$(".cell.win").forEach(c=>c.classList.remove("win")); }
  displayName(player){ return this.state.names[player] || `PLAYER ${player}`; }

  updateModeUI(){
    $$(".mode").forEach(btn=>btn.classList.toggle("active",btn.dataset.mode===this.mode));
    $("#sideTitle").textContent=this.mode==="ai"?"NOVA ARENA":"LOCAL DUEL";
    $("#sideText").textContent=this.mode==="ai"?`NOVA is ${this.state.difficulty==="hard"?"unbeatable":this.state.difficulty}. Can you outsmart it?`:"Pass the device and challenge a friend.";
  }
  updateSoundButton(){ $("#soundBtn").textContent=this.state.sound?"♫":"♩"; }
  openSettings(){ this.syncSettings(); $("#settingsModal").hidden=false; }
  syncSettings(){ $("#soundToggle").checked=!!this.state.sound; $("#darkToggle").checked=!!this.state.dark; $("#timerToggle").checked=!!this.state.timer; $("#contrastToggle").checked=!!this.state.contrast; $("#difficultySelect").value=this.state.difficulty; $("#nameXInput").value=this.state.names.X; $("#nameOInput").value=this.state.names.O; }
  saveSettings(){
    this.state.sound=$("#soundToggle").checked; this.state.dark=$("#darkToggle").checked; this.state.timer=$("#timerToggle").checked; this.state.contrast=$("#contrastToggle").checked; this.state.difficulty=$("#difficultySelect").value; this.state.names.X=$("#nameXInput").value.trim()||"PLAYER X"; this.state.names.O=$("#nameOInput").value.trim()||"PLAYER O";
    this.audio.enabled=this.state.sound; this.persist(); this.applySettings(); $("#settingsModal").hidden=true; this.audio.click(); this.toast("Settings saved");
  }
  applySettings(){ document.body.classList.toggle("light",!this.state.dark); document.body.classList.toggle("contrast",!!this.state.contrast); this.audio.enabled=!!this.state.sound; this.updateSoundButton(); $("#timerWrap").hidden=!this.state.timer; this.updateModeUI(); this.renderScores(); this.persist(); if(!this.game.over){this.stopTimer(); if(this.state.timer)this.startTimer();} }

  startTimer(){
    this.stopTimer(); if(!this.state.timer||this.game.over)return;
    let left=10; const circle=$("#timerProgress"); $("#timerText").textContent="10"; circle.style.strokeDashoffset="0";
    this.timer=setInterval(()=>{ left-=.1; $("#timerText").textContent=Math.max(0,Math.ceil(left)); circle.style.strokeDashoffset=(106.8*(1-left/10)).toFixed(2); if(left<=0){ this.stopTimer(); if(this.game.over)return; if(this.mode==="ai"&&this.game.current==="O")this.aiMove(); else { const empty=this.game.board.map((v,i)=>v?null:i).filter(i=>i!==null); if(empty.length)this.play(empty[Math.floor(Math.random()*empty.length)]); } } },100);
  }
  stopTimer(){ if(this.timer){clearInterval(this.timer);this.timer=null;} }
  persist(){ this.state.mode=this.mode; this.storage.save(this.state); }
  toast(message){ const t=$("#toast"); t.textContent=message; t.classList.add("show"); clearTimeout(this.toastTimer); this.toastTimer=setTimeout(()=>t.classList.remove("show"),1800); }
}

const App={ui:null};
document.addEventListener("DOMContentLoaded",()=>{
  const controller=new UIController(new GameEngine(),new StorageManager(),new AudioManager());
  App.ui=controller;
  addEventListener("resize",()=>{if(controller.game.over){const r=controller.game.result();if(r.line)controller.highlight(r.line);}});
  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js?v=2.2").catch(()=>{});
});
