import { storage } from "./storage";
import { db } from "./db";
import { users, salons, services, queueEntries } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if data exists
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  // Create Customers
  const cust1 = await storage.createUser({
    name: "Rahul Kumar",
    phone: "9876543210",
    role: "customer",
    location: "Mumbai"
  });
  
  const cust2 = await storage.createUser({
    name: "Amit Singh",
    phone: "9876543211",
    role: "customer",
    location: "Delhi"
  });

  console.log("Customers created");

  // Create Barbers/Owners
  const barber1 = await storage.createUser({
    name: "Vikram Barber",
    phone: "1122334455",
    role: "barber"
  });

  const barber2 = await storage.createUser({
    name: "Suresh Salon",
    phone: "5544332211",
    role: "barber"
  });

  console.log("Barbers created");

  // Create Salons
  const salon1 = await storage.createSalon({
    ownerId: barber1.id,
    name: "Vikram's Hair Studio",
    location: "Andheri West, Mumbai",
    phone: "1122334455",
    isOpen: true,
    isOnBreak: false
  });

  const salon2 = await storage.createSalon({
    ownerId: barber2.id,
    name: "Suresh Men's Parlour",
    location: "Connaught Place, Delhi",
    phone: "5544332211",
    isOpen: true,
    isOnBreak: true // Testing break status
  });

  console.log("Salons created");

  // Create Services
  // Salon 1
  const s1_haircut = await storage.createService({
    salonId: salon1.id,
    name: "Hair Cut",
    durationMinutes: 30,
    price: 150
  });
  
  const s1_shave = await storage.createService({
    salonId: salon1.id,
    name: "Shaving",
    durationMinutes: 15,
    price: 80
  });

  const s1_combo = await storage.createService({
    salonId: salon1.id,
    name: "Hair Cut + Shaving",
    durationMinutes: 45,
    price: 200
  });

  // Salon 2
  await storage.createService({
    salonId: salon2.id,
    name: "Classic Hair Cut",
    durationMinutes: 40,
    price: 100
  });

  console.log("Services created");

  // Create Queue Entries (Mock Data)
  // Salon 1 Queue
  await storage.addToQueue({
    salonId: salon1.id,
    customerId: cust1.id,
    serviceId: s1_haircut.id,
    tokenNumber: 1,
    status: "waiting",
    estimatedWaitMinutes: 0
  });

  await storage.updateSalonStatus(salon1.id, { lastIssuedToken: 1 });

  console.log("Queue seeded");
  console.log("Seeding complete!");
}

seed().catch(console.error);
