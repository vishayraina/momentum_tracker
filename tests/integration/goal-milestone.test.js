import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../../src/db/index.js';
import { createApp } from '../../src/app.js';
import { createTestClient } from '../test-client.js';

describe('Sequential Goal Configuration & Milestone Lifecycle Integration Tests', () => {
  let app;
  let db;
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
      body: {
        name: 'Engineering Mastery',
        description: 'Becoming a world-class distributed systems engineer'
      }
    });
    testDirectionId = dirRes.body.data.id;

    const areaRes = await client.post('/api/areas', {
      body: {
        lifeDirectionId: testDirectionId,
        name: 'Distributed Systems',
        description: 'Consensus, replication, and storage engines'
      }
    });
    testAreaId = areaRes.body.data.id;

    const priorityRes = await client.post('/api/priorities', {
      body: {
        areaId: testAreaId,
        name: 'Master Raft Consensus',
        description: 'Understand and implement Raft leader election and log replication',
        currentPhase: 'FIRE',
        sparkDefinition: 'Read 5 pages of Raft paper',
        fireDefinition: 'Write 2 hours of consensus test harness',
        cookDefinition: 'Implement heartbeat and election timer state machine',
        synthesisDefinition: 'Write a comprehensive synthesis on split-vote edge cases'
      }
    });
    testPriorityId = priorityRes.body.data.id;
  });

  describe('Goal Creation across Measurement Types', () => {
    it('should create an active COUNT goal with start, target, unit, and target date', async () => {
      const res = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Pass Raft Jepsen Tests (50 iterations)',
          description: 'Run chaos network partitions against cluster',
          measurementType: 'COUNT',
          startValue: 0,
          currentValue: 5,
          targetValue: 50,
          unit: 'passed test runs',
          targetDate: '2026-10-15'
        }
      });

      assert.equal(res.status, 201);
      const goal = res.body.data;
      assert.ok(goal.id);
      assert.equal(goal.priority_id, testPriorityId);
      assert.equal(goal.title, 'Pass Raft Jepsen Tests (50 iterations)');
      assert.equal(goal.measurement_type, 'COUNT');
      assert.equal(goal.start_value, 0);
      assert.equal(goal.current_value, 5);
      assert.equal(goal.target_value, 50);
      assert.equal(goal.unit, 'passed test runs');
      assert.equal(goal.target_date, '2026-10-15');
      assert.equal(goal.status, 'ACTIVE');
      assert.equal(goal.sequence_number, 1);
      assert.equal(goal.progress_percent, 10); // (5-0)/(50-0)*100 = 10%

      // Verify Priority now references this active goal
      const pRes = await client.get(`/api/priorities/${testPriorityId}`);
      assert.equal(pRes.status, 200);
      assert.equal(pRes.body.data.current_goal_id, goal.id);
      assert.equal(pRes.body.data.active_goal.title, 'Pass Raft Jepsen Tests (50 iterations)');
      assert.equal(pRes.body.data.active_goal.progress_percent, 10);
    });

    it('should create a BOOLEAN milestone', async () => {
      const res = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Publish open-source Raft crate',
          measurementType: 'BOOLEAN'
        }
      });

      assert.equal(res.status, 201);
      const goal = res.body.data;
      assert.equal(goal.measurement_type, 'BOOLEAN');
      assert.equal(goal.start_value, 0);
      assert.equal(goal.target_value, 1);
      assert.equal(goal.current_value, 0);
      assert.equal(goal.progress_percent, 0);
    });

    it('should create QUALITATIVE and MAINTENANCE milestones', async () => {
      const qualRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Deep intuitive understanding of Raft membership changes',
          measurementType: 'QUALITATIVE'
        }
      });
      assert.equal(qualRes.status, 201);
      assert.equal(qualRes.body.data.measurement_type, 'QUALITATIVE');

      // Achieve it so we can test MAINTENANCE next
      await client.post(`/api/goals/${qualRes.body.data.id}/achieve`, {
        body: { note: 'Solid mental model formed' }
      });

      const maintRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Maintain daily Raft paper note revisions',
          measurementType: 'MAINTENANCE'
        }
      });
      assert.equal(maintRes.status, 201);
      assert.equal(maintRes.body.data.measurement_type, 'MAINTENANCE');
      assert.equal(maintRes.body.data.sequence_number, 2);
    });

    it('should reject invalid measurement types and missing required fields', async () => {
      // Missing title
      const resNoTitle = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: '',
          measurementType: 'COUNT',
          unit: 'pages'
        }
      });
      assert.equal(resNoTitle.status, 400);

      // Invalid measurement type
      const resBadType = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Invalid goal',
          measurementType: 'COMPLEX_SCORE'
        }
      });
      assert.equal(resBadType.status, 400);

      // COUNT goal with start >= target
      const resBadTarget = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Bad target',
          measurementType: 'COUNT',
          startValue: 10,
          targetValue: 5,
          unit: 'items'
        }
      });
      assert.equal(resBadTarget.status, 400);

      // COUNT goal with missing unit
      const resNoUnit = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Missing unit',
          measurementType: 'COUNT',
          startValue: 0,
          targetValue: 10
        }
      });
      assert.equal(resNoUnit.status, 400);
    });
  });

  describe('Single-Active-Goal Invariant Enforcement', () => {
    it('should strictly reject creating a second active goal on the same priority', async () => {
      // 1. Create first active goal
      const firstRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'First Milestone: Core State Machine',
          measurementType: 'BOOLEAN'
        }
      });
      assert.equal(firstRes.status, 201);

      // 2. Attempt to create a second active goal while first is active
      const secondRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Second Milestone: Log Compaction',
          measurementType: 'BOOLEAN'
        }
      });
      assert.equal(secondRes.status, 400);
      assert.match(secondRes.body.error, /already has an active goal/i);
    });
  });

  describe('Progress Updates & Goal Editing', () => {
    it('should update current progress value and recalculate progress percentage', async () => {
      const createRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Write 100 Unit Tests',
          measurementType: 'COUNT',
          startValue: 0,
          targetValue: 100,
          unit: 'unit tests'
        }
      });
      const goalId = createRes.body.data.id;

      // Update progress
      const patchRes = await client.patch(`/api/goals/${goalId}/progress`, {
        body: { currentValue: 45 }
      });
      assert.equal(patchRes.status, 200);
      assert.equal(patchRes.body.data.current_value, 45);
      assert.equal(patchRes.body.data.progress_percent, 45);

      // Verify in priority fetch
      const pRes = await client.get(`/api/priorities/${testPriorityId}`);
      assert.equal(pRes.body.data.active_goal.current_value, 45);
      assert.equal(pRes.body.data.active_goal.progress_percent, 45);
    });

    it('should update goal details for an active goal', async () => {
      const createRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Initial Goal Title',
          measurementType: 'COUNT',
          startValue: 0,
          targetValue: 10,
          unit: 'chapters'
        }
      });
      const goalId = createRes.body.data.id;

      const editRes = await client.patch(`/api/goals/${goalId}`, {
        body: {
          title: 'Updated Goal Title',
          targetValue: 20,
          targetDate: '2026-11-30'
        }
      });
      assert.equal(editRes.status, 200);
      assert.equal(editRes.body.data.title, 'Updated Goal Title');
      assert.equal(editRes.body.data.target_value, 20);
      assert.equal(editRes.body.data.target_date, '2026-11-30');
    });
  });

  describe('Milestone Achievement Lifecycle & Event Logging', () => {
    it('should mark milestone achieved, clear current_goal_id, and log GOAL_ACHIEVED progress event', async () => {
      const createRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Implement Snapshotting & Log Compaction',
          measurementType: 'COUNT',
          startValue: 0,
          targetValue: 10,
          unit: 'modules'
        }
      });
      const goalId = createRes.body.data.id;

      const achievedTimestamp = '2026-09-03T10:00:00.000Z';
      const achieveRes = await client.post(`/api/goals/${goalId}/achieve`, {
        body: {
          note: 'All snapshotting tests passed under network partition simulations!',
          achievedAt: achievedTimestamp
        }
      });

      assert.equal(achieveRes.status, 200);
      const achievedGoal = achieveRes.body.data;
      assert.equal(achievedGoal.status, 'ACHIEVED');
      assert.equal(achievedGoal.achieved_at, achievedTimestamp);
      assert.equal(achievedGoal.achievement_note, 'All snapshotting tests passed under network partition simulations!');
      assert.equal(achievedGoal.progress_percent, 100);

      // Verify Priority current_goal_id is cleared and achieved_goals_count is 1
      const pRes = await client.get(`/api/priorities/${testPriorityId}`);
      assert.equal(pRes.body.data.current_goal_id, null);
      assert.equal(pRes.body.data.active_goal, null);
      assert.equal(pRes.body.data.achieved_goals_count, 1);

      // Verify immutable event logged in progress_events table
      const events = db.prepare(`
        SELECT * FROM progress_events WHERE priority_id = ? AND event_type = 'GOAL_ACHIEVED'
      `).all(testPriorityId);
      assert.equal(events.length, 1);
      assert.equal(events[0].goal_id, goalId);
      assert.equal(events[0].occurred_at, achievedTimestamp);
      assert.match(events[0].note, /All snapshotting tests passed/);
    });

    it('should reject editing an achieved goal', async () => {
      const createRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Milestone to achieve',
          measurementType: 'BOOLEAN'
        }
      });
      const goalId = createRes.body.data.id;

      await client.post(`/api/goals/${goalId}/achieve`, { body: { note: 'Done' } });

      const patchRes = await client.patch(`/api/goals/${goalId}`, { body: { title: 'Modified' } });
      assert.equal(patchRes.status, 400);
      assert.match(patchRes.body.error, /cannot modify a goal that is already achieved/i);
    });
  });

  describe('Sequential Milestone Progression & History', () => {
    it('should allow creating the next sequential milestone with incremented sequence_number', async () => {
      // Milestone 1
      const m1Res = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Milestone 1: Protocol Basics',
          measurementType: 'BOOLEAN'
        }
      });
      const m1Id = m1Res.body.data.id;
      assert.equal(m1Res.body.data.sequence_number, 1);

      // Achieve Milestone 1
      await client.post(`/api/goals/${m1Id}/achieve`, {
        body: { note: 'Finished protocol basics' }
      });

      // Milestone 2
      const m2Res = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Milestone 2: Multi-Node Clustering',
          measurementType: 'COUNT',
          startValue: 0,
          targetValue: 5,
          unit: 'nodes'
        }
      });
      const m2Id = m2Res.body.data.id;
      assert.equal(m2Res.body.data.sequence_number, 2);
      assert.equal(m2Res.body.data.status, 'ACTIVE');

      // Achieve Milestone 2
      await client.post(`/api/goals/${m2Id}/achieve`, {
        body: { note: 'Clustering works' }
      });

      // Milestone 3
      const m3Res = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Milestone 3: Dynamic Membership Changes',
          measurementType: 'QUALITATIVE'
        }
      });
      assert.equal(m3Res.body.data.sequence_number, 3);
      assert.equal(m3Res.body.data.status, 'ACTIVE');

      // Fetch sequence history
      const historyRes = await client.get(`/api/priorities/${testPriorityId}/goals`);
      assert.equal(historyRes.status, 200);
      const history = historyRes.body.data;
      assert.equal(history.length, 3);
      assert.equal(history[0].sequence_number, 1);
      assert.equal(history[0].status, 'ACHIEVED');
      assert.equal(history[1].sequence_number, 2);
      assert.equal(history[1].status, 'ACHIEVED');
      assert.equal(history[2].sequence_number, 3);
      assert.equal(history[2].status, 'ACTIVE');
    });

    it('should support retiring an active goal without marking it achieved', async () => {
      const createRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Milestone to retire',
          measurementType: 'BOOLEAN'
        }
      });
      const goalId = createRes.body.data.id;

      const retireRes = await client.post(`/api/goals/${goalId}/retire`, {
        body: { note: 'Decided to pivot implementation strategy' }
      });
      assert.equal(retireRes.status, 200);
      assert.equal(retireRes.body.data.status, 'RETIRED');
      assert.equal(retireRes.body.data.achievement_note, 'Decided to pivot implementation strategy');

      // Priority current_goal_id is cleared
      const pRes = await client.get(`/api/priorities/${testPriorityId}`);
      assert.equal(pRes.body.data.current_goal_id, null);

      // Next goal can now be created
      const nextRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'New Strategy Milestone',
          measurementType: 'BOOLEAN'
        }
      });
      assert.equal(nextRes.status, 201);
      assert.equal(nextRes.body.data.sequence_number, 2);
    });
  });

  describe('User Data Isolation', () => {
    it('should isolate goals between different users', async () => {
      // User 1 creates goal on priority owned by default-user
      const u1GoalRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        headers: { 'x-user-id': 'user-1' },
        body: {
          title: 'User 1 Confidential Milestone',
          measurementType: 'BOOLEAN'
        }
      });
      // Since priority was created under 'default-user', creating under 'user-1' should fail
      assert.equal(u1GoalRes.status, 400);

      // Create goal under default-user
      const goalRes = await client.post(`/api/priorities/${testPriorityId}/goals`, {
        body: {
          title: 'Default User Milestone',
          measurementType: 'BOOLEAN'
        }
      });
      const goalId = goalRes.body.data.id;

      // Other user cannot view or mutate default-user's goal
      const getOtherRes = await client.get(`/api/goals/${goalId}`, {
        headers: { 'x-user-id': 'user-2' }
      });
      assert.equal(getOtherRes.status, 404);

      const achieveOtherRes = await client.post(`/api/goals/${goalId}/achieve`, {
        headers: { 'x-user-id': 'user-2' },
        body: { note: 'Hacked' }
      });
      assert.equal(achieveOtherRes.status, 404);
    });
  });
});
