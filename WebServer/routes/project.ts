import {Router, Request, Response, NextFunction} from 'express';
import {Project, ProjectModel} from "../models/project";
import {ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode,} from 'http-status-codes';
import Debug, {skips} from "debug";
import {ensureAuthenticated} from "../authentication/authentication";

const debug = Debug("project");
const router = Router();

// TODO: Filter by currently logged in user or etc.

// User authentication checks before processing all project requests.
router.all("*", ensureAuthenticated);

router.get("/", async (req: Request, res: Response) => {
    await ProjectModel.find().exec().then(async projects => {
        if (projects.length === 0) {
            res.status(StatusCodes.NOT_FOUND).send({
                warn: "No project found."
            });
        } else {
            res.send(projects);
        }
    }).catch(err => {
        debug(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }).finally(() => {
        res.end();
    });
});

router.get("/:id", async (req: Request, res: Response) => {
    await ProjectModel.findById(decodeURI(req.params.id)).exec().then(async project => {
        if (!project || Object.keys(project).length === 0) {
            res.status(StatusCodes.NOT_FOUND).send({
                warn: "The project does not exist."
            });
        } else {
            res.send(project);
        }
    }).catch(err => {
        debug(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }).finally(() => {
        res.end();
    });
});

router.post("/", async (req: Request, res: Response) => {
    await ProjectModel.findOne({name: req.body.name}).exec().then(async project => {
        if (!project) {
            let projectModel = new ProjectModel(req.body);
            debug("projectModel: ", projectModel);
            
            await ProjectModel.create(projectModel).then(async newProject => {
                await res.status(StatusCodes.CREATED).send(newProject);
            });
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({
                error: "Project name already in use." // getReasonPhrase(StatusCodes.BAD_REQUEST)
            });
        }
    }).catch(err => {
        debug(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }).finally(() => {
        res.end();
    });
});

router.put("/:id", async (req: Request, res: Response) => {
    debug("req.body: ", req.body);
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send({
            error: "Project data is empty."
        });
    } else {
        let projectModel = new ProjectModel(req.body, null, {skipId: true});
        
        // request data validation
        let error = projectModel.validateSync();
        if (error && Object.keys(error).length > 0 && error.hasOwnProperty("message")) {
            res.status(StatusCodes.BAD_REQUEST).send({
                error: "Project data is malformed.",
                message: error.message
            });
        }
        
        debug("projectModel: ", projectModel);
        await ProjectModel.findByIdAndUpdate(decodeURI(req.params.id), projectModel, {new: true}).then(modProject => {
            if (!modProject) {
                res.status(StatusCodes.NOT_FOUND).send({
                    warn: "No project was modified."
                });
            } else {
                res.status(StatusCodes.CREATED).send(modProject);
            }
        }).catch(err => {
            debug(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
            });
        }).finally(() => {
            res.end();
        });
    }
});

router.delete("/", (req: Request, res: Response) => {
    let _ids: Array<string> = req.body.ids;
    debug("_ids: ", _ids);
    if (Array.isArray(_ids)) {
        ProjectModel.deleteMany({_id: {$in: _ids}}).exec().then(result => {
            if (result.deletedCount === 0) {
                res.status(StatusCodes.NOT_FOUND).send({
                    warn: "No project was deleted."
                });
            } else {
                res.status(StatusCodes.OK).send(result);
            }
        }).catch(err => {
            debug(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
            });
        }).finally(() => {
            res.end();
        });
    } else {
        res.status(StatusCodes.BAD_REQUEST).send({
            error: "'ids' is not an array."
        });
    }
});

router.delete("/:id", (req: Request, res: Response) => {
    ProjectModel.findByIdAndDelete(decodeURI(req.params.id)).exec().then(async delProject => {
        if (!delProject) {
            res.status(StatusCodes.NOT_FOUND).send({
                warn: "No project was deleted."
            });
        } else {
            await res.status(StatusCodes.OK).send(delProject);
        }
    }).catch(err => {
        debug(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }).finally(() => {
        res.end();
    });
})

export default router;