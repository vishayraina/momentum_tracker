// Client API client for Personal Momentum OS

const API_BASE = '/api';

export const api = {
  // Life Directions
  async getLifeDirections() {
    const res = await fetch(`${API_BASE}/life-directions`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch life directions');
    return json.data;
  },

  async createLifeDirection(payload) {
    const res = await fetch(`${API_BASE}/life-directions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create life direction');
    return json.data;
  },

  async updateLifeDirection(id, payload) {
    const res = await fetch(`${API_BASE}/life-directions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update life direction');
    return json.data;
  },

  async deleteLifeDirection(id) {
    const res = await fetch(`${API_BASE}/life-directions/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete life direction');
    return json;
  },

  // Areas
  async getAreas(lifeDirectionId = null) {
    const url = lifeDirectionId ? `${API_BASE}/areas?lifeDirectionId=${lifeDirectionId}` : `${API_BASE}/areas`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch areas');
    return json.data;
  },

  async createArea(payload) {
    const res = await fetch(`${API_BASE}/areas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create area');
    return json.data;
  },

  async updateArea(id, payload) {
    const res = await fetch(`${API_BASE}/areas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update area');
    return json.data;
  },

  async deleteArea(id) {
    const res = await fetch(`${API_BASE}/areas/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete area');
    return json;
  },

  // Priorities
  async getPriorities(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.areaId) searchParams.set('areaId', params.areaId);
    if (params.phase) searchParams.set('phase', params.phase);
    if (params.isActive !== undefined) searchParams.set('isActive', params.isActive);

    const query = searchParams.toString();
    const url = query ? `${API_BASE}/priorities?${query}` : `${API_BASE}/priorities`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch priorities');
    return json.data;
  },

  async getHierarchy(isActive = true) {
    const res = await fetch(`${API_BASE}/priorities/hierarchy?isActive=${isActive}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch hierarchy');
    return json.data;
  },

  async getPriority(id) {
    const res = await fetch(`${API_BASE}/priorities/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch priority');
    return json.data;
  },

  async createPriority(payload) {
    const res = await fetch(`${API_BASE}/priorities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create priority');
    return json.data;
  },

  async updatePriority(id, payload) {
    const res = await fetch(`${API_BASE}/priorities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update priority');
    return json.data;
  },

  async deletePriority(id) {
    const res = await fetch(`${API_BASE}/priorities/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete priority');
    return json;
  },

  // Goals & Milestones
  async getGoals(priorityId, status = null) {
    const url = status ? `${API_BASE}/priorities/${priorityId}/goals?status=${status}` : `${API_BASE}/priorities/${priorityId}/goals`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch goals');
    return json.data;
  },

  async getActiveGoal(priorityId) {
    const res = await fetch(`${API_BASE}/priorities/${priorityId}/goals/active`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch active goal');
    return json.data;
  },

  async createGoal(priorityId, payload) {
    const res = await fetch(`${API_BASE}/priorities/${priorityId}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create goal');
    return json.data;
  },

  async getGoal(id) {
    const res = await fetch(`${API_BASE}/goals/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch goal');
    return json.data;
  },

  async updateGoal(id, payload) {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update goal');
    return json.data;
  },

  async updateGoalProgress(id, currentValue) {
    const res = await fetch(`${API_BASE}/goals/${id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentValue })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update goal progress');
    return json.data;
  },

  async achieveGoal(id, payload) {
    const res = await fetch(`${API_BASE}/goals/${id}/achieve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to record goal achievement');
    return json.data;
  },

  async retireGoal(id, payload) {
    const res = await fetch(`${API_BASE}/goals/${id}/retire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to retire goal');
    return json.data;
  },

  async deleteGoal(id) {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete goal');
    return json;
  },

  // Progress Events & Timeline
  async getEvents(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.priorityId) searchParams.set('priorityId', params.priorityId);
    if (params.goalId) searchParams.set('goalId', params.goalId);
    if (params.eventType) searchParams.set('eventType', params.eventType);
    if (params.status) searchParams.set('status', params.status);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.sort) searchParams.set('sort', params.sort);

    const query = searchParams.toString();
    const url = query ? `${API_BASE}/events?${query}` : `${API_BASE}/events`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch events');
    return json.data;
  },

  async logEvent(payload) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to log progress event');
    return json.data;
  },

  async getEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch event');
    return json.data;
  },

  async voidEvent(id, reason = null) {
    const res = await fetch(`${API_BASE}/events/${id}/void`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to void event');
    return json.data;
  },

  async getPriorityTimeline(priorityId, includeVoided = true) {
    const res = await fetch(`${API_BASE}/priorities/${priorityId}/events?includeVoided=${includeVoided}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch priority timeline');
    return json.data;
  }
};
