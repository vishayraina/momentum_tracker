import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../../src/db/index.js';
import { createApp } from '../../src/app.js';
import { createTestClient } from '../test-client.js';

describe('Priority Phase Transitions & State History Integration Tests', () => {
  let db;
  let app;
  let client;

  let testDirectionId;
  let testAreaId;
  let testPriorityId;

  beforeEach(async () => {
    db = createDatabase(':memory:');
    app = createApp(db);
    client = createTestClient(app);

    // Create baseline hierarchy
    const dirRes = await client.post('/api/life-directions', {
      body: { name: 'Craft & Mastery', description: 'Deep knowledge and engineering craft' }
    });
    testDirectionId = dirRes.body.data.id;

    const areaRes = await client.post('/api/areas', {
      body: {
        lifeDirectionId: testDirectionId,
        name: 'Distributed Systems',
        description: 'Consensus algorithms and distributed storage'
      }
    });
    testAreaId = areaRes.body.data.id;

    const prioRes = await client.post('/api/priorities', {
      body: {
        areaId: testAreaId,
        name: 'Master Raft Consensus',
        description: 'Understand and build raft replication engine',
        currentPhase: 'SPARK',
        sparkDefinition: 'Read Raft paper section',
        fireDefinition: '2h coding on leader election loop',
        cookDefinition: '4h continuous implementation of log compaction',
        synthesisDefinition: 'Formal proof writeup of election safety invariants'
      }
    });
    testPriorityId = prioRes.body.data.id;
  });

  describe('Unrestricted Phase Transitions', () => {
    it('should transition between all phases without artificial state machine restrictions', async () => {
      // 1. SPARK -> FIRE
      const res1 = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'FIRE',
          note: 'Idea clarified, ramping up to rapid prototyping'
        }
      });
      assert.equal(res1.status, 201);
      assert.equal(res1.body.data.from_phase, 'SPARK');
      assert.equal(res1.body.data.to_phase, 'FIRE');
      assert.equal(res1.body.data.note, 'Idea clarified, ramping up to rapid prototyping');
      assert.ok(res1.body.data.timestamp);
      assert.equal(res1.body.priority.current_phase, 'FIRE');

      // Verify priority current phase updated
      const prioCheck1 = await client.get(`/api/priorities/${testPriorityId}`);
      assert.equal(prioCheck1.body.data.current_phase, 'FIRE');

      // 2. FIRE -> COOK
      const res2 = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'COOK',
          note: 'Architecture established, settling into deep sustained focus'
        }
      });
      assert.equal(res2.status, 201);
      assert.equal(res2.body.data.from_phase, 'FIRE');
      assert.equal(res2.body.data.to_phase, 'COOK');

      // 3. COOK -> SPARK (Unrestricted backward jump)
      const res3 = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'SPARK',
          note: 'Pivoting back to exploration of multi-raft architecture'
        }
      });
      assert.equal(res3.status, 201);
      assert.equal(res3.body.data.from_phase, 'COOK');
      assert.equal(res3.body.data.to_phase, 'SPARK');

      // 4. SPARK -> COOK (Direct skip of FIRE)
      const res4 = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'COOK',
          note: 'Direct immersion into deep cook session phase'
        }
      });
      assert.equal(res4.status, 201);
      assert.equal(res4.body.data.from_phase, 'SPARK');
      assert.equal(res4.body.data.to_phase, 'COOK');

      // 5. COOK -> FIRE
      const res5 = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'FIRE',
          note: 'Sprint to unblock network partition edge-case'
        }
      });
      assert.equal(res5.status, 201);
      assert.equal(res5.body.data.from_phase, 'COOK');
      assert.equal(res5.body.data.to_phase, 'FIRE');

      // 6. FIRE -> SPARK
      const res6 = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'SPARK',
          note: 'Resting and incubating new ideas'
        }
      });
      assert.equal(res6.status, 201);
      assert.equal(res6.body.data.from_phase, 'FIRE');
      assert.equal(res6.body.data.to_phase, 'SPARK');

      // Total 6 transitions recorded
      const historyRes = await client.get(`/api/priorities/${testPriorityId}/phase-transitions`);
      assert.equal(historyRes.status, 200);
      assert.equal(historyRes.body.data.length, 6);
    });

    it('should support optional reason note and custom timestamp', async () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days ago

      const res = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'COOK',
          timestamp: pastDate
          // note omitted
        }
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.note, null);
      assert.equal(res.body.data.timestamp, pastDate);
      assert.equal(res.body.data.from_phase, 'SPARK');
      assert.equal(res.body.data.to_phase, 'COOK');
    });

    it('should accept snake_case payload parameters (to_phase, occurredAt)', async () => {
      const res = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          to_phase: 'FIRE',
          occurredAt: new Date().toISOString(),
          note: 'Snake case test'
        }
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.to_phase, 'FIRE');
      assert.equal(res.body.data.note, 'Snake case test');
    });

    it('should reject transition with invalid phase name', async () => {
      const res = await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'FREEZE'
        }
      });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /invalid phase/i);
    });

    it('should reject transition on non-existent priority', async () => {
      const res = await client.post('/api/priorities/non-existent-uuid/phase-transitions', {
        body: {
          toPhase: 'FIRE'
        }
      });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /priority not found/i);
    });
  });

  describe('Phase Duration Metrics & Calculations', () => {
    it('should compute days in initial phase when no transitions exist', async () => {
      const res = await client.get(`/api/priorities/${testPriorityId}/phase-history`);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.current_phase, 'SPARK');
      assert.equal(res.body.data.days_in_current_phase, 0);
      assert.equal(res.body.data.current_phase_duration_text, 'Spark for 0 days');
      assert.equal(res.body.data.transitions_count, 0);
      assert.equal(res.body.data.history.length, 0);

      // Verify Priority card representation
      const prioRes = await client.get(`/api/priorities/${testPriorityId}`);
      assert.equal(prioRes.body.data.days_in_current_phase, 0);
      assert.equal(prioRes.body.data.current_phase_duration_text, 'Spark for 0 days');
    });

    it('should calculate accurate phase duration for long-running phases (e.g. Cook for 28 days)', async () => {
      const msPerDay = 1000 * 60 * 60 * 24;
      const baseTime = new Date('2026-08-01T00:00:00.000Z').getTime();

      // Priority transitioned to COOK on 2026-08-01
      await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'COOK',
          timestamp: new Date(baseTime).toISOString(),
          note: 'Commencing 4-week deep cook cycle'
        }
      });

      // Query metrics as of 28 days later (2026-08-29)
      const asOf28Days = new Date(baseTime + 28 * msPerDay).toISOString();
      const historyRes = await client.get(`/api/priorities/${testPriorityId}/phase-history?asOf=${asOf28Days}`);

      assert.equal(historyRes.status, 200);
      assert.equal(historyRes.body.data.current_phase, 'COOK');
      assert.equal(historyRes.body.data.days_in_current_phase, 28);
      assert.equal(historyRes.body.data.current_phase_duration_text, 'Cook for 28 days');
      assert.equal(historyRes.body.data.total_days_by_phase.COOK, 28);
    });

    it('should calculate historical duration spent in prior phases across sequential transitions', async () => {
      const msPerDay = 1000 * 60 * 60 * 24;
      const t0 = new Date('2026-08-01T00:00:00.000Z').getTime(); // Creation
      const t1 = t0 + 10 * msPerDay; // 10 days in SPARK -> transitions to FIRE
      const t2 = t1 + 15 * msPerDay; // 15 days in FIRE -> transitions to COOK
      const t3 = t2 + 20 * msPerDay; // Query as of 20 days into COOK

      // Transition 1: SPARK -> FIRE at t1
      await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'FIRE',
          timestamp: new Date(t1).toISOString(),
          note: '10 days of spark completed'
        }
      });

      // Transition 2: FIRE -> COOK at t2
      await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: {
          toPhase: 'COOK',
          timestamp: new Date(t2).toISOString(),
          note: '15 days of fire sprint completed'
        }
      });

      const historyRes = await client.get(`/api/priorities/${testPriorityId}/phase-history?asOf=${new Date(t3).toISOString()}`);
      assert.equal(historyRes.status, 200);

      const data = historyRes.body.data;
      assert.equal(data.current_phase, 'COOK');
      assert.equal(data.days_in_current_phase, 20);
      assert.equal(data.current_phase_duration_text, 'Cook for 20 days');

      // Check transition history records (reverse chronological: most recent first)
      assert.equal(data.history.length, 2);

      const recentTransition = data.history[0];
      assert.equal(recentTransition.from_phase, 'FIRE');
      assert.equal(recentTransition.to_phase, 'COOK');
      assert.equal(recentTransition.days_in_prior_phase, 15);
      assert.equal(recentTransition.prior_phase_duration_text, 'Fire for 15 days');

      const olderTransition = data.history[1];
      assert.equal(olderTransition.from_phase, 'SPARK');
      assert.equal(olderTransition.to_phase, 'FIRE');
      assert.equal(olderTransition.days_in_prior_phase, 0); // created_at was recent in test run, so delta to t1 or baseline
    });
  });

  describe('Independence from Goals & Progress Events', () => {
    it('should verify phase transitions do not mutate progress_events or goals', async () => {
      // 1. Create a goal
      const goalRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Implement Raft Log Compaction',
          measurementType: 'COUNT',
          startValue: 0,
          targetValue: 10,
          unit: 'benchmarks'
        }
      });
      const goalId = goalRes.body.data.id;

      // 2. Log a progress event
      const eventRes = await client.post('/api/events', {
        body: {
          priorityId: testPriorityId,
          goalId,
          eventType: 'COOK_SESSION',
          note: '3h deep session on snapshot installation'
        }
      });
      const eventId = eventRes.body.data.id;

      // 3. Perform phase transitions
      await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: { toPhase: 'FIRE', note: 'Switching to fire' }
      });
      await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: { toPhase: 'COOK', note: 'Back to cook' }
      });

      // 4. Verify progress events are completely intact
      const eventsCheck = await client.get(`/api/events?priorityId=${testPriorityId}`);
      assert.equal(eventsCheck.body.data.length, 1);
      assert.equal(eventsCheck.body.data[0].id, eventId);
      assert.equal(eventsCheck.body.data[0].event_type, 'COOK_SESSION');
      assert.equal(eventsCheck.body.data[0].status, 'ACTIVE');

      // 5. Verify goal is completely intact
      const goalCheck = await client.get(`/api/goals/${goalId}`);
      assert.equal(goalCheck.body.data.id, goalId);
      assert.equal(goalCheck.body.data.status, 'ACTIVE');
      assert.equal(goalCheck.body.data.current_value, 0);

      // 6. Achieve goal and verify phase transitions table remains intact
      await client.post(`/api/goals/${goalId}/achieve`, {
        body: { note: 'Goal achieved successfully' }
      });

      const ptCheck = await client.get(`/api/priorities/${testPriorityId}/phase-transitions`);
      assert.equal(ptCheck.body.data.length, 2);
    });
  });

  describe('User Data Isolation', () => {
    it('should strictly isolate phase transitions and history between different users', async () => {
      // User Alpha creates their own priority
      const alphaDir = await client.post('/api/life-directions', {
        headers: { 'x-user-id': 'user-alpha' },
        body: { name: 'Alpha Direction' }
      });
      const alphaArea = await client.post('/api/areas', {
        headers: { 'x-user-id': 'user-alpha' },
        body: { lifeDirectionId: alphaDir.body.data.id, name: 'Alpha Area' }
      });
      const alphaPrio = await client.post('/api/priorities', {
        headers: { 'x-user-id': 'user-alpha' },
        body: {
          areaId: alphaArea.body.data.id,
          name: 'Alpha Priority',
          currentPhase: 'SPARK',
          sparkDefinition: 'def',
          fireDefinition: 'def',
          cookDefinition: 'def',
          synthesisDefinition: 'def'
        }
      });
      const alphaPrioId = alphaPrio.body.data.id;

      // User Alpha transitions phase
      const alphaTransition = await client.post(`/api/priorities/${alphaPrioId}/phase-transitions`, {
        headers: { 'x-user-id': 'user-alpha' },
        body: { toPhase: 'FIRE', note: 'Alpha confidential transition' }
      });
      assert.equal(alphaTransition.status, 201);

      // Default user cannot transition User Alpha's priority
      const unauthorizedPost = await client.post(`/api/priorities/${alphaPrioId}/phase-transitions`, {
        body: { toPhase: 'COOK' }
      });
      assert.equal(unauthorizedPost.status, 400);

      // Default user cannot view User Alpha's phase transitions or history
      const unauthorizedList = await client.get(`/api/priorities/${alphaPrioId}/phase-transitions`);
      assert.equal(unauthorizedList.status, 404);

      const unauthorizedHistory = await client.get(`/api/priorities/${alphaPrioId}/phase-history`);
      assert.equal(unauthorizedHistory.status, 404);

      // User Alpha can access their own history
      const alphaHistory = await client.get(`/api/priorities/${alphaPrioId}/phase-history`, {
        headers: { 'x-user-id': 'user-alpha' }
      });
      assert.equal(alphaHistory.status, 200);
      assert.equal(alphaHistory.body.data.history.length, 1);
      assert.equal(alphaHistory.body.data.history[0].note, 'Alpha confidential transition');
    });
  });

  describe('State Timeline Queries', () => {
    it('should query state timeline and include phase transitions when requested', async () => {
      // Log an event and create two phase transitions
      await client.post('/api/events', {
        body: {
          priorityId: testPriorityId,
          eventType: 'SPARK',
          note: 'First spark event'
        }
      });

      await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: { toPhase: 'FIRE', note: 'Moving into Fire mode' }
      });

      await client.post(`/api/priorities/${testPriorityId}/phase-transitions`, {
        body: { toPhase: 'COOK', note: 'Entering Cook cycle' }
      });

      // Default timeline: progress events
      const defaultTimeline = await client.get(`/api/priorities/${testPriorityId}/events`);
      assert.equal(defaultTimeline.status, 200);
      assert.equal(defaultTimeline.body.data.events.length, 1);
      assert.equal(defaultTimeline.body.data.phase_transitions, undefined);

      // Unified timeline: includes phase transitions
      const unifiedTimeline = await client.get(`/api/priorities/${testPriorityId}/events?includeTransitions=true`);
      assert.equal(unifiedTimeline.status, 200);
      assert.equal(unifiedTimeline.body.data.events.length, 1);
      assert.equal(unifiedTimeline.body.data.phase_transitions.length, 2);
      assert.equal(unifiedTimeline.body.data.phase_transitions[0].to_phase, 'COOK');
      assert.equal(unifiedTimeline.body.data.phase_transitions[1].to_phase, 'FIRE');
    });
  });
});

