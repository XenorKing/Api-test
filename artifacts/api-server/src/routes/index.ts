import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import notesRouter from "./notes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(notesRouter);

export default router;
