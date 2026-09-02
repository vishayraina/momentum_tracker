import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../../src/db/index.js';
import { createApp } from '../../src/app.js';
import { createTestClient } from '../test-client.js';

describe('Project Foundation & Priority Definition Integration Tests', () => {
  let db;
  let app;
  let client;

  beforeEach(() => {
    // Isolated in-memory database for each test run
    db = createDatabase(':memory:');
    app = createApp(db);
    client = createTestClient(app);
  });

  describe('Life Directions', () => {
    it('should create and list life directions in order', async () => {
      const res1 = await client.post('/api/life-directions', {
        body: { name: 'Build Wealth', description: 'Financial sovereignty', sortOrder: 1 }
      });
      assert.equal(res1.status, 201);
      assert.equal(res1.body.data.name, 'Build Wealth');
      assert.equal(res1.body.data.sort_order, 1);

      const res2 = await client.post('/api/life-directions', {
        body: { name: 'Engineering Mastery', description: 'Deep technical craft', sortOrder: 0 }
      });
      assert.equal(res2.status, 201);

      const listRes = await client.get('/api/life-directions');
      assert.equal(listRes.status, 200);
      assert.equal(listRes.body.data.length, 2);
      // Sorted by sort_order: Engineering Mastery (0) should come before Build Wealth (1)
      assert.equal(listRes.body.data[0].name, 'Engineering Mastery');
      assert.equal(listRes.body.data[1].name, 'Build Wealth');
    });

    it('should reject creating life direction without name', async () => {
      const res = await client.post('/api/life-directions', {
        body: { name: '   ', description: 'No name' }
      });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /Life Direction name is required/i);
    });

    it('should update a life direction', async () => {
      const createRes = await client.post('/api/life-directions', {
        body: { name: 'Initial Name', description: 'Initial Desc' }
      });
      const id = createRes.body.data.id;

      const updateRes = await client.patch(`/api/life-directions/${id}`, {
        body: { name: 'Updated Name', description: 'Updated Desc', sortOrder: 5 }
      });
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.data.name, 'Updated Name');
      assert.equal(updateRes.body.data.description, 'Updated Desc');
      assert.equal(updateRes.body.data.sort_order, 5);
    });

    it('should reject updating life direction to an empty name', async () => {
      const createRes = await client.post('/api/life-directions', {
        body: { name: 'Valid Name' }
      });
      const id = createRes.body.data.id;

      const updateRes = await client.patch(`/api/life-directions/${id}`, {
        body: { name: '   ' }
      });
      assert.equal(updateRes.status, 400);
      assert.match(updateRes.body.error, /cannot be empty/i);
    });

    it('should delete a life direction', async () => {
      const createRes = await client.post('/api/life-directions', {
        body: { name: 'To Delete' }
      });
      const id = createRes.body.data.id;

      const delRes = await client.delete(`/api/life-directions/${id}`);
      assert.equal(delRes.status, 200);

      const getRes = await client.get(`/api/life-directions/${id}`);
      assert.equal(getRes.status, 404);
    });
  });

  describe('Areas', () => {
    let directionId;

    beforeEach(async () => {
      const dirRes = await client.post('/api/life-directions', {
        body: { name: 'Engineering Mastery' }
      });
      directionId = dirRes.body.data.id;
    });

    it('should create and list areas within a life direction', async () => {
      const res1 = await client.post('/api/areas', {
        body: {
          lifeDirectionId: directionId,
          name: 'Distributed Systems',
          description: 'Consensus & storage engines',
          sortOrder: 0
        }
      });
      assert.equal(res1.status, 201);
      assert.equal(res1.body.data.name, 'Distributed Systems');
      assert.equal(res1.body.data.life_direction_id, directionId);

      const listRes = await client.get(`/api/areas?lifeDirectionId=${directionId}`);
      assert.equal(listRes.status, 200);
      assert.equal(listRes.body.data.length, 1);
      assert.equal(listRes.body.data[0].name, 'Distributed Systems');
    });

    it('should reject creating area with non-existent life direction', async () => {
      const res = await client.post('/api/areas', {
        body: {
          lifeDirectionId: 'non-existent-id',
          name: 'Distributed Systems'
        }
      });
      assert.equal(res.status, 400);
    });

    it('should update an area and move it to another life direction', async () => {
      const dir2Res = await client.post('/api/life-directions', {
        body: { name: 'Direction 2' }
      });
      const dir2Id = dir2Res.body.data.id;

      const areaRes = await client.post('/api/areas', {
        body: { lifeDirectionId: directionId, name: 'Original Area' }
      });
      const areaId = areaRes.body.data.id;

      const updateRes = await client.patch(`/api/areas/${areaId}`, {
        body: { lifeDirectionId: dir2Id, name: 'Moved Area', sortOrder: 3 }
      });
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.data.name, 'Moved Area');
      assert.equal(updateRes.body.data.life_direction_id, dir2Id);
      assert.equal(updateRes.body.data.sort_order, 3);
    });

    it('should delete an area', async () => {
      const areaRes = await client.post('/api/areas', {
        body: { lifeDirectionId: directionId, name: 'Area To Delete' }
      });
      const areaId = areaRes.body.data.id;

      const delRes = await client.delete(`/api/areas/${areaId}`);
      assert.equal(delRes.status, 200);

      const checkRes = await client.get(`/api/areas/${areaId}`);
      assert.equal(checkRes.status, 404);
    });
  });

  describe('Priorities & Operating Definitions', () => {
    let directionId;
    let areaId;

    beforeEach(async () => {
      const dirRes = await client.post('/api/life-directions', {
        body: { name: 'Engineering Mastery' }
      });
      directionId = dirRes.body.data.id;

      const areaRes = await client.post('/api/areas', {
        body: { lifeDirectionId: directionId, name: 'Distributed Systems' }
      });
      areaId = areaRes.body.data.id;
    });

    it('should create priority with custom operating definitions and initial phase', async () => {
      const payload = {
        areaId,
        name: 'Build Raft Consensus Engine',
        description: 'Implementing consensus from scratch in Rust',
        currentPhase: 'COOK',
        sparkDefinition: 'Read 5 pages of Raft paper or review 1 test failure',
        fireDefinition: 'Write and debug a complete leader election cycle in 3+ hours',
        cookDefinition: 'Dedicated 2-hour structured deep work on log compaction or RPC pipeline',
        synthesisDefinition: 'Publish architectural note on raft invariant verification'
      };

      const res = await client.post('/api/priorities', { body: payload });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.name, 'Build Raft Consensus Engine');
      assert.equal(res.body.data.current_phase, 'COOK');
      assert.equal(res.body.data.spark_definition, payload.sparkDefinition);
      assert.equal(res.body.data.fire_definition, payload.fireDefinition);
      assert.equal(res.body.data.cook_definition, payload.cookDefinition);
      assert.equal(res.body.data.synthesis_definition, payload.synthesisDefinition);
      assert.equal(res.body.data.is_active, 1);
      assert.equal(res.body.data.area_name, 'Distributed Systems');
      assert.equal(res.body.data.life_direction_name, 'Engineering Mastery');
    });

    it('should reject invalid operating phase', async () => {
      const res = await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Invalid Phase Priority',
          currentPhase: 'SPRINTING', // Invalid phase
          sparkDefinition: 'Read 1 page',
          fireDefinition: 'Code 2 hrs',
          cookDefinition: 'Deep work',
          synthesisDefinition: 'Write note'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /Invalid phase/i);
    });

    it('should reject priority creation if any operating definition is missing', async () => {
      const res = await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Missing Definitions Priority',
          currentPhase: 'SPARK',
          sparkDefinition: 'Read 1 page',
          // fireDefinition missing
          cookDefinition: 'Deep work',
          synthesisDefinition: 'Write note'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /fire_definition is required/i);
    });

    it('should update operating definitions and details of priority', async () => {
      const createRes = await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Original Priority',
          currentPhase: 'SPARK',
          sparkDefinition: 'Initial spark',
          fireDefinition: 'Initial fire',
          cookDefinition: 'Initial cook',
          synthesisDefinition: 'Initial synthesis'
        }
      });

      const id = createRes.body.data.id;

      const updateRes = await client.patch(`/api/priorities/${id}`, {
        body: {
          name: 'Refined Priority Name',
          currentPhase: 'FIRE',
          sparkDefinition: 'Refined spark: 15 mins reviewing design',
          fireDefinition: 'Refined fire: 4 hours uninterrupted coding'
        }
      });

      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.data.name, 'Refined Priority Name');
      assert.equal(updateRes.body.data.current_phase, 'FIRE');
      assert.equal(updateRes.body.data.spark_definition, 'Refined spark: 15 mins reviewing design');
      assert.equal(updateRes.body.data.fire_definition, 'Refined fire: 4 hours uninterrupted coding');
      assert.equal(updateRes.body.data.cook_definition, 'Initial cook');
    });

    it('should filter priorities by phase', async () => {
      await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Spark Priority',
          currentPhase: 'SPARK',
          sparkDefinition: 's',
          fireDefinition: 'f',
          cookDefinition: 'c',
          synthesisDefinition: 'y'
        }
      });

      await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Fire Priority',
          currentPhase: 'FIRE',
          sparkDefinition: 's',
          fireDefinition: 'f',
          cookDefinition: 'c',
          synthesisDefinition: 'y'
        }
      });

      const sparkRes = await client.get('/api/priorities?phase=SPARK');
      assert.equal(sparkRes.status, 200);
      assert.equal(sparkRes.body.data.length, 1);
      assert.equal(sparkRes.body.data[0].name, 'Spark Priority');

      const fireRes = await client.get('/api/priorities?phase=FIRE');
      assert.equal(fireRes.status, 200);
      assert.equal(fireRes.body.data.length, 1);
      assert.equal(fireRes.body.data[0].name, 'Fire Priority');
    });

    it('should reject updating priority definition to an empty string', async () => {
      const createRes = await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Prio',
          currentPhase: 'SPARK',
          sparkDefinition: 'Valid spark',
          fireDefinition: 'Valid fire',
          cookDefinition: 'Valid cook',
          synthesisDefinition: 'Valid synth'
        }
      });
      const id = createRes.body.data.id;

      const updateRes = await client.patch(`/api/priorities/${id}`, {
        body: { sparkDefinition: '   ' }
      });
      assert.equal(updateRes.status, 400);
      assert.match(updateRes.body.error, /Operating definitions cannot be empty/i);
    });

    it('should support archiving (is_active = 0) and unarchiving', async () => {
      const createRes = await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Archivable Priority',
          currentPhase: 'SPARK',
          sparkDefinition: 'spark',
          fireDefinition: 'fire',
          cookDefinition: 'cook',
          synthesisDefinition: 'synth'
        }
      });

      const id = createRes.body.data.id;

      // Archive
      const archiveRes = await client.patch(`/api/priorities/${id}`, {
        body: { isActive: false }
      });
      assert.equal(archiveRes.status, 200);
      assert.equal(archiveRes.body.data.is_active, 0);

      // List active priorities should not include it
      const activeList = await client.get('/api/priorities?isActive=true');
      assert.equal(activeList.body.data.length, 0);

      // List inactive priorities should include it
      const inactiveList = await client.get('/api/priorities?isActive=false');
      assert.equal(inactiveList.body.data.length, 1);
      assert.equal(inactiveList.body.data[0].id, id);

      // Unarchive
      const unarchiveRes = await client.patch(`/api/priorities/${id}`, {
        body: { isActive: true }
      });
      assert.equal(unarchiveRes.status, 200);
      assert.equal(unarchiveRes.body.data.is_active, 1);
    });

    it('should return full grouped hierarchy', async () => {
      await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Active Priority 1',
          currentPhase: 'SPARK',
          sparkDefinition: 'spark 1',
          fireDefinition: 'fire 1',
          cookDefinition: 'cook 1',
          synthesisDefinition: 'synth 1'
        }
      });

      const hierarchyRes = await client.get('/api/priorities/hierarchy');
      assert.equal(hierarchyRes.status, 200);
      assert.equal(hierarchyRes.body.data.length, 1);
      assert.equal(hierarchyRes.body.data[0].name, 'Engineering Mastery');
      assert.equal(hierarchyRes.body.data[0].areas.length, 1);
      assert.equal(hierarchyRes.body.data[0].areas[0].name, 'Distributed Systems');
      assert.equal(hierarchyRes.body.data[0].areas[0].priorities.length, 1);
      assert.equal(hierarchyRes.body.data[0].areas[0].priorities[0].name, 'Active Priority 1');
    });

    it('should cascade delete priorities when parent life direction is deleted', async () => {
      const prioRes = await client.post('/api/priorities', {
        body: {
          areaId,
          name: 'Cascade Target Priority',
          currentPhase: 'SPARK',
          sparkDefinition: 'spark',
          fireDefinition: 'fire',
          cookDefinition: 'cook',
          synthesisDefinition: 'synth'
        }
      });
      const priorityId = prioRes.body.data.id;

      // Delete the life direction
      await client.delete(`/api/life-directions/${directionId}`);

      // Area and Priority should be deleted
      const areaCheck = await client.get(`/api/areas/${areaId}`);
      assert.equal(areaCheck.status, 404);

      const priorityCheck = await client.get(`/api/priorities/${priorityId}`);
      assert.equal(priorityCheck.status, 404);
    });

    it('should enforce user data isolation', async () => {
      // Create priority for user_a
      await client.post('/api/priorities', {
        headers: { 'x-user-id': 'user_a' },
        body: {
          areaId,
          name: 'User A Priority',
          currentPhase: 'SPARK',
          sparkDefinition: 'spark',
          fireDefinition: 'fire',
          cookDefinition: 'cook',
          synthesisDefinition: 'synth'
        }
      });

      // User B should see 0 priorities
      const userBList = await client.get('/api/priorities', {
        headers: { 'x-user-id': 'user_b' }
      });

      assert.equal(userBList.status, 200);
      assert.equal(userBList.body.data.length, 0);
    });
  });
});
