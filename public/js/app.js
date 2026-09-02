import { api } from './api.js';

// Event Type Metadata & Descriptions
export const EVENT_TYPE_CONFIG = {
  SPARK: {
    icon: '⚡',
    label: 'Spark',
    placeholder: 'e.g., Read 5 pages, maintained habit, reviewed PR...'
  },
  FIRE: {
    icon: '🔥',
    label: 'Fire',
    placeholder: 'e.g., High-energy coding burst, solved stubborn race condition...'
  },
  COOK_SESSION: {
    icon: '🍲',
    label: 'Cook Session',
    placeholder: 'e.g., 90m deep work exploration of consensus logs...'
  },
  SERVE: {
    icon: '🚀',
    label: 'Serve',
    placeholder: 'e.g., Published architecture blog post, demoed prototype...'
  },
  GOAL_ACHIEVED: {
    icon: '🎯',
    label: 'Goal Achieved',
    placeholder: 'e.g., All 25 test cases green, milestone accomplished!'
  },
  SYNTHESIS: {
    icon: '💡',
    label: 'Synthesis',
    placeholder: 'e.g., Synthesized lessons learned and mental model...'
  }
};

// Application State
const state = {
  hierarchy: [],
  directions: [],
  areas: [],
  selectedPhaseFilter: 'ALL',
  searchQuery: '',
  showArchived: false,
  editingPriorityId: null,
  inspectingPriority: null,
  activeGoalModalPriority: null,
  activeGoalModalGoal: null,
  activeHistoryPriorityId: null,
  activeHistoryPriorityName: null,
  activeTimelinePriorityId: null,
  activeTimelinePriorityName: null,
  timelineFilter: 'ALL',
  cachedTimelineEvents: []
};

// DOM Elements
const elements = {
  directionsContainer: document.getElementById('directionsContainer'),
  totalPrioritiesEl: document.getElementById('totalPrioritiesCount'),
  sparkCountEl: document.getElementById('sparkCount'),
  fireCountEl: document.getElementById('fireCount'),
  cookCountEl: document.getElementById('cookCount'),
  searchInput: document.getElementById('searchInput'),
  filterChips: document.querySelectorAll('.filter-chip'),
  toastContainer: document.getElementById('toastContainer'),

  // Modals
  priorityModal: document.getElementById('priorityModal'),
  directionModal: document.getElementById('directionModal'),
  areaModal: document.getElementById('areaModal'),
  inspectorModal: document.getElementById('inspectorModal'),
  goalModal: document.getElementById('goalModal'),
  achieveGoalModal: document.getElementById('achieveGoalModal'),
  progressModal: document.getElementById('progressModal'),
  goalHistoryModal: document.getElementById('goalHistoryModal'),
  logProgressModal: document.getElementById('logProgressModal'),
  priorityTimelineModal: document.getElementById('priorityTimelineModal'),

  // Forms
  priorityForm: document.getElementById('priorityForm'),
  directionForm: document.getElementById('directionForm'),
  areaForm: document.getElementById('areaForm'),
  goalForm: document.getElementById('goalForm'),
  achieveGoalForm: document.getElementById('achieveGoalForm'),
  progressForm: document.getElementById('progressForm'),
  logProgressForm: document.getElementById('logProgressForm'),

  // Goal & Milestone Elements
  goalCountFields: document.getElementById('goalCountFields'),
  goalMeasurementLabels: document.querySelectorAll('.measurement-type-label'),
  goalHistoryContainer: document.getElementById('goalHistoryContainer'),

  // Log Progress Elements
  btnLogProgress: document.getElementById('btnLogProgress'),
  eventTypeCards: document.querySelectorAll('.event-type-card'),
  logPrioritySelect: document.getElementById('logPrioritySelect'),
  logGoalSelect: document.getElementById('logGoalSelect'),
  logNoteInput: document.getElementById('logNote'),
  logOccurredAtInput: document.getElementById('logOccurredAt'),

  // Timeline Elements
  timelineStreamContainer: document.getElementById('timelineStreamContainer'),
  timelineFilterChips: document.querySelectorAll('#timelineFilterChips .filter-chip')
};

// Notification Helper
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠️'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Load Data
async function loadData() {
  try {
    const [hierarchy, directions, areas] = await Promise.all([
      api.getHierarchy(!state.showArchived),
      api.getLifeDirections(),
      api.getAreas()
    ]);

    state.hierarchy = hierarchy;
    state.directions = directions;
    state.areas = areas;

    renderWorkspace();
    updateHeaderStats();
    populateAreaSelect();
    populateDirectionSelect();
    populateLogPrioritySelect();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Update Top Bar Stats
function updateHeaderStats() {
  let total = 0;
  let sparks = 0;
  let fires = 0;
  let cooks = 0;

  state.hierarchy.forEach(dir => {
    dir.areas.forEach(area => {
      area.priorities.forEach(p => {
        total++;
        if (p.current_phase === 'SPARK') sparks++;
        if (p.current_phase === 'FIRE') fires++;
        if (p.current_phase === 'COOK') cooks++;
      });
    });
  });

  elements.totalPrioritiesEl.textContent = total;
  elements.sparkCountEl.textContent = sparks;
  elements.fireCountEl.textContent = fires;
  elements.cookCountEl.textContent = cooks;
}

// Populate Modal Selectors
function populateAreaSelect() {
  const select = document.getElementById('priorityAreaSelect');
  if (!select) return;
  select.innerHTML = '<option value="">Select an Area...</option>';

  state.directions.forEach(dir => {
    const optGroup = document.createElement('optgroup');
    optGroup.label = dir.name;
    const dirAreas = state.areas.filter(a => a.life_direction_id === dir.id);
    dirAreas.forEach(area => {
      const opt = document.createElement('option');
      opt.value = area.id;
      opt.textContent = area.name;
      optGroup.appendChild(opt);
    });
    if (dirAreas.length > 0) {
      select.appendChild(optGroup);
    }
  });
}

function populateDirectionSelect() {
  const select = document.getElementById('areaDirectionSelect');
  if (!select) return;
  select.innerHTML = '<option value="">Select a Life Direction...</option>';

  state.directions.forEach(dir => {
    const opt = document.createElement('option');
    opt.value = dir.id;
    opt.textContent = dir.name;
    select.appendChild(opt);
  });
}

// Render Workspace
function renderWorkspace() {
  const container = elements.directionsContainer;
  container.innerHTML = '';

  if (!state.hierarchy || state.hierarchy.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </div>
        <h3 class="empty-title">Define Your Orbit</h3>
        <p class="empty-desc">Create your first Life Direction and Area to begin organizing your persistent long-term priorities.</p>
        <button class="btn btn-primary" id="btnEmptyCreateDirection">+ Create Life Direction</button>
      </div>
    `;
    document.getElementById('btnEmptyCreateDirection')?.addEventListener('click', () => openDirectionModal());
    return;
  }

  // Filter hierarchy
  state.hierarchy.forEach(dir => {
    const filteredAreas = dir.areas.map(area => {
      const filteredPriorities = area.priorities.filter(p => {
        // Phase filter
        if (state.selectedPhaseFilter !== 'ALL' && p.current_phase !== state.selectedPhaseFilter) {
          return false;
        }
        // Search filter
        if (state.searchQuery) {
          const q = state.searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchArea = area.name.toLowerCase().includes(q);
          const matchGoal = p.active_goal ? p.active_goal.title.toLowerCase().includes(q) : false;
          if (!matchName && !matchDesc && !matchArea && !matchGoal) return false;
        }
        return true;
      });

      return {
        ...area,
        priorities: filteredPriorities
      };
    });

    // Check if direction has any matching areas or if search is active
    const hasPriorities = filteredAreas.some(a => a.priorities.length > 0);
    if (state.searchQuery && !hasPriorities && !dir.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
      return;
    }

    const dirSection = document.createElement('div');
    dirSection.className = 'direction-section';
    dirSection.innerHTML = `
      <div class="direction-header">
        <div class="direction-title-wrap">
          <div>
            <h2 class="direction-title">${escapeHtml(dir.name)}</h2>
            ${dir.description ? `<p class="direction-desc">${escapeHtml(dir.description)}</p>` : ''}
          </div>
          <span class="direction-badge">${dir.areas.length} Areas</span>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-sm btn-create-area" data-dir-id="${dir.id}">+ Area</button>
          <button class="btn btn-ghost btn-sm btn-edit-dir" data-dir-id="${dir.id}" title="Edit Direction">✎</button>
          <button class="btn btn-ghost btn-sm btn-delete-dir" data-dir-id="${dir.id}" title="Delete Direction">🗑</button>
        </div>
      </div>
      <div class="areas-container">
        ${filteredAreas.length === 0 ? `
          <div style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">
            No areas yet in this life direction. Click "+ Area" to add one.
          </div>
        ` : filteredAreas.map(area => `
          <div class="area-block">
            <div class="area-header">
              <div class="area-title-wrap">
                <h3 class="area-title">${escapeHtml(area.name)}</h3>
                ${area.description ? `<span class="area-desc">${escapeHtml(area.description)}</span>` : ''}
              </div>
              <div class="header-actions">
                <button class="btn btn-primary btn-sm btn-create-priority" data-area-id="${area.id}">+ Priority</button>
                <button class="btn btn-ghost btn-sm btn-edit-area" data-area-id="${area.id}" title="Edit Area">✎</button>
                <button class="btn btn-ghost btn-sm btn-delete-area" data-area-id="${area.id}" title="Delete Area">🗑</button>
              </div>
            </div>
            ${area.priorities.length === 0 ? `
              <div style="color: var(--text-dim); font-size: 0.8rem; padding: 0.75rem; border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); text-align: center;">
                No active priorities in this area.
              </div>
            ` : `
              <div class="priorities-grid">
                ${area.priorities.map(p => renderPriorityCard(p)).join('')}
              </div>
            `}
          </div>
        `).join('')}
      </div>
    `;

    container.appendChild(dirSection);
  });

  attachWorkspaceListeners();
}

// Render Individual Priority Card
function renderPriorityCard(p) {
  const phaseLower = p.current_phase.toLowerCase();
  const goal = p.active_goal;

  return `
    <div class="priority-card ${phaseLower}-phase" data-id="${p.id}">
      <div class="priority-top">
        <div>
          <h4 class="priority-name">${escapeHtml(p.name)}</h4>
          ${p.description ? `<p class="priority-desc">${escapeHtml(p.description)}</p>` : ''}
        </div>
        <span class="phase-pill ${phaseLower}">
          ● ${p.current_phase}
        </span>
      </div>

      <!-- Active Sequential Milestone Box -->
      ${goal ? `
        <div class="priority-goal-box">
          <div class="priority-goal-header">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span class="goal-seq-tag">#${goal.sequence_number}</span>
              <span class="goal-type-badge ${goal.measurement_type.toLowerCase()}">${goal.measurement_type}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.25rem;">
              <button class="btn btn-ghost btn-sm btn-edit-goal" data-prio-id="${p.id}" data-goal-id="${goal.id}" title="Edit Milestone">✎</button>
              <button class="btn btn-ghost btn-sm btn-retire-goal" data-goal-id="${goal.id}" title="Retire Milestone">✕</button>
            </div>
          </div>

          <div class="goal-title-text">${escapeHtml(goal.title)}</div>

          ${goal.measurement_type === 'COUNT' ? `
            <div class="goal-progress-wrap">
              <div class="goal-progress-bar">
                <div class="goal-progress-fill" style="width: ${goal.progress_percent}%"></div>
              </div>
              <div class="goal-progress-meta">
                <span>${goal.current_value} / ${goal.target_value} ${escapeHtml(goal.unit || '')}</span>
                <span>${goal.progress_percent}%</span>
              </div>
              ${goal.target_date ? `
                <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">
                  Target: ${goal.target_date}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="goal-actions-row">
            ${goal.measurement_type === 'COUNT' ? `
              <button class="btn btn-secondary btn-sm btn-quick-progress" data-prio-id="${p.id}" data-goal-id="${goal.id}">
                + Progress
              </button>
            ` : '<span></span>'}

            <button class="btn btn-primary btn-sm btn-achieve-goal" data-prio-id="${p.id}" data-goal-id="${goal.id}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              ✓ Achieve
            </button>
          </div>
        </div>
      ` : `
        <div class="empty-goal-prompt">
          <span class="empty-goal-text">No active milestone in orbit</span>
          <button class="btn btn-secondary btn-sm btn-set-goal" data-prio-id="${p.id}">
            + Set Milestone
          </button>
        </div>
      `}

      <!-- Definitions Summary Chips -->
      <div class="definitions-summary" title="Click a definition to view full contract">
        <div class="def-chip spark-chip btn-inspect-def" data-id="${p.id}" data-type="spark">Spark</div>
        <div class="def-chip fire-chip btn-inspect-def" data-id="${p.id}" data-type="fire">Fire</div>
        <div class="def-chip cook-chip btn-inspect-def" data-id="${p.id}" data-type="cook">Cook</div>
        <div class="def-chip synthesis-chip btn-inspect-def" data-id="${p.id}" data-type="synthesis">Synthesis</div>
      </div>

      <!-- Card Footer -->
      <div class="priority-footer">
        <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
          <button class="btn btn-ghost btn-sm btn-card-quick-log" data-prio-id="${p.id}" data-goal-id="${p.active_goal?.id || ''}" title="Log progress event for this priority">
            ⚡ + Log
          </button>
          <button class="btn btn-ghost btn-sm btn-card-timeline" data-prio-id="${p.id}" data-prio-name="${escapeHtml(p.name)}" title="View chronological event timeline">
            📜 Timeline
          </button>
          <button class="btn btn-ghost btn-sm btn-view-milestones" data-prio-id="${p.id}" data-prio-name="${escapeHtml(p.name)}" title="View sequential milestone history">
            🏆 Milestones (${p.achieved_goals_count || 0})
          </button>
        </div>
        <div class="priority-actions">
          <button class="btn btn-ghost btn-sm btn-inspect" data-id="${p.id}" title="View Operating Definitions">Definitions</button>
          <button class="btn btn-ghost btn-sm btn-edit-priority" data-id="${p.id}" title="Edit Priority">✎</button>
          <button class="btn btn-ghost btn-sm btn-toggle-archive" data-id="${p.id}" title="${p.is_active ? 'Archive Priority' : 'Unarchive Priority'}">
            ${p.is_active ? '📦' : '↻'}
          </button>
          <button class="btn btn-ghost btn-sm btn-delete-priority" data-id="${p.id}" title="Delete Priority">🗑</button>
        </div>
      </div>
    </div>
  `;
}

// Attach Event Listeners to Dynamically Rendered Workspace Elements
function attachWorkspaceListeners() {
  // Create Area Button
  document.querySelectorAll('.btn-create-area').forEach(btn => {
    btn.addEventListener('click', () => openAreaModal(btn.dataset.dirId));
  });

  // Edit Direction Button
  document.querySelectorAll('.btn-edit-dir').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = state.directions.find(d => d.id === btn.dataset.dirId);
      if (dir) openDirectionModal(dir);
    });
  });

  // Delete Direction Button
  document.querySelectorAll('.btn-delete-dir').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this Life Direction? All child Areas and Priorities will also be deleted.')) {
        try {
          await api.deleteLifeDirection(btn.dataset.dirId);
          showToast('Life Direction deleted');
          await loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  // Create Priority Button
  document.querySelectorAll('.btn-create-priority').forEach(btn => {
    btn.addEventListener('click', () => openPriorityModal(null, btn.dataset.areaId));
  });

  // Edit Area Button
  document.querySelectorAll('.btn-edit-area').forEach(btn => {
    btn.addEventListener('click', () => {
      const area = state.areas.find(a => a.id === btn.dataset.areaId);
      if (area) openAreaModal(area.life_direction_id, area);
    });
  });

  // Delete Area Button
  document.querySelectorAll('.btn-delete-area').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this Area? All child Priorities will also be deleted.')) {
        try {
          await api.deleteArea(btn.dataset.areaId);
          showToast('Area deleted');
          await loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  // Inspect Definitions Button
  document.querySelectorAll('.btn-inspect, .btn-inspect-def').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const priority = await api.getPriority(btn.dataset.id);
        openInspectorModal(priority, btn.dataset.type);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Edit Priority Button
  document.querySelectorAll('.btn-edit-priority').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const priority = await api.getPriority(btn.dataset.id);
        openPriorityModal(priority);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Toggle Archive Button
  document.querySelectorAll('.btn-toggle-archive').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const p = await api.getPriority(btn.dataset.id);
        await api.updatePriority(p.id, { isActive: !p.is_active });
        showToast(p.is_active ? 'Priority archived' : 'Priority restored to orbit');
        await loadData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Delete Priority Button
  document.querySelectorAll('.btn-delete-priority').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Permanently delete this Priority?')) {
        try {
          await api.deletePriority(btn.dataset.id);
          showToast('Priority deleted');
          await loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  // --- Goal Action Listeners ---

  // Set Milestone Button
  document.querySelectorAll('.btn-set-goal').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const priority = await api.getPriority(btn.dataset.prioId);
        openGoalModal(priority);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Edit Goal Button
  document.querySelectorAll('.btn-edit-goal').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const [priority, goal] = await Promise.all([
          api.getPriority(btn.dataset.prioId),
          api.getGoal(btn.dataset.goalId)
        ]);
        openGoalModal(priority, goal);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Quick Progress Button
  document.querySelectorAll('.btn-quick-progress').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const [priority, goal] = await Promise.all([
          api.getPriority(btn.dataset.prioId),
          api.getGoal(btn.dataset.goalId)
        ]);
        openProgressModal(goal, priority.name);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Achieve Goal Button
  document.querySelectorAll('.btn-achieve-goal').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const [priority, goal] = await Promise.all([
          api.getPriority(btn.dataset.prioId),
          api.getGoal(btn.dataset.goalId)
        ]);
        openAchieveGoalModal(goal, priority.name);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Retire Goal Button
  document.querySelectorAll('.btn-retire-goal').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Retire this active milestone? You can configure a new sequential milestone.')) {
        try {
          await api.retireGoal(btn.dataset.goalId, { note: 'Retired by user' });
          showToast('Milestone retired');
          await loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  // View Milestone History Button
  document.querySelectorAll('.btn-view-milestones').forEach(btn => {
    btn.addEventListener('click', () => {
      openGoalHistoryModal(btn.dataset.prioId, btn.dataset.prioName);
    });
  });

  // Quick Log Button on Priority Card
  document.querySelectorAll('.btn-card-quick-log').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLogProgressModal(btn.dataset.prioId, btn.dataset.goalId || null);
    });
  });

  // Timeline Button on Priority Card
  document.querySelectorAll('.btn-card-timeline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPriorityTimelineModal(btn.dataset.prioId, btn.dataset.prioName);
    });
  });
}

// Modal Handlers
function openModal(modalEl) {
  modalEl.classList.add('open');
}

function closeModal(modalEl) {
  modalEl.classList.remove('open');
}

// Direction Modal
function openDirectionModal(direction = null) {
  const form = elements.directionForm;
  form.reset();
  document.getElementById('directionModalTitle').textContent = direction ? 'Edit Life Direction' : 'New Life Direction';
  document.getElementById('directionId').value = direction ? direction.id : '';
  document.getElementById('directionName').value = direction ? direction.name : '';
  document.getElementById('directionDesc').value = direction ? (direction.description || '') : '';
  document.getElementById('directionSortOrder').value = direction ? direction.sort_order : 0;
  openModal(elements.directionModal);
}

// Area Modal
function openAreaModal(directionId = null, area = null) {
  const form = elements.areaForm;
  form.reset();
  populateDirectionSelect();
  document.getElementById('areaModalTitle').textContent = area ? 'Edit Area' : 'New Area';
  document.getElementById('areaId').value = area ? area.id : '';
  document.getElementById('areaDirectionSelect').value = area ? area.life_direction_id : (directionId || '');
  document.getElementById('areaName').value = area ? area.name : '';
  document.getElementById('areaDesc').value = area ? (area.description || '') : '';
  document.getElementById('areaSortOrder').value = area ? area.sort_order : 0;
  openModal(elements.areaModal);
}

// Priority Modal
function openPriorityModal(priority = null, defaultAreaId = null) {
  const form = elements.priorityForm;
  form.reset();
  populateAreaSelect();

  state.editingPriorityId = priority ? priority.id : null;
  document.getElementById('priorityModalTitle').textContent = priority ? 'Edit Priority & Definitions' : 'New Priority Moon';

  if (priority) {
    document.getElementById('priorityAreaSelect').value = priority.area_id;
    document.getElementById('priorityName').value = priority.name;
    document.getElementById('priorityDesc').value = priority.description || '';
    document.getElementById('sparkDefinition').value = priority.spark_definition;
    document.getElementById('fireDefinition').value = priority.fire_definition;
    document.getElementById('cookDefinition').value = priority.cook_definition;
    document.getElementById('synthesisDefinition').value = priority.synthesis_definition;

    // Set phase radio
    const phaseRadio = form.querySelector(`input[name="currentPhase"][value="${priority.current_phase}"]`);
    if (phaseRadio) {
      phaseRadio.checked = true;
      updatePhaseRadioStyles();
    }
  } else {
    if (defaultAreaId) {
      document.getElementById('priorityAreaSelect').value = defaultAreaId;
    }
    const defaultRadio = form.querySelector('input[name="currentPhase"][value="SPARK"]');
    if (defaultRadio) {
      defaultRadio.checked = true;
      updatePhaseRadioStyles();
    }
  }

  openModal(elements.priorityModal);
}

function updatePhaseRadioStyles() {
  const labels = elements.priorityForm.querySelectorAll('.phase-radio-label');
  labels.forEach(lbl => {
    const radio = lbl.querySelector('input[type="radio"]');
    if (radio && radio.checked) {
      lbl.classList.add('selected');
    } else {
      lbl.classList.remove('selected');
    }
  });
}

// Inspector Modal
function openInspectorModal(priority, highlightType = null) {
  state.inspectingPriority = priority;
  document.getElementById('inspectorTitle').textContent = `${priority.name} - Operating Definitions`;
  document.getElementById('inspectorSubtitle').textContent = `${priority.life_direction_name} > ${priority.area_name} (Current: ${priority.current_phase})`;

  document.getElementById('inspectorSpark').textContent = priority.spark_definition;
  document.getElementById('inspectorFire').textContent = priority.fire_definition;
  document.getElementById('inspectorCook').textContent = priority.cook_definition;
  document.getElementById('inspectorSynthesis').textContent = priority.synthesis_definition;

  openModal(elements.inspectorModal);
}

// --- Goal Modal Controllers ---

function updateMeasurementTypeStyles() {
  const selectedType = elements.goalForm.querySelector('input[name="measurementType"]:checked')?.value || 'COUNT';
  elements.goalMeasurementLabels.forEach(lbl => {
    const radio = lbl.querySelector('input[type="radio"]');
    if (radio && radio.checked) {
      lbl.classList.add('selected');
    } else {
      lbl.classList.remove('selected');
    }
  });

  if (selectedType === 'COUNT') {
    elements.goalCountFields.style.display = 'flex';
    document.getElementById('goalUnit').required = true;
  } else {
    elements.goalCountFields.style.display = 'none';
    document.getElementById('goalUnit').required = false;
  }
}

function openGoalModal(priority, goal = null) {
  state.activeGoalModalPriority = priority;
  state.activeGoalModalGoal = goal;

  const form = elements.goalForm;
  form.reset();

  document.getElementById('goalPriorityId').value = priority.id;
  document.getElementById('goalPriorityContext').textContent = `${priority.name} (Phase: ${priority.current_phase})`;
  document.getElementById('goalModalTitle').textContent = goal ? 'Edit Sequential Milestone' : 'Set Sequential Milestone';
  document.getElementById('goalId').value = goal ? goal.id : '';

  if (goal) {
    document.getElementById('goalTitle').value = goal.title;
    document.getElementById('goalDesc').value = goal.description || '';

    const radio = form.querySelector(`input[name="measurementType"][value="${goal.measurement_type}"]`);
    if (radio) radio.checked = true;

    document.getElementById('goalStartValue').value = goal.start_value;
    document.getElementById('goalTargetValue').value = goal.target_value;
    document.getElementById('goalUnit').value = goal.unit || '';
    document.getElementById('goalTargetDate').value = goal.target_date || '';
  } else {
    const defaultRadio = form.querySelector('input[name="measurementType"][value="COUNT"]');
    if (defaultRadio) defaultRadio.checked = true;
    document.getElementById('goalStartValue').value = 0;
    document.getElementById('goalTargetValue').value = 10;
    document.getElementById('goalUnit').value = '';
    document.getElementById('goalTargetDate').value = '';
  }

  updateMeasurementTypeStyles();
  openModal(elements.goalModal);
}

function openAchieveGoalModal(goal, priorityName) {
  state.activeGoalModalGoal = goal;
  const form = elements.achieveGoalForm;
  form.reset();

  document.getElementById('achieveGoalId').value = goal.id;
  document.getElementById('achieveGoalContext').textContent = priorityName;
  document.getElementById('achieveGoalTitle').textContent = goal.title;

  // Set datetime-local default to now
  const now = new Date();
  const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  document.getElementById('achieveGoalDate').value = localIso;

  openModal(elements.achieveGoalModal);
}

function openProgressModal(goal, priorityName) {
  state.activeGoalModalGoal = goal;
  const form = elements.progressForm;
  form.reset();

  document.getElementById('progressGoalId').value = goal.id;
  document.getElementById('progressGoalContext').textContent = `${priorityName} > ${goal.title}`;
  document.getElementById('progressCurrentLabel').textContent = `Current: ${goal.current_value}`;
  document.getElementById('progressTargetLabel').textContent = `Target: ${goal.target_value} ${goal.unit || ''}`;
  document.getElementById('progressModalBar').style.width = `${goal.progress_percent}%`;
  document.getElementById('progressModalPercent').textContent = `${goal.progress_percent}%`;

  document.getElementById('progressInput').value = goal.current_value;
  document.getElementById('progressUnitLabel').textContent = goal.unit || '';

  openModal(elements.progressModal);
}

async function openGoalHistoryModal(priorityId, priorityName) {
  state.activeHistoryPriorityId = priorityId;
  state.activeHistoryPriorityName = priorityName;

  document.getElementById('historyPriorityContext').textContent = priorityName;
  const container = elements.goalHistoryContainer;
  container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">Loading milestone sequence...</div>';
  openModal(elements.goalHistoryModal);

  try {
    const goals = await api.getGoals(priorityId);
    if (!goals || goals.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-secondary); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎯</div>
          <div>No milestones recorded for this priority yet.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = goals.map(g => {
      const statusLower = g.status.toLowerCase();
      const achievedDateStr = g.achieved_at ? new Date(g.achieved_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
      const createdDateStr = new Date(g.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

      return `
        <div class="history-milestone-card ${statusLower}">
          <div class="history-card-top">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="goal-seq-tag">#${g.sequence_number}</span>
              <span class="goal-type-badge ${g.measurement_type.toLowerCase()}">${g.measurement_type}</span>
              <h4 class="history-title">${escapeHtml(g.title)}</h4>
            </div>
            <span class="history-status-badge ${statusLower}">${g.status}</span>
          </div>

          ${g.description ? `
            <div style="font-size: 0.825rem; color: var(--text-secondary);">${escapeHtml(g.description)}</div>
          ` : ''}

          <div class="history-meta-row">
            ${g.measurement_type === 'COUNT' ? `
              <span>Progress: ${g.current_value} / ${g.target_value} ${escapeHtml(g.unit || '')} (${g.progress_percent}%)</span>
            ` : ''}
            <span>Created: ${createdDateStr}</span>
            ${achievedDateStr ? `<span>Achieved: ${achievedDateStr}</span>` : ''}
          </div>

          ${g.achievement_note ? `
            <div class="history-note-box">
              "${escapeHtml(g.achievement_note)}"
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: #f43f5e; padding: 1rem 0;">Failed to load milestones: ${escapeHtml(err.message)}</div>`;
  }
}

// --- Log Progress & Timeline Modal Controllers ---

function updateEventTypeStyles() {
  const selectedType = elements.logProgressForm.querySelector('input[name="logEventType"]:checked')?.value || 'SPARK';
  elements.eventTypeCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    if (radio && radio.checked) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  // Adjust placeholder from metadata dictionary
  if (elements.logNoteInput) {
    const config = EVENT_TYPE_CONFIG[selectedType];
    elements.logNoteInput.placeholder = config?.placeholder || 'One-line note or learning...';
  }
}

function populateLogPrioritySelect(defaultPriorityId = null, defaultGoalId = null) {
  const select = elements.logPrioritySelect;
  if (!select) return;

  select.innerHTML = '<option value="">Select a Priority...</option>';

  // Direct single-pass traversal of pre-grouped hierarchy
  state.hierarchy.forEach(dir => {
    dir.areas.forEach(area => {
      if (area.priorities && area.priorities.length > 0) {
        const group = document.createElement('optgroup');
        group.label = `${dir.name} > ${area.name}`;
        area.priorities.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = `${p.name} (${p.current_phase})`;
          if (p.active_goal) {
            opt.dataset.hasActiveGoal = 'true';
            opt.dataset.activeGoalId = p.active_goal.id;
            opt.dataset.activeGoalTitle = p.active_goal.title;
          }
          group.appendChild(opt);
        });
        select.appendChild(group);
      }
    });
  });

  if (defaultPriorityId) {
    select.value = defaultPriorityId;
  }
  populateLogGoalSelect(defaultGoalId);
}

async function populateLogGoalSelect(defaultGoalId = null) {
  const goalSelect = elements.logGoalSelect;
  if (!goalSelect) return;

  const priorityId = elements.logPrioritySelect.value;
  if (!priorityId) {
    goalSelect.innerHTML = '<option value="">None / General Priority Level</option>';
    return;
  }

  goalSelect.innerHTML = '<option value="">Loading milestones...</option>';

  try {
    const goals = await api.getGoals(priorityId);
    goalSelect.innerHTML = '<option value="">None / General Priority Level</option>';

    if (goals && goals.length > 0) {
      goals.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        const statusIcon = g.status === 'ACHIEVED' ? '✓' : (g.status === 'ACTIVE' ? '🎯' : '•');
        opt.textContent = `${statusIcon} #${g.sequence_number}: ${g.title} (${g.status})`;
        if (defaultGoalId && g.id === defaultGoalId) {
          opt.selected = true;
        } else if (!defaultGoalId && g.status === 'ACTIVE') {
          opt.selected = true;
        }
        goalSelect.appendChild(opt);
      });
    }
  } catch (err) {
    goalSelect.innerHTML = '<option value="">None / General Priority Level</option>';
  }
}

function openLogProgressModal(defaultPriorityId = null, defaultGoalId = null) {
  const form = elements.logProgressForm;
  form.reset();

  // Pre-fill local current timestamp
  const now = new Date();
  const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  elements.logOccurredAtInput.value = localIso;

  // Set default event type to SPARK
  const sparkRadio = form.querySelector('input[name="logEventType"][value="SPARK"]');
  if (sparkRadio) sparkRadio.checked = true;
  updateEventTypeStyles();

  populateLogPrioritySelect(defaultPriorityId, defaultGoalId);
  openModal(elements.logProgressModal);

  // Auto focus note or priority select
  setTimeout(() => {
    if (defaultPriorityId) {
      elements.logNoteInput?.focus();
    } else {
      elements.logPrioritySelect?.focus();
    }
  }, 100);
}

function formatRelativeTime(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);

  if (diffSec < 45) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

async function openPriorityTimelineModal(priorityId, priorityName) {
  state.activeTimelinePriorityId = priorityId;
  state.activeTimelinePriorityName = priorityName;
  state.timelineFilter = 'ALL';

  document.getElementById('timelineModalTitle').textContent = `${priorityName}`;
  document.getElementById('timelineSubtitle').textContent = `Chronological immutable event ledger & audit trail`;

  // Reset filter chips
  elements.timelineFilterChips.forEach(c => {
    if (c.dataset.tlFilter === 'ALL') c.classList.add('active');
    else c.classList.remove('active');
  });

  openModal(elements.priorityTimelineModal);
  await refreshPriorityTimeline();
}

async function refreshPriorityTimeline() {
  if (!state.activeTimelinePriorityId) return;

  const container = elements.timelineStreamContainer;
  container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 1.5rem 0; text-align: center;">Loading chronological events...</div>';

  try {
    const data = await api.getPriorityTimeline(state.activeTimelinePriorityId, true);
    state.cachedTimelineEvents = data.events || [];

    // Update count pills
    const counts = data.counts || {};
    document.getElementById('tlTotalCount').textContent = counts.total || 0;
    document.getElementById('tlSparkCount').textContent = counts.spark || 0;
    document.getElementById('tlFireCount').textContent = counts.fire || 0;
    document.getElementById('tlCookCount').textContent = counts.cook_session || 0;
    document.getElementById('tlServeCount').textContent = counts.serve || 0;
    document.getElementById('tlGoalCount').textContent = counts.goal_achieved || 0;
    document.getElementById('tlVoidedCount').textContent = counts.voided || 0;

    renderTimelineStream();
  } catch (err) {
    container.innerHTML = `<div style="color: #f43f5e; padding: 1rem 0;">Failed to load timeline: ${escapeHtml(err.message)}</div>`;
  }
}

function renderTimelineStream() {
  const container = elements.timelineStreamContainer;
  if (!container) return;

  const filter = state.timelineFilter || 'ALL';
  const filteredEvents = state.cachedTimelineEvents.filter(e => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return e.status === 'ACTIVE';
    if (filter === 'VOIDED') return e.status === 'VOIDED';
    return e.event_type === filter && e.status === 'ACTIVE';
  });

  if (filteredEvents.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
        <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">📜</div>
        <div style="font-weight: 500;">No progress events match the current filter.</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Log meaningful progress to build this Priority's momentum narrative.</div>
        <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" id="btnTimelineEmptyLog">+ Log First Event</button>
      </div>
    `;
    document.getElementById('btnTimelineEmptyLog')?.addEventListener('click', () => {
      closeModal(elements.priorityTimelineModal);
      openLogProgressModal(state.activeTimelinePriorityId);
    });
    return;
  }

  container.innerHTML = filteredEvents.map(e => {
    const isVoided = e.status === 'VOIDED';
    const typeLower = e.event_type.toLowerCase();
    const exactDateStr = new Date(e.occurred_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const relativeTime = formatRelativeTime(e.occurred_at);

    const config = EVENT_TYPE_CONFIG[e.event_type] || { icon: '⚡', label: e.event_type.replace('_', ' ') };
    const typeEmoji = config.icon;
    const typeDisplay = config.label;

    return `
      <div class="timeline-item ${typeLower} ${isVoided ? 'voided' : ''}">
        <div class="timeline-node"></div>
        <div class="timeline-card ${isVoided ? 'voided' : ''}">
          <div class="timeline-card-header">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span class="timeline-badge ${typeLower}">${typeEmoji} ${typeDisplay}</span>
              ${isVoided ? `<span class="timeline-badge voided">🚫 VOIDED AUDIT RECORD</span>` : ''}
            </div>
            <span class="timeline-timestamp" title="${escapeHtml(e.occurred_at)}">${exactDateStr} (${relativeTime})</span>
          </div>

          ${e.note ? `
            <div class="timeline-note">${escapeHtml(e.note)}</div>
          ` : `
            <div class="timeline-note" style="color: var(--text-dim); font-style: italic;">No reflection note attached</div>
          `}

          <div class="timeline-footer">
            ${e.goal_title ? `
              <span class="timeline-goal-tag" title="Linked milestone">🎯 ${escapeHtml(e.goal_title)}</span>
            ` : `
              <span></span>
            `}

            ${!isVoided ? `
              <button class="btn-void-event" data-id="${e.id}" title="Void this entry (preserves immutable audit log)">
                🚫 Void Entry
              </button>
            ` : `
              <span style="font-size: 0.7rem; color: var(--text-dim);">Immutable Audit Record</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach Void Listeners
  container.querySelectorAll('.btn-void-event').forEach(btn => {
    btn.addEventListener('click', async () => {
      const eventId = btn.dataset.id;
      const confirmed = confirm('Void this progress event entry? This preserves the permanent audit record while immediately removing it from active momentum metrics.');
      if (!confirmed) return;

      const reason = prompt('Optional void reason (e.g., accidental duplicate, incorrect priority):');
      try {
        await api.voidEvent(eventId, reason);
        showToast('Event voided. Audit trail preserved.');
        await refreshPriorityTimeline();
        await loadData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

// Setup Global Event Listeners
function setupEvents() {
  // Modal Close buttons
  document.querySelectorAll('.modal-close, .btn-modal-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const backdrop = btn.closest('.modal-backdrop');
      if (backdrop) closeModal(backdrop);
    });
  });

  // Modal Backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  // Header Actions
  document.getElementById('btnNewPriority')?.addEventListener('click', () => openPriorityModal());
  document.getElementById('btnNewArea')?.addEventListener('click', () => openAreaModal());
  document.getElementById('btnNewDirection')?.addEventListener('click', () => openDirectionModal());

  // Phase Filter Chips
  elements.filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedPhaseFilter = chip.dataset.phase;
      renderWorkspace();
    });
  });

  // Search Input
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    renderWorkspace();
  });

  // Phase Radio change in priority form
  elements.priorityForm.querySelectorAll('input[name="currentPhase"]').forEach(radio => {
    radio.addEventListener('change', updatePhaseRadioStyles);
  });

  // Goal Measurement Type Radio change
  elements.goalForm.querySelectorAll('input[name="measurementType"]').forEach(radio => {
    radio.addEventListener('change', updateMeasurementTypeStyles);
  });

  // Quick Increment Buttons in Progress Modal
  document.querySelectorAll('.btn-quick-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const inc = Number(btn.dataset.inc);
      const input = document.getElementById('progressInput');
      const current = Number(input.value) || 0;
      input.value = current + inc;
    });
  });

  // History Modal: Set Next Milestone Button
  document.getElementById('btnHistoryNewGoal')?.addEventListener('click', async () => {
    if (state.activeHistoryPriorityId) {
      closeModal(elements.goalHistoryModal);
      try {
        const priority = await api.getPriority(state.activeHistoryPriorityId);
        openGoalModal(priority);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });

  // --- Form Submissions ---

  // 1. Direction Form
  elements.directionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('directionId').value;
    const name = document.getElementById('directionName').value.trim();
    const description = document.getElementById('directionDesc').value.trim();
    const sortOrder = parseInt(document.getElementById('directionSortOrder').value, 10) || 0;

    try {
      if (id) {
        await api.updateLifeDirection(id, { name, description, sortOrder });
        showToast('Life Direction updated');
      } else {
        await api.createLifeDirection({ name, description, sortOrder });
        showToast('Life Direction created');
      }
      closeModal(elements.directionModal);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 2. Area Form
  elements.areaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('areaId').value;
    const lifeDirectionId = document.getElementById('areaDirectionSelect').value;
    const name = document.getElementById('areaName').value.trim();
    const description = document.getElementById('areaDesc').value.trim();
    const sortOrder = parseInt(document.getElementById('areaSortOrder').value, 10) || 0;

    try {
      if (id) {
        await api.updateArea(id, { lifeDirectionId, name, description, sortOrder });
        showToast('Area updated');
      } else {
        await api.createArea({ lifeDirectionId, name, description, sortOrder });
        showToast('Area created');
      }
      closeModal(elements.areaModal);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 3. Priority Form
  elements.priorityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const areaId = document.getElementById('priorityAreaSelect').value;
    const name = document.getElementById('priorityName').value.trim();
    const description = document.getElementById('priorityDesc').value.trim();
    const currentPhase = elements.priorityForm.querySelector('input[name="currentPhase"]:checked')?.value || 'SPARK';
    const sparkDefinition = document.getElementById('sparkDefinition').value.trim();
    const fireDefinition = document.getElementById('fireDefinition').value.trim();
    const cookDefinition = document.getElementById('cookDefinition').value.trim();
    const synthesisDefinition = document.getElementById('synthesisDefinition').value.trim();

    if (!areaId) {
      showToast('Please select an Area', 'error');
      return;
    }
    if (!sparkDefinition || !fireDefinition || !cookDefinition || !synthesisDefinition) {
      showToast('All 4 operating definitions are required', 'error');
      return;
    }

    const payload = {
      areaId,
      name,
      description,
      currentPhase,
      sparkDefinition,
      fireDefinition,
      cookDefinition,
      synthesisDefinition
    };

    try {
      if (state.editingPriorityId) {
        await api.updatePriority(state.editingPriorityId, payload);
        showToast('Priority and definitions updated');
      } else {
        await api.createPriority(payload);
        showToast('Priority moon added to orbit');
      }
      closeModal(elements.priorityModal);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 4. Goal Form
  elements.goalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const priorityId = document.getElementById('goalPriorityId').value;
    const goalId = document.getElementById('goalId').value;
    const title = document.getElementById('goalTitle').value.trim();
    const description = document.getElementById('goalDesc').value.trim();
    const measurementType = elements.goalForm.querySelector('input[name="measurementType"]:checked')?.value || 'COUNT';
    const startValue = parseFloat(document.getElementById('goalStartValue').value) || 0;
    const targetValue = parseFloat(document.getElementById('goalTargetValue').value) || 1;
    const unit = document.getElementById('goalUnit').value.trim();
    const targetDate = document.getElementById('goalTargetDate').value || null;

    if (!title) {
      showToast('Milestone title is required', 'error');
      return;
    }

    if (measurementType === 'COUNT') {
      if (startValue >= targetValue) {
        showToast('Target value must be greater than start value', 'error');
        return;
      }
      if (!unit) {
        showToast('Measurement unit is required for count metrics', 'error');
        return;
      }
    }

    const payload = {
      title,
      description,
      measurementType,
      startValue,
      targetValue,
      unit,
      targetDate
    };

    try {
      if (goalId) {
        await api.updateGoal(goalId, payload);
        showToast('Milestone updated');
      } else {
        await api.createGoal(priorityId, payload);
        showToast('Sequential milestone attached to orbit');
      }
      closeModal(elements.goalModal);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 5. Achieve Goal Form
  elements.achieveGoalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goalId = document.getElementById('achieveGoalId').value;
    const note = document.getElementById('achieveGoalNote').value.trim();
    const dateVal = document.getElementById('achieveGoalDate').value;
    const achievedAt = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

    try {
      await api.achieveGoal(goalId, { note, achievedAt });
      showToast('Milestone Achieved! Recorded in historical event log.');
      closeModal(elements.achieveGoalModal);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // 6. Progress Quick Update Form
  elements.progressForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goalId = document.getElementById('progressGoalId').value;
    const currentValue = parseFloat(document.getElementById('progressInput').value);

    if (isNaN(currentValue)) {
      showToast('Please enter a valid numeric progress value', 'error');
      return;
    }

    try {
      await api.updateGoalProgress(goalId, currentValue);
      showToast('Progress updated');
      closeModal(elements.progressModal);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Inspector Edit button
  document.getElementById('btnInspectorEdit')?.addEventListener('click', () => {
    if (state.inspectingPriority) {
      closeModal(elements.inspectorModal);
      openPriorityModal(state.inspectingPriority);
    }
  });

  // --- Log Progress Listeners ---

  // Top header button
  elements.btnLogProgress?.addEventListener('click', () => openLogProgressModal());

  // Event Type Card selection in Log Modal
  elements.eventTypeCards.forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        updateEventTypeStyles();
      }
    });
  });

  // Target Priority change updates Goal selector
  elements.logPrioritySelect?.addEventListener('change', () => populateLogGoalSelect());

  // Submit Log Progress Form
  elements.logProgressForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventType = elements.logProgressForm.querySelector('input[name="logEventType"]:checked')?.value || 'SPARK';
    const priorityId = elements.logPrioritySelect.value;
    const goalId = elements.logGoalSelect.value || null;
    const note = elements.logNoteInput.value.trim() || null;
    const dateVal = elements.logOccurredAtInput.value;
    const occurredAt = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

    if (!priorityId) {
      showToast('Please select a Target Priority', 'error');
      return;
    }

    try {
      await api.logEvent({
        eventType,
        priorityId,
        goalId,
        note,
        occurredAt
      });

      showToast(`Progress logged: ${eventType.replace('_', ' ')} recorded!`);
      closeModal(elements.logProgressModal);

      // If priority timeline modal is open for this priority, refresh it
      if (state.activeTimelinePriorityId === priorityId) {
        await refreshPriorityTimeline();
      }

      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Timeline Quick Log Button
  document.getElementById('btnTimelineQuickLog')?.addEventListener('click', () => {
    const activePrioId = state.activeTimelinePriorityId;
    closeModal(elements.priorityTimelineModal);
    openLogProgressModal(activePrioId);
  });

  // Timeline Filter Chips
  elements.timelineFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.timelineFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.timelineFilter = chip.dataset.tlFilter;
      renderTimelineStream();
    });
  });

  // Timeline Summary Pill clicks also filter
  document.querySelectorAll('.timeline-summary-bar .summary-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;
      state.timelineFilter = filter;
      elements.timelineFilterChips.forEach(c => {
        if (c.dataset.tlFilter === filter) c.classList.add('active');
        else c.classList.remove('active');
      });
      renderTimelineStream();
    });
  });

  // Global Keyboard Shortcut: Press 'L' to quickly log progress
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = document.activeElement?.tagName;
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        e.preventDefault();
        openLogProgressModal();
      }
    }
  });
}

// Initial Boot
window.addEventListener('DOMContentLoaded', () => {
  setupEvents();
  loadData();
});
