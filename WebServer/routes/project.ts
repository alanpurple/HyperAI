import {Router, Request, Response, NextFunction} from 'express';
import {ProjectModel} from "../models/project";
import {ReasonPhrases, StatusCodes,} from 'http-status-codes';
import Debug from "debug";
import {ensureAuthenticated} from "../authentication/authentication";
import {ResponseData} from "../interfaces/ResponseData";

const debug = Debug("project");
const router = Router();

const makeErrorResult = (error, response: Response) => {
    debug("############## ", error.message);
    
    let responseData = new ResponseData();
    
    responseData.success = false;
    
    if (error.name === "ValidationError" || error.name === "CastError") {
        response.status(StatusCodes.BAD_REQUEST);
        responseData.code = StatusCodes.BAD_REQUEST;
    } else {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR);
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
    }
    
    responseData.message = error.name;
    responseData.data = error.message;
    
    debug("############## responseData - ", responseData);
    return responseData;
};

const pathParamError = (name: string) => {
    return (!decodeURI(name) || decodeURI(name).trim().length === 0)
};

// User authentication checks before processing all project requests.
// Temporary comments for testing
// router.all("*", ensureAuthenticated);

router.get("/", async (request: Request, response: Response) => {
    let responseData = new ResponseData();
    debug(request.user);
    
    await ProjectModel.find({
            // Temporary comments for testing
            // "owner": request.user['_id']
        },
        {_id: 0}
    )
        .populate({path: 'owner', select: 'email -_id'})
        .populate({path: 'members.user', select: 'email -_id'})
        .exec()
        .then(projects => {
            responseData.success = true;
            
            if (projects.length === 0) {
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = "No project found.";
                
                response.status(StatusCodes.NOT_FOUND);
            } else {
                responseData.code = StatusCodes.OK;
                responseData.message = `Found ${projects.length} projects.`;
                responseData.data = projects;
                
                response.status(StatusCodes.OK);
            }
        })
        .catch(error => {
            responseData = makeErrorResult(error, response);
        })
        .finally(() => {
            // debug("############## responseData -", responseData);
            response.send(responseData);
            response.end();
        });
});

router.get("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    await ProjectModel.findOne(
        {
            name: decodeURI(request.params.name)
            // Temporary comments for testing
            // , "owner": request.user['_id']
        },
        {_id: 0}
    )
        .populate({path: 'owner', select: 'email -_id'})
        .populate({path: 'members.user', select: 'email -_id'})
        .exec()
        .then(project => {
            responseData.success = true;
            
            if (!project || Object.keys(project).length === 0) {
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = "A project with the specified name was not found.";
                
                response.status(StatusCodes.NOT_FOUND);
            } else {
                responseData.code = StatusCodes.OK;
                responseData.message = `Found a project.`;
                responseData.data = project;
                
                response.status(StatusCodes.OK);
            }
        })
        .catch(error => {
            responseData = makeErrorResult(error, response);
        })
        .finally(() => {
            response.send(responseData);
            response.end();
        });
});

router.post("/", (request: Request, response: Response) => {
    let responseData = new ResponseData();
    
    ProjectModel.findOne({name: request.body.name}).exec()
        .then(async project => {
            if (!project) {
                let projectModel = new ProjectModel(request.body);
                debug("projectModel: ", projectModel);
                
                await ProjectModel.create(projectModel)
                    .then(async newProject => {
                        responseData.success = true;
                        responseData.code = StatusCodes.CREATED;
                        responseData.message = ReasonPhrases.CREATED;
                        
                        await newProject.populate({path: 'owner', select: 'email -_id'});
                        await newProject.populate({path: 'members.user', select: 'email -_id'});
                        
                        let projectData = newProject.toObject();
                        delete projectData._id || delete projectData["_id"];
                        responseData.data = projectData;
                        
                        response.status(StatusCodes.CREATED);
                    });
            } else {
                responseData.success = false;
                responseData.code = StatusCodes.BAD_REQUEST;
                responseData.message = "Project name already in use.";
                
                response.status(StatusCodes.BAD_REQUEST);
            }
        })
        .catch(error => {
            responseData = makeErrorResult(error, response);
        })
        .finally(() => {
            response.send(responseData);
            response.end();
        });
});

router.put("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    let projectModel = new ProjectModel(request.body, null, {skipId: true});
    
    let error = projectModel.validateSync(); // ValidationError: there are errors, undefined: there is no error
    if ((error) && (Object.keys(error.errors).length > 0)) {
        return next(error);
    }
    
    debug("projectModel: ", projectModel);
    await ProjectModel.findOneAndUpdate({name: decodeURI(request.params.name)}, projectModel, {returnOriginal: false})
        .exec()
        .then(async modProject => {
            if (!modProject) {
                responseData.success = false;
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = "No project was modified.";
                
                response.status(StatusCodes.NOT_FOUND);
            } else {
                responseData.success = true;
                responseData.code = StatusCodes.CREATED;
                responseData.message = ReasonPhrases.CREATED;
                // responseData.data = modProject;
                
                await modProject.populate({path: 'owner', select: 'email -_id'});
                await modProject.populate({path: 'members.user', select: 'email -_id'});
                
                let projectData = modProject.toObject();
                delete projectData._id || delete projectData["_id"];
                responseData.data = projectData;
                
                response.status(StatusCodes.CREATED);
            }
        })
        .catch(error => {
            responseData = makeErrorResult(error, response);
        })
        .finally(() => {
            response.send(responseData);
            response.end();
        });
});

router.delete("/", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    let names: Array<string> = request.body.names || [];
    
    if (!Array.isArray(names) || (names.length === 0)) {
        return next(new Error("'names' is not an array or empty."));
    }
    
    await ProjectModel.deleteMany({name: {$in: names}}).exec()
        .then(result => {
            responseData.success = true;
            
            if (result.deletedCount === 0) {
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = "No project was deleted.";
                
                response.status(StatusCodes.NOT_FOUND);
            } else {
                responseData.code = StatusCodes.OK;
                responseData.message = ReasonPhrases.OK;
                responseData.data = result;
                
                response.status(StatusCodes.OK);
            }
        })
        .catch(error => {
            responseData = makeErrorResult(error, response);
        })
        .finally(() => {
            response.send(responseData);
            response.end();
        });
});

router.delete("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    await ProjectModel.findOneAndDelete({name: decodeURI(request.params.name)}).exec()
        .then(async delProject => {
            responseData.success = true;
            
            if (!delProject) {
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = "No project was deleted.";
                
                response.status(StatusCodes.NOT_FOUND);
            } else {
                responseData.code = StatusCodes.OK;
                responseData.message = ReasonPhrases.OK;
                
                await delProject.populate({path: 'owner', select: 'email -_id'});
                await delProject.populate({path: 'members.user', select: 'email -_id'});
                
                let projectData = delProject.toObject();
                delete projectData._id || delete projectData["_id"];
                responseData.data = projectData;
                
                response.status(StatusCodes.OK);
            }
        })
        .catch(error => {
            responseData = makeErrorResult(error, response);
        })
        .finally(() => {
            response.send(responseData);
            response.end();
        });
});

export default router;