import { NextFunction, Request, Response, Router } from 'express';
import { Project, ProjectModel, StructuralTask, TextTask, VisionTask } from "../models/project";
import { ReasonPhrases, StatusCodes, } from 'http-status-codes';
import Debug from "debug";
import { ResponseData } from "../interfaces/ResponseData";
import { RequestProject } from "../interfaces/ProjectRequest";
import { Document, Types } from 'mongoose';
import { UserModel } from "../models/user";
import { ensureAuthenticated } from "../authentication/authentication";

const debug = Debug("project");
const router = Router();

/**
 * Generate error response messages
 * @param error
 * @param response
 * @return Generated data
 */
const makeErrorResult = (error, response: Response) => {
    debug("############## ", error.message);
    console.error(error);
    
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
    
    return responseData;
};

/**
 * Validate project name
 * @param name
 */
const pathParamError = (name: string) => {
    return (!decodeURI(name) || decodeURI(name).trim().length === 0);
};

/**
 * Validate project model schema
 * @param model
 */
const modelValidationError = (model: Document<any, any, Project> & Project & { _id: Types.ObjectId; }) => {
    let validationError = model.validateSync(); // ValidationError: there are errors, undefined: there is no error
    
    return {
        error: validationError,
        withError: ((validationError) && (Object.keys(validationError.errors).length > 0))
    };
}

const makeProjectResponse = (isAdmin: boolean, project: Document<any, any, Project> & Project & { _id: Types.ObjectId; }) => {
    let projectMemberArray = [];
    project.members.forEach(elem => {
        let member = {
            user: elem.user["email"],
            role: elem.role
        }
        projectMemberArray.push(member);
    });
    
    return {
        name: project.name,
        dataURI: project.dataURI,
        projectType: project.projectType,
        category: project.category,
        owner: isAdmin ? project.owner["email"] : "self",
        members: projectMemberArray,
        visionTasks: project.visionTasks,
        textTasks: project.textTasks,
        structuralTasks: project.structuralTasks,
        createdAt: project["createdAt"],
        updatedAt: project["updatedAt"]
    };
};

/**
 * Convert requested project data to mongoose project data
 * @param rProject Requested project data
 */
const convertToProjectSchema = async (user, rProject: RequestProject) => {
    debug("user::::::::", user);
    debug("rProject::::::::::", rProject);
    try {
        // let owner = await UserModel.findOne({ email: rProject.owner }).exec();
        let members: { user: Types.ObjectId; role: "attendee" | "member" }[] = [];
        
        for (let rMember of rProject.members) {
            let user = await UserModel.findOne({ email: rMember.user }).exec();
            members.push({ user: user._id, role: rMember.role });
        }
        
        let projectSchema: Project = {
            category: rProject.category,
            dataURI: rProject.dataURI,
            members: members,
            name: rProject.name,
            owner: user["_id"],
            projectType: rProject.projectType,
            structuralTasks: rProject.structuralTasks,
            textTasks: rProject.textTasks,
            visionTasks: rProject.visionTasks
        };
        
        return projectSchema;
    } catch(error) {
        debug(error);
        return undefined;
    }
};

const addMember = async (responseData: ResponseData, inMembers: { user: string, role: 'member' | 'attendee' }[], project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    responseData.success = true;
    responseData.code = StatusCodes.CREATED;
    
    try {
        for (let member of inMembers) {
            let user = await UserModel.findOne({ email: member.user }).exec();
            
            if (project.members.findIndex(elem => elem.user.equals(user._id)) < 0) {
                project.updateOne({
                    $push: { "members": { user: user._id, role: member.role } }
                }, (error) => {
                    if (error) {
                        console.error(error);
                        responseData.success = false;
                        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                        responseData.message = error;
                    }
                });
            } else {
                responseData.success = false;
                responseData.code = StatusCodes.BAD_REQUEST;
                responseData.message = `The member ${ member.user } already exists.`;
            }
            
            if (!responseData.success) break;
        }
    } catch (error) {
        console.error(error);
        responseData.success = false;
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
        responseData.message = error;
    }
};

