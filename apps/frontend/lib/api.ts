const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
// Ensure API_URL always ends with /api
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/api`;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: {
    username: string;
    email?: string;
    teamName: string;
    participant1Name: string;
    participant2Name?: string;
    password: string;
  }) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { username: string; password: string; email?: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getProfile: () => apiRequest('/users/me'),
  
  // Teams
  createTeam: (data: { name: string }) =>
    apiRequest('/teams', { method: 'POST', body: JSON.stringify(data) }),
  
  joinTeam: (data: { teamId: string }) =>
    apiRequest('/teams/join', { method: 'POST', body: JSON.stringify(data) }),
  
  getAllTeams: () => apiRequest('/teams'),
  
  getTeam: (id: string) => apiRequest(`/teams/${id}`),

  // Rounds
  getCurrentRound: () => apiRequest('/rounds/current'),
  
  getAllRounds: () => apiRequest('/rounds'),

  // Challenges
  getAllChallenges: () => apiRequest('/challenges/all'),

  challenges: {
    getCurrent: () => apiRequest('/challenges/current'),
    getActivity: () => apiRequest('/challenges/activity'),
    useHint: (challengeId: string) => apiRequest(`/challenges/${challengeId}/hint`, { method: 'POST' }),
    submitFlag: (data: { challengeId: string; flag: string }) =>
      apiRequest('/challenges/submit', { method: 'POST', body: JSON.stringify(data) }),
    getLeaderboard: () => apiRequest('/scoreboard'),
  },

  // Submissions
  getMySubmissions: () => apiRequest('/submissions/me'),

  // Scoreboard
  getScoreboard: () => apiRequest('/scoreboard'),

  getTeamStats: (teamId: string) => apiRequest(`/scoreboard/team/${teamId}`),

  getScoreboardStatus: () => apiRequest('/scoreboard/status'),

  // Admin
  admin: {
    getStats: () => apiRequest('/admin/stats'),
    getAllSubmissions: () => apiRequest('/admin/submissions'),
    createRound: (data: any) => apiRequest('/admin/rounds', { method: 'POST', body: JSON.stringify(data) }),
    updateRoundStatus: (id: string, data: any) =>
      apiRequest(`/admin/rounds/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    createChallenge: (data: any) =>
      apiRequest('/admin/challenges', { method: 'POST', body: JSON.stringify(data) }),
    updateChallenge: (id: string, data: any) =>
      apiRequest(`/admin/challenges/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteChallenge: (id: string) => apiRequest(`/admin/challenges/${id}`, { method: 'DELETE' }),
    deleteRound: (id: string) => apiRequest(`/admin/rounds/${id}`, { method: 'DELETE' }),
    resetCompetition: () => apiRequest('/admin/reset', { method: 'POST' }),
    adjustTeamScore: (teamId: string, data: { points: number; reason: string }) =>
      apiRequest(`/admin/teams/${teamId}/adjust-score`, { method: 'POST', body: JSON.stringify(data) }),
    disqualifyTeam: (teamId: string, data: { reason: string }) =>
      apiRequest(`/admin/teams/${teamId}/disqualify`, { method: 'POST', body: JSON.stringify(data) }),
    reEnableTeam: (teamId: string) =>
      apiRequest(`/admin/teams/${teamId}/re-enable`, { method: 'POST' }),
    freezeTeamScore: (teamId: string, data: { freeze: boolean }) =>
      apiRequest(`/admin/teams/${teamId}/freeze-score`, { method: 'POST', body: JSON.stringify(data) }),
    qualifyTeam: (teamId: string) =>
      apiRequest(`/admin/teams/${teamId}/qualify`, { method: 'POST' }),
    qualifyTopTeams: (count: number) =>
      apiRequest('/admin/teams/qualify-top', { method: 'POST', body: JSON.stringify({ count }) }),
    getHints: () => apiRequest('/admin/hints'),
    grantHint: (teamId: string, data?: { challengeId?: string; free?: boolean }) =>
      apiRequest(`/admin/teams/${teamId}/grant-hint`, { method: 'POST', body: JSON.stringify(data || {}) }),
    resetHints: (teamId: string, data?: { challengeId?: string; refundPoints?: boolean }) =>
      apiRequest(`/admin/teams/${teamId}/reset-hints`, { method: 'POST', body: JSON.stringify(data || {}) }),
    freezeScoreboard: (data: { freeze: boolean }) =>
      apiRequest('/admin/scoreboard/freeze', { method: 'POST', body: JSON.stringify(data) }),
    exportResults: () => apiRequest('/admin/export'),
    exportResultsCSV: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/admin/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.text();
    },
    endGame: () => apiRequest('/admin/game/end', { method: 'POST' }),
    resumeGame: () => apiRequest('/admin/game/resume', { method: 'POST' }),
    activateAllRounds: () => apiRequest('/admin/rounds/activate-all', { method: 'POST' }),
  },

  // Game/victory state (who has won, whether the story has ended)
  game: {
    getState: () => apiRequest('/game/state'),
  },
};
