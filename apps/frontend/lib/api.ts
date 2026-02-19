const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
  register: (data: { email: string; teamName: string; participant1Name: string; participant2Name: string; password: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  auth: {
    profile: () => apiRequest('/auth/profile'),
  },

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
  getAllChallenges: () => apiRequest('/challenges'),
  
  getChallengesByRound: (roundId: string) => apiRequest(`/challenges/round/${roundId}`),
  
  getChallenge: (id: string) => apiRequest(`/challenges/${id}`),
  
  challenges: {
    getCurrent: () => apiRequest('/challenges/current'),
    getActivity: () => apiRequest('/challenges/activity'),
    submitFlag: (data: { flag: string }) => apiRequest('/submissions', { method: 'POST', body: JSON.stringify(data) }),
    getLeaderboard: () => apiRequest('/scoreboard'),
  },

  // Submissions
  submitFlag: (data: { challengeId: string; flag: string }) =>
    apiRequest('/submissions', { method: 'POST', body: JSON.stringify(data) }),
  
  getMySubmissions: () => apiRequest('/submissions/me'),
  
  getTeamSubmissions: (teamId: string) => apiRequest(`/submissions/team/${teamId}`),

  // Scoreboard
  getScoreboard: () => apiRequest('/scoreboard'),
  
  getTeamStats: (teamId: string) => apiRequest(`/scoreboard/team/${teamId}`),

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
    resetCompetition: () => apiRequest('/admin/reset', { method: 'POST' }),
    adjustTeamScore: (teamId: string, data: { points: number; reason: string }) =>
      apiRequest(`/admin/teams/${teamId}/adjust-score`, { method: 'POST', body: JSON.stringify(data) }),
    disqualifyTeam: (teamId: string, data: { reason: string }) =>
      apiRequest(`/admin/teams/${teamId}/disqualify`, { method: 'POST', body: JSON.stringify(data) }),
    qualifyTeam: (teamId: string) =>
      apiRequest(`/admin/teams/${teamId}/qualify`, { method: 'POST' }),
    qualifyTopTeams: (count: number) =>
      apiRequest('/admin/teams/qualify-top', { method: 'POST', body: JSON.stringify({ count }) }),
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
  },

  // Story endpoints
  story: {
    getState: () => apiRequest('/story/state'),
    getProgress: () => apiRequest('/story/progress'),
    getRound: (roundNumber: number) => apiRequest(`/story/round/${roundNumber}`),
    submitRound1: (data: { systemTarget: string; darkweaveCode: string; credentialHash: string }) =>
      apiRequest('/story/submit/round1', { method: 'POST', body: JSON.stringify(data) }),
    submitRound2: (data: { masterKey: string; backdoorLocation: string }) =>
      apiRequest('/story/submit/round2', { method: 'POST', body: JSON.stringify(data) }),
    submitRound3: (data: { flag: string }) =>
      apiRequest('/story/submit/round3', { method: 'POST', body: JSON.stringify(data) }),
    admin: {
      start: () => apiRequest('/story/admin/start', { method: 'POST' }),
      end: (outcome: 'CITY_SAVED' | 'BREACH_EXECUTED') =>
        apiRequest('/story/admin/end', { method: 'POST', body: JSON.stringify({ outcome }) }),
      reset: () => apiRequest('/story/admin/reset', { method: 'POST' }),
      getAllProgress: () => apiRequest('/story/admin/all-progress'),
    },
  },
};
