const STORAGE_KEYS = {
  state: 'pomodoro-state-v1',
  history: 'pomodoro-history-v1',
  theme: 'pomodoro-theme-v1',
  notifications: 'pomodoro-notifications-v1',
  settings: 'pomodoro-settings-v1'
};

const THEME_OPTIONS = ['light', 'dark'];

const DEFAULT_SETTINGS = Object.freeze({
  focusMinutes: 25,
  breakMinutes: 5,
  workColor: '#f59e0b',
  breakColor: '#14b8a6',
  theme: 'dark',
  notificationsEnabled: false
});

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
  themeColorMeta: document.getElementById('theme-color-meta'),
  settingsButton: document.getElementById('settings-button'),
  settingsDialog: document.getElementById('settings-dialog'),
  settingsForm: document.getElementById('settings-form'),
  settingsClose: document.getElementById('settings-close'),
  settingsCancel: document.getElementById('settings-cancel'),
  settingsError: document.getElementById('settings-error'),
  focusMinutes: document.getElementById('focus-minutes'),
  breakMinutes: document.getElementById('break-minutes'),
  workColor: document.getElementById('work-color'),
  breakColor: document.getElementById('break-color'),
  notificationToggle: document.getElementById('notifications-enabled'),
  notificationStatus: document.getElementById('notification-status')
};

let audioContext = null;
let timerId = null;
let statsChart = null;
let settings = loadSettings();
let themePreference = settings.theme;
let notificationsEnabled = settings.notificationsEnabled;

const state = loadState();

function isValidDuration(value) {
  return Number.isInteger(value) && value >= 1 && value <= 120;
}

function normalizeHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : null;
}

function normalizeSettings(candidate, fallback = DEFAULT_SETTINGS) {
  const source = candidate && typeof candidate === 'object' ? candidate : {};

  return {
    focusMinutes: isValidDuration(source.focusMinutes) ? source.focusMinutes : fallback.focusMinutes,
    breakMinutes: isValidDuration(source.breakMinutes) ? source.breakMinutes : fallback.breakMinutes,
    workColor: normalizeHexColor(source.workColor) || fallback.workColor,
    breakColor: normalizeHexColor(source.breakColor) || fallback.breakColor,
    theme: THEME_OPTIONS.includes(source.theme) ? source.theme : fallback.theme,
    notificationsEnabled: typeof source.notificationsEnabled === 'boolean'
      ? source.notificationsEnabled
      : fallback.notificationsEnabled
  };
}

function loadSettings() {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);

    if (savedSettings !== null) {
      return normalizeSettings(JSON.parse(savedSettings));
    }

    return normalizeSettings({
      theme: localStorage.getItem(STORAGE_KEYS.theme),
      notificationsEnabled: localStorage.getItem(STORAGE_KEYS.notifications) === 'enabled'
    });
  } catch (error) {
    console.warn('Unable to read settings.', error);
    return { ...DEFAULT_SETTINGS };
  }
}

function getColorChannels(hexColor) {
  return {
    red: parseInt(hexColor.slice(1, 3), 16),
    green: parseInt(hexColor.slice(3, 5), 16),
    blue: parseInt(hexColor.slice(5, 7), 16)
  };
}

