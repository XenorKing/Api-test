import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, notesTable, insertNoteSchema } from "@workspace/db";

const router: IRouter = Router();

const updateNoteSchema = insertNoteSchema.partial();

router.get("/notes", async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
  const done = req.query.done !== undefined ? req.query.done === "true" : undefined;

  const conditions = [];
  if (userId !== undefined && !isNaN(userId)) {
    conditions.push(eq(notesTable.userId, userId));
  }
  if (done !== undefined) {
    conditions.push(eq(notesTable.done, done));
  }

  const notes =
    conditions.length > 0
      ? await db.select().from(notesTable).where(and(...conditions))
      : await db.select().from(notesTable);

  res.json(notes);
});

router.get("/notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, id));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

router.post("/notes", async (req, res) => {
  const parsed = insertNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [note] = await db.insert(notesTable).values(parsed.data).returning();
  res.status(201).json(note);
});

router.put("/notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const parsed = updateNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [note] = await db
    .update(notesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(notesTable.id, id))
    .returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

router.delete("/notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [note] = await db
    .delete(notesTable)
    .where(eq(notesTable.id, id))
    .returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json({ message: "Note deleted" });
});

export default router;
