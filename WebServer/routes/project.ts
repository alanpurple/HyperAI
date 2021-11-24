import { Request, Response, Router } from 'express';
import { Project, ProjectModel, StructuralTask, TextTask, VisionTask } from "../models/project";
import { ReasonPhrases, StatusCodes, } from 'http-status-codes';
import { ResponseData } from "../interfaces/ResponseData";
import { RequestProject } from "../interfaces/ProjectRequest";
import { Document, Types } from 'mongoose';
import { User, UserModel } from "../models/user";
import { ensureAuthenticated } from "../authentication/authentication";

const logger = require("../logger/logger")("project");
const router = Router();

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
    
    try {
        let filter = isAdmin(request.user["accountType"]) ? {} : { $or: [{ owner: request.user['_id'] }, { "members.user": request.user['_id'] }] };
        
        let projects = await ProjectModel
            .find(filter, { _id: false, __v: false })
            .populate({ path: 'owner', select: 'email -_id' })
            .populate({ path: 'members.user', select: 'email -_id' })
            .exec();
        
        responseData.success = true;
        
        if (projects.length > 0) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.count = projects.length;
            
            let projectArray = [];
            projects.forEach(project => projectArray.push(makeProjectResponse(<User>request.user, project)));
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

router.get("/:name", async (request: Request, response: Response) => {
    let responseData = new ResponseData();
    
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    try {
        checkPathParamError(request.params.name, "project name");
        
        let filter = { name: decodeURI(request.params.name) };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { $or: [{ owner: request.user['_id'] }, { "members.user": request.user['_id'] }] });
        
        let project = await ProjectModel
            .findOne(filter, { _id: 0 })
            .populate({ path: 'owner', select: 'email -_id' })
            .populate({ path: 'members.user', select: 'email -_id' })
            .exec();
        
        responseData.success = true;
        
        if (project && Object.keys(project).length > 0) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.data = makeProjectResponse(<User>request.user, project);
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

router.post("/", async (request: Request, response: Response) => {
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
            await ProjectModel.create(projectModel);
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

router.put("/:name/members", async (request: Request, response: Response) => {
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    let responseData = new ResponseData();
    
    let addMemberResult: AddMemberResult = { error: [], addedMembers: [], ignoredMembers: [] };
    let removeMemberResult: RemoveMemberResult = { error: [], ignoredMembers: [], removedMembers: [] };
    
    try {
        checkPathParamError(request.params.name, "project name");
        
        let filter = { name: decodeURI(request.params.name) };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { owner: request.user['_id'] });
        
        let reqMembers: EditMember = request.body;
        
        let modProject = await ProjectModel.findOne(filter)
            .populate({ path: 'members.user', select: 'email -_id' })
            .exec();
        
        if (modProject) {
            const removable = checkMemberRemovability(modProject.members.map(member => member.user["email"]), reqMembers.inMember.map(e => e.user));
            
            if (reqMembers.inMember.length > 0) {
                addMemberResult = await addMember(reqMembers.inMember, modProject);
            }
            
            if (reqMembers.outMember.length > 0) {
                removeMemberResult = await removeMember(reqMembers.outMember, modProject, removable);
            }
            
            if (addMemberResult.error.length === 0 && removeMemberResult.error.length === 0) {
                responseData.success = true;
                responseData.code = StatusCodes.CREATED;
                if (addMemberResult.ignoredMembers.length > 0 || removeMemberResult.ignoredMembers.length > 0) {
                    responseData.message = "Some or all requests were ignored.";
                } else {
                    responseData.message = "Project members were modified.";
                }
                responseData.data = {
                    addMemberResult: addMemberResult, removeMemberResult: removeMemberResult
                };
            } else {
                doProjectError(`Errors occurred - add: ${addMemberResult.error.join()}, remove: ${removeMemberResult.error.join()}`);
            }
            
        } else {
            doUnauthorizedError("Insufficient permission to edit project member.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.put("/:name/task", async (request: Request, response: Response) => {
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    let responseData = new ResponseData();
    let updateResult = undefined;
    
    try {
        checkPathParamError(request.params.name, "project name");
        
        let filter = { name: decodeURI(request.params.name) };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { owner: request.user['_id'] });
        
        let reqTasks: TaskBody = request.body;
        
        let modProject = await ProjectModel.findOne(filter).exec();
        
        if (modProject) {
            updateResult = await addTask(reqTasks, modProject);
            
            if (updateResult) {
                responseData.success = true;
                responseData.code = StatusCodes.CREATED;
            } else {
                responseData.success = false;
                responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                responseData.message = "Uncaught error occurred.";
            }
        } else {
            doUnauthorizedError("Insufficient permission to add project task.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.put("/:name/task/:taskName", async (request: Request, response: Response) => {
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    let responseData = new ResponseData();
    let updateResult = undefined;
    
    try {
        checkPathParamError(request.params.name, "project name");
        checkPathParamError(request.params.taskName, "task name");
        
        let filter = { name: decodeURI(request.params.name) };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { owner: request.user['_id'] });
        
        let reqTasks: TaskBody = request.body;
        
        let modProject = await ProjectModel.findOne(filter).exec();
        
        if (modProject) {
            updateResult = await editTask(decodeURI(request.params.taskName), reqTasks, modProject);
            
            if (updateResult) {
                responseData.success = true;
                responseData.code = StatusCodes.CREATED;
            } else {
                responseData.success = false;
                responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                responseData.message = "Uncaught error occurred.";
            }
        } else {
            doUnauthorizedError("Insufficient permission to edit project task.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.delete("/:name/task/:type/:taskName", async (request: Request, response: Response) => {
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    let responseData = new ResponseData();
    let updateResult = undefined;
    
    try {
        checkPathParamError(request.params.name, "project name");
        checkPathParamError(request.params.type, "project category");
        checkPathParamError(request.params.taskName, "task name");
        
        let filter = { name: decodeURI(request.params.name) };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { owner: request.user['_id'] });
        
        let modProject = await ProjectModel.findOne(filter).exec();
        
        if (modProject) {
            updateResult = await removeTask(decodeURI(request.params.type), decodeURI(request.params.taskName), modProject);
            
            if (updateResult) {
                responseData.success = true;
                responseData.code = StatusCodes.CREATED;
            } else {
                responseData.success = false;
                responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
                responseData.message = "Uncaught error occurred.";
            }
        } else {
            doUnauthorizedError("Insufficient permission to delete project task.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.delete("/", async (request: Request, response: Response) => {
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    let responseData = new ResponseData();
    
    try {
        checkArray(request.body.names);
        
        let filter = { name: { $in: request.body.names } };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { owner: request.user['_id'] });
        
        let result = await ProjectModel.deleteMany(filter).exec();
        
        responseData.success = true;
        
        if (result.deletedCount > 0) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.data = result;
        } else {
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = "No projects were deleted.";
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

router.delete("/:name", async (request: Request, response: Response) => {
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    let responseData = new ResponseData();
    
    try {
        checkPathParamError(request.params.name, "project name");
        
        let filter = { name: decodeURI(request.params.name) };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { owner: request.user['_id'] });
        
        let delProject = await ProjectModel.findOneAndDelete(filter).exec();
        
        responseData.success = true;
        
        if (delProject) {
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
        } else {
            doUnauthorizedError("Insufficient permission to delete project.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData);
        response.end();
    }
});

class ProjectError extends Error {
    constructor(message) {
        super(message);
        this.name = "ProjectError";
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnauthorizedError";
    }
}

const doProjectError = (message: string) => {
    throw new ProjectError(message);
};

const doUnauthorizedError = (message: string) => {
    throw new UnauthorizedError(message);
};

const doUncaughtError = (message: string) => {
    throw new Error(message);
};

/**
 * Generate error response messages
 * @param error
 * @param responseData
 * @return Generated data
 */
const makeErrorResult = (error, responseData: ResponseData) => {
    console.error(error);
    logger(error);
    
    responseData.success = false;
    if (error.name === "ValidationError" || error.name === "CastError" || error.name === "ProjectError") {
        responseData.code = StatusCodes.BAD_REQUEST;
    } else if (error.name === "UnauthorizedError") {
        responseData.code = StatusCodes.UNAUTHORIZED;
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

const isAdmin = (accountType: string) => {
    return accountType === "admin";
};

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

const makeProjectResponse = (user: User, project: Document<any, any, Project> & Project & { _id: Types.ObjectId; }) => {
    let isAdminOrMember = isAdmin(user.accountType) || (user.email !== project.owner["email"]);
    
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
        owner: isAdminOrMember ? project.owner["email"] : "self",
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

const checkMemberRemovability = (current: string[], add: string[]) => {
    const difference: string[] = add.filter(e => !current.includes(e));
    return difference.length > 0
};

const addMember = async (inMembers: { user: string, role: 'member' | 'attendee' }[], project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    try {
        let addMemberResult: AddMemberResult = { error: [], addedMembers: [], ignoredMembers: [] };
        const options = { lean: true, new: true, rawResult: true };
        
        // Check if the target to be removed exists
        let currentMemberEmails: string[] = project.members.map(member => member.user["email"]);
        let inMemberEmails: string[] = inMembers.map(e => e.user);
        const difference: string[] = inMemberEmails.filter(e => !currentMemberEmails.includes(e));
        
        if (difference.length > 0) {
            for (let member of inMembers) {
                let user = await UserModel.findOne({ email: member.user }).exec();
                
                if (user) {
                    let foundIndex = currentMemberEmails.findIndex(email => email === user.email);
                    
                    if (foundIndex < 0) {
                        let updateResult = await project.updateOne(
                            { $push: { "members": { user: user._id, role: member.role } } }, options
                        ).exec();
    
                        if (!updateResult) {
                            addMemberResult.error.push(`An error occurred while adding member '${ member.user }'.`);
                        } else {
                            logger(`User '${ member.user }' is added.`);
                            addMemberResult.addedMembers.push(member.user);
                        }
                    } else {
                        addMemberResult.ignoredMembers.push(`${ member.user }: already exists.`);
                    }
                } else {
                    addMemberResult.ignoredMembers.push(`${ member.user }: not found.`);
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

const removeMember = async (outMembers: string[], project: Document<any, any, Project> & Project & { _id: Types.ObjectId }, removable: boolean) => {
    try {
        let removeMemberResult: RemoveMemberResult = { error: [], ignoredMembers: [], removedMembers: [] };
        const options = { lean: true, new: true, rawResult: true };
        
        // Check if the target to be removed exists
        let currentMemberEmails: string[] = project.members.map(member => member.user["email"]);
        const intersection: string[] = currentMemberEmails.filter(e => outMembers.includes(e));
        
        if (intersection.length > 0 && (currentMemberEmails.length > intersection.length) || removable) {
            for (let member of outMembers) {
                let user = await UserModel.findOne({ email: member }).exec();
                
                if (user) {
                    let updateResult = await project.updateOne(
                        { $pull: { "members": { user: user._id } } }, options
                    ).exec();
                    
                    if (!updateResult) {
                        removeMemberResult.error.push(`An error occurred while removing member '${ member }'.`);
                    } else {
                        logger(`User '${ member }' is removed.`);
                        removeMemberResult.removedMembers.push(member);
                    }
                } else {
                    logger(`User '${ member }' not found.`);
                    removeMemberResult.ignoredMembers.push(`${ member }: not found.`);
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

const checkTasksCanBeAdded = (tasks: Array<any>, taskName: string) => !(tasks.findIndex(elem => elem.name === taskName) >= 0);

const addTask = async (task: TaskBody, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    try {
        let tasksCanBeAdded: boolean = false;
        let updateResult = undefined;
        const options = { lean: true, new: true, rawResult: true };
        
        switch (task.type) {
            case "vision":
                const visionTask = task.task as VisionTask;
                tasksCanBeAdded = checkTasksCanBeAdded(project.visionTasks, visionTask.name);
                if (tasksCanBeAdded) {
                    let newVisionTask: VisionTask = {
                        completed: visionTask.completed,
                        includeMask: visionTask.includeMask,
                        name: visionTask.name,
                        preprocessed: visionTask.preprocessed,
                        taskType: visionTask.taskType
                    };
                    
                    updateResult = await project.updateOne(
                        { $push: { visionTasks: newVisionTask } }, options
                    ).exec();
                }
                
                break;
            case "text":
                const textTask = task.task as TextTask;
                tasksCanBeAdded = checkTasksCanBeAdded(project.textTasks, textTask.name);
                if (tasksCanBeAdded) {
                    let newTextTask: TextTask = {
                        name: textTask.name,
                        taskType: textTask.taskType
                    };
                    
                    updateResult = await project.updateOne(
                        { $push: { textTasks: newTextTask } }, options
                    ).exec();
                }
                
                break;
            case "structural":
                const structuralTask = task.task as StructuralTask;
                tasksCanBeAdded = checkTasksCanBeAdded(project.structuralTasks, structuralTask.name);
                if (tasksCanBeAdded) {
                    let newStructuralTask: StructuralTask = {
                        name: structuralTask.name,
                        taskType: structuralTask.taskType
                    };
                    
                    updateResult = await project.updateOne(
                        { $push: { structuralTasks: newStructuralTask } }, options
                    ).exec();
                }
                
                break;
            default:
                doProjectError(`The requested category '${ task.type }' is not supported.`);
                break;
        }
        
        if (!tasksCanBeAdded) doProjectError("The task name already exists.");
        if (!updateResult) doUncaughtError("Some errors occurred");
        
        return updateResult;
    } catch (error) {
        throw error;
    }
};

const editTask = async (taskName: string, task: TaskBody, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    try {
        let foundIndex = -1;
        let updateResult = undefined;
        const options = { lean: true, new: true, rawResult: true };
        const projectObj = project.toObject();
        let tasks: any[] = [];
        
        switch (task.type) {
            case "vision":
                tasks = projectObj.visionTasks;
                foundIndex = tasks.findIndex(task => task.name === taskName);
                if (foundIndex >= 0) {
                    let targetTask = tasks[foundIndex];
                    tasks[foundIndex] = Object.assign({}, targetTask, task.task);
                    
                    updateResult = await project.updateOne(
                        { $set: { visionTasks: tasks } }, options
                    ).exec();
                }
                
                break;
            case "text":
                tasks = projectObj.textTasks;
                foundIndex = tasks.findIndex(task => task.name === taskName);
                if (foundIndex >= 0) {
                    let targetTask = tasks[foundIndex];
                    tasks[foundIndex] = Object.assign({}, targetTask, task.task);
                    
                    updateResult = await project.updateOne(
                        { $set: { textTasks: tasks } }, options
                    ).exec();
                }
                
                break;
            case "structural":
                tasks = projectObj.structuralTasks;
                foundIndex = tasks.findIndex(task => task.name === taskName);
                if (foundIndex >= 0) {
                    let targetTask = tasks[foundIndex];
                    tasks[foundIndex] = Object.assign({}, targetTask, task.task);
                    
                    updateResult = await project.updateOne(
                        { $set: { structuralTasks: tasks } }, options
                    ).exec();
                }
                
                break;
            default:
                doProjectError(`The requested category '${ task.type }' is not supported.`);
                break;
        }
        
        if (foundIndex < 0) doProjectError(`The task '${ taskName }' does not exist.`);
        if (!updateResult) doUncaughtError("Some errors occurred");
        
        return updateResult;
    } catch (error) {
        throw error;
    }
};

const checkTasksRemovable = (length: number): boolean => {
    const MIN_REMOVABLE_LENGTH = 2;
    return !(length < MIN_REMOVABLE_LENGTH);
};

const removeTask = async (type: string, taskName: string, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    try {
        let tasksRemovable: boolean = false;
        let updateResult = undefined;
        /*
         <updateResult sample>
         updateResult = {
          "acknowledged": true,
          "modifiedCount": 1,
          "upsertedId": null,
          "upsertedCount": 0,
          "matchedCount": 1
        }
         */
        const options = { lean: true, new: true, rawResult: true };
        
        switch (type) {
            case "vision":
                tasksRemovable = checkTasksRemovable(project.visionTasks.length);
                if (tasksRemovable) {
                    updateResult = await project.updateOne(
                        { $pull: { visionTasks: { name: taskName } } }, options
                    ).exec();
                }
                
                break;
            case "text":
                tasksRemovable = checkTasksRemovable(project.textTasks.length);
                if (tasksRemovable) {
                    updateResult = await project.updateOne(
                        { $push: { textTasks: { name: taskName } } }, options
                    ).exec();
                }
                
                break;
            case "structural":
                tasksRemovable = checkTasksRemovable(project.structuralTasks.length)
                if (tasksRemovable) {
                    updateResult = await project.updateOne(
                        { $push: { structuralTasks: { name: taskName } } }, options
                    ).exec();
                }
                
                break;
            default:
                doProjectError(`The requested category '${ type }' is not supported.`);
                break;
        }
        
        if (!tasksRemovable) doProjectError("Project must have at least one task.");
        if (!updateResult) doUncaughtError("Some errors occurred");
        
        return updateResult;
    } catch (error) {
        throw error;
    }
};

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
    accountType: "user",
    email: "soorong@infinov.com"
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
}

export default router;