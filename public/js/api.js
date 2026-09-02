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
  }
};