const removeMember = async (responseData: ResponseData, outMembers: string[], project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    responseData.success = true;
    responseData.code = StatusCodes.CREATED;
    const MIN_REMOVABLE_LENGTH = 2;
    
    try {
        for (let member of outMembers) {
            if (project.members.length < MIN_REMOVABLE_LENGTH) {
                responseData.success = false;
                responseData.code = StatusCodes.BAD_REQUEST;
                responseData.message = "The member could not be deleted. A project member must have at least one user.";
            } else {
                let user = await UserModel.findOne({ email: member }).exec();
                project.updateOne({
                    $pull: { "members": { user: user._id } }
                }, (error) => {
                    if (error) {
                        console.log(error);
                        responseData.success = false;
                        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                        responseData.message = error;
                    }
                });
            }
            
            if (!responseData.success) break;
        }
    } catch (error) {
        console.error(error);
        responseData.success = false;
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
        responseData.message = error;
    }
};

const addTask = async (responseData: ResponseData, task: TaskBody, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    responseData.success = true;
    responseData.code = StatusCodes.CREATED;
    
    try {
        switch (task.type) {
            case "vision":
                const visionTask = task.task as VisionTask;
                
                if (project.visionTasks.findIndex(elem => elem.name === visionTask.name) < 0) {
                    let newVisionTask: VisionTask = {
                        completed: visionTask.completed,
                        includeMask: visionTask.includeMask,
                        name: visionTask.name,
                        preprocessed: visionTask.preprocessed,
                        taskType: visionTask.taskType
                    };
                    
                    project.updateOne({
                        $push: { visionTasks: newVisionTask }
                    }, (error) => {
                        if (error) {
                            console.error(error);
                            responseData.success = false;
                            responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                            responseData.message = error;
                        }
                    });
                } else {
                    responseData.success = false;
                    responseData.code = StatusCodes.BAD_REQUEST;
                    responseData.message = "The task name already exists.";
                }
                
                break;
            case "text":
                const textTask = task.task as TextTask;
                
                if (project.textTasks.findIndex(elem => elem.name === textTask.name) < 0) {
                    let newTextTask: TextTask = {
                        name: textTask.name
                    };
                    
                    project.updateOne({
                        $push: { textTasks: newTextTask }
                    }, (error) => {
                        if (error) {
                            console.error(error);
                            responseData.success = false;
                            responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                            responseData.message = error;
                        }
                    });
                } else {
                    responseData.success = false;
                    responseData.code = StatusCodes.BAD_REQUEST;
                    responseData.message = "The task name already exists.";
                }
                
                break;
            case "structural":
                const structuralTask = task.task as StructuralTask;
                
                if (project.structuralTasks.findIndex(elem => elem.name === structuralTask.name) < 0) {
                    let newStructuralTask: StructuralTask = {
                        name: structuralTask.name,
                        taskType: structuralTask.taskType
                    };
                    
                    project.updateOne({
                        $push: { structuralTasks: newStructuralTask }
                    }, (error) => {
                        if (error) {
                            console.error(error);
                            responseData.success = false;
                            responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                            responseData.message = error;
                        }
                    });
                } else {
                    responseData.success = false;
                    responseData.code = StatusCodes.BAD_REQUEST;
                    responseData.message = "The task name already exists.";
                }
                
                break;
            default:
                responseData.success = false;
                responseData.code = StatusCodes.BAD_REQUEST;
                responseData.message = "category is undefined";
                break;
        }
    } catch (error) {
        console.error(error);
        responseData.success = false;
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
        responseData.message = error;
    }
};

