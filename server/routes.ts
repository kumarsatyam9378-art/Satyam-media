import type { Express } from "express";
import { createServer, type Server } from "http";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { users } from "@shared/schema";
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api
  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
  // === AUTH ===
  app.post(api.auth.login.path, async (req, res) => {
    // Simple mock auth
    const { phone, otp } = req.body;
    if (otp !== "1234") {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    const user = await storage.getUserByPhone(phone);
    if (!user) {
      return res.status(401).json({ message: "User not found. Please register." });
    }
    // In a real app, we'd set a session here. For now, we return the user and client stores it.
    res.json(user);
  });
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // === SALONS ===
  app.post(api.salons.create.path, async (req, res) => {
    try {
      const input = api.salons.create.input.parse(req.body);
      const salon = await storage.createSalon(input);
      res.status(201).json(salon);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app.get(api.salons.getMySalon.path, async (req, res) => {
    // Requires ownerId in query or header in a real app, simulating with query param 'userId' for MVP simplicity
    // But since the API definition doesn't have it, we'll assume the frontend passes it or we mocked session.
    // For this MVP, let's pass userId as a query param to identifying the owner for this specific route.
    // Wait, standard practice is session. Let's assume the client passes X-User-Id header.
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const salon = await storage.getSalonByOwner(userId);
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    res.json(salon);
  });
  app.get(api.salons.search.path, async (req, res) => {
    const query = req.query.query as string | undefined;
    const salons = await storage.searchSalons(query);
    res.json(salons);
  });
  app.get(api.salons.get.path, async (req, res) => {
    const salonId = Number(req.params.id);
    const salon = await storage.getSalon(salonId);
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    const services = await storage.getSalonServices(salonId);
    res.json({ ...salon, services });
  });
  app.patch(api.salons.updateStatus.path, async (req, res) => {
    const salonId = Number(req.params.id);
    const { action, ...updates } = req.body;
    
    let finalUpdates = { ...updates };
    
    // Handle convenience actions
    if (action === 'open') {
      finalUpdates = { isOpen: true, isOnBreak: false };
      // Check if we need to reset token if it's a new day? 
      // Simplified: We assume daily reset happens via a separate check or manually.
      // But let's check date.
      const salon = await storage.getSalon(salonId);
      if (salon) {
        const today = new Date().toISOString().split('T')[0];
        if (salon.lastTokenReset !== today) {
           await storage.resetSalonTokens(salonId);
        }
      }
    } else if (action === 'close') {
      finalUpdates = { isOpen: false, isOnBreak: false };
    } else if (action === 'break_start') {
      finalUpdates = { isOnBreak: true, breakStartTime: new Date() };
    } else if (action === 'break_end') {
      finalUpdates = { isOnBreak: false, breakStartTime: null };
    }
    const updated = await storage.updateSalonStatus(salonId, finalUpdates);
    res.json(updated);
  });
  app.get(api.salons.getQueueStatus.path, async (req, res) => {
    const salonId = Number(req.params.id);
    const salon = await storage.getSalon(salonId);
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    
    const queue = await storage.getSalonQueue(salonId);
    
    // Calculate total wait time
    let totalWaitTime = 0;
    queue.forEach(item => {
      totalWaitTime += item.service.durationMinutes;
    });
    res.json({
      currentToken: salon.currentToken || 0,
      lastIssuedToken: salon.lastIssuedToken || 0,
      queueLength: queue.length,
      totalWaitTimeMinutes: totalWaitTime
    });
  });
  // === SERVICES ===
  app.post(api.services.create.path, async (req, res) => {
    const salonId = Number(req.params.salonId);
    const input = api.services.create.input.parse({ ...req.body, salonId }); // Manually inject salonId from param if needed or body
    // Actually the schema for input omits salonId, so we need to add it back for storage call
    // But route def says input is omit salonId.
    // So we reconstruct.
    const service = await storage.createService({ ...input, salonId });
    res.status(201).json(service);
  });
  app.get(api.services.list.path, async (req, res) => {
    const salonId = Number(req.params.salonId);
    const services = await storage.getSalonServices(salonId);
    res.json(services);
  });
  // === QUEUE ===
  app.post(api.queue.join.path, async (req, res) => {
    const { salonId, serviceId, customerId } = req.body;
    
    const salon = await storage.getSalon(salonId);
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    if (!salon.isOpen) return res.status(400).json({ message: "Salon is closed" });
    // Check if user already in queue? Simplified: allow multiple for now.
    // Assign token
    const newTokenNumber = (salon.lastIssuedToken || 0) + 1;
    
    // Calculate estimated wait time
    const currentQueue = await storage.getSalonQueue(salonId);
    let waitTime = 0;
    currentQueue.forEach(q => waitTime += q.service.durationMinutes);
    
    // If salon is on break, add break buffer? (Simplification: ignore break duration for calculation for now, just service time)
    const entry = await storage.addToQueue({
      salonId,
      serviceId,
      customerId,
      tokenNumber: newTokenNumber,
      estimatedWaitMinutes: waitTime,
      status: "waiting",
      // created_at is default
    });
    // Update salon last token
    await storage.updateSalonStatus(salonId, { lastIssuedToken: newTokenNumber });
    res.status(201).json({ ...entry, position: currentQueue.length + 1, estimatedWaitMinutes: waitTime });
  });
  app.get(api.queue.list.path, async (req, res) => {
    const salonId = Number(req.params.salonId);
    const queue = await storage.getSalonQueue(salonId);
    res.json(queue);
  });
  app.get(api.queue.myQueue.path, async (req, res) => {
     const userId = Number(req.headers['x-user-id']);
     if (!userId) return res.status(401).json({ message: "Unauthorized" });
     
     const entries = await storage.getCustomerActiveQueueEntries(userId);
     
     // Enhance with dynamic calculation
     const enhancedEntries = await Promise.all(entries.map(async (entry) => {
       // Get fresh queue state for this salon
       const salonQueue = await storage.getSalonQueue(entry.salonId);
       // Find position
       const position = salonQueue.findIndex(q => q.id === entry.id) + 1; // 1-based
       
       // Calculate wait time: sum of all people BEFORE this entry
       let waitTime = 0;
       for (const q of salonQueue) {
         if (q.id === entry.id) break;
         waitTime += q.service.durationMinutes;
       }
       
       return {
         ...entry,
         position,
         estimatedWaitMinutes: waitTime
       };
     }));
     res.json(enhancedEntries);
  });
  app.post(api.queue.next.path, async (req, res) => {
    const salonId = Number(req.params.salonId);
    const salon = await storage.getSalon(salonId);
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    // Find current waiting token with lowest number
    const nextItem = await storage.getNextInQueue(salonId);
    
    if (nextItem) {
      // Mark as completed (or should we mark the PREVIOUS one as completed? 
      // "Next Customer" usually means: Finish current, start next.
      // So we should find the one "in_progress" (if we had that state) and finish it.
      // For MVP "Next" -> Marks the *current active* token as done (if any), and implicitly starts the next?
      // Simplified: We just remove the top of the queue (mark completed).
      await storage.updateQueueStatus(nextItem.id, "completed");
      
      // Update salon current token
      await storage.updateSalonStatus(salonId, { currentToken: nextItem.tokenNumber });
      
      // Get the NEW next token to return
      const newNext = await storage.getNextInQueue(salonId);
      
      res.json({ message: "Queue advanced", nextToken: newNext?.tokenNumber || null });
    } else {
      res.json({ message: "Queue is empty", nextToken: null });
    }
  });
  app.patch(api.queue.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const updated = await storage.updateQueueStatus(id, status);
    res.json(updated);
  });
  // === SUBSCRIPTIONS ===
  app.post(api.subscriptions.subscribe.path, async (req, res) => {
    const input = api.subscriptions.subscribe.input.parse(req.body);
    // Mock subscription logic: just create it
    const sub = await storage.createSubscription({
      userId: input.userId,
      type: input.type,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days mock
    });
    res.status(201).json(sub);
  });
  return httpServer;
}
