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
            projects.forEach(project => projectArray.push(makeProjectResponse(request.user as User, project)));
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
            response.send(responseData.message);
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
            response.send(responseData.message);
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
        const reqProject: RequestProject = request.body;
        
        if (!isValidObjective(reqProject.objective, reqProject.category)) doProjectError("The objective cannot be used for the specified category.");
        
        const projectSchema = await convertToProjectSchema(request.user, reqProject);
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
        response.send(responseData.message);
        response.end();
    }
});

/***********************
 * ***** caution!!  automl function is only temporary and not generally applicable ( yet )
 * 
 * AutoML is a very very sophisticated job and cannot be implemented easily,  and should be carefully designed and studied before development start
 * 
 * this routine is just a temporary medication for demo and not be used for real job.
 * this codes is just for the future roadmap
 * 
 * *********************/
router.get('/:name/automl', async (req: Request, res: Response) => {
    const projectName = req.params.name;
    try {
        let project = await ProjectModel.findOne({ name: projectName });
        if (project.category == 'various') {
            res.status(501).send('various type is not supported yet');
            return;
        }
        let tasks: any[];
        switch (project.category) {
            case 'structural':
                res.status(501).send('not implemented yet');
                return;
                /*tasks = project.structuralTasks;
                tasks.push([{
                    }
                ])
                break;*/
            case 'text':
                res.status(501).send('not implemented yet');
                return;
                /*tasks = project.textTasks;
                break;*/
            case 'vision':
                tasks = project.visionTasks;
                if (project.objective != 'segmentation') {
                    res.status(501).send('not implemented yet');
                    return;
                }
                project.visionTasks.push({
                    name: 'masked rcnn preprocessing',
                    description: 'make tfrecord',
                    taskType: 'preprocess',
                    include_mask: true,
                    train_dir: 'train2017',
                    val_dir: 'val2017',
                    test_dir: 'test2017',
                    train_anno: 'annotations/captions_train2017.json',
                    val_anno: 'annotations/captions_val2017.json',
                    // unused params
                    batch_size: 0,
                    no_xla: false,
                    use_amp: false,
                    preprocessed: ['train2017','val2017','test2017'],
                    completed: false,
                    model_params: null,
                    tb_port: undefined
                });
                project.visionTasks.push({
                    name: 'masked rcnn training',
                    description: 'seg training using tensorflow',
                    taskType: 'train',
                    // redundant and meaningless since preprocessing defines this
                    include_mask: true,
                    train_dir: '',
                    val_dir: '',
                    test_dir: '',
                    train_anno: '',
                    val_anno: '',
                    batch_size: 512,
                    no_xla: false,
                    use_amp: true,
                    preprocessed: [],
                    completed: false,
                    model_params: {
                        min_level: 2,
                        max_level: 6,
                        augment_input_data: true,
                        skip_crowd: true,
                        use_category: true
                    },
                    tb_port: 6006
                });
                project.visionTasks.push({
                    name: 'mask rcnn test',
                    description: 'test trained model',
                    taskType: 'test',
                    include_mask: false,
                    train_dir: '',
                    val_dir: '',
                    test_dir: '',
                    train_anno: '',
                    val_anno: '',
                    batch_size: 0,
                    no_xla: false,
                    use_amp: false,
                    preprocessed: [],
                    completed: false,
                    model_params: null,
                    tb_port: undefined
                });
                project.visionTasks.push({
                    name: 'rcnn deploy',
                    description: 'deploy mask rcnn to tfx',
                    taskType: 'deploy',
                    include_mask: false,
                    train_dir: '',
                    val_dir: '',
                    test_dir: '',
                    train_anno: '',
                    val_anno: '',
                    batch_size: 0,
                    no_xla: false,
                    use_amp: false,
                    preprocessed: [],
                    completed: false,
                    model_params: null,
                    tb_port: undefined
                });
                break;
            // currently unreachable code
            //case 'various':
            //    break;

        }
        console.dir(tasks);
        await project.save();
        res.send(tasks);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
})

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
            if (reqMembers.inMember.length > 0) {
                addMemberResult = await addMember(reqMembers.inMember, modProject);
            }
            
            if (reqMembers.outMember.length > 0) {
                removeMemberResult = await removeMember(reqMembers.outMember, modProject);
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
        response.send(responseData.message);
        response.end();
    }
});

router.put("/:name/task", async (request: Request, response: Response) => {
    logger(request.body);
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
        
        let reqTasks: TaskBody = request.body;
        
        let modProject = await ProjectModel.findOne(filter).exec();
        
        if (modProject) {
            await addTask(reqTasks, modProject);
            
            responseData.success = true;
            responseData.code = StatusCodes.CREATED;
        } else {
            doUnauthorizedError("Insufficient permission to add project task.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData.message);
        response.end();
    }
});

router.put("/:name/task/:taskName", async (request: Request, response: Response) => {
    logger(request.body);
    if (env === 'development') {
        if (!request.user) {
            request.user = testUser;
        }
    }
    
    let responseData = new ResponseData();
    
    try {
        checkPathParamError(request.params.name, "project name");
        checkPathParamError(request.params.taskName, "task name");
        
        let filter = { name: decodeURI(request.params.name) };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { owner: request.user['_id'] });
        
        let reqTasks: TaskBody = request.body;
        
        let modProject = await ProjectModel.findOne(filter).exec();
        
        if (modProject) {
            await editTask(decodeURI(request.params.taskName), reqTasks, modProject);
            
            responseData.success = true;
            responseData.code = StatusCodes.CREATED;
        } else {
            doUnauthorizedError("Insufficient permission to edit project task.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData.message);
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
    
    try {
        checkPathParamError(request.params.name, "project name");
        checkPathParamError(request.params.type, "project category");
        checkPathParamError(request.params.taskName, "task name");
        
        let filter = { name: decodeURI(request.params.name) };
        filter = isAdmin(request.user["accountType"]) ? filter : Object.assign({}, filter, { owner: request.user['_id'] });
        
        let modProject = await ProjectModel.findOne(filter).exec();
        
        if (modProject) {
            await removeTask(decodeURI(request.params.type), decodeURI(request.params.taskName), modProject);
            
            responseData.success = true;
            responseData.code = StatusCodes.CREATED;
        } else {
            doUnauthorizedError("Insufficient permission to delete project task.");
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code);
        response.send(responseData.message);
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
        response.send(responseData.message);
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
        response.send(responseData.message);
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
        objective: project.objective,
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
    let admin = isAdmin(user.accountType);
    
    if (admin) {
        let owner = await UserModel.findOne({ email: reqProject.owner }).exec();
        
        reqProject.owner = owner['_id'];
    }
    
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
        owner: admin ? reqProject.owner : user["_id"],
        projectType: reqProject.projectType,
        objective: reqProject.objective,
        structuralTasks: reqProject.structuralTasks,
        textTasks: reqProject.textTasks,
        visionTasks: reqProject.visionTasks
    };
    
    return projectSchema;
};

const addMember = async (inMembers: { user: string, role: 'member' | 'attendee' }[], project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
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
                    await project.updateOne({ $push: { "members": { user: user._id, role: member.role } } }, options).exec();
                    
                    logger(`User '${ member.user }' is added.`);
                    addMemberResult.addedMembers.push(member.user);
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
};

export const removeMember = async (outMembers: string[], project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    let removeMemberResult: RemoveMemberResult = { error: [], ignoredMembers: [], removedMembers: [] };
    const options = { lean: true, new: true, rawResult: true };
    
    // Check if the target to be removed exists
    let currentMemberEmails: string[] = project.members.map(member => member.user["email"]);
    const intersection: string[] = currentMemberEmails.filter(e => outMembers.includes(e));
    
    if (intersection.length > 0) {
        for (let member of outMembers) {
            let user = await UserModel.findOne({ email: member }).exec();
            
            if (user) {
                await project.updateOne({ $pull: { "members": { user: user._id } } }, options).exec();
                
                logger(`User '${ member }' is removed.`);
                removeMemberResult.removedMembers.push(member);
            } else {
                logger(`User '${ member }' not found.`);
                removeMemberResult.ignoredMembers.push(`${ member }: not found.`);
            }
        }
    } else {
        removeMemberResult.error.push("No project members to remove.");
    }
    
    return removeMemberResult;
};

const checkTasksCanBeAdded = (tasks: Array<any>, taskName: string) => !(tasks.findIndex(elem => elem.name === taskName) >= 0);

const addTask = async (task: TaskBody, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    let tasksCanBeAdded: boolean = false;
    const options = { lean: true, new: true, rawResult: true };
    
    switch (task.type) {
        case "vision":
            const visionTask = task.task as VisionTask;
            tasksCanBeAdded = checkTasksCanBeAdded(project.visionTasks, visionTask.name);
            if (tasksCanBeAdded) {
                let newVisionTask: VisionTask = {
                    completed: false,
                    description: visionTask.description,
                    name: visionTask.name,
                    preprocessed: visionTask.preprocessed,
                    taskType: visionTask.taskType,
                    include_mask: visionTask.include_mask,
                    train_dir: visionTask.train_dir,
                    val_dir: visionTask.val_dir,
                    test_dir: visionTask.test_dir,
                    train_anno: visionTask.train_anno,
                    val_anno: visionTask.val_anno,
                    batch_size: visionTask.batch_size,
                    no_xla: visionTask.no_xla,
                    use_amp: visionTask.use_amp,
                    model_params: visionTask.model_params,
                    tb_port: visionTask.tb_port
                };
                
                await project.updateOne(
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
                    description: textTask.description,
                    taskType: textTask.taskType
                };
                
                await project.updateOne(
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
                    description: structuralTask.description,
                    taskType: structuralTask.taskType
                };
                
                await project.updateOne(
                    { $push: { structuralTasks: newStructuralTask } }, options
                ).exec();
            }
            
            break;
        default:
            doProjectError(`The requested category '${ task.type }' is not supported.`);
            break;
    }
    
    if (!tasksCanBeAdded) doProjectError("The task name already exists.");
};

const editTask = async (taskName: string, task: TaskBody, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    let foundIndex = -1;
    const options = { lean: true, new: true, rawResult: true };
    const projectObj = project.toObject();
    let tasks: any[] = [];
    
    switch (task.type) {
        case "vision":
            tasks = projectObj.visionTasks;
            foundIndex = tasks.findIndex(task => task.name === taskName);
            if (foundIndex >= 0) {
                let targetTask = tasks[foundIndex];
                tasks[foundIndex] = Object.assign({}, targetTask, task.modification);
                
                await project.updateOne(
                    { $set: { visionTasks: tasks } }, options
                ).exec();
            }
            
            break;
        case "text":
            tasks = projectObj.textTasks;
            foundIndex = tasks.findIndex(task => task.name === taskName);
            if (foundIndex >= 0) {
                let targetTask = tasks[foundIndex];
                tasks[foundIndex] = Object.assign({}, targetTask, task.modification);
                
                await project.updateOne(
                    { $set: { textTasks: tasks } }, options
                ).exec();
            }
            
            break;
        case "structural":
            tasks = projectObj.structuralTasks;
            foundIndex = tasks.findIndex(task => task.name === taskName);
            if (foundIndex >= 0) {
                let targetTask = tasks[foundIndex];
                tasks[foundIndex] = Object.assign({}, targetTask, task.modification);
                
                await project.updateOne(
                    { $set: { structuralTasks: tasks } }, options
                ).exec();
            }
            
            break;
        default:
            doProjectError(`The requested category '${ task.type }' is not supported.`);
            break;
    }
    
    if (foundIndex < 0) doProjectError(`The task '${ taskName }' does not exist.`);
};

const removeTask = async (type: string, taskName: string, project: Document<any, any, Project> & Project & { _id: Types.ObjectId }) => {
    const options = { lean: true, new: true, rawResult: true };
    
    switch (type) {
        case "vision":
            await project.updateOne(
                { $pull: { visionTasks: { name: taskName } } }, options
            ).exec();
            
            break;
        case "text":
            await project.updateOne(
                { $pull: { textTasks: { name: taskName } } }, options
            ).exec();
        
            break;
        case "structural":
            await project.updateOne(
                { $pull: { structuralTasks: { name: taskName } } }, options
            ).exec();
            
            break;
        default:
            doProjectError(`The requested category '${ type }' is not supported.`);
            break;
    }
};

const isValidObjective = (objective: string, category: string) => {
    if (['qna', 'translation'].includes(objective) && category != 'text')
        return false;
    
    return !(['segmentation', 'object detection'].includes(objective) && category != 'vision');
};

interface EditMember {
    inMember: { user: string, role: 'member' | 'attendee' }[];
    outMember: string[];
}

interface TaskBody {
    type: 'structural' | 'text' | 'vision';
    task: object,
    modification: object
}

const testUser = {
    _id: "61a0533e89ecce461e25089e",
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