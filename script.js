const STORAGE_KEY_PREFIX = 'guildWorkspaceAppData';
const ACTIVE_WORKSPACE_KEY = 'activeWorkspaceSlug';
const MEMBER_ACCESS_CODE_KEY = 'memberWorkspaceAccessCode';
const SUPABASE_PLACEHOLDER = 'YOUR_SUPABASE_';

const authGateOverlay = document.getElementById('authGateOverlay');
const activeWorkspaceName = document.getElementById('activeWorkspaceName');
const activeTeamName = document.getElementById('activeTeamName');
const activeSessionName = document.getElementById('activeSessionName');
const sessionSummaryCard = document.getElementById('sessionSummaryCard');
const participantRoundBadge = document.getElementById('participantRoundBadge');
const progressLabel = document.getElementById('progressLabel');
const progressCounter = document.getElementById('progressCounter');
const progressFill = document.getElementById('progressFill');
const participantGridEmpty = document.getElementById('participantGridEmpty');
const participantGrid = document.getElementById('participantGrid');

const drawCountInput = document.getElementById('drawCountInput');
const drawAllButton = document.getElementById('drawAllButton');
const controlCard = document.getElementById('controlCard');
const controlMeta = document.getElementById('controlMeta');
const memberViewCard = document.getElementById('memberViewCard');
const memberStatMembers = document.getElementById('memberStatMembers');
const memberStatDistributed = document.getElementById('memberStatDistributed');
const memberStatRemaining = document.getElementById('memberStatRemaining');

const memberAccessCodeInput = document.getElementById('memberAccessCodeInput');
const memberAccessButton = document.getElementById('memberAccessButton');
const googleAuthButton = document.getElementById('googleAuthButton');
const settingsLogoutButton = document.getElementById('settingsLogoutButton');
const settingsPasswordGate = document.getElementById('settingsPasswordGate');
const settingsForm = document.getElementById('settingsForm');
const authStatusText = document.getElementById('authStatusText');
const authSessionText = document.getElementById('authSessionText');
const authTopbarSession = document.getElementById('authTopbarSession');
const settingsPanel = document.querySelector('.settings-panel');
const memberReadonlyHint = document.getElementById('memberReadonlyHint');

const workspaceSelect = document.getElementById('workspaceSelect');
const loadWorkspaceButton = document.getElementById('loadWorkspaceButton');
const workspaceCountBadge = document.getElementById('workspaceCountBadge');
const workspaceStatusText = document.getElementById('workspaceStatusText');
const createWorkspaceNameInput = document.getElementById('createWorkspaceNameInput');
const createWorkspaceSlugInput = document.getElementById('createWorkspaceSlugInput');
const createWorkspaceButton = document.getElementById('createWorkspaceButton');
const memberAccessCodeDisplay = document.getElementById('memberAccessCodeDisplay');
const memberAccessCodeHint = document.getElementById('memberAccessCodeHint');
const generateMemberAccessCodeButton = document.getElementById('generateMemberAccessCodeButton');

const teamNameInput = document.getElementById('teamNameInput');
const sessionNameInput = document.getElementById('sessionNameInput');
const participantNameInput = document.getElementById('participantNameInput');
const addParticipantButton = document.getElementById('addParticipantButton');
const participantCountBadge = document.getElementById('participantCountBadge');
const settingsParticipantEmpty = document.getElementById('settingsParticipantEmpty');
const settingsParticipantList = document.getElementById('settingsParticipantList');

const prize1Name = document.getElementById('prize1Name');
const prize1Image = document.getElementById('prize1Image');
const prize1ImagePreview = document.getElementById('prize1ImagePreview');
const prize1Count = document.getElementById('prize1Count');
const prize1BatchSize = document.getElementById('prize1BatchSize');
const prize2Name = document.getElementById('prize2Name');
const prize2Image = document.getElementById('prize2Image');
const prize2ImagePreview = document.getElementById('prize2ImagePreview');
const prize2Count = document.getElementById('prize2Count');
const prize2BatchSize = document.getElementById('prize2BatchSize');
const prize3Name = document.getElementById('prize3Name');
const prize3Image = document.getElementById('prize3Image');
const prize3ImagePreview = document.getElementById('prize3ImagePreview');
const prize3Count = document.getElementById('prize3Count');
const prize3BatchSize = document.getElementById('prize3BatchSize');
const settingsDrawCountInput = document.getElementById('settingsDrawCountInput');
const addPrizeSetButton = document.getElementById('addPrizeSetButton');
const settingsSaveButton = document.getElementById('settingsSaveButton');
const settingsPrizeResetButton = document.getElementById('settingsPrizeResetButton');
const settingsResetButton = document.getElementById('settingsResetButton');

const prizeIcon1 = document.getElementById('prizeIcon1');
const prizeNameDisplay1 = document.getElementById('prizeName1');
const prizeCount1 = document.getElementById('prizeCount1');
const prizeBatch1 = document.getElementById('prizeBatch1');
const prizeIcon2 = document.getElementById('prizeIcon2');
const prizeNameDisplay2 = document.getElementById('prizeName2');
const prizeCount2 = document.getElementById('prizeCount2');
const prizeBatch2 = document.getElementById('prizeBatch2');
const prizeIcon3 = document.getElementById('prizeIcon3');
const prizeNameDisplay3 = document.getElementById('prizeName3');
const prizeCount3 = document.getElementById('prizeCount3');
const prizeBatch3 = document.getElementById('prizeBatch3');

const resultText = document.getElementById('resultText');
const resultRunButtons = document.getElementById('resultRunButtons');
const historyTables = document.getElementById('historyTables');

const prizeEditModal = document.getElementById('prizeEditModal');
const closePrizeEditButton = document.getElementById('closePrizeEditButton');
const editPrizeName = document.getElementById('editPrizeName');
const editPrizeImage = document.getElementById('editPrizeImage');
const editPrizeImagePreview = document.getElementById('editPrizeImagePreview');
const editPrizeCount = document.getElementById('editPrizeCount');
const editPrizeBatchSize = document.getElementById('editPrizeBatchSize');
const editPrizeSaveButton = document.getElementById('editPrizeSaveButton');

let state = createDefaultState();
let currentWorkspace = null;
let myWorkspaces = [];
let authSession = null;
let supabaseClient = null;
let storageMode = 'local';
let isAdmin = false;
let canManageWorkspace = false;
let currentAccessMode = 'locked';
let currentEditingPrizeIndex = -1;
let latestMemberAccessCode = '';
let selectedHistoryRunId = '';

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultPrizes() {
  return [
    { id: createId('prize'), name: 'รางวัล 1', image: '🏆', totalUnits: 1, unitsPerWinner: 1 },
    { id: createId('prize'), name: 'รางวัล 2', image: '🎁', totalUnits: 1, unitsPerWinner: 1 },
    { id: createId('prize'), name: 'รางวัล 3', image: '🎉', totalUnits: 1, unitsPerWinner: 1 }
  ];
}

function createSession(name = 'รอบหลัก') {
  return {
    id: createId('session'),
    name,
    createdAt: Date.now(),
    history: []
  };
}

function createDefaultTeam() {
  const session = createSession();
  return {
    id: createId('team'),
    name: 'Guild หลัก',
    members: [],
    prizes: createDefaultPrizes(),
    sessions: [session],
    activeSessionId: session.id,
    drawCount: 1
  };
}

function createDefaultState() {
  const team = createDefaultTeam();
  return {
    teams: [team],
    activeTeamId: team.id
  };
}

function normalizeName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeSlug(value) {
  return normalizeName(value).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function normalizeAccessCode(value) {
  return normalizeName(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function formatAccessCode(value) {
  return normalizeAccessCode(value).replace(/(.{4})/g, '$1-').replace(/-$/, '');
}

function formatAuthError(error, mode = 'login') {
  const rawMessage = String(error?.message || '').trim();
  const message = rawMessage.toLowerCase();
  const code = String(error?.code || '').toLowerCase();

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  }

  if (message.includes('email not confirmed')) {
    return 'บัญชีนี้ยังไม่ได้ยืนยันอีเมล กรุณากดยืนยันจากอีเมลก่อน';
  }

  if (message.includes('email rate limit exceeded')) {
    return 'ส่งอีเมลถี่เกินไป กรุณารอสักครู่แล้วลองใหม่';
  }

  if (message.includes('security purposes') && message.includes('request this after')) {
    return 'คุณกดทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่';
  }

  if (message.includes('user already registered')) {
    return 'อีเมลนี้ถูกสมัครไว้แล้ว กรุณาเข้าสู่ระบบแทน';
  }

  if (message.includes('signup is disabled') || message.includes('provider is not enabled')) {
    return 'ยังไม่ได้เปิด Email/Password Auth ใน Supabase โปรดเปิดที่ Authentication > Providers > Email';
  }

  if (message.includes('password should be at least')) {
    return 'รหัสผ่านสั้นเกินไป กรุณาตั้งรหัสผ่านให้ยาวขึ้น';
  }

  if (message.includes('database error saving new user')) {
    return 'Supabase สร้างผู้ใช้ไม่สำเร็จ โปรดตรวจสอบการตั้งค่า Authentication และ trigger ในโปรเจกต์';
  }

  if (!rawMessage) {
    return mode === 'signup' ? 'สมัครไม่สำเร็จ' : 'เข้าสู่ระบบไม่สำเร็จ';
  }

  return rawMessage;
}

function normalizeMembers(members) {
  return Array.from(
    new Set((Array.isArray(members) ? members : []).map(normalizeName).filter(Boolean))
  );
}

function normalizePrize(prize, fallbackName, fallbackImage) {
  if (!prize || typeof prize === 'string') {
    return {
      id: createId('prize'),
      name: typeof prize === 'string' ? prize : fallbackName,
      image: fallbackImage,
      totalUnits: 1,
      unitsPerWinner: 1
    };
  }

  return {
    id: prize.id || createId('prize'),
    name: normalizeName(prize.name || fallbackName) || fallbackName,
    image: prize.image || prize.emoji || fallbackImage,
    totalUnits: Math.max(1, parseInt(prize.totalUnits ?? prize.count, 10) || 1),
    unitsPerWinner: Math.max(1, parseInt(prize.unitsPerWinner ?? prize.batchSize, 10) || 1)
  };
}

function normalizeHistory(history) {
  return Array.isArray(history)
    ? history.map(entry => ({
        id: entry.id || createId('history'),
        teamId: entry.teamId || '',
        sessionId: entry.sessionId || '',
        sessionName: entry.sessionName || 'รอบแจก',
        distributionRunId: entry.distributionRunId || entry.batchId || '',
        prizeId: entry.prizeId || '',
        prizeName: entry.prizeName || entry.prize || 'รางวัล',
        memberName: entry.memberName || entry.winner || 'สมาชิก',
        units: Math.max(1, parseInt(entry.units ?? entry.prizeUnits, 10) || 1),
        time: entry.time || Date.now()
      }))
    : [];
}

function normalizeSession(session) {
  return {
    id: session?.id || createId('session'),
    name: normalizeName(session?.name || 'รอบแจก') || 'รอบแจก',
    createdAt: session?.createdAt || Date.now(),
    history: normalizeHistory(session?.history)
  };
}

function normalizeTeam(team) {
  const defaultTeam = createDefaultTeam();
  const sessions = Array.isArray(team?.sessions) && team.sessions.length > 0
    ? team.sessions.map(normalizeSession)
    : [createSession()];
  const activeSessionId = sessions.some(session => session.id === team?.activeSessionId)
    ? team.activeSessionId
    : sessions[0].id;

  return {
    id: team?.id || defaultTeam.id,
    name: normalizeName(team?.name || defaultTeam.name) || defaultTeam.name,
    members: normalizeMembers(team?.members || team?.participants),
    prizes: Array.isArray(team?.prizes)
      ? [
          normalizePrize(team.prizes[0], 'รางวัล 1', '🏆'),
          normalizePrize(team.prizes[1], 'รางวัล 2', '🎁'),
          normalizePrize(team.prizes[2], 'รางวัล 3', '🎉')
        ]
      : defaultTeam.prizes,
    sessions,
    activeSessionId,
    drawCount: Math.max(1, parseInt(team?.drawCount, 10) || 1)
  };
}

function normalizeState(rawState) {
  if (Array.isArray(rawState?.teams) && rawState.teams.length > 0) {
    const teams = rawState.teams.map(normalizeTeam);
    const activeTeamId = teams.some(team => team.id === rawState.activeTeamId)
      ? rawState.activeTeamId
      : teams[0].id;
    return { teams, activeTeamId };
  }

  const team = normalizeTeam(rawState);
  return {
    teams: [team],
    activeTeamId: team.id
  };
}

function getStorageKey(slug = currentWorkspace?.slug || 'default') {
  return `${STORAGE_KEY_PREFIX}:${slug}`;
}

function loadStateFromLocal(slug = currentWorkspace?.slug || 'default') {
  const raw = localStorage.getItem(getStorageKey(slug));
  if (!raw) {
    return createDefaultState();
  }

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

function saveStateToLocal(slug = currentWorkspace?.slug || 'default') {
  localStorage.setItem(getStorageKey(slug), JSON.stringify(state));
}

function isSupabaseConfigured() {
  const config = window.SUPABASE_CONFIG || {};
  return Boolean(
    window.supabase &&
    typeof config.url === 'string' &&
    typeof config.anonKey === 'string' &&
    config.url &&
    config.anonKey &&
    !config.url.includes(SUPABASE_PLACEHOLDER) &&
    !config.anonKey.includes(SUPABASE_PLACEHOLDER)
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey
    );
  }

  return supabaseClient;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getAuthUserLabel() {
  return authSession?.user?.email || 'ผู้ดูแลระบบ';
}

function getCurrentWorkspaceSlug() {
  const querySlug = new URLSearchParams(window.location.search).get('workspace');
  return normalizeSlug(querySlug || localStorage.getItem(ACTIVE_WORKSPACE_KEY));
}

function persistActiveWorkspaceSlug(slug) {
  const normalized = normalizeSlug(slug);
  const params = new URLSearchParams(window.location.search);
  if (normalized) {
    params.set('workspace', normalized);
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, normalized);
  } else {
    params.delete('workspace');
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
  }

  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
}

function getStoredMemberAccessCode() {
  return normalizeAccessCode(sessionStorage.getItem(MEMBER_ACCESS_CODE_KEY) || '');
}

function persistMemberAccessCode(code) {
  const normalized = normalizeAccessCode(code);
  if (normalized) {
    sessionStorage.setItem(MEMBER_ACCESS_CODE_KEY, normalized);
  } else {
    sessionStorage.removeItem(MEMBER_ACCESS_CODE_KEY);
  }
}

function getOAuthRedirectUrl(slug = getCurrentWorkspaceSlug()) {
  const normalized = normalizeSlug(slug);
  const url = new URL(window.location.origin + window.location.pathname);
  if (url.pathname.endsWith('/index.html')) {
    url.pathname = url.pathname.slice(0, -'/index.html'.length) || '/';
  }

  const pathSegments = url.pathname.split('/').filter(Boolean);
  if (window.location.hostname.endsWith('github.io') && pathSegments.length === 1) {
    url.pathname = `/${pathSegments[0]}/`;
  }

  url.hash = '';
  if (normalized) {
    url.searchParams.set('workspace', normalized);
  }
  return url.toString();
}

function cleanupAuthRedirectParams() {
  const url = new URL(window.location.href);
  ['access_token', 'refresh_token', 'provider_token', 'provider_refresh_token', 'code', 'type', 'error', 'error_code', 'error_description'].forEach(param => {
    url.searchParams.delete(param);
  });
  url.hash = '';
  window.history.replaceState({}, '', url.toString());
}

async function handleOAuthRedirect() {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
  const authError = hashParams.get('error_description')
    || url.searchParams.get('error_description')
    || hashParams.get('error')
    || url.searchParams.get('error')
    || '';
  const authCode = url.searchParams.get('code') || hashParams.get('code') || '';
  const hasOAuthParams = ['access_token', 'refresh_token', 'provider_token', 'provider_refresh_token', 'type', 'error', 'error_code']
    .some(param => url.searchParams.has(param) || hashParams.has(param))
    || Boolean(authCode);

  if (!hasOAuthParams) {
    return null;
  }

  if (authError) {
    console.error('Supabase OAuth redirect returned an error.', authError);
    authStatusText.textContent = `Google login failed: ${authError}`;
    cleanupAuthRedirectParams();
    return null;
  }

  let session = null;

  if (authCode && typeof client.auth.exchangeCodeForSession === 'function') {
    const { data, error } = await client.auth.exchangeCodeForSession(authCode);
    if (error) {
      console.error('Failed to exchange Supabase OAuth code for session.', error);
      authStatusText.textContent = `Google login failed: ${formatAuthError(error, 'login')}`;
      cleanupAuthRedirectParams();
      return null;
    }

    session = data?.session || null;
  } else {
    const { data, error } = await client.auth.getSessionFromUrl({ storeSession: true });
    if (error) {
      console.error('Failed to get Supabase session from OAuth redirect URL.', error);
      authStatusText.textContent = `Google login failed: ${formatAuthError(error, 'login')}`;
      cleanupAuthRedirectParams();
      return null;
    }

    session = data?.session || null;
  }

  cleanupAuthRedirectParams();
  return session;
}

async function hasWorkspaceAdminPrivileges(workspaceId, client = getSupabaseClient()) {
  if (!client || !authSession || !workspaceId) {
    return false;
  }

  const { data, error } = await client.rpc('is_workspace_admin', {
    candidate_workspace: workspaceId
  });

  if (error) {
    console.error('Failed to check workspace admin privileges.', error);
    return false;
  }

  return Boolean(data);
}

async function resolveWorkspaceAccessCode(code, client = getSupabaseClient()) {
  if (!client || !code) {
    return null;
  }

  const { data, error } = await client.rpc('resolve_workspace_access_code', {
    candidate_code: normalizeAccessCode(code)
  });

  if (error) {
    console.error('Failed to resolve workspace access code.', error);
    return null;
  }

  if (Array.isArray(data)) {
    return data[0] || null;
  }

  return data || null;
}

async function fetchMyWorkspaces() {
  const client = getSupabaseClient();
  if (!client || !authSession) {
    myWorkspaces = [];
    return;
  }

  const { data, error } = await client
    .from('workspace_admins')
    .select('role, workspaces:workspace_id(id, name, slug, created_at)')
    .eq('user_id', authSession.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch workspaces.', error);
    myWorkspaces = [];
    return;
  }

  myWorkspaces = (data || [])
    .map(row => ({
      id: row.workspaces?.id,
      name: row.workspaces?.name,
      slug: row.workspaces?.slug,
      role: row.role
    }))
    .filter(workspace => workspace.id && workspace.slug);
}

function renderWorkspaceOptions() {
  workspaceSelect.innerHTML = '';
  workspaceCountBadge.textContent = `${myWorkspaces.length} workspace`;

  if (myWorkspaces.length === 0) {
    workspaceStatusText.textContent = 'ยังไม่มี workspace ของคุณ สร้างใหม่ได้ด้านล่าง';
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'ยังไม่มี workspace';
    workspaceSelect.appendChild(option);
    return;
  }

  workspaceStatusText.textContent = currentWorkspace
    ? `workspace ปัจจุบัน: ${currentWorkspace.name} (${currentWorkspace.slug})`
    : 'เลือก workspace ที่ต้องการเปิด';

  myWorkspaces.forEach(workspace => {
    const option = document.createElement('option');
    option.value = workspace.slug;
    option.textContent = `${workspace.name} (${workspace.slug})`;
    option.selected = currentWorkspace?.slug === workspace.slug;
    workspaceSelect.appendChild(option);
  });
}

async function loadWorkspaceState(workspace) {
  currentWorkspace = workspace || null;
  latestMemberAccessCode = '';
  clearLatestDistributionResult();
  persistActiveWorkspaceSlug(currentWorkspace?.slug || '');

  if (!currentWorkspace) {
    state = createDefaultState();
    render();
    renderWorkspaceOptions();
    renderMemberAccessPanel();
    return;
  }

  const client = getSupabaseClient();
  if (!client || !authSession) {
    state = loadStateFromLocal(currentWorkspace.slug);
    storageMode = 'local';
    render();
    renderWorkspaceOptions();
    renderMemberAccessPanel();
    return;
  }

  const { data, error } = await client
    .from('workspace_state')
    .select('payload')
    .eq('workspace_id', currentWorkspace.id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load workspace state, using local backup.', error);
    state = loadStateFromLocal(currentWorkspace.slug);
    storageMode = 'local';
  } else {
    state = data?.payload ? normalizeState(data.payload) : createDefaultState();
    saveStateToLocal(currentWorkspace.slug);
    storageMode = 'supabase';
  }

  render();
  renderWorkspaceOptions();
  renderMemberAccessPanel();
  renderMemberViewSummary();
}

async function loadInitialState() {
  state = createDefaultState();
  const client = getSupabaseClient();

  if (!client) {
    isAdmin = false;
    canManageWorkspace = false;
    currentAccessMode = 'locked';
    currentWorkspace = null;
    storageMode = 'local';
    render();
    renderWorkspaceOptions();
    renderMemberAccessPanel();
    updateAuthUI();
    return;
  }

  let session = null;
  const redirectSession = await handleOAuthRedirect();
  if (redirectSession) {
    session = redirectSession;
  } else {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error('Failed to get auth session.', error);
    }
    session = data?.session || null;
  }
  authSession = session;
  await fetchMyWorkspaces();

  if (authSession) {
    currentAccessMode = 'admin';
    persistMemberAccessCode('');
    isAdmin = true;
    const requestedSlug = getCurrentWorkspaceSlug();
    const matchedWorkspace = myWorkspaces.find(workspace => workspace.slug === requestedSlug) || myWorkspaces[0] || null;
    canManageWorkspace = Boolean(matchedWorkspace && await hasWorkspaceAdminPrivileges(matchedWorkspace.id, client));
    await loadWorkspaceState(matchedWorkspace);
    updateAuthUI();
    return;
  }

  isAdmin = false;
  canManageWorkspace = false;
  myWorkspaces = [];
  const restoredAccessCode = getStoredMemberAccessCode();
  if (restoredAccessCode) {
    const memberWorkspace = await resolveWorkspaceAccessCode(restoredAccessCode, client);
    if (memberWorkspace) {
      currentAccessMode = 'member';
      await loadWorkspaceState({
        id: memberWorkspace.workspace_id,
        name: memberWorkspace.workspace_name,
        slug: memberWorkspace.workspace_slug
      });
      state = memberWorkspace.payload ? normalizeState(memberWorkspace.payload) : createDefaultState();
      render();
      renderMemberAccessPanel();
      updateAuthUI();
      return;
    }

    persistMemberAccessCode('');
  }

  currentWorkspace = null;
  currentAccessMode = 'locked';
  state = createDefaultState();
  render();
  renderWorkspaceOptions();
  renderMemberAccessPanel();
  updateAuthUI();
}

function showPasswordGate() {
  authGateOverlay.classList.remove('hidden');
  document.body.classList.add('auth-locked');
  settingsPasswordGate.classList.remove('hidden');
  authTopbarSession.classList.add('hidden');
  settingsForm.classList.add('hidden');
}

function showSettingsForm() {
  authGateOverlay.classList.add('hidden');
  document.body.classList.remove('auth-locked');
  authTopbarSession.classList.remove('hidden');
  settingsForm.classList.remove('hidden');
}

function getActiveTeam() {
  return state.teams.find(team => team.id === state.activeTeamId) || state.teams[0];
}

function getActiveSession(team = getActiveTeam()) {
  return team.sessions.find(session => session.id === team.activeSessionId) || team.sessions[0];
}

function getAllTeamHistory(team = getActiveTeam()) {
  return team.sessions.flatMap(session => session.history);
}

function ensureActiveSession(team = getActiveTeam()) {
  let session = getActiveSession(team);
  if (!session) {
    session = createSession();
    team.sessions.push(session);
    team.activeSessionId = session.id;
  }
  return session;
}

function startNewSession(sessionName) {
  const team = getActiveTeam();
  const nextName = normalizeName(sessionName) || `รอบ ${team.sessions.length + 1}`;
  const currentSession = getActiveSession(team);

  if (currentSession && currentSession.history.length === 0) {
    currentSession.name = nextName;
    return currentSession;
  }

  const session = createSession(nextName);
  team.sessions.push(session);
  team.activeSessionId = session.id;
  return session;
}

function updatePrizeIcon(iconElement, image, fitMode = 'cover') {
  if (!image || image.length <= 2) {
    iconElement.textContent = image || '🎁';
    iconElement.style.backgroundImage = 'none';
    iconElement.style.backgroundSize = '';
    iconElement.style.backgroundPosition = '';
    iconElement.style.backgroundRepeat = '';
    return;
  }

  if (image.startsWith('data:') || image.startsWith('http')) {
    iconElement.textContent = '';
    iconElement.style.backgroundImage = `url('${image}')`;
    iconElement.style.backgroundSize = fitMode;
    iconElement.style.backgroundPosition = 'center';
    iconElement.style.backgroundRepeat = 'no-repeat';
  }
}

function setPreviewImage(previewElement, image) {
  if (!image) {
    previewElement.textContent = 'ไม่มีรูป';
    previewElement.style.backgroundImage = 'none';
    previewElement.style.backgroundSize = '';
    previewElement.style.backgroundPosition = '';
    previewElement.style.backgroundRepeat = '';
    return;
  }

  updatePrizeIcon(previewElement, image, 'cover');
}

function getAssignedPrizeUnits(team = getActiveTeam(), session = getActiveSession(team)) {
  const assigned = new Map();
  (session?.history || []).forEach(entry => {
    const units = Math.max(1, parseInt(entry.units, 10) || 1);
    assigned.set(entry.prizeId, (assigned.get(entry.prizeId) || 0) + units);
  });
  return assigned;
}

function updatePrizePreviews() {
  const team = getActiveTeam();
  const assignedUnits = getAssignedPrizeUnits(team);
  const rows = [
    [team.prizes[0], prizeIcon1, prizeNameDisplay1, prizeCount1, prizeBatch1],
    [team.prizes[1], prizeIcon2, prizeNameDisplay2, prizeCount2, prizeBatch2],
    [team.prizes[2], prizeIcon3, prizeNameDisplay3, prizeCount3, prizeBatch3]
  ];

  rows.forEach(([prize, icon, name, count, batch]) => {
    updatePrizeIcon(icon, prize.image);
    name.textContent = prize.name;
    const used = assignedUnits.get(prize.id) || 0;
    count.textContent = `เหลือ ${Math.max(0, prize.totalUnits - used)}/${prize.totalUnits} ชิ้น`;
    batch.textContent = `แจกคนละ ${prize.unitsPerWinner} ชิ้น`;
  });
}

function getParticipantAvatar(name) {
  return normalizeName(name).charAt(0).toUpperCase() || 'P';
}

function applyTokenVisual(element, image, fallbackText = '1') {
  if (!image || image.length <= 2) {
    element.textContent = image || fallbackText;
    element.style.backgroundImage = 'none';
    return;
  }

  if (image.startsWith('data:') || image.startsWith('http')) {
    element.textContent = '';
    element.style.backgroundImage = `url('${image}')`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    element.style.backgroundRepeat = 'no-repeat';
    return;
  }

  element.textContent = fallbackText;
  element.style.backgroundImage = 'none';
}

function getCurrentSessionRecipients(session = getActiveSession()) {
  return new Set((session?.history || []).map(entry => entry.memberName));
}

function getMemberPrizeReceiptMap(team = getActiveTeam()) {
  const receiptMap = new Map();

  getAllTeamHistory(team).forEach(entry => {
    if (!receiptMap.has(entry.memberName)) {
      receiptMap.set(entry.memberName, new Set());
    }

    receiptMap.get(entry.memberName).add(entry.prizeId);
  });

  return receiptMap;
}

function renderTeamMeta() {
  const team = getActiveTeam();
  const session = getActiveSession(team);
  activeWorkspaceName.textContent = currentWorkspace?.name || 'ยังไม่ได้เลือก workspace';
  activeTeamName.textContent = currentWorkspace ? (team.name || 'ยังไม่ได้ตั้งชื่อ Guild') : 'ยังไม่ได้ตั้งชื่อ Guild';
  activeSessionName.textContent = currentWorkspace ? (session?.name || 'รอบหลัก') : 'รอบหลัก';
  sessionSummaryCard.textContent = currentWorkspace
    ? `${currentWorkspace.name} | ${session?.name || 'รอบหลัก'}`
    : 'ยังไม่ได้เปิด workspace';
}

function renderParticipantGrid() {
  const team = getActiveTeam();
  const session = getActiveSession(team);
  const members = normalizeMembers(team.members);
  const receiptMap = getMemberPrizeReceiptMap(team);
  const completedMembers = members.filter(memberName => (receiptMap.get(memberName)?.size || 0) > 0).length;
  const totalMembers = members.length;
  const progressPercent = totalMembers === 0 ? 0 : (completedMembers / totalMembers) * 100;

  participantRoundBadge.textContent = `รอบที่ ${team.sessions.findIndex(item => item.id === session.id) + 1}`;
  progressLabel.textContent = currentWorkspace
    ? `ความคืบหน้าของ ${session?.name || 'รอบปัจจุบัน'}`
    : 'เลือก workspace เพื่อเริ่มใช้งาน';
  progressCounter.textContent = `${completedMembers}/${totalMembers} คน`;
  progressFill.style.width = `${progressPercent}%`;

  participantGrid.innerHTML = '';
  participantGridEmpty.classList.toggle('hidden', totalMembers > 0);
  participantGridEmpty.textContent = currentWorkspace
    ? 'ยังไม่มีสมาชิกใน Guild'
    : 'เข้าสู่ระบบและเปิด workspace ก่อน';

  members.forEach(memberName => {
    const receivedPrizeIds = receiptMap.get(memberName) || new Set();
    const received = receivedPrizeIds.size >= team.prizes.length;
    const card = document.createElement('article');
    card.className = `participant-card${received ? ' received' : ''}`;

    const top = document.createElement('div');
    top.className = 'participant-card-top';

    const avatar = document.createElement('div');
    avatar.className = 'participant-card-avatar';
    avatar.textContent = getParticipantAvatar(memberName);
    top.appendChild(avatar);

    const prizeList = document.createElement('div');
    prizeList.className = 'participant-prize-list';
    team.prizes.forEach((prize, index) => {
      const chip = document.createElement('div');
      chip.className = `participant-prize-chip${receivedPrizeIds.has(prize.id) ? ' received' : ''}`;
      chip.title = prize.name;
      applyTokenVisual(chip, prize.image, `${index + 1}`);
      prizeList.appendChild(chip);
    });
    top.appendChild(prizeList);

    const nameElement = document.createElement('div');
    nameElement.className = 'participant-card-name';
    nameElement.textContent = memberName;

    card.appendChild(top);
    card.appendChild(nameElement);
    participantGrid.appendChild(card);
  });
}

function renderSettingsMemberList() {
  const team = getActiveTeam();
  const members = normalizeMembers(team.members);
  settingsParticipantList.innerHTML = '';
  participantCountBadge.textContent = `${members.length} คน`;
  settingsParticipantEmpty.classList.toggle('hidden', members.length > 0);

  members.forEach((memberName, index) => {
    const item = document.createElement('li');
    item.className = 'settings-participant-item';
    item.innerHTML = `
      <span class="settings-participant-name">${escapeHtml(memberName)}</span>
      <button class="participant-remove-button" type="button" data-index="${index}">ลบ</button>
    `;
    settingsParticipantList.appendChild(item);
  });
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function getSessionDistributionRuns(team = getActiveTeam(), session = getActiveSession(team)) {
  const prizeOrderMap = new Map(team.prizes.map((prize, index) => [prize.id, index]));
  const runMap = new Map();

  (session?.history || []).forEach(entry => {
    const fallbackRunId = `${session.id}:${Math.floor((entry.time || 0) / 1000)}`;
    const runId = entry.distributionRunId || fallbackRunId;

    if (!runMap.has(runId)) {
      runMap.set(runId, {
        id: runId,
        sessionId: session.id,
        sessionName: session.name,
        time: entry.time || 0,
        entries: []
      });
    }

    const run = runMap.get(runId);
    run.time = Math.min(run.time || entry.time || 0, entry.time || 0);
    run.entries.push(entry);
  });

  return Array.from(runMap.values())
    .sort((left, right) => (left.time || 0) - (right.time || 0))
    .map((run, index) => ({
      ...run,
      runNumber: index + 1,
      entries: run.entries
        .slice()
        .sort((left, right) => {
          const leftOrder = prizeOrderMap.get(left.prizeId) ?? Number.MAX_SAFE_INTEGER;
          const rightOrder = prizeOrderMap.get(right.prizeId) ?? Number.MAX_SAFE_INTEGER;
          if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
          }
          if (left.units !== right.units) {
            return right.units - left.units;
          }
          return left.memberName.localeCompare(right.memberName, 'th');
        })
    }));
}

function getAllDistributionRuns(team = getActiveTeam()) {
  return team.sessions.flatMap((session, sessionIndex) =>
    getSessionDistributionRuns(team, session).map(run => ({
      ...run,
      sessionIndex: sessionIndex + 1
    }))
  );
}

function getSelectedRunForCurrentSession(team = getActiveTeam(), session = getActiveSession(team)) {
  const runs = getSessionDistributionRuns(team, session);
  if (runs.length === 0) {
    return { runs, selectedRun: null };
  }

  const selectedRun = runs.find(run => run.id === selectedHistoryRunId) || runs[runs.length - 1];
  selectedHistoryRunId = selectedRun.id;
  return { runs, selectedRun };
}

function renderHistory() {
  const team = getActiveTeam();
  const session = getActiveSession(team);
  const prizeOrderMap = new Map();
  const prizeNameMap = new Map(team.prizes.map(prize => [prize.id, prize.name]));
  const prizeNameOrderMap = new Map();

  team.prizes.forEach((prize, index) => {
    prizeOrderMap.set(prize.id, index);
    prizeNameOrderMap.set(prize.name, index);
  });

  const { selectedRun } = getSelectedRunForCurrentSession(team, session);
  const sourceEntries = selectedRun ? selectedRun.entries : [];
  const history = sourceEntries
    .slice()
    .sort((left, right) => {
      const leftDisplayPrizeName = prizeNameMap.get(left.prizeId) || left.prizeName;
      const rightDisplayPrizeName = prizeNameMap.get(right.prizeId) || right.prizeName;
      const leftOrder = prizeOrderMap.get(left.prizeId) ?? prizeNameOrderMap.get(leftDisplayPrizeName) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = prizeOrderMap.get(right.prizeId) ?? prizeNameOrderMap.get(rightDisplayPrizeName) ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      if (left.units !== right.units) {
        return right.units - left.units;
      }

      if (left.time !== right.time) {
        return left.time - right.time;
      }

      return left.memberName.localeCompare(right.memberName, 'th');
    });

  historyTables.innerHTML = '';
  if (history.length === 0) {
    historyTables.innerHTML = `<div class="history-empty">${currentWorkspace ? 'ยังไม่มีประวัติการแบ่งของรอบที่เลือก' : 'เข้าสู่ระบบและเปิด workspace เพื่อดูข้อมูล'}</div>`;
    return;
  }

  const selectedTitle = document.createElement('div');
  selectedTitle.className = 'history-selected-title';
  selectedTitle.textContent = `รอบ ${session.name} | การแบ่งครั้งที่ ${selectedRun.runNumber}`;
  historyTables.appendChild(selectedTitle);

  const groupedHistory = new Map();
  history.forEach(entry => {
    const displayPrizeName = prizeNameMap.get(entry.prizeId) || entry.prizeName;
    if (!groupedHistory.has(displayPrizeName)) {
      groupedHistory.set(displayPrizeName, []);
    }

    groupedHistory.get(displayPrizeName).push(entry);
  });

  groupedHistory.forEach((entries, prizeName) => {
    const section = document.createElement('section');
    section.className = 'history-group';

    const title = document.createElement('h3');
    title.className = 'history-group-title';
    title.textContent = prizeName;

    const table = document.createElement('table');
    table.className = 'history-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>ลำดับ</th>
          <th>รอบแจก</th>
          <th>สมาชิก</th>
          <th>จำนวน</th>
          <th>เวลา</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const body = table.querySelector('tbody');
    entries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(entry.sessionName)}</td>
        <td>${escapeHtml(entry.memberName)}</td>
        <td>${entry.units}</td>
        <td>${formatTimestamp(entry.time)}</td>
      `;
      body.appendChild(row);
    });

    section.appendChild(title);
    section.appendChild(table);
    historyTables.appendChild(section);
  });
}

function render() {
  const team = getActiveTeam();
  team.members = normalizeMembers(team.members);
  renderTeamMeta();
  updatePrizePreviews();
  renderParticipantGrid();
  drawCountInput.value = team.drawCount;
  drawCountInput.max = Math.max(1, getRemainingPrizeAssignments(team).length);
  renderResultRunButtons();
  renderHistory();
  renderMemberViewSummary();
}

function clearLatestDistributionResult() {
  resultRunButtons.innerHTML = '';
  selectedHistoryRunId = '';
}

function renderResultRunButtons() {
  const team = getActiveTeam();
  const session = getActiveSession(team);
  const { runs, selectedRun } = getSelectedRunForCurrentSession(team, session);
  resultRunButtons.innerHTML = '';

  if (!currentWorkspace) {
    return;
  }

  if (runs.length === 0) {
    return;
  }

  runs.forEach(run => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `result-run-button${selectedRun?.id === run.id ? ' active' : ''}`;
    button.textContent = `การแบ่งครั้งที่ ${run.runNumber} รอบที่ ${team.sessions.findIndex(item => item.id === session.id) + 1}`;
    button.addEventListener('click', () => {
      selectedHistoryRunId = run.id;
      renderResultRunButtons();
      renderHistory();
    });
    resultRunButtons.appendChild(button);
  });
}

function showResult(message) {
  if (resultText) {
    resultText.textContent = message;
  }
}

async function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.readAsDataURL(file);
  });
}

async function resolvePrizeImage(fileInput, existingImage, fallbackImage) {
  const file = fileInput.files && fileInput.files[0];
  if (file) {
    return readImageFile(file);
  }
  return existingImage || fallbackImage;
}

function getRemainingPrizeAssignments(team = getActiveTeam()) {
  const assignedUnits = getAssignedPrizeUnits(team);
  const remaining = [];

  team.prizes.forEach(prize => {
    const usedUnits = assignedUnits.get(prize.id) || 0;
    const remainingUnits = Math.max(0, prize.totalUnits - usedUnits);
    const unitsPerWinner = Math.max(1, prize.unitsPerWinner);

    for (let unitsLeft = remainingUnits; unitsLeft > 0; unitsLeft -= unitsPerWinner) {
      remaining.push({
        prizeId: prize.id,
        prizeName: prize.name,
        units: Math.min(unitsPerWinner, unitsLeft)
      });
    }
  });

  return remaining;
}

function getEligibleMembersForPrize(team = getActiveTeam(), prizeId, session = getActiveSession(team), excludedMembers = new Set()) {
  const receiptMap = getMemberPrizeReceiptMap(team);
  return normalizeMembers(team.members).filter(memberName => (
    !excludedMembers.has(memberName)
    && !receiptMap.get(memberName)?.has(prizeId)
  ));
}

function shuffle(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getDistributableAssignments(team = getActiveTeam(), session = getActiveSession(team)) {
  const assignments = shuffle(getRemainingPrizeAssignments(team));
  const reservedMembers = new Set();

  return assignments.filter(assignment => {
    const eligibleMembers = getEligibleMembersForPrize(team, assignment.prizeId, session, reservedMembers);
    if (eligibleMembers.length === 0) {
      return false;
    }

    reservedMembers.add(eligibleMembers[0]);
    return true;
  });
}

function closeEditPrizeModal() {
  prizeEditModal.classList.add('hidden');
  currentEditingPrizeIndex = -1;
}

async function handleEditPrizeSave() {
  if (currentEditingPrizeIndex === -1) {
    return;
  }

  try {
    const team = getActiveTeam();
    const currentPrize = team.prizes[currentEditingPrizeIndex];
    const nextImage = await resolvePrizeImage(editPrizeImage, currentPrize.image, '🎁');

    team.prizes[currentEditingPrizeIndex] = {
      ...currentPrize,
      name: normalizeName(editPrizeName.value) || `รางวัล ${currentEditingPrizeIndex + 1}`,
      image: nextImage,
      totalUnits: Math.max(1, parseInt(editPrizeCount.value, 10) || 1),
      unitsPerWinner: Math.max(1, parseInt(editPrizeBatchSize.value, 10) || 1)
    };

    await saveState();
    render();
    closeEditPrizeModal();
    showResult('บันทึกการแก้ไขรางวัลเรียบร้อย');
  } catch (error) {
    showResult(error.message);
  }
}

function bindImagePreview(input, preview) {
  input.addEventListener('change', async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      const imageData = await readImageFile(file);
      setPreviewImage(preview, imageData);
    } catch (error) {
      showResult(error.message);
    }
  });
}

function fillSettingsForm() {
  const team = getActiveTeam();
  const session = getActiveSession(team);
  const [p1, p2, p3] = team.prizes;

  teamNameInput.value = team.name;
  sessionNameInput.value = session?.name || 'รอบหลัก';
  prize1Name.value = p1.name;
  prize1Count.value = p1.totalUnits;
  prize1BatchSize.value = p1.unitsPerWinner;
  prize2Name.value = p2.name;
  prize2Count.value = p2.totalUnits;
  prize2BatchSize.value = p2.unitsPerWinner;
  prize3Name.value = p3.name;
  prize3Count.value = p3.totalUnits;
  prize3BatchSize.value = p3.unitsPerWinner;
  settingsDrawCountInput.value = team.drawCount;
  setPreviewImage(prize1ImagePreview, p1.image);
  setPreviewImage(prize2ImagePreview, p2.image);
  setPreviewImage(prize3ImagePreview, p3.image);
  renderSettingsMemberList();
}

function applyMemberWorkspaceAccess(workspaceRecord) {
  currentWorkspace = {
    id: workspaceRecord.workspace_id,
    name: workspaceRecord.workspace_name,
    slug: workspaceRecord.workspace_slug
  };
  latestMemberAccessCode = '';
  currentAccessMode = 'member';
  persistActiveWorkspaceSlug(currentWorkspace.slug);
  state = workspaceRecord.payload ? normalizeState(workspaceRecord.payload) : createDefaultState();
  storageMode = 'supabase';
  render();
  renderWorkspaceOptions();
  renderMemberAccessPanel();
  renderMemberViewSummary();
}

function showMemberWorkspaceView() {
  authGateOverlay.classList.add('hidden');
  document.body.classList.remove('auth-locked');
  authTopbarSession.classList.remove('hidden');
  settingsForm.classList.add('hidden');
}

function renderMemberAccessPanel() {
  if (!memberAccessCodeDisplay || !memberAccessCodeHint || !generateMemberAccessCodeButton) {
    return;
  }

  if (!currentWorkspace) {
    memberAccessCodeDisplay.textContent = 'ยังไม่ได้สร้างรหัสสมาชิก';
    memberAccessCodeHint.textContent = 'สร้างหรือเปิด workspace ก่อน แล้วจึงสร้างรหัสสมาชิกสำหรับแชร์ให้สมาชิกกิล';
    generateMemberAccessCodeButton.disabled = true;
    return;
  }

  if (latestMemberAccessCode) {
    memberAccessCodeDisplay.textContent = formatAccessCode(latestMemberAccessCode);
    memberAccessCodeHint.textContent = 'ส่งรหัสนี้ให้สมาชิกกิลได้ทันที หากกดสร้างใหม่ รหัสเดิมจะใช้ไม่ได้ทันที';
  } else {
    memberAccessCodeDisplay.textContent = 'ยังไม่ได้สร้างรหัสสมาชิก';
    memberAccessCodeHint.textContent = 'กดปุ่มด้านล่างเพื่อสร้างรหัสใหม่ รหัสเดิมจะถูกยกเลิกทันทีเมื่อสร้างใหม่';
  }

  generateMemberAccessCodeButton.disabled = !(isAdmin && canManageWorkspace && currentWorkspace?.id);
}

function renderMemberViewSummary() {
  if (!memberStatMembers || !memberStatDistributed || !memberStatRemaining) {
    return;
  }

  if (!currentWorkspace) {
    memberStatMembers.textContent = '0';
    memberStatDistributed.textContent = '0';
    memberStatRemaining.textContent = '0';
    if (sessionSummaryCard && currentAccessMode === 'member') {
      sessionSummaryCard.textContent = 'ยังไม่ได้เลือกกิลสำหรับโหมดสมาชิก';
    }
    return;
  }

  const team = getActiveTeam();
  const totalMembers = normalizeMembers(team.members).length;
  const distributedUnits = getAllTeamHistory(team).reduce((sum, entry) => sum + (parseInt(entry.units, 10) || 0), 0);
  const remainingUnits = getRemainingPrizeAssignments(team).reduce((sum, entry) => sum + entry.units, 0);

  memberStatMembers.textContent = String(totalMembers);
  memberStatDistributed.textContent = String(distributedUnits);
  memberStatRemaining.textContent = String(remainingUnits);

  if (sessionSummaryCard && currentAccessMode === 'member') {
    sessionSummaryCard.textContent = `${team.name || currentWorkspace.name} | สมาชิก ${totalMembers} คน | คงเหลือ ${remainingUnits} ชิ้น`;
  }
}

async function handleGoogleAuth() {
  const client = getSupabaseClient();
  if (!client) {
    authStatusText.textContent = 'การเข้าใช้ด้วย Google ต้องตั้งค่า Supabase ก่อน';
    showResult('การเข้าใช้ด้วย Google ต้องใช้ Supabase Auth');
    return;
  }

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getOAuthRedirectUrl()
    }
  });

  if (error) {
    authStatusText.textContent = `เข้าใช้ด้วย Google ไม่สำเร็จ: ${formatAuthError(error, 'login')}`;
    showResult('เริ่มต้น Google sign-in ไม่สำเร็จ');
  }
}

function updateAdminUI() {
  document.querySelectorAll('.edit-prize-btn').forEach(button => {
    button.classList.toggle('hidden', !canManageWorkspace);
  });
}

function updateAuthUI() {
  updateAdminUI();

  if (isAdmin) {
    showSettingsForm();
    authSessionText.textContent = authSession
      ? `ผู้ดูแลกิล: ${getAuthUserLabel()}`
      : 'ผู้ดูแลกิล';
  } else if (currentAccessMode === 'member' && currentWorkspace) {
    showMemberWorkspaceView();
    authSessionText.textContent = `เข้าใช้ด้วยรหัสสมาชิกของ ${currentWorkspace.name}`;
  } else {
    authSessionText.textContent = 'ยังไม่ได้เข้าสู่ระบบ';
    showPasswordGate();
  }

  settingsPanel.classList.toggle('hidden', !isAdmin);
  drawAllButton.disabled = !canManageWorkspace;
  drawCountInput.disabled = !canManageWorkspace;
  drawAllButton.classList.toggle('hidden', !canManageWorkspace);
  controlMeta.classList.toggle('hidden', !canManageWorkspace);
  controlCard.classList.toggle('member-view', !canManageWorkspace && currentAccessMode === 'member' && Boolean(currentWorkspace));
  controlCard.classList.toggle('hidden', !canManageWorkspace && currentAccessMode === 'member' && Boolean(currentWorkspace));
  memberViewCard.classList.toggle('hidden', !(currentAccessMode === 'member' && Boolean(currentWorkspace)));
  memberReadonlyHint.classList.add('hidden');
  activeWorkspaceName.textContent = currentWorkspace?.name || 'ยังไม่ได้เลือก workspace';
  renderMemberAccessPanel();
  renderMemberViewSummary();
}

async function loadInitialState() {
  state = createDefaultState();
  const client = getSupabaseClient();

  if (!client) {
    authSession = null;
    isAdmin = false;
    canManageWorkspace = false;
    currentAccessMode = 'locked';
    currentWorkspace = null;
    storageMode = 'local';
    render();
    renderWorkspaceOptions();
    renderMemberAccessPanel();
    updateAuthUI();
    return;
  }

  let session = null;
  const redirectSession = await handleOAuthRedirect();
  if (redirectSession) {
    session = redirectSession;
  } else {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error('Failed to get auth session.', error);
    }
    session = data?.session || null;
  }
  authSession = session;
  await fetchMyWorkspaces();

  if (authSession) {
    isAdmin = true;
    currentAccessMode = 'admin';
    persistMemberAccessCode('');
    const requestedSlug = getCurrentWorkspaceSlug();
    const matchedWorkspace = myWorkspaces.find(workspace => workspace.slug === requestedSlug) || myWorkspaces[0] || null;
    canManageWorkspace = Boolean(matchedWorkspace && await hasWorkspaceAdminPrivileges(matchedWorkspace.id, client));
    await loadWorkspaceState(matchedWorkspace);
    fillSettingsForm();
    updateAuthUI();
    return;
  }

  isAdmin = false;
  canManageWorkspace = false;
  myWorkspaces = [];
  const storedCode = getStoredMemberAccessCode();
  if (storedCode) {
    const memberWorkspace = await resolveWorkspaceAccessCode(storedCode, client);
    if (memberWorkspace) {
      applyMemberWorkspaceAccess(memberWorkspace);
      updateAuthUI();
      return;
    }

    persistMemberAccessCode('');
  }

  currentWorkspace = null;
  currentAccessMode = 'locked';
  render();
  renderWorkspaceOptions();
  renderMemberAccessPanel();
  updateAuthUI();
}

async function syncAuthState() {
  const client = getSupabaseClient();
  if (!client) {
    authSession = null;
    isAdmin = false;
    canManageWorkspace = false;
    currentAccessMode = 'locked';
    myWorkspaces = [];
    renderWorkspaceOptions();
    renderMemberAccessPanel();
    updateAuthUI();
    return;
  }

  const { data, error } = await client.auth.getSession();
  if (error) {
    console.error('Failed to sync auth state.', error);
  }
  authSession = data?.session || null;
  await fetchMyWorkspaces();

  if (authSession) {
    isAdmin = true;
    currentAccessMode = 'admin';
    persistMemberAccessCode('');
    const requestedSlug = getCurrentWorkspaceSlug();
    const matchedWorkspace = myWorkspaces.find(workspace => workspace.slug === requestedSlug)
      || myWorkspaces.find(workspace => workspace.slug === currentWorkspace?.slug)
      || myWorkspaces[0]
      || null;
    canManageWorkspace = Boolean(matchedWorkspace && await hasWorkspaceAdminPrivileges(matchedWorkspace.id, client));
    await loadWorkspaceState(matchedWorkspace);
    fillSettingsForm();
    updateAuthUI();
    return;
  }

  isAdmin = false;
  canManageWorkspace = false;
  myWorkspaces = [];
  const storedCode = getStoredMemberAccessCode();
  if (storedCode) {
    const memberWorkspace = await resolveWorkspaceAccessCode(storedCode, client);
    if (memberWorkspace) {
      applyMemberWorkspaceAccess(memberWorkspace);
      updateAuthUI();
      return;
    }

    persistMemberAccessCode('');
  }

  currentWorkspace = null;
  currentAccessMode = 'locked';
  state = createDefaultState();
  render();
  renderWorkspaceOptions();
  renderMemberAccessPanel();
  updateAuthUI();
}

async function saveState() {
  if (currentWorkspace?.slug) {
    saveStateToLocal(currentWorkspace.slug);
  }

  const client = getSupabaseClient();
  if (!client || !authSession || !canManageWorkspace || !currentWorkspace?.id) {
    storageMode = 'local';
    return;
  }

  const { error } = await client.from('workspace_state').upsert({
    workspace_id: currentWorkspace.id,
    payload: state,
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error('Failed to save workspace state to Supabase.', error);
    storageMode = 'local';
    showResult('บันทึกขึ้น Supabase ไม่สำเร็จ ระบบเก็บสำรองไว้ในเครื่องแล้ว');
    return;
  }

  storageMode = 'supabase';
}

async function createWorkspace() {
  const client = getSupabaseClient();
  if (!client || !authSession) {
    showResult('ต้องเข้าสู่ระบบด้วย Google ก่อนสร้าง workspace');
    return;
  }

  const workspaceName = normalizeName(createWorkspaceNameInput.value);
  const workspaceSlug = normalizeSlug(createWorkspaceSlugInput.value);
  if (!workspaceName || !workspaceSlug) {
    showResult('กรุณากรอกชื่อและ slug ของ workspace');
    return;
  }

  const initialState = createDefaultState();
  const { data, error } = await client.rpc('create_workspace', {
    workspace_name: workspaceName,
    workspace_slug: workspaceSlug,
    initial_payload: initialState
  });

  if (error) {
    showResult(`สร้าง workspace ไม่สำเร็จ: ${error.message}`);
    return;
  }

  createWorkspaceNameInput.value = '';
  createWorkspaceSlugInput.value = '';
  persistActiveWorkspaceSlug(workspaceSlug);
  await syncAuthState();
  currentWorkspace = myWorkspaces.find(workspace => workspace.id === data)
    || myWorkspaces.find(workspace => workspace.slug === workspaceSlug)
    || null;
  canManageWorkspace = Boolean(currentWorkspace);
  await loadWorkspaceState(currentWorkspace);
  fillSettingsForm();
  updateAuthUI();
  showResult(`สร้าง workspace เรียบร้อย: ${workspaceName}`);
}

async function openSelectedWorkspace() {
  const slug = normalizeSlug(workspaceSelect.value);
  const workspace = myWorkspaces.find(item => item.slug === slug);
  if (!workspace) {
    showResult('ไม่พบ workspace ที่เลือก');
    return;
  }

  const client = getSupabaseClient();
  canManageWorkspace = Boolean(client && authSession && await hasWorkspaceAdminPrivileges(workspace.id, client));
  await loadWorkspaceState(workspace);
  fillSettingsForm();
  updateAuthUI();
  showResult(`เปิด workspace แล้ว: ${workspace.name}`);
}

async function handleMemberAccessLogin() {
  const client = getSupabaseClient();
  if (!client) {
    authStatusText.textContent = 'การใช้รหัสสมาชิกต้องตั้งค่า Supabase ก่อน';
    showResult('ยังไม่พร้อมใช้งานรหัสสมาชิก');
    return;
  }

  const code = normalizeAccessCode(memberAccessCodeInput.value);
  if (!code) {
    authStatusText.textContent = 'กรุณากรอกรหัสสมาชิก';
    showResult('กรุณากรอกรหัสสมาชิก');
    memberAccessCodeInput.focus();
    return;
  }

  const memberWorkspace = await resolveWorkspaceAccessCode(code, client);
  if (!memberWorkspace) {
    authStatusText.textContent = 'รหัสสมาชิกไม่ถูกต้องหรือหมดอายุแล้ว';
    showResult('รหัสสมาชิกไม่ถูกต้องหรือหมดอายุแล้ว');
    memberAccessCodeInput.select();
    return;
  }

  persistMemberAccessCode(code);
  authSession = null;
  isAdmin = false;
  canManageWorkspace = false;
  applyMemberWorkspaceAccess(memberWorkspace);
  authStatusText.textContent = `เปิดใช้งาน workspace แล้ว: ${memberWorkspace.workspace_name}`;
  memberAccessCodeInput.value = '';
  updateAuthUI();
  showResult(`เข้าสู่แอปด้วยรหัสสมาชิกแล้ว: ${memberWorkspace.workspace_name}`);
}

async function handleSettingsLogout() {
  const client = getSupabaseClient();
  if (client && authSession) {
    await client.auth.signOut();
  }

  authSession = null;
  isAdmin = false;
  canManageWorkspace = false;
  currentWorkspace = null;
  currentAccessMode = 'locked';
  myWorkspaces = [];
  latestMemberAccessCode = '';
  state = createDefaultState();
  persistMemberAccessCode('');
  authStatusText.textContent = 'ถ้าเป็นสมาชิกกิล ให้ขอรหัสสมาชิกจากผู้ดูแลกิลก่อน ส่วนผู้ดูแลกิลสามารถกด Google เพื่อเข้าสู่ระบบได้ทันที';
  render();
  renderWorkspaceOptions();
  renderMemberAccessPanel();
  updateAuthUI();
  showResult('ออกจากระบบแล้ว');
}

async function handleGenerateMemberAccessCode() {
  const client = getSupabaseClient();
  if (!client || !authSession || !canManageWorkspace || !currentWorkspace?.id) {
    showResult('ต้องเปิด workspace และเข้าสู่ระบบในฐานะผู้ดูแลกิลก่อน');
    return;
  }

  const { data, error } = await client.rpc('rotate_workspace_access_code', {
    candidate_workspace: currentWorkspace.id
  });

  if (error) {
    showResult(`สร้างรหัสสมาชิกไม่สำเร็จ: ${error.message}`);
    return;
  }

  latestMemberAccessCode = normalizeAccessCode(data);
  renderMemberAccessPanel();
  showResult(`สร้างรหัสสมาชิกใหม่แล้ว: ${formatAccessCode(latestMemberAccessCode)}`);
}

async function addMember() {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('ต้องเปิด workspace และเข้าสู่ระบบในฐานะผู้ดูแลกิลก่อนเพิ่มสมาชิก');
    return;
  }

  const team = getActiveTeam();
  const memberName = normalizeName(participantNameInput.value);
  if (!memberName) {
    showResult('กรุณากรอกชื่อสมาชิก Guild');
    participantNameInput.focus();
    return;
  }

  if (team.members.includes(memberName)) {
    showResult('ชื่อนี้มีอยู่ใน Guild แล้ว');
    participantNameInput.select();
    return;
  }

  team.members.push(memberName);
  team.members = normalizeMembers(team.members);
  await saveState();
  render();
  renderSettingsMemberList();
  participantNameInput.value = '';
  showResult(`เพิ่มสมาชิกแล้ว: ${memberName}`);
}

async function removeMember(index) {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('ต้องเปิด workspace และเข้าสู่ระบบในฐานะผู้ดูแลกิลก่อนลบสมาชิก');
    return;
  }

  const team = getActiveTeam();
  const removed = team.members[index];
  if (!removed) {
    return;
  }

  team.members.splice(index, 1);
  await saveState();
  render();
  renderSettingsMemberList();
  showResult(`ลบสมาชิกแล้ว: ${removed}`);
}

function openEditPrizeModal(index) {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('ต้องเปิด workspace และเข้าสู่ระบบในฐานะผู้ดูแลกิลก่อนแก้ไขรางวัล');
    return;
  }

  const prize = getActiveTeam().prizes[index];
  currentEditingPrizeIndex = index;
  editPrizeName.value = prize.name;
  editPrizeImage.value = '';
  editPrizeCount.value = prize.totalUnits;
  editPrizeBatchSize.value = prize.unitsPerWinner;
  setPreviewImage(editPrizeImagePreview, prize.image);
  prizeEditModal.classList.remove('hidden');
}

async function distributePrizes() {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('เฉพาะผู้ดูแลกิลเท่านั้นที่สามารถแบ่งของรางวัลได้');
    return;
  }

  const team = getActiveTeam();
  const session = ensureActiveSession(team);
  const normalizedMembers = normalizeMembers(team.members);
  const remainingAssignments = getRemainingPrizeAssignments(team);
  const eligibleMembers = getEligibleMembers(team, session);
  const count = Math.max(1, Math.min(parseInt(drawCountInput.value, 10) || 1, remainingAssignments.length));

  if (normalizedMembers.length === 0) {
    showResult('ยังไม่มีสมาชิกใน Guild สำหรับการแบ่งของ');
    return;
  }

  if (remainingAssignments.length === 0) {
    showResult('ของรางวัลถูกแจกครบแล้ว');
    return;
  }

  if (eligibleMembers.length === 0) {
    showResult('สมาชิกในรอบนี้ได้รับของครบทุกคนแล้ว กรุณาเปลี่ยนชื่อรอบเพื่อเริ่มรอบใหม่');
    return;
  }

  if (count > eligibleMembers.length) {
    showResult(`ยังมีผู้มีสิทธิ์รับรางวัลเพียง ${eligibleMembers.length} คน`);
    return;
  }

  const assignments = shuffle(remainingAssignments).slice(0, count);
  const winners = pickWinners(team, count);

  assignments.forEach((assignment, index) => {
    session.history.push({
      id: createId('history'),
      teamId: team.id,
      sessionId: session.id,
      sessionName: session.name,
      prizeId: assignment.prizeId,
      prizeName: assignment.prizeName,
      memberName: winners[index],
      units: assignment.units,
      time: Date.now()
    });
  });

  await saveState();
  render();
  showResult(
    `แบ่งของเรียบร้อย: ${assignments
      .map((assignment, index) => `${winners[index]} ได้ ${assignment.prizeName} x${assignment.units}`)
      .join(', ')}`
  );
}

async function readPrizeSettingsFromForm(team = getActiveTeam()) {
  const [image1, image2, image3] = await Promise.all([
    resolvePrizeImage(prize1Image, team.prizes[0]?.image, '🏆'),
    resolvePrizeImage(prize2Image, team.prizes[1]?.image, '🎁'),
    resolvePrizeImage(prize3Image, team.prizes[2]?.image, '🎉')
  ]);

  return [
    {
      id: team.prizes[0]?.id || createId('prize'),
      name: normalizeName(prize1Name.value) || 'รางวัล 1',
      image: image1,
      totalUnits: Math.max(1, parseInt(prize1Count.value, 10) || 1),
      unitsPerWinner: Math.max(1, parseInt(prize1BatchSize.value, 10) || 1)
    },
    {
      id: team.prizes[1]?.id || createId('prize'),
      name: normalizeName(prize2Name.value) || 'รางวัล 2',
      image: image2,
      totalUnits: Math.max(1, parseInt(prize2Count.value, 10) || 1),
      unitsPerWinner: Math.max(1, parseInt(prize2BatchSize.value, 10) || 1)
    },
    {
      id: team.prizes[2]?.id || createId('prize'),
      name: normalizeName(prize3Name.value) || 'รางวัล 3',
      image: image3,
      totalUnits: Math.max(1, parseInt(prize3Count.value, 10) || 1),
      unitsPerWinner: Math.max(1, parseInt(prize3BatchSize.value, 10) || 1)
    }
  ];
}

async function handleSettingsSave() {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('ต้องเปิด workspace และเข้าสู่ระบบในฐานะผู้ดูแลกิลก่อนบันทึก');
    return;
  }

  try {
    const team = getActiveTeam();
    const nextSessionName = normalizeName(sessionNameInput.value) || 'รอบหลัก';
    const currentSession = getActiveSession(team);

    if (!currentSession || currentSession.name !== nextSessionName) {
      startNewSession(nextSessionName);
    }

    team.name = normalizeName(teamNameInput.value) || 'Guild หลัก';
    team.prizes = await readPrizeSettingsFromForm(team);
    team.drawCount = Math.max(1, parseInt(settingsDrawCountInput.value, 10) || 1);

    await saveState();
    render();
    fillSettingsForm();
    showResult('บันทึกข้อมูล Guild และรอบแจกเรียบร้อย');
  } catch (error) {
    showResult(error.message);
  }
}

async function handlePrizeReset() {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('ต้องเปิด workspace และเข้าสู่ระบบในฐานะผู้ดูแลกิลก่อนรีเซ็ตรางวัล');
    return;
  }

  if (!confirm(`ต้องการรีเซ็ตรางวัลของ workspace ${currentWorkspace.name} โดยเก็บสมาชิกและชื่อกิลไว้ใช่หรือไม่?`)) {
    return;
  }

  try {
    const team = getActiveTeam();
    const nextSessionName = normalizeName(sessionNameInput.value) || 'รอบหลัก';
    const freshSession = createSession(nextSessionName);

    team.name = normalizeName(teamNameInput.value) || team.name || 'Guild หลัก';
    team.prizes = await readPrizeSettingsFromForm(team);
    team.drawCount = Math.max(1, parseInt(settingsDrawCountInput.value, 10) || 1);
    team.sessions = [freshSession];
    team.activeSessionId = freshSession.id;

    await saveState();
    clearLatestDistributionResult();
    render();
    fillSettingsForm();
    showResult(`รีเซ็ตรางวัลเรียบร้อย และเริ่มรอบใหม่: ${nextSessionName}`);
  } catch (error) {
    showResult(error.message);
  }
}

async function handleSettingsReset() {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('ต้องเปิด workspace และเข้าสู่ระบบในฐานะผู้ดูแลกิลก่อนรีเซ็ตทั้งหมด');
    return;
  }

  if (!confirm(`ต้องการรีเซ็ตข้อมูลทั้งหมดของ workspace ${currentWorkspace.name} ใช่หรือไม่?`)) {
    return;
  }

  state = createDefaultState();
  await saveState();
  clearLatestDistributionResult();
  render();
  fillSettingsForm();
  showResult('รีเซ็ตข้อมูลทั้งหมดของ workspace เรียบร้อย');
}

async function handleAddPrizeSet() {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('ต้องเปิด workspace และเข้าในฐานะผู้ดูแลกิลก่อนเพิ่มชุดรางวัล');
    return;
  }

  try {
    const team = getActiveTeam();
    const requestedSessionName = normalizeName(sessionNameInput.value) || `รอบ ${team.sessions.length + 1}`;
    const currentSession = getActiveSession(team);

    if (currentSession?.history?.length > 0 || currentSession?.name === requestedSessionName) {
      startNewSession(requestedSessionName);
    } else {
      currentSession.name = requestedSessionName;
    }

    const [image1, image2, image3] = await Promise.all([
      resolvePrizeImage(prize1Image, team.prizes[0]?.image, '🏆'),
      resolvePrizeImage(prize2Image, team.prizes[1]?.image, '🎁'),
      resolvePrizeImage(prize3Image, team.prizes[2]?.image, '🎉')
    ]);

    team.name = normalizeName(teamNameInput.value) || 'Guild หลัก';
    team.prizes = [
      {
        id: team.prizes[0]?.id || createId('prize'),
        name: normalizeName(prize1Name.value) || 'รางวัล 1',
        image: image1,
        totalUnits: Math.max(1, parseInt(prize1Count.value, 10) || 1),
        unitsPerWinner: Math.max(1, parseInt(prize1BatchSize.value, 10) || 1)
      },
      {
        id: team.prizes[1]?.id || createId('prize'),
        name: normalizeName(prize2Name.value) || 'รางวัล 2',
        image: image2,
        totalUnits: Math.max(1, parseInt(prize2Count.value, 10) || 1),
        unitsPerWinner: Math.max(1, parseInt(prize2BatchSize.value, 10) || 1)
      },
      {
        id: team.prizes[2]?.id || createId('prize'),
        name: normalizeName(prize3Name.value) || 'รางวัล 3',
        image: image3,
        totalUnits: Math.max(1, parseInt(prize3Count.value, 10) || 1),
        unitsPerWinner: Math.max(1, parseInt(prize3BatchSize.value, 10) || 1)
      }
    ];
    team.drawCount = Math.max(1, parseInt(settingsDrawCountInput.value, 10) || 1);

    await saveState();
    clearLatestDistributionResult();
    render();
    fillSettingsForm();
    showResult(`เพิ่มชุดรางวัลรอบใหม่แล้ว: ${requestedSessionName}`);
  } catch (error) {
    showResult(error.message);
  }
}

async function distributePrizes() {
  if (!currentWorkspace || !canManageWorkspace) {
    showResult('เฉพาะผู้ดูแลกิลเท่านั้นที่สามารถแบ่งของรางวัลได้');
    return;
  }

  const team = getActiveTeam();
  const session = ensureActiveSession(team);
  const normalizedMembers = normalizeMembers(team.members);
  const remainingAssignments = getRemainingPrizeAssignments(team);
  const distributableAssignments = getDistributableAssignments(team, session);
  const count = Math.max(1, Math.min(parseInt(drawCountInput.value, 10) || 1, distributableAssignments.length));

  if (normalizedMembers.length === 0) {
    showResult('ยังไม่มีสมาชิกใน Guild สำหรับการแบ่งของ');
    return;
  }

  if (remainingAssignments.length === 0) {
    showResult('ของรางวัลถูกแจกครบแล้ว');
    return;
  }

  if (distributableAssignments.length === 0) {
    showResult('สมาชิกในรอบนี้ได้รับของครบทุกคนทุกอย่างแล้ว ให้เพิ่มชุดรางวัลรอบใหม่');
    return;
  }

  const assignments = distributableAssignments.slice(0, count);
  const results = [];
  const distributionRunId = createId('distribution');
  const distributionRunTime = Date.now();
  const winnersThisRun = new Set();

  assignments.forEach(assignment => {
    const eligibleMembers = shuffle(getEligibleMembersForPrize(team, assignment.prizeId, session, winnersThisRun));
    const winner = eligibleMembers[0];
    if (!winner) {
      return;
    }

    winnersThisRun.add(winner);

    const historyEntry = {
      id: createId('history'),
      teamId: team.id,
      sessionId: session.id,
      sessionName: session.name,
      distributionRunId,
      prizeId: assignment.prizeId,
      prizeName: assignment.prizeName,
      memberName: winner,
      units: assignment.units,
      time: distributionRunTime
    };

    session.history.push(historyEntry);

    results.push(`${winner} ได้ ${assignment.prizeName} x${assignment.units}`);
  });

  if (results.length === 0) {
    showResult('ยังไม่มีสมาชิกที่มีสิทธิ์รับรางวัลในชุดนี้');
    return;
  }

  await saveState();
  render();
  fillSettingsForm();
  showResult(`แบ่งของเรียบร้อย: ${results.join(', ')}`);
}

async function initializeApp() {
  await loadInitialState();
  fillSettingsForm();
  renderWorkspaceOptions();
  renderMemberAccessPanel();

  drawAllButton.addEventListener('click', () => void distributePrizes());
  memberAccessButton.addEventListener('click', () => void handleMemberAccessLogin());
  googleAuthButton.addEventListener('click', () => void handleGoogleAuth());
  settingsLogoutButton.addEventListener('click', () => void handleSettingsLogout());
  loadWorkspaceButton.addEventListener('click', () => void openSelectedWorkspace());
  createWorkspaceButton.addEventListener('click', () => void createWorkspace());
  generateMemberAccessCodeButton.addEventListener('click', () => void handleGenerateMemberAccessCode());
  addPrizeSetButton.addEventListener('click', () => void handleAddPrizeSet());
  settingsSaveButton.addEventListener('click', () => void handleSettingsSave());
  settingsPrizeResetButton.addEventListener('click', () => void handlePrizeReset());
  settingsResetButton.addEventListener('click', () => void handleSettingsReset());
  addParticipantButton.addEventListener('click', () => void addMember());

  memberAccessCodeInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleMemberAccessLogin();
    }
  });
  participantNameInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void addMember();
    }
  });
  createWorkspaceSlugInput.addEventListener('input', () => {
    createWorkspaceSlugInput.value = normalizeSlug(createWorkspaceSlugInput.value);
  });

  settingsParticipantList.addEventListener('click', event => {
    const button = event.target.closest('.participant-remove-button');
    if (!button) {
      return;
    }
    void removeMember(parseInt(button.dataset.index, 10));
  });

  document.querySelectorAll('.edit-prize-btn').forEach(button => {
    button.addEventListener('click', () => {
      openEditPrizeModal(parseInt(button.dataset.index, 10));
    });
  });
  closePrizeEditButton.addEventListener('click', closeEditPrizeModal);
  editPrizeSaveButton.addEventListener('click', () => void handleEditPrizeSave());
  prizeEditModal.addEventListener('click', event => {
    if (event.target === prizeEditModal) {
      closeEditPrizeModal();
    }
  });

  bindImagePreview(prize1Image, prize1ImagePreview);
  bindImagePreview(prize2Image, prize2ImagePreview);
  bindImagePreview(prize3Image, prize3ImagePreview);
  bindImagePreview(editPrizeImage, editPrizeImagePreview);

  const client = getSupabaseClient();
  if (client) {
    client.auth.onAuthStateChange(() => {
      void syncAuthState().then(() => {
        fillSettingsForm();
        renderWorkspaceOptions();
      });
    });
  }
}

void initializeApp();
