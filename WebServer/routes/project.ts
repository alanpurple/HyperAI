import {Router, Request, Response} from 'express';
import {ProjectModel} from "../models/project";
import {ReasonPhrases, StatusCodes, } from 'http-status-codes';
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

// User authentication checks before processing all project requests.
// router.all("*", ensureAuthenticated);

router.get("/", (request: Request, response: Response) => {
    let responseData = new ResponseData();
    
    ProjectModel.find({"members.email": request.user.email}).exec()
        .then(projects => {
            responseData.success = true;
            
            if (projects.length === 0) {
                responseData.code = StatusCodes.NO_CONTENT;
                responseData.message = "No project found.";
                
                response.status(StatusCodes.NO_CONTENT);
            } else {
                responseData.code = StatusCodes.OK;
                responseData.message = `Found ${projects.length} projects.`;
                
                response.status(StatusCodes.OK);
            }
            responseData.data = projects;
        })
        .catch(error => {
            responseData = makeErrorResult(error, response);
        })
        .finally(() => {
            response.send(responseData);
            response.end();
        });
});

router.get("/:id", (request: Request, response: Response) => {
    let responseData = new ResponseData();
    
    ProjectModel.findById(decodeURI(request.params.id)).exec()
        .then(project => {
            responseData.success = true;
            
            if (!project || Object.keys(project).length === 0) {
                responseData.code = StatusCodes.NO_CONTENT;
                responseData.message = "A project with the specified ID was not found.";
                
                response.status(StatusCodes.NO_CONTENT);
            } else {
                responseData.code = StatusCodes.OK;
                responseData.message = `Found a project.`;
                
                response.status(StatusCodes.OK);
            }
            
            responseData.data = project;
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
                        responseData.data = newProject;
                        
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

router.put("/:id", async (request: Request, response: Response) => {
    let responseData = new ResponseData();
    let projectModel = new ProjectModel(request.body, null, {skipId: true});
    
    let error = projectModel.validateSync();
    if ((error.errors) && (Object.keys(error.errors).length > 0)) {
        responseData = makeErrorResult(error, response);
        response.status(StatusCodes.BAD_REQUEST).send(responseData);
        response.end();
    } else {
        debug("projectModel: ", projectModel);
        await ProjectModel.findByIdAndUpdate(decodeURI(request.params.id), projectModel, {new: true}).then(modProject => {
            if (!modProject) {
                responseData.success = false;
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = "No project was modified.";
                
                response.status(StatusCodes.NOT_FOUND);
            } else {
                responseData.success = true;
                responseData.code = StatusCodes.CREATED;
                responseData.message = ReasonPhrases.CREATED;
                responseData.data = modProject;
                
                response.status(StatusCodes.CREATED);
            }
        }).catch(error => {
            responseData = makeErrorResult(error, response);
        }).finally(() => {
            response.send(responseData);
            response.end();
        });
    }
});

router.delete("/", (request: Request, response: Response) => {
    let responseData = new ResponseData();
    let _ids: Array<string> = request.body.ids;
    
    if (Array.isArray(_ids)) {
        ProjectModel.deleteMany({_id: {$in: _ids}}).exec()
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
    } else {
        responseData.success = false;
        responseData.code = StatusCodes.BAD_REQUEST;
        responseData.message = "'ids' is not an array.";
        
        response.status(StatusCodes.BAD_REQUEST).send(responseData);
    }
});

router.delete("/:id", (request: Request, response: Response) => {
    let responseData = new ResponseData();
    
    ProjectModel.findByIdAndDelete(decodeURI(request.params.id)).exec()
        .then(async delProject => {
            responseData.success = true;
            
            if (!delProject) {
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = "No project was deleted.";
                
                response.status(StatusCodes.NOT_FOUND);
            } else {
                responseData.code = StatusCodes.OK;
                responseData.message = ReasonPhrases.OK;
                responseData.data = delProject;
                
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