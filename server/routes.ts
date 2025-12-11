import { Router } from "express";
import { db } from "./db.js";
import { 
  clients, projects, teamMembers, projectAssignments, 
  timeEntries, invoices, invoiceLineItems 
} from "../shared/schema.js";
import { eq, and, gte, lte, desc } from "drizzle-orm";

const router = Router();

router.get("/clients", async (req, res) => {
  try {
    const result = await db.select().from(clients).orderBy(desc(clients.createdAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

router.get("/clients/:id", async (req, res) => {
  try {
    const [client] = await db.select().from(clients).where(eq(clients.id, parseInt(req.params.id)));
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

router.post("/clients", async (req, res) => {
  try {
    const [client] = await db.insert(clients).values(req.body).returning();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to create client" });
  }
});

router.put("/clients/:id", async (req, res) => {
  try {
    const [client] = await db.update(clients)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(clients.id, parseInt(req.params.id)))
      .returning();
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to update client" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    await db.delete(clients).where(eq(clients.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete client" });
  }
});

router.get("/team-members", async (req, res) => {
  try {
    const result = await db.select().from(teamMembers).orderBy(desc(teamMembers.createdAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

router.get("/team-members/:id", async (req, res) => {
  try {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, parseInt(req.params.id)));
    if (!member) return res.status(404).json({ error: "Team member not found" });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team member" });
  }
});

router.post("/team-members", async (req, res) => {
  try {
    const [member] = await db.insert(teamMembers).values(req.body).returning();
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to create team member" });
  }
});

router.put("/team-members/:id", async (req, res) => {
  try {
    const [member] = await db.update(teamMembers)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(teamMembers.id, parseInt(req.params.id)))
      .returning();
    if (!member) return res.status(404).json({ error: "Team member not found" });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to update team member" });
  }
});

router.delete("/team-members/:id", async (req, res) => {
  try {
    await db.delete(teamMembers).where(eq(teamMembers.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const result = await db.query.projects.findMany({
      with: { client: true, projectAssignments: { with: { teamMember: true } } },
      orderBy: [desc(projects.createdAt)],
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, parseInt(req.params.id)),
      with: { client: true, projectAssignments: { with: { teamMember: true } } },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const { teamMemberIds, ...projectData } = req.body;
    const [project] = await db.insert(projects).values(projectData).returning();
    
    if (teamMemberIds && teamMemberIds.length > 0) {
      await db.insert(projectAssignments).values(
        teamMemberIds.map((memberId: number) => ({
          projectId: project.id,
          teamMemberId: memberId,
        }))
      );
    }
    
    const fullProject = await db.query.projects.findFirst({
      where: eq(projects.id, project.id),
      with: { client: true, projectAssignments: { with: { teamMember: true } } },
    });
    res.status(201).json(fullProject);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/projects/:id", async (req, res) => {
  try {
    const { teamMemberIds, ...projectData } = req.body;
    const projectId = parseInt(req.params.id);
    
    const [project] = await db.update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();
    
    if (!project) return res.status(404).json({ error: "Project not found" });
    
    if (teamMemberIds !== undefined) {
      await db.delete(projectAssignments).where(eq(projectAssignments.projectId, projectId));
      if (teamMemberIds.length > 0) {
        await db.insert(projectAssignments).values(
          teamMemberIds.map((memberId: number) => ({
            projectId: projectId,
            teamMemberId: memberId,
          }))
        );
      }
    }
    
    const fullProject = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: { client: true, projectAssignments: { with: { teamMember: true } } },
    });
    res.json(fullProject);
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await db.delete(projects).where(eq(projects.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

router.get("/time-entries/:id", async (req, res) => {
  try {
    const entry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, parseInt(req.params.id)),
      with: { project: { with: { client: true } }, teamMember: true },
    });
    if (!entry) return res.status(404).json({ error: "Time entry not found" });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch time entry" });
  }
});

router.get("/time-entries", async (req, res) => {
  try {
    const { projectId, teamMemberId, dateFrom, dateTo } = req.query;
    
    let query = db.query.timeEntries.findMany({
      with: { project: { with: { client: true } }, teamMember: true },
      orderBy: [desc(timeEntries.date)],
    });
    
    const result = await query;
    
    let filtered = result;
    if (projectId) {
      filtered = filtered.filter(e => e.projectId === parseInt(projectId as string));
    }
    if (teamMemberId) {
      filtered = filtered.filter(e => e.teamMemberId === parseInt(teamMemberId as string));
    }
    if (dateFrom) {
      filtered = filtered.filter(e => e.date >= (dateFrom as string));
    }
    if (dateTo) {
      filtered = filtered.filter(e => e.date <= (dateTo as string));
    }
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch time entries" });
  }
});

router.post("/time-entries", async (req, res) => {
  try {
    const [entry] = await db.insert(timeEntries).values(req.body).returning();
    const fullEntry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, entry.id),
      with: { project: { with: { client: true } }, teamMember: true },
    });
    res.status(201).json(fullEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to create time entry" });
  }
});

router.put("/time-entries/:id", async (req, res) => {
  try {
    const [entry] = await db.update(timeEntries)
      .set(req.body)
      .where(eq(timeEntries.id, parseInt(req.params.id)))
      .returning();
    if (!entry) return res.status(404).json({ error: "Time entry not found" });
    
    const fullEntry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, entry.id),
      with: { project: { with: { client: true } }, teamMember: true },
    });
    res.json(fullEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to update time entry" });
  }
});

router.delete("/time-entries/:id", async (req, res) => {
  try {
    await db.delete(timeEntries).where(eq(timeEntries.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete time entry" });
  }
});

router.get("/invoices", async (req, res) => {
  try {
    const result = await db.query.invoices.findMany({
      with: { client: true, project: true, lineItems: true },
      orderBy: [desc(invoices.createdAt)],
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, parseInt(req.params.id)),
      with: { client: true, project: true, lineItems: true },
    });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

router.post("/invoices/generate", async (req, res) => {
  try {
    const { clientId, projectId, dateFrom, dateTo } = req.body;
    
    let entriesQuery = db.query.timeEntries.findMany({
      with: { teamMember: true, project: true },
    });
    
    const allEntries = await entriesQuery;
    
    let entries = allEntries.filter(e => {
      const project = e.project;
      const matchClient = project.clientId === clientId;
      const matchProject = !projectId || e.projectId === projectId;
      const matchDateFrom = !dateFrom || e.date >= dateFrom;
      const matchDateTo = !dateTo || e.date <= dateTo;
      return matchClient && matchProject && matchDateFrom && matchDateTo;
    });
    
    if (entries.length === 0) {
      return res.status(400).json({ error: "No time entries found for the specified criteria" });
    }
    
    const lineItemsMap = new Map<number, { 
      teamMember: typeof entries[0]["teamMember"], 
      totalHours: number,
      projectName: string 
    }>();
    
    for (const entry of entries) {
      const key = entry.teamMemberId;
      const existing = lineItemsMap.get(key);
      if (existing) {
        existing.totalHours += parseFloat(entry.hours);
      } else {
        lineItemsMap.set(key, {
          teamMember: entry.teamMember,
          totalHours: parseFloat(entry.hours),
          projectName: entry.project.projectName,
        });
      }
    }
    
    const lineItemsData: { description: string; quantity: number; rate: number; amount: number }[] = [];
    let subtotal = 0;
    
    for (const [, data] of lineItemsMap) {
      const rate = parseFloat(data.teamMember.rate);
      let quantity: number;
      let amount: number;
      let description: string;
      
      if (data.teamMember.billingType === "hourly") {
        quantity = data.totalHours;
        amount = quantity * rate;
        description = `${data.teamMember.name} - ${data.teamMember.role} (Hourly @ $${rate}/hr)`;
        lineItemsData.push({
          description,
          quantity: Math.round(quantity * 100) / 100,
          rate,
          amount: Math.round(amount * 100) / 100,
        });
      } else {
        const daysWorked = data.totalHours / 8;
        const workingDaysInMonth = 22;
        const dailyRate = rate / workingDaysInMonth;
        quantity = daysWorked;
        amount = dailyRate * daysWorked;
        description = `${data.teamMember.name} - ${data.teamMember.role} (Daily @ $${dailyRate.toFixed(2)}/day)`;
        lineItemsData.push({
          description,
          quantity: Math.round(quantity * 100) / 100,
          rate: Math.round(dailyRate * 100) / 100,
          amount: Math.round(amount * 100) / 100,
        });
      }
      subtotal += amount;
    }
    
    subtotal = Math.round(subtotal * 100) / 100;
    const total = subtotal;
    
    const invoiceCount = await db.select().from(invoices);
    const invoiceNumber = `INV-${String(invoiceCount.length + 1).padStart(5, "0")}`;
    
    const [invoice] = await db.insert(invoices).values({
      invoiceNumber,
      clientId,
      projectId: projectId || null,
      dateFrom,
      dateTo,
      subtotal: subtotal.toString(),
      tax: "0",
      total: total.toString(),
      status: "draft",
    }).returning();
    
    for (const item of lineItemsData) {
      await db.insert(invoiceLineItems).values({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity.toString(),
        rate: item.rate.toString(),
        amount: item.amount.toString(),
      });
    }
    
    const fullInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoice.id),
      with: { client: true, project: true, lineItems: true },
    });
    
    res.status(201).json(fullInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

router.put("/invoices/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const [invoice] = await db.update(invoices)
      .set({ status })
      .where(eq(invoices.id, parseInt(req.params.id)))
      .returning();
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to update invoice status" });
  }
});

router.delete("/invoices/:id", async (req, res) => {
  try {
    await db.delete(invoices).where(eq(invoices.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

router.get("/projects/by-client/:clientId", async (req, res) => {
  try {
    const result = await db.query.projects.findMany({
      where: eq(projects.clientId, parseInt(req.params.clientId)),
      with: { client: true },
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects for client" });
  }
});

router.get("/project-assignments/:projectId", async (req, res) => {
  try {
    const result = await db.query.projectAssignments.findMany({
      where: eq(projectAssignments.projectId, parseInt(req.params.projectId)),
      with: { teamMember: true },
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project assignments" });
  }
});

export default router;