const removeTask = async (responseData: ResponseData, type: string, taskName: string, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    responseData.success = true;
    responseData.code = StatusCodes.CREATED;
    const MIN_REMOVABLE_LENGTH = 2;
    
    try {
        switch (type) {
            case "vision":
                if (project.visionTasks.length < MIN_REMOVABLE_LENGTH) {
                    responseData.success = false;
                    responseData.code = StatusCodes.BAD_REQUEST;
                    responseData.message = "The task could not be deleted. A project must have at least one task.";
                } else {
                    project.updateOne({
                        $pull: { visionTasks: { name: taskName } }
                    }, (error) => {
                        if (error) {
                            console.error(error);
                            responseData.success = false;
                            responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                            responseData.message = error;
                        }
                    });
                }
                
                break;
            case "text":
                if (project.textTasks.length < MIN_REMOVABLE_LENGTH) {
                    responseData.success = false;
                    responseData.code = StatusCodes.BAD_REQUEST;
                    responseData.message = "The task could not be deleted. A project must have at least one task.";
                } else {
                    project.updateOne({
                        $push: { textTasks: { name: taskName } }
                    }, (error) => {
                        if (error) {
                            console.error(error);
                            responseData.success = false;
                            responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                            responseData.message = error;
                        }
                    });
                }
                
                break;
            case "structural":
                if (project.structuralTasks.length < MIN_REMOVABLE_LENGTH) {
                    responseData.success = false;
                    responseData.code = StatusCodes.BAD_REQUEST;
                    responseData.message = "The task could not be deleted. A project must have at least one task.";
                } else {
                    project.updateOne({
                        $push: { structuralTasks: { name: taskName } }
                    }, (error) => {
                        if (error) {
                            console.error(error);
                            responseData.success = false;
                            responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                            responseData.message = error;
                        }
                    });
                }
                
                break;
            default:
                responseData.success = false;
                responseData.code = StatusCodes.BAD_REQUEST;
                responseData.message = "category is undefined";
                break;
        }
    } catch (error) {
        console.error(error);
        responseData.success = false;
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
        responseData.message = error;
    }
};

// User authentication checks before processing all project requests.
router.all("*", ensureAuthenticated);

router.get("/", async (request: Request, response: Response) => {
    let responseData = new ResponseData();
    debug(request.user);
    
    let isAdmin = request.user["accountType"] === "admin";
    
    try {
        let projects = await ProjectModel
            .find({ /*"owner": request.user['_id']*/ }, { _id: false, __v: false })
            .populate({ path: 'owner', select: 'email -_id' })
            .populate({ path: 'members.user', select: 'email -_id' })
            .exec();
        
        responseData.success = true;
        
        if (projects.length > 0) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.count = projects.length;
            
            let projectArray = [];
            projects.forEach(project => projectArray.push(makeProjectResponse(isAdmin, project)));
            responseData.data = projectArray;
            
            response.status(StatusCodes.OK);
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = ReasonPhrases.NOT_FOUND;
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        debug("############## responseData -", responseData);
        response.send(responseData.data); // send data only
        response.end();
    }
});

router.get("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    let isAdmin = request.user["accountType"] === "admin";
    
    try {
        let project = await ProjectModel
            .findOne({ name: decodeURI(request.params.name)/*, "owner": request.user['_id']*/ }, { _id: 0 })
            .populate({ path: 'owner', select: 'email -_id' })
            .populate({ path: 'members.user', select: 'email -_id' })
            .exec();
        
        responseData.success = true;
        
        if (project && Object.keys(project).length > 0) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.data = makeProjectResponse(isAdmin, project);
            
            response.status(StatusCodes.OK);
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = ReasonPhrases.NOT_FOUND;
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData.data); // send data only
        response.end();
    }
});

router.post("/", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    const projectSchema = await convertToProjectSchema(request.user, request.body);
    if (!projectSchema) {
        return next("Failed to parse request data.");
    }
    
    let projectModel = new ProjectModel(projectSchema);
    
    let validation = modelValidationError(projectModel);
    if (validation.withError) {
        return next(validation.error);
    }
    
    try {
        let project = await ProjectModel.findOne({ name: request.body.name }).exec();
        
        if (!project) {
            let newProject = await ProjectModel.create(projectModel);
            
            responseData.success = true;
            responseData.code = StatusCodes.CREATED;
            responseData.message = ReasonPhrases.CREATED;
            
            response.status(StatusCodes.CREATED);
        } else {
            responseData.success = false;
            responseData.code = StatusCodes.BAD_REQUEST;
            responseData.message = "Project name already in use.";
            
            response.status(StatusCodes.BAD_REQUEST);
        }
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData);
        response.end();
    }
});

