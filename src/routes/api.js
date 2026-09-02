import express from 'express';
import { LifeDirectionService } from '../services/life-direction-service.js';
import { AreaService } from '../services/area-service.js';
import { PriorityService } from '../services/priority-service.js';
import { GoalService } from '../services/goal-service.js';
import { createEventRouter } from './event-routes.js';

export function createApiRouter(db) {
  const router = express.Router();
  const lifeDirectionService = new LifeDirectionService(db);
  const areaService = new AreaService(db);
  const priorityService = new PriorityService(db);
  const goalService = new GoalService(db);

  // Middleware to attach userId (supports header or default)
  router.use((req, res, next) => {
    req.userId = req.headers['x-user-id'] || 'default-user';
    next();
  });

  // --- Life Directions ---

  router.get('/life-directions', (req, res) => {
    try {
      const items = lifeDirectionService.list({ userId: req.userId });
      res.json({ data: items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/life-directions', (req, res) => {
    try {
      const { name, description, sortOrder } = req.body;
      const created = lifeDirectionService.create({
        userId: req.userId,
        name,
        description,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0
      });
      res.status(201).json({ data: created });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/life-directions/:id', (req, res) => {
    try {
      const item = lifeDirectionService.getById({ userId: req.userId, id: req.params.id });
      if (!item) {
        return res.status(404).json({ error: 'Life direction not found' });
      }
      res.json({ data: item });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/life-directions/:id', (req, res) => {
    try {
      const { name, description, sortOrder } = req.body;
      const updated = lifeDirectionService.update({
        userId: req.userId,
        id: req.params.id,
        name,
        description,
        sortOrder
      });
      if (!updated) {
        return res.status(404).json({ error: 'Life direction not found' });
      }
      res.json({ data: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/life-directions/:id', (req, res) => {
    try {
      const deleted = lifeDirectionService.delete({ userId: req.userId, id: req.params.id });
      if (!deleted) {
        return res.status(404).json({ error: 'Life direction not found' });
      }
      res.json({ success: true, message: 'Life direction deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Areas ---

  router.get('/areas', (req, res) => {
    try {
      const { lifeDirectionId } = req.query;
      const items = areaService.list({ userId: req.userId, lifeDirectionId });
      res.json({ data: items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/areas', (req, res) => {
    try {
      const { lifeDirectionId, name, description, sortOrder } = req.body;
      const created = areaService.create({
        userId: req.userId,
        lifeDirectionId,
        name,
        description,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0
      });
      res.status(201).json({ data: created });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/areas/:id', (req, res) => {
    try {
      const item = areaService.getById({ userId: req.userId, id: req.params.id });
      if (!item) {
        return res.status(404).json({ error: 'Area not found' });
      }
      res.json({ data: item });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/areas/:id', (req, res) => {
    try {
      const { lifeDirectionId, name, description, sortOrder } = req.body;
      const updated = areaService.update({
        userId: req.userId,
        id: req.params.id,
        lifeDirectionId,
        name,
        description,
        sortOrder
      });
      if (!updated) {
        return res.status(404).json({ error: 'Area not found' });
      }
      res.json({ data: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/areas/:id', (req, res) => {
    try {
      const deleted = areaService.delete({ userId: req.userId, id: req.params.id });
      if (!deleted) {
        return res.status(404).json({ error: 'Area not found' });
      }
      res.json({ success: true, message: 'Area deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Priorities ---

  router.get('/priorities', (req, res) => {
    try {
      const { areaId, lifeDirectionId, phase, isActive } = req.query;
      const items = priorityService.list({
        userId: req.userId,
        areaId,
        lifeDirectionId,
        phase,
        isActive: isActive !== undefined ? isActive === 'true' || isActive === '1' : undefined
      });
      res.json({ data: items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/priorities/hierarchy', (req, res) => {
    try {
      const { isActive } = req.query;
      const hierarchy = priorityService.listGroupedHierarchy({
        userId: req.userId,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === '1' ? 1 : 0) : 1
      });
      res.json({ data: hierarchy });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/priorities', (req, res) => {
    try {
      const {
        areaId,
        name,
        description,
        currentPhase,
        sparkDefinition,
        fireDefinition,
        cookDefinition,
        synthesisDefinition,
        isActive
      } = req.body;

      const created = priorityService.create({
        userId: req.userId,
        areaId,
        name,
        description,
        currentPhase,
        sparkDefinition,
        fireDefinition,
        cookDefinition,
        synthesisDefinition,
        isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1
      });

      res.status(201).json({ data: created });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/priorities/:id', (req, res) => {
    try {
      const item = priorityService.getById({ userId: req.userId, id: req.params.id });
      if (!item) {
        return res.status(404).json({ error: 'Priority not found' });
      }
      res.json({ data: item });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/priorities/:id', (req, res) => {
    try {
      const {
        areaId,
        name,
        description,
        currentPhase,
        sparkDefinition,
        fireDefinition,
        cookDefinition,
        synthesisDefinition,
        isActive
      } = req.body;

      const updated = priorityService.update({
        userId: req.userId,
        id: req.params.id,
        areaId,
        name,
        description,
        currentPhase,
        sparkDefinition,
        fireDefinition,
        cookDefinition,
        synthesisDefinition,
        isActive
      });

      if (!updated) {
        return res.status(404).json({ error: 'Priority not found' });
      }

      res.json({ data: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/priorities/:id', (req, res) => {
    try {
      const deleted = priorityService.delete({ userId: req.userId, id: req.params.id });
      if (!deleted) {
        return res.status(404).json({ error: 'Priority not found' });
      }
      res.json({ success: true, message: 'Priority deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Goals & Milestones ---

  router.get('/priorities/:priorityId/goals', (req, res) => {
    try {
      const { status } = req.query;
      const items = goalService.listByPriorityId({
        userId: req.userId,
        priorityId: req.params.priorityId,
        status
      });
      res.json({ data: items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/priorities/:priorityId/goals/active', (req, res) => {
    try {
      const item = goalService.getActiveByPriorityId({
        userId: req.userId,
        priorityId: req.params.priorityId
      });
      res.json({ data: item });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/priorities/:priorityId/goals', (req, res) => {
    try {
      const {
        title,
        description,
        measurementType,
        unit,
        startValue,
        targetValue,
        currentValue,
        targetDate
      } = req.body;

      const created = goalService.create({
        userId: req.userId,
        priorityId: req.params.priorityId,
        title,
        description,
        measurementType,
        unit,
        startValue,
        targetValue,
        currentValue,
        targetDate
      });

      res.status(201).json({ data: created });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/goals/:id', (req, res) => {
    try {
      const item = goalService.getById({ userId: req.userId, id: req.params.id });
      if (!item) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json({ data: item });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/goals/:id', (req, res) => {
    try {
      const {
        title,
        description,
        unit,
        startValue,
        targetValue,
        currentValue,
        targetDate
      } = req.body;

      const updated = goalService.update({
        userId: req.userId,
        id: req.params.id,
        title,
        description,
        unit,
        startValue,
        targetValue,
        currentValue,
        targetDate
      });

      if (!updated) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({ data: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.patch('/goals/:id/progress', (req, res) => {
    try {
      const { currentValue } = req.body;
      const updated = goalService.updateProgress({
        userId: req.userId,
        id: req.params.id,
        currentValue
      });

      if (!updated) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({ data: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/goals/:id/achieve', (req, res) => {
    try {
      const { note, achievedAt } = req.body;
      const updated = goalService.achieve({
        userId: req.userId,
        id: req.params.id,
        note,
        achievedAt
      });

      if (!updated) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({ data: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/goals/:id/retire', (req, res) => {
    try {
      const { note } = req.body;
      const updated = goalService.retire({
        userId: req.userId,
        id: req.params.id,
        note
      });

      if (!updated) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({ data: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/goals/:id', (req, res) => {
    try {
      const deleted = goalService.delete({ userId: req.userId, id: req.params.id });
      if (!deleted) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json({ success: true, message: 'Goal deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Progress Events & Timeline Sub-Router ---
  router.use(createEventRouter(db));

  return router;
}
