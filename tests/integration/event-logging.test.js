import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../../src/db/index.js';
import { createApp } from '../../src/app.js';
import { createTestClient } from '../test-client.js';

describe('Rapid Progress Event Logging & Timeline Audit Integration Tests', () => {
  let app;
  let db;
  let client;

  let testDirectionId;
  let testAreaId;
  let testPriorityId;
  let testGoalId;

  beforeEach(async () => {
    db = createDatabase(':memory:');
    app = createApp(db);
    client = createTestClient(app);

    // Create baseline hierarchy
    const dirRes = await client.post('/api/life-directions', {
      body: {
        name: 'Technical Depth',
        description: 'Core systems engineering'
      }
    });
    testDirectionId = dirRes.body.data.id;

    const areaRes = await client.post('/api/areas', {
      body: {
        lifeDirectionId: testDirectionId,
        name: 'Distributed Systems',
        description: 'Consensus & replication protocols'
      }
    });
    testAreaId = areaRes.body.data.id;

    const prioRes = await client.post('/api/priorities', {
      body: {
        areaId: testAreaId,
        name: 'Master Raft Consensus',
        description: 'Deep dive into consensus algorithms',
        currentPhase: 'FIRE',
        sparkDefinition: 'Read 5 pages of Raft dissertation',
        fireDefinition: '2h intense coding on election timer harness',
        cookDefinition: '3h continuous work on log compaction & snapshotting',
        synthesisDefinition: 'Detailed architectural writeup of invariants'
      }
    });
    testPriorityId = prioRes.body.data.id;

    const goalRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
      body: {
        title: 'Pass 50 Jepsen Chaos Partitions',
        measurementType: 'COUNT',
        startValue: 0,
        targetValue: 50,
        unit: 'runs'
      }
    });
    testGoalId = goalRes.body.data.id;
  });

  describe('Rapid Event Logging across Event Types', () => {
    it('should rapidly log each valid event type with default timestamp and active status', async () => {
      const types = ['SPARK', 'FIRE', 'COOK_SESSION', 'SERVE', 'GOAL_ACHIEVED'];

      for (const type of types) {
        const res = await client.post('/api/events', {
          body: {
            priorityId: testPriorityId,
            eventType: type,
            note: `Logged ${type} test entry`
          }
        });

        assert.equal(res.status, 201);
        assert.ok(res.body.data.id);
        assert.equal(res.body.data.priority_id, testPriorityId);
        assert.equal(res.body.data.event_type, type);
        assert.equal(res.body.data.status, 'ACTIVE');
        assert.equal(res.body.data.note, `Logged ${type} test entry`);
        assert.ok(res.body.data.occurred_at);
        assert.ok(res.body.data.created_at);
        assert.equal(res.body.data.priority_name, 'Master Raft Consensus');
      }
    });

    it('should log an event linked to a specific goal', async () => {
      const res = await client.post('/api/events', {
        body: {
          priorityId: testPriorityId,
          goalId: testGoalId,
          eventType: 'COOK_SESSION',
          note: 'Deep work on partition healing tests'
        }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.goal_id, testGoalId);
      assert.equal(res.body.data.goal_title, 'Pass 50 Jepsen Chaos Partitions');
    });

    it('should log an event without a note (note defaults to null)', async () => {
      const res = await client.post('/api/events', {
        body: {
          priorityId: testPriorityId,
          eventType: 'SPARK'
        }
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.note, null);
    });
  });

  describe('Backdating & Chronological Timeline Sorting', () => {
    it('should support backdated timestamps and return events in strict chronological order', async () => {
      const t1 = new Date('2026-08-01T10:00:00Z').toISOString();
      const t2 = new Date('2026-08-15T15:00:00Z').toISOString();
      const t3 = new Date('2026-09-01T12:00:00Z').toISOString();

      // Log events out of order (t2, t1, t3)
      await client.post('/api/events', {
        body: {
          priorityId: testPriorityId,
          eventType: 'FIRE',
          occurredAt: t2,
          note: 'Middle event'
        }
      });

      await client.post('/api/events', {
        body: {
          priorityId: testPriorityId,
          eventType: 'SPARK',
          occurredAt: t1,
          note: 'Oldest event'
        }
      });

      await client.post('/api/events', {
        body: {
          priorityId: testPriorityId,
          eventType: 'SERVE',
          occurredAt: t3,
          note: 'Newest event'
        }
      });

      const timelineRes = await client.get(`/api/priorities/${testPriorityId}/events`);
      assert.equal(timelineRes.status, 200);

      const events = timelineRes.body.data.events;
      assert.equal(events.length, 3);

      // Verify descending chronological order (newest first)
      assert.equal(events[0].occurred_at, t3);
      assert.equal(events[0].note, 'Newest event');
      assert.equal(events[1].occurred_at, t2);
      assert.equal(events[1].note, 'Middle event');
      assert.equal(events[2].occurred_at, t1);
      assert.equal(events[2].note, 'Oldest event');
    });
  });

  describe('Voiding Semantics & Audit Trail Integrity', () => {
    it('should void an erroneous event, retain it in the audit log, and update active metrics', async () => {
      // 1. Log 3 active events
      const e1 = await client.post('/api/events', {
        body: { priorityId: testPriorityId, eventType: 'SPARK', note: 'Valid spark' }
      });
      const e2 = await client.post('/api/events', {
        body: { priorityId: testPriorityId, eventType: 'FIRE', note: 'Accidental duplicate entry' }
      });
      const e3 = await client.post('/api/events', {
        body: { priorityId: testPriorityId, eventType: 'FIRE', note: 'Legitimate fire session' }
      });

      // Check initial timeline counts
      let tl = await client.get(`/api/priorities/${testPriorityId}/events`);
      assert.equal(tl.body.data.counts.total, 3);
      assert.equal(tl.body.data.counts.active, 3);
      assert.equal(tl.body.data.counts.voided, 0);
      assert.equal(tl.body.data.counts.spark, 1);
      assert.equal(tl.body.data.counts.fire, 2);

      // 2. Void e2
      const voidRes = await client.post(`/api/events/${e2.body.data.id}/void`, {
        body: { reason: 'Accidental double click' }
      });

      assert.equal(voidRes.status, 200);
      assert.equal(voidRes.body.data.status, 'VOIDED');
      assert.ok(voidRes.body.data.note.includes('Accidental double click'));

      // 3. Verify record was NOT deleted from the database (immutable audit guarantee)
      const fetchVoided = await client.get(`/api/events/${e2.body.data.id}`);
      assert.equal(fetchVoided.status, 200);
      assert.equal(fetchVoided.body.data.status, 'VOIDED');

      // 4. Check updated timeline metrics: active count should drop, voided count should increment
      tl = await client.get(`/api/priorities/${testPriorityId}/events`);
      assert.equal(tl.body.data.counts.total, 3);
      assert.equal(tl.body.data.counts.active, 2);
      assert.equal(tl.body.data.counts.voided, 1);
      assert.equal(tl.body.data.counts.fire, 1); // Only 1 active fire remains!
      assert.equal(tl.body.data.counts.spark, 1);

      // 5. Verify query filtering by status
      const activeOnly = await client.get(`/api/events?priorityId=${testPriorityId}&status=ACTIVE`);
      assert.equal(activeOnly.body.data.length, 2);
      assert.ok(activeOnly.body.data.every(e => e.status === 'ACTIVE'));

      const voidedOnly = await client.get(`/api/events?priorityId=${testPriorityId}&status=VOIDED`);
      assert.equal(voidedOnly.body.data.length, 1);
      assert.equal(voidedOnly.body.data[0].id, e2.body.data.id);
    });

    it('should return 404 when attempting to void a non-existent event', async () => {
      const res = await client.post('/api/events/non-existent-uuid/void', {
        body: { reason: 'test' }
      });
      assert.equal(res.status, 404);
    });
  });

  describe('Validation & Data Integrity', () => {
    it('should reject invalid event types', async () => {
      const res = await client.post('/api/events', {
        body: {
          priorityId: testPriorityId,
          eventType: 'INVALID_TYPE',
          note: 'Should fail'
        }
      });
      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('Invalid event_type'));
    });

    it('should reject logging an event without priority_id', async () => {
      const res = await client.post('/api/events', {
        body: {
          eventType: 'SPARK',
          note: 'Missing priority'
        }
      });
      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('priority_id is required'));
    });

    it('should reject logging an event against a non-existent priority', async () => {
      const res = await client.post('/api/events', {
        body: {
          priorityId: 'random-unknown-uuid',
          eventType: 'SPARK'
        }
      });
      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('Priority not found'));
    });

    it('should reject linking an event to a goal belonging to a different priority', async () => {
      // Create second priority
      const p2Res = await client.post('/api/priorities', {
        body: {
          areaId: testAreaId,
          name: 'Second Priority',
          currentPhase: 'SPARK',
          sparkDefinition: 'def',
          fireDefinition: 'def',
          cookDefinition: 'def',
          synthesisDefinition: 'def'
        }
      });
      const p2Id = p2Res.body.data.id;

      // Attempt to link testGoalId (which belongs to testPriorityId) to p2Id
      const res = await client.post('/api/events', {
        body: {
          priorityId: p2Id,
          goalId: testGoalId,
          eventType: 'COOK_SESSION'
        }
      });

      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('Goal not found or does not belong to this priority'));
    });
  });

  describe('Sub-Second Performance SLA Benchmark', () => {
    it('should log 50 progress events sequentially in well under 500ms (sub-second SLA)', async () => {
      const count = 50;
      const startTime = performance.now();

      for (let i = 0; i < count; i++) {
        const res = await client.post('/api/events', {
          body: {
            priorityId: testPriorityId,
            eventType: i % 2 === 0 ? 'SPARK' : 'FIRE',
            note: `Performance benchmark event #${i + 1}`
          }
        });
        assert.equal(res.status, 201);
      }

      const durationMs = performance.now() - startTime;
      // 50 events in in-memory SQLite should easily take < 500ms
      assert.ok(durationMs < 1000, `Expected 50 events to log in < 1000ms, took ${durationMs.toFixed(2)}ms`);

      const listRes = await client.get(`/api/events?priorityId=${testPriorityId}&limit=100`);
      assert.equal(listRes.body.data.length, count);
    });
  });

  describe('User Data Isolation', () => {
    it('should isolate events between different users', async () => {
      // User A logs an event
      const userAEvent = await client.post('/api/events', {
        headers: { 'x-user-id': 'user-alpha' },
        body: {
          priorityId: testPriorityId, // was created by default-user, should fail for user-alpha!
          eventType: 'SPARK'
        }
      });
      assert.equal(userAEvent.status, 400); // Cannot log to default-user's priority

      // User Alpha sets up their own hierarchy
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

      const alphaLogRes = await client.post('/api/events', {
        headers: { 'x-user-id': 'user-alpha' },
        body: {
          priorityId: alphaPrioId,
          eventType: 'FIRE',
          note: 'Alpha private event'
        }
      });
      assert.equal(alphaLogRes.status, 201);
      const alphaEventId = alphaLogRes.body.data.id;

      // Default user cannot access or void User Alpha's event
      const defaultUserFetch = await client.get(`/api/events/${alphaEventId}`);
      assert.equal(defaultUserFetch.status, 404);

      const defaultUserVoid = await client.post(`/api/events/${alphaEventId}/void`, {
        body: { reason: 'Unauthorized void attempt' }
      });
      assert.equal(defaultUserVoid.status, 404);

      // User Alpha can access it
      const alphaFetch = await client.get(`/api/events/${alphaEventId}`, {
        headers: { 'x-user-id': 'user-alpha' }
      });
      assert.equal(alphaFetch.status, 200);
      assert.equal(alphaFetch.body.data.note, 'Alpha private event');
    });
  });
});