router.put("/:name/members", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    let reqMembers: EditMember = request.body;
    
    try {
        let modProject = await ProjectModel.findOne({ name: decodeURI(request.params.name) })
            .populate({ path: 'members.user', select: 'email -_id' })
            .exec();
        
        if (modProject) {
            let currentMemberEmails: string[] = modProject.members.map(member => {
                return member.user["email"];
            });
            
            let inCount: number = 0, outCount: number = 0;
            if (reqMembers.inMember.length > 0) {
                // Check if the target to be removed exists
                let inMemberEmails: string[] = reqMembers.inMember.map(e => e.user);
                const difference: string[] = inMemberEmails.filter(e => !currentMemberEmails.includes(e));
                if (difference.length > 0) {
                    await addMember(responseData, reqMembers.inMember, modProject);
                    inCount = difference.length;
                }
            }
            
            if (reqMembers.outMember.length > 0) {
                // Check if the target to be removed exists
                const intersection: string[] = currentMemberEmails.filter(e => reqMembers.outMember.includes(e));
                if (intersection.length > 0 && (currentMemberEmails.length > intersection.length)) {
                    await removeMember(responseData, reqMembers.outMember, modProject);
                    outCount = intersection.length;
                }
            }
            
            if (inCount === 0 && outCount === 0) {
                responseData.success = false;
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = "No members were modified.";
            }
            
            response.status(responseData.code);
        } else {
            responseData.success = false;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No project was modified.";
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData);
        response.end();
    }
});

router.put("/:name/task", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    let reqTasks: TaskBody = request.body;
    
    try {
        let modProject = await ProjectModel.findOne({ name: decodeURI(request.params.name) }).exec();
        
        if (modProject) {
            await addTask(responseData, reqTasks, modProject);
            response.status(responseData.code);
        } else {
            responseData.success = false;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No task was added.";
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData);
        response.end();
    }
});

router.delete("/:name/task/:type/:taskName", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    if (pathParamError(request.params.type)) {
        return next(new Error("Project category error."));
    }
    
    if (pathParamError(request.params.taskName)) {
        return next(new Error("Task name error."));
    }
    
    try {
        let modProject = await ProjectModel.findOne({ name: decodeURI(request.params.name) }).exec();
        
        if (modProject) {
            await removeTask(responseData, decodeURI(request.params.type), decodeURI(request.params.taskName), modProject);
            response.status(responseData.code);
        } else {
            responseData.success = false;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No tasks were removed.";
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData);
        response.end();
    }
});

router.delete("/", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    let names: Array<string> = request.body.names || [];
    
    if (!Array.isArray(names) || (names.length === 0)) {
        return next(new Error("'names' is not an array or empty."));
    }
    
    try {
        let result = await ProjectModel.deleteMany({ name: { $in: names } }).exec();
        
        responseData.success = true;
        
        if (result.deletedCount > 0) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.data = result;
            
            response.status(StatusCodes.OK);
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No project was deleted.";
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData);
        response.end();
    }
});

router.delete("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    try {
        let delProject = await ProjectModel.findOneAndDelete({ name: decodeURI(request.params.name) }).exec();
        
        responseData.success = true;
        
        if (delProject) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            
            response.status(StatusCodes.OK);
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No project was deleted.";
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData);
        response.end();
    }
});

interface EditMember {
    inMember: { user: string, role: 'member' | 'attendee' }[];
    outMember: string[];
}

interface EditTask {
    name: string;
    taskType: 'recommendation' | 'clustering' | 'classification' | 'regression';
}

interface TaskBody {
    type: 'structural' | 'text' | 'vision';
    task: EditTask
}

export default router;