import express from 'express';
import { EventService } from '../services/event-service.js';

export function createEventRouter(dbOrService) {
  const router = express.Router();
  const eventService = dbOrService instanceof EventService ? dbOrService : new EventService(dbOrService);

  router.get('/events', (req, res) => {
    try {
      const { priorityId, goalId, eventType, status, sort, limit, offset } = req.query;
      const items = eventService.list({
        userId: req.userId,
        priorityId,
        goalId,
        eventType,
        status,
        sort,
        limit,
        offset
      });
      res.json({ data: items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/events', (req, res) => {
    try {
      const { priorityId, goalId, eventType, occurredAt, note, status } = req.body;
      const created = eventService.create({
        userId: req.userId,
        priorityId,
        goalId,
        eventType,
        occurredAt,
        note,
        status
      });
      res.status(201).json({ data: created });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/events/:id', (req, res) => {
    try {
      const item = eventService.getById({ userId: req.userId, id: req.params.id });
      if (!item) {
        return res.status(404).json({ error: 'Progress event not found' });
      }
      res.json({ data: item });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/events/:id/void', (req, res) => {
    try {
      const { reason } = req.body || {};
      const voided = eventService.voidEvent({
        userId: req.userId,
        id: req.params.id,
        reason
      });
      if (!voided) {
        return res.status(404).json({ error: 'Progress event not found' });
      }
      res.json({ data: voided });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/priorities/:priorityId/events', (req, res) => {
    try {
      const { includeVoided, includeTransitions } = req.query;
      const timeline = eventService.getPriorityTimeline({
        userId: req.userId,
        priorityId: req.params.priorityId,
        includeVoided: includeVoided !== undefined ? includeVoided === 'true' || includeVoided === '1' : true,
        includeTransitions: includeTransitions !== undefined ? includeTransitions === 'true' || includeTransitions === '1' : false
      });
      res.json({ data: timeline });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}
