const STORAGE_KEYS = {
  state: 'pomodoro-state-v1',
  history: 'pomodoro-history-v1',
  theme: 'pomodoro-theme-v1',
  notifications: 'pomodoro-notifications-v1'
};

const THEME_OPTIONS = ['light', 'dark'];

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const RING_CIRCUMFERENCE = 2 * Math.PI * 88;

const elements = {
  body: document.body,
  modeBadge: document.getElementById('timer-mode'),
  timerDisplay: document.getElementById('timer-display'),
  progressCircle: document.getElementById('progress-circle'),
  startButton: document.getElementById('start-btn'),
  pauseButton: document.getElementById('pause-btn'),
  resetButton: document.getElementById('reset-btn'),
  focusNote: document.getElementById('focus-note'),
  historyList: document.getElementById('history-list'),
  weekTotal: document.getElementById('stats-week-total'),
  averageDuration: document.getElementById('stats-average-duration'),
  currentStreak: document.getElementById('stats-current-streak'),
  statsChart: document.getElementById('stats-chart'),
  themeButton: document.getElementById('theme-button'),
  themeIcon: document.getElementById('theme-icon'),
  themeColorMeta: document.getElementById('theme-color-meta'),
  notificationButton: document.getElementById('notification-button')
};

let audioContext = null;
let timerId = null;
let statsChart = null;
let themePreference = loadThemePreference();
let notificationsEnabled = loadNotificationPreference();

const state = loadState();

function loadThemePreference() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    return THEME_OPTIONS.includes(savedTheme) ? savedTheme : 'dark';
  } catch (error) {
    console.warn('Unable to read theme preference.', error);
    return 'dark';
  }
}

function saveThemePreference() {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, themePreference);
  } catch (error) {
    console.warn('Unable to persist theme preference.', error);
  }
}

function loadNotificationPreference() {
  try {
    return localStorage.getItem(STORAGE_KEYS.notifications) === 'enabled';
  } catch (error) {
    console.warn('Unable to read notification preference.', error);
    return false;
  }
}

function saveNotificationPreference() {
  try {
    localStorage.setItem(STORAGE_KEYS.notifications, notificationsEnabled ? 'enabled' : 'disabled');
  } catch (error) {
    console.warn('Unable to persist notification preference.', error);
  }
}

function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return window.Notification.permission;
}

function renderNotificationControl() {
  const permission = getNotificationPermission();
  const isEnabled = notificationsEnabled && permission === 'granted';
  let status = 'Notifications off';
  let label = 'Enable browser notifications';
  let disabled = false;

  if (permission === 'unsupported') {
    status = 'Notifications unavailable';
    label = 'Browser notifications are unavailable';
    disabled = true;
  } else if (permission === 'denied') {
    status = 'Notifications blocked';
    label = 'Browser notifications are blocked';
    disabled = true;
  } else if (isEnabled) {
    status = 'Notifications on';
    label = 'Disable browser notifications';
  } else if (permission === 'granted') {
    label = 'Enable browser notifications';
  } else {
    label = 'Enable browser notifications';
  }

  elements.notificationButton.disabled = disabled;
  elements.notificationButton.setAttribute('aria-pressed', String(isEnabled));
  elements.notificationButton.setAttribute('aria-label', label);
  elements.notificationButton.title = label;
  elements.notificationButton.dataset.status = status;
}

async function toggleNotifications() {
  const permission = getNotificationPermission();

  if (permission === 'unsupported' || permission === 'denied') {
    renderNotificationControl();
    return;
  }

  if (permission === 'granted') {
    notificationsEnabled = !notificationsEnabled;
  } else {
    try {
      const requestedPermission = await window.Notification.requestPermission();
      notificationsEnabled = requestedPermission === 'granted';
    } catch (error) {
      notificationsEnabled = false;
      console.warn('Unable to request browser notification permission.', error);
    }
  }

  saveNotificationPreference();
  renderNotificationControl();
}

function getEffectiveTheme() {
  return themePreference;
}

function getThemeToken(name) {
  return getComputedStyle(elements.body).getPropertyValue(name).trim();
}

function getNextTheme() {
  const currentIndex = THEME_OPTIONS.indexOf(themePreference);
  return THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];
}

function formatThemeName(theme) {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

function applyTheme() {
  const effectiveTheme = getEffectiveTheme();
  const isLight = effectiveTheme === 'light';
  const nextTheme = getNextTheme();
  const themeLabel = `Theme: ${formatThemeName(themePreference)}. Activate to use ${formatThemeName(nextTheme)} theme`;

  document.documentElement.classList.toggle('theme-light', isLight);
  document.documentElement.classList.toggle('theme-dark', !isLight);
  elements.body.dataset.theme = effectiveTheme;
  elements.themeButton.setAttribute('aria-label', themeLabel);
  elements.themeButton.title = themeLabel;
  elements.themeIcon.setAttribute('d', isLight
    ? 'M12 3v2m0 14v2M5.64 5.64l1.42 1.42m9.9 9.9 1.42 1.42M3 12h2m14 0h2M5.64 18.36l1.42-1.42m9.9-9.9 1.42-1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'
    : 'M20.35 15.35A8.5 8.5 0 0 1 8.65 3.65 8.5 8.5 0 1 0 20.35 15.35Z');
  elements.themeColorMeta.content = isLight ? '#f5f7fb' : '#0b1220';
}

function defaultState() {
  return {
    mode: 'work',
    phase: 'idle',
    remainingSeconds: WORK_SECONDS,
    totalSeconds: WORK_SECONDS,
    lastTimestamp: null
  };
}

function loadState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEYS.state) || 'null');

    if (!savedState) {
      return defaultState();
    }

    return {
      ...defaultState(),
      ...savedState,
      remainingSeconds: Number(savedState.remainingSeconds) || WORK_SECONDS,
      totalSeconds: Number(savedState.totalSeconds) || WORK_SECONDS,
      mode: savedState.mode === 'break' ? 'break' : 'work',
      phase: ['idle', 'running', 'paused'].includes(savedState.phase) ? savedState.phase : 'idle'
    };
  } catch (error) {
    console.warn('Unable to read Pomodoro state from storage.', error);
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist Pomodoro state.', error);
  }
}

function loadHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.warn('Unable to read Pomodoro history.', error);
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  } catch (error) {
    console.warn('Unable to persist Pomodoro history.', error);
  }
}

function getModeDuration(mode) {
  return mode === 'work' ? WORK_SECONDS : BREAK_SECONDS;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function formatDisplayDuration(seconds) {
  const totalMinutes = Math.round(seconds / 60);
  return `${totalMinutes} min`;
}

function formatHistoryTimestamp(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWorkHistory(history = loadHistory()) {
  return history.filter((entry) => entry && entry.type === 'work' && Number(entry.durationSeconds) > 0);
}

function calculateCurrentStreak(history = loadHistory()) {
  const workDates = new Set(
    getWorkHistory(history)
      .map((entry) => {
        const entryDate = new Date(entry.date);
        return Number.isNaN(entryDate.getTime()) ? null : getDateKey(entryDate);
      })
      .filter(Boolean)
  );

  if (!workDates.size) {
    return 0;
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 365; offset += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const key = getDateKey(day);

    if (workDates.has(key)) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function calculateLastSevenDayTotals(history = loadHistory()) {
  const workHistory = getWorkHistory(history);
  const totalsByDay = new Map();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);

    totalsByDay.set(getDateKey(date), {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      count: 0
    });
  }

  workHistory.forEach((entry) => {
    const entryDate = new Date(entry.date);
    if (Number.isNaN(entryDate.getTime())) {
      return;
    }

    const key = getDateKey(entryDate);
    if (totalsByDay.has(key)) {
      totalsByDay.get(key).count += 1;
    }
  });

  return Array.from(totalsByDay.values());
}

function calculateStatistics() {
  const history = loadHistory();
  const workHistory = getWorkHistory(history);
  const dailyTotals = calculateLastSevenDayTotals(history);
  const totalSeconds = workHistory.reduce((sum, entry) => sum + Number(entry.durationSeconds || 0), 0);
  const averageSeconds = workHistory.length ? totalSeconds / workHistory.length : null;

  return {
    totalWeekSessions: dailyTotals.reduce((sum, day) => sum + day.count, 0),
    averageMinutes: averageSeconds === null ? null : averageSeconds / 60,
    currentStreak: calculateCurrentStreak(history),
    dailyTotals
  };
}

function renderStatistics() {
  const { totalWeekSessions, averageMinutes, currentStreak, dailyTotals } = calculateStatistics();

  elements.weekTotal.textContent = String(totalWeekSessions);
  elements.averageDuration.textContent = averageMinutes === null ? 'No data' : `${Math.round(averageMinutes)} min`;
  elements.currentStreak.textContent = `${currentStreak} day${currentStreak === 1 ? '' : 's'}`;

  const chartSummary = dailyTotals
    .map((day) => `${day.label}: ${day.count} session${day.count === 1 ? '' : 's'}`)
    .join(', ');
  document.getElementById('stats-chart-summary').textContent =
    `Seven-day Pomodoro activity: ${chartSummary}.`;

  if (!window.echarts || !elements.statsChart) {
    return;
  }

  if (!statsChart) {
    statsChart = window.echarts.init(elements.statsChart, null, { renderer: 'svg' });
    window.addEventListener('resize', () => statsChart.resize(), { passive: true });
  }

  const labels = dailyTotals.map((day) => day.label);
  const values = dailyTotals.map((day) => day.count);
  const maxValue = Math.max(1, ...values);

  statsChart.setOption({
    animation: false,
    grid: {
      top: 16,
      left: 10,
      right: 14,
      bottom: 24,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: labels,
      axisLabel: {
          color: getThemeToken('--muted'),
        fontSize: 10
      },
      axisLine: {
        lineStyle: {
            color: getThemeToken('--panel-border')
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: maxValue,
      axisLabel: {
        color: getThemeToken('--muted'),
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: getThemeToken('--chart-grid')
        }
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: getThemeToken('--bg-elevated'),
      borderColor: getThemeToken('--panel-border'),
      textStyle: {
        color: getThemeToken('--text')
      }
    },
    series: [{
      type: 'bar',
      barWidth: '56%',
      data: values,
      itemStyle: {
        color: getThemeToken('--ring-progress'),
        borderRadius: [8, 8, 0, 0]
      }
    }]
  }, true);
}

function renderTimer() {
  elements.timerDisplay.textContent = formatTime(state.remainingSeconds);
  updateRing();
}

function updateTheme() {
  applyTheme();
}

function updateRing() {
  const progress = state.remainingSeconds / state.totalSeconds;
  const strokeOffset = RING_CIRCUMFERENCE * (1 - progress);
  elements.progressCircle.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  elements.progressCircle.style.strokeDashoffset = String(strokeOffset);
}

function renderHistory() {
  const history = loadHistory();

  if (!history.length) {
    elements.historyList.innerHTML = '<li class="history-empty">No completed sessions yet</li>';
    return;
  }

  const rows = history
    .slice(0, 20)
    .map((item) => {
      const text = item.type === 'work' ? 'Work' : 'Break';
      const note = typeof item.note === 'string' ? item.note.trim() : '';
      return `
        <li class="history-item">
          <div class="history-meta">
            <span class="history-date">${formatHistoryTimestamp(item.date)}</span>
            <span class="history-type">${text}</span>
            ${note ? `<span class="history-note">${escapeHtml(note)}</span>` : ''}
          </div>
          <span class="history-duration">${formatDisplayDuration(item.durationSeconds)}</span>
        </li>
      `;
    })
    .join('');

  elements.historyList.innerHTML = rows;
}

function render() {
  updateTheme();
  elements.body.dataset.mode = state.mode;
  elements.body.dataset.phase = state.phase;
  elements.modeBadge.textContent = state.mode === 'work' ? 'Work' : 'Break';

  if (state.phase === 'paused') {
    elements.modeBadge.textContent = 'Paused';
  }

  elements.startButton.disabled = state.phase === 'running';
  elements.pauseButton.disabled = state.phase !== 'running';
  elements.resetButton.disabled = state.phase === 'idle' && state.mode === 'work' && state.remainingSeconds === WORK_SECONDS;

  renderTimer();
  renderStatistics();
  renderHistory();
  saveState();
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function playCompletionTone() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtor) {
    return;
  }

  try {
    audioContext = audioContext || new AudioCtor();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = state.mode === 'work' ? 880 : 660;
    gainNode.gain.value = 0.001;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } catch (error) {
    console.warn('Unable to play a notification tone.', error);
  }
}

function sendCompletionNotification(sessionType) {
  if (!notificationsEnabled || getNotificationPermission() !== 'granted') {
    return;
  }

  const isWorkSession = sessionType === 'work';
  const title = isWorkSession ? 'Work session complete' : 'Break complete';
  const body = isWorkSession ? 'Your break is ready.' : 'Your next work session is ready.';

  try {
    new window.Notification(title, {
      body,
      tag: `pomodoro-${sessionType}-complete`
    });
  } catch (error) {
    console.warn('Unable to display browser notification.', error);
  }
}

function completeSession() {
  stopTimer();

  const sessionType = state.mode;
  const focusNote = sessionType === 'work' ? elements.focusNote.value.trim().slice(0, 24) : '';
  const history = loadHistory();
  const sessionRecord = {
    id: Date.now(),
    date: new Date().toISOString(),
    type: sessionType,
    durationSeconds: getModeDuration(sessionType)
  };

  if (focusNote) {
    sessionRecord.note = focusNote;
  }

  history.unshift(sessionRecord);
  saveHistory(history.slice(0, 30));

  if (sessionType === 'work') {
    elements.focusNote.value = '';
  }

  playCompletionTone();
  sendCompletionNotification(sessionType);

  state.mode = sessionType === 'work' ? 'break' : 'work';
  state.phase = 'idle';
  state.totalSeconds = getModeDuration(state.mode);
  state.remainingSeconds = state.totalSeconds;
  state.lastTimestamp = null;

  render();
}

function tick() {
  if (state.phase !== 'running') {
    return;
  }

  const now = Date.now();

  if (state.lastTimestamp) {
    const elapsedSeconds = Math.floor((now - state.lastTimestamp) / 1000);

    if (elapsedSeconds > 0) {
      state.remainingSeconds = Math.max(0, state.remainingSeconds - elapsedSeconds);
      state.lastTimestamp = now;
    }
  }

  if (state.remainingSeconds <= 0) {
    completeSession();
    return;
  }

  renderTimer();
}

function startTimer() {
  if (state.phase === 'running') {
    return;
  }

  state.phase = 'running';
  state.lastTimestamp = Date.now();
  timerId = setInterval(tick, 1000);
  render();
}

function pauseTimer() {
  if (state.phase !== 'running') {
    return;
  }

  stopTimer();
  state.phase = 'paused';
  state.lastTimestamp = null;
  render();
}

function resetTimer() {
  stopTimer();
  state.mode = 'work';
  state.phase = 'idle';
  state.totalSeconds = WORK_SECONDS;
  state.remainingSeconds = WORK_SECONDS;
  state.lastTimestamp = null;
  render();
}

function initialize() {
  updateTheme();
  renderNotificationControl();

  if (state.phase === 'running') {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - (state.lastTimestamp || Date.now())) / 1000));
    state.remainingSeconds = Math.max(0, state.remainingSeconds - elapsedSeconds);

    if (state.remainingSeconds <= 0) {
      completeSession();
    } else {
      state.lastTimestamp = Date.now();
      timerId = setInterval(tick, 1000);
    }
  }

  render();
}

function handleThemeChange() {
  themePreference = getNextTheme();
  saveThemePreference();
  render();
}

elements.themeButton.addEventListener('click', handleThemeChange);
elements.notificationButton.addEventListener('click', toggleNotifications);
elements.startButton.addEventListener('click', startTimer);
elements.pauseButton.addEventListener('click', pauseTimer);
elements.resetButton.addEventListener('click', resetTimer);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker registration failed.', error);
    });
  });
}

initialize();