function getRelativeLuminance(hexColor) {
  const channels = Object.values(getColorChannels(hexColor)).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function getReadableForeground(hexColor) {
  const backgroundLuminance = getRelativeLuminance(hexColor);
  const darkColor = '#0b1220';
  const darkContrast = (backgroundLuminance + 0.05) / (getRelativeLuminance(darkColor) + 0.05);
  const lightContrast = 1.05 / (backgroundLuminance + 0.05);

  return darkContrast >= lightContrast ? darkColor : '#ffffff';
}

function toRgba(hexColor, alpha) {
  const { red, green, blue } = getColorChannels(hexColor);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function applyAccentSettings() {
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty('--accent', settings.workColor);
  rootStyle.setProperty('--accent-soft', toRgba(settings.workColor, 0.18));
  rootStyle.setProperty('--accent-shadow', toRgba(settings.workColor, 0.22));
  rootStyle.setProperty('--accent-contrast', getReadableForeground(settings.workColor));
  rootStyle.setProperty('--break-accent', settings.breakColor);
  rootStyle.setProperty('--break-soft', toRgba(settings.breakColor, 0.18));
  rootStyle.setProperty('--break-shadow', toRgba(settings.breakColor, 0.22));
  rootStyle.setProperty('--break-contrast', getReadableForeground(settings.breakColor));
}

function saveSettings(nextSettings) {
  settings = normalizeSettings(nextSettings);
  themePreference = settings.theme;
  notificationsEnabled = settings.notificationsEnabled;
  applyAccentSettings();

  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.warn('Unable to persist settings.', error);
    return false;
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
  let disabled = false;

  if (permission === 'unsupported') {
    status = 'Notifications unavailable';
    disabled = true;
  } else if (permission === 'denied') {
    status = 'Notifications blocked';
    disabled = true;
  } else if (isEnabled) {
    status = 'Notifications on';
  }

  elements.notificationToggle.disabled = disabled;
  elements.notificationToggle.checked = isEnabled;
  elements.notificationStatus.textContent = status;
}

async function resolveNotificationPreference(requested) {
  const permission = getNotificationPermission();

  if (permission === 'unsupported' || permission === 'denied') {
    return false;
  }

  if (requested && permission !== 'granted') {
    try {
      const requestedPermission = await window.Notification.requestPermission();
      return requestedPermission === 'granted';
    } catch (error) {
      console.warn('Unable to request browser notification permission.', error);
      return false;
    }
  }

  return requested && permission === 'granted';
}

function getEffectiveTheme() {
  return themePreference;
}

function getThemeToken(name) {
  return getComputedStyle(elements.body).getPropertyValue(name).trim();
}

function applyTheme() {
  const effectiveTheme = getEffectiveTheme();
  const isLight = effectiveTheme === 'light';

  document.documentElement.classList.toggle('theme-light', isLight);
  document.documentElement.classList.toggle('theme-dark', !isLight);
  elements.body.dataset.theme = effectiveTheme;
  elements.themeColorMeta.content = isLight ? '#f5f7fb' : '#0b1220';
}

function defaultState() {
  const workSeconds = getModeDuration('work');

  return {
    mode: 'work',
    phase: 'idle',
    remainingSeconds: workSeconds,
    totalSeconds: workSeconds,
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
      remainingSeconds: Number(savedState.remainingSeconds) || getModeDuration('work'),
      totalSeconds: Number(savedState.totalSeconds) || getModeDuration('work'),
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
  return (mode === 'work' ? settings.focusMinutes : settings.breakMinutes) * 60;
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
  applyAccentSettings();
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
  elements.resetButton.disabled = state.phase === 'idle' && state.mode === 'work' && state.remainingSeconds === getModeDuration('work');

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
    durationSeconds: state.totalSeconds
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
  state.totalSeconds = getModeDuration('work');
  state.remainingSeconds = state.totalSeconds;
  state.lastTimestamp = null;
  render();
}

function populateSettingsForm() {
  elements.focusMinutes.value = String(settings.focusMinutes);
  elements.breakMinutes.value = String(settings.breakMinutes);
  elements.workColor.value = settings.workColor;
  elements.breakColor.value = settings.breakColor;
  elements.settingsForm.elements.theme.value = settings.theme;
  elements.settingsError.textContent = '';
  renderNotificationControl();
}

function openSettings() {
  populateSettingsForm();
  elements.settingsDialog.showModal();
  elements.focusMinutes.focus();
}

function closeSettings() {
  if (elements.settingsDialog.open) {
    elements.settingsDialog.close();
  }
}

function validateDurationInput(input) {
  const value = Number(input.value);
  const isValid = isValidDuration(value) && input.value.trim() !== '';
  input.setCustomValidity(isValid ? '' : 'Enter a whole number from 1 to 120.');
  return isValid;
}

async function handleSettingsSubmit(event) {
  event.preventDefault();

  const focusIsValid = validateDurationInput(elements.focusMinutes);
  const breakIsValid = validateDurationInput(elements.breakMinutes);

  if (!focusIsValid || !breakIsValid || !elements.settingsForm.checkValidity()) {
    elements.settingsError.textContent = 'Check the highlighted timer values and try again.';
    elements.settingsForm.reportValidity();
    return;
  }

  const notificationsRequested = elements.notificationToggle.checked;
  const effectiveNotifications = await resolveNotificationPreference(notificationsRequested);
  const nextSettings = {
    focusMinutes: Number(elements.focusMinutes.value),
    breakMinutes: Number(elements.breakMinutes.value),
    workColor: elements.workColor.value,
    breakColor: elements.breakColor.value,
    theme: elements.settingsForm.elements.theme.value,
    notificationsEnabled: elements.notificationToggle.disabled
      ? settings.notificationsEnabled
      : effectiveNotifications
  };

  saveSettings(nextSettings);

  if (state.phase === 'idle') {
    state.totalSeconds = getModeDuration(state.mode);
    state.remainingSeconds = state.totalSeconds;
  }

  renderNotificationControl();
  render();
  closeSettings();
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

elements.settingsButton.addEventListener('click', openSettings);
elements.settingsClose.addEventListener('click', closeSettings);
elements.settingsCancel.addEventListener('click', closeSettings);
elements.settingsDialog.addEventListener('close', () => elements.settingsButton.focus());
elements.settingsDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  elements.settingsError.textContent = '';
  closeSettings();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && elements.settingsDialog.open) {
    event.preventDefault();
    elements.settingsError.textContent = '';
    closeSettings();
  }
});
elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
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
