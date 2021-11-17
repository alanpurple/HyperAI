import { NextFunction, Request, Response, Router } from 'express';
import { Project, ProjectModel, StructuralTask, TextTask, VisionTask } from "../models/project";
import { ReasonPhrases, StatusCodes, } from 'http-status-codes';
import { ResponseData } from "../interfaces/ResponseData";
import { RequestProject } from "../interfaces/ProjectRequest";
import { Document, Types } from 'mongoose';
import { UserModel } from "../models/user";
import { ensureAuthenticated } from "../authentication/authentication";

const logger = require("../logger/logger")("project");

const router = Router();

class ProjectError extends Error {
    constructor(message) {
        super(message);
        this.name = "ProjectError";
    }
}

const doProjectError = (message: string) => {
    throw new ProjectError(message);
};

/**
 * Generate error response messages
 * @param error
 * @param responseData
 * @return Generated data
 */
const makeErrorResult = (error, responseData: ResponseData) => {
    logger(error);
    
    responseData.success = false;
    if (error.name === "ValidationError" || error.name === "CastError" || error.name === "ProjectError") {
        responseData.code = StatusCodes.BAD_REQUEST;
    } else {
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
    }
    responseData.message = error.message;
};

/**
 * Validate project name
 * @param pathParameter
 * @param pathName
 */
const checkPathParamError = (pathParameter: string, pathName: string) => {
    if (!decodeURI(pathParameter) || decodeURI(pathParameter).trim().length === 0) {
        throw new ProjectError(`Path parameter error - ${ pathName }`);
    }
};

const checkArray = (target: any) => {
    if (!Array.isArray(target) || (target.length === 0)) {
        throw new ProjectError("Target is not an array or empty.");
    }
}

/**
 * Validate project model schema
 * @param model
 */
const validateProjectModel = (model: Document<any, any, Project> & Project & { _id: Types.ObjectId; }) => {
    let validationError = model.validateSync(); // ValidationError: there are errors, undefined: there is no error
    
    if (validationError) {
        throw validationError;
    }
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
 * @param user
 * @param reqProject Requested project data
 */
const convertToProjectSchema = async (user, reqProject: RequestProject) => {
    logger(user);
    logger(reqProject);
    
    let members: { user: Types.ObjectId; role: "attendee" | "member" }[] = [];
    
    for (let rMember of reqProject.members) {
        let user = await UserModel.findOne({ email: rMember.user }).exec();
        
        if (user) {
            members.push({ user: user._id, role: rMember.role });
        } else {
            doProjectError(`Project member '${ rMember.user }' not found.`);
        }
    }
    
    let projectSchema: Project = {
        category: reqProject.category,
        dataURI: reqProject.dataURI,
        members: members,
        name: reqProject.name,
        owner: user["_id"],
        projectType: reqProject.projectType,
        structuralTasks: reqProject.structuralTasks,
        textTasks: reqProject.textTasks,
        visionTasks: reqProject.visionTasks
    };
    
    return projectSchema;
};

const addMember = async (inMembers: { user: string, role: 'member' | 'attendee' }[], project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    try {
        let addMemberResult: AddMemberResult = { error: [], addedMembers: [], ignoredMembers: [] };
        
        // Check if the target to be removed exists
        let currentMemberEmails: string[] = project.members.map(member => member.user["email"]);
        let inMemberEmails: string[] = inMembers.map(e => e.user);
        const difference: string[] = inMemberEmails.filter(e => !currentMemberEmails.includes(e));
        
        if (difference.length > 0) {
            for (let member of inMembers) {
                let user = await UserModel.findOne({ email: member.user }).exec();
                
                if (user) {
                    project.updateOne({
                        $push: { "members": { user: user._id, role: member.role } }
                    }, (error) => {
                        if (error) {
                            logger(error);
                            addMemberResult.error.push(error);
                        } else {
                            logger(`User '${ member.user }' is added.`);
                            addMemberResult.addedMembers.push(member.user);
                        }
                    });
                } else {
                    logger(`User '${ member.user }' not found.`);
                    addMemberResult.ignoredMembers.push(member.user);
                }
            }
        } else {
            addMemberResult.addedMembers.push("Project members already exist.");
        }
        
        return addMemberResult;
    } catch (error) {
        throw error;
    }
};

/**
 * remove project member when user account is being removed (future use)
 *
 * @param userId
 */
const removeMemberFromAllProjects = async (userId: Types.ObjectId) => {
    let projects = await ProjectModel.find({ "members.user": userId }).exec();
    if (projects.length > 0) {
        projects.forEach(project => {
            project.updateOne({
                $pull: { "members": { user: userId } }
            }, (error) => {
                throw error;
            });
        });
    }
}

const removeMember = async (outMembers: string[], project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    try {
        let removeMemberResult: RemoveMemberResult = { error: [], ignoredMembers: [], removedMembers: [] };
        
        // Check if the target to be removed exists
        let currentMemberEmails: string[] = project.members.map(member => member.user["email"]);
        const intersection: string[] = currentMemberEmails.filter(e => outMembers.includes(e));
        
        if (intersection.length > 0 && (currentMemberEmails.length > intersection.length)) {
            for (let member of outMembers) {
                let user = await UserModel.findOne({ email: member }).exec();
                
                if (user) {
                    project.updateOne({
                        $pull: { "members": { user: user._id } }
                    }, (error) => {
                        if (error) {
                            logger(error);
                            removeMemberResult.error.push(error);
                        } else {
                            logger(`User '${ member }' is removed.`);
                            removeMemberResult.removedMembers.push(member);
                        }
                    });
                } else {
                    logger(`User '${ member }' not found.`);
                    removeMemberResult.ignoredMembers.push(member);
                }
            }
        } else if (intersection.length === 0) {
            removeMemberResult.error.push("No project members to remove.");
        } else {
            removeMemberResult.error.push("Project member must have at least one user.");
        }
        
        return removeMemberResult;
    } catch (error) {
        throw error;
    }
};

const tasksCanBeAdded = (tasks: Array<any>, taskName: string, responseData: ResponseData) => {
    if (tasks.findIndex(elem => elem.name === taskName) >= 0) {
        responseData.success = false;
        responseData.code = StatusCodes.BAD_REQUEST;
        responseData.message = "The task name already exists.";
    }
    
    return !(tasks.findIndex(elem => elem.name === taskName) >= 0);
}

const addTask = async (responseData: ResponseData, task: TaskBody, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    responseData.success = true;
    responseData.code = StatusCodes.CREATED;
    
    try {
        switch (task.type) {
            case "vision":
                const visionTask = task.task as VisionTask;
                
                if (tasksCanBeAdded(project.visionTasks, visionTask.name, responseData)) {
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
                            makeErrorResult(error, responseData);
                        }
                    });
                }
                
                break;
            case "text":
                const textTask = task.task as TextTask;
                
                if (tasksCanBeAdded(project.textTasks, textTask.name, responseData)) {
                    let newTextTask: TextTask = {
                        name: textTask.name
                    };
                    
                    project.updateOne({
                        $push: { textTasks: newTextTask }
                    }, (error) => {
                        if (error) {
                            makeErrorResult(error, responseData);
                        }
                    });
                }
                
                break;
            case "structural":
                const structuralTask = task.task as StructuralTask;
                
                if (tasksCanBeAdded(project.structuralTasks, structuralTask.name, responseData)) {
                    let newStructuralTask: StructuralTask = {
                        name: structuralTask.name,
                        taskType: structuralTask.taskType
                    };
                    
                    project.updateOne({
                        $push: { structuralTasks: newStructuralTask }
                    }, (error) => {
                        if (error) {
                            makeErrorResult(error, responseData);
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
        makeErrorResult(error, responseData);
    }
};

const tasksRemovable = (length: number, responseData: ResponseData): boolean => {
    const MIN_REMOVABLE_LENGTH = 2;
    
    if (length < MIN_REMOVABLE_LENGTH) {
        responseData.success = false;
        responseData.code = StatusCodes.BAD_REQUEST;
        responseData.message = "Project must have at least one task.";
    }
    
    return !(length < MIN_REMOVABLE_LENGTH);
};

const removeTask = async (responseData: ResponseData, type: string, taskName: string, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    responseData.success = true;
    responseData.code = StatusCodes.CREATED;
    
    try {
        switch (type) {
            case "vision":
                if (tasksRemovable(project.visionTasks.length, responseData)) {
                    project.updateOne({
                        $pull: { visionTasks: { name: taskName } }
                    }, (error) => {
                        if (error) {
                            makeErrorResult(error, responseData);
                        }
                    });
                }
                
                break;
            case "text":
                if (tasksRemovable(project.textTasks.length, responseData)) {
                    project.updateOne({
                        $push: { textTasks: { name: taskName } }
                    }, (error) => {
                        if (error) {
                            makeErrorResult(error, responseData);
                        }
                    });
                }
                
                break;
            case "structural":
                if (tasksRemovable(project.structuralTasks.length, responseData)) {
                    project.updateOne({
                        $push: { structuralTasks: { name: taskName } }
                    }, (error) => {
                        if (error) {
                            makeErrorResult(error, responseData);
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
        makeErrorResult(error, responseData);
    }
};

// User authentication checks before processing all project requests.
const env = process.env.NODE_ENV || 'production';
if (env === 'production') {
    router.all("*", ensureAuthenticated);
}

router.get("/", async (request: Request, response: Response) => {
    let responseData = new ResponseData();
    
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    logger(request.user);
    
    try {
        let isAdmin = request.user["accountType"] === "admin";
        
        let projects = await ProjectModel
            .find({ "owner": request.user['_id'] }, { _id: false, __v: false })
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
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = ReasonPhrases.NOT_FOUND;
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        logger(responseData);
        response.status(responseData.code);
        if (responseData.success) {
            response.send(responseData.data); // send data only
        } else {
            response.send(responseData);
        }
        response.end();
    }
});

router.get("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    try {
        checkPathParamError(request.params.name, "project name");
        
        let isAdmin = request.user["accountType"] === "admin";
        
        let project = await ProjectModel
            .findOne({ name: decodeURI(request.params.name), "owner": request.user['_id'] }, { _id: 0 })
            .populate({ path: 'owner', select: 'email -_id' })
            .populate({ path: 'members.user', select: 'email -_id' })
            .exec();
        
        responseData.success = true;
        
        if (project && Object.keys(project).length > 0) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.data = makeProjectResponse(isAdmin, project);
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = ReasonPhrases.NOT_FOUND;
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        if (responseData.success) {
            response.send(responseData.data); // send data only
        } else {
            response.send(responseData);
        }
        response.end();
    }
});

router.post("/", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    try {
        const projectSchema = await convertToProjectSchema(request.user, request.body);
        if (!projectSchema) {
            doProjectError("Failed to parse request data.");
        }
        
        let projectModel = new ProjectModel(projectSchema);
        
        validateProjectModel(projectModel);
        
        let project = await ProjectModel.findOne({ name: request.body.name }).exec();
        
        if (!project) {
            let newProject = await ProjectModel.create(projectModel);
            
            responseData.success = true;
            responseData.code = StatusCodes.CREATED;
            responseData.message = ReasonPhrases.CREATED;
        } else {
            doProjectError("Project name already in use.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.put("/:name/members", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    let addMemberResult: AddMemberResult = { error: [], addedMembers: [], ignoredMembers: [] };
    let removeMemberResult: RemoveMemberResult = { error: [], ignoredMembers: [], removedMembers: [] };
    
    
    try {
        checkPathParamError(request.params.name, "project name");
        
        let reqMembers: EditMember = request.body;
        
        let modProject = await ProjectModel.findOne({ name: decodeURI(request.params.name) })
            .populate({ path: 'members.user', select: 'email -_id' })
            .exec();
        
        if (modProject) {
            if (reqMembers.inMember.length > 0) {
                addMemberResult = await addMember(reqMembers.inMember, modProject);
            }
            
            if (reqMembers.outMember.length > 0) {
                removeMemberResult = await removeMember(reqMembers.outMember, modProject);
            }
            
            if (addMemberResult.error.length === 0 && removeMemberResult.error.length === 0) {
                responseData.success = true;
                responseData.code = StatusCodes.CREATED;
                responseData.message = "Project members were modified.";
            } else {
                responseData.success = false;
                responseData.code = StatusCodes.BAD_REQUEST;
                responseData.message = "Errors occurred";
            }
            
            responseData.data = {
                addMemberResult: addMemberResult, removeMemberResult: removeMemberResult
            };
        } else {
            doProjectError("The target project does not exist.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.put("/:name/task", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    try {
        checkPathParamError(request.params.name, "project name");
        
        let reqTasks: TaskBody = request.body;
        
        let modProject = await ProjectModel.findOne({ name: decodeURI(request.params.name) }).exec();
        
        if (modProject) {
            await addTask(responseData, reqTasks, modProject);
        } else {
            responseData.success = false;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No task was added.";
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.delete("/:name/task/:type/:taskName", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    try {
        checkPathParamError(request.params.name, "project name");
        checkPathParamError(request.params.name, "project category");
        checkPathParamError(request.params.name, "task name");
        
        let modProject = await ProjectModel.findOne({ name: decodeURI(request.params.name) }).exec();
        
        if (modProject) {
            await removeTask(responseData, decodeURI(request.params.type), decodeURI(request.params.taskName), modProject);
        } else {
            responseData.success = false;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No tasks were removed.";
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.delete("/", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    try {
        checkArray(request.body.names);
        
        let result = await ProjectModel.deleteMany({ name: { $in: request.body.names } }).exec();
        
        responseData.success = true;
        
        if (result.deletedCount > 0) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.data = result;
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No project was deleted.";
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.delete("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    try {
        checkPathParamError(request.params.name, "project name");
        
        let delProject = await ProjectModel.findOneAndDelete({ name: decodeURI(request.params.name) }).exec();
        
        responseData.success = true;
        
        if (delProject) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No project was deleted.";
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

interface EditMember {
    inMember: { user: string, role: 'member' | 'attendee' }[];
    outMember: string[];
}

interface TaskBody {
    type: 'structural' | 'text' | 'vision';
    task: object
}

const testUser = {
    _id: "6182210d0befc34adfa2c8cf",
    accountType: "user"
};

interface AddMemberResult {
    error: any[];
    addedMembers: string[];
    ignoredMembers: string[];
}

interface RemoveMemberResult {
    error: any[];
    removedMembers: string[];
    ignoredMembers: string[];
};

export default router;