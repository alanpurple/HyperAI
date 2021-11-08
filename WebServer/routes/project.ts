import {Router, Request, Response, NextFunction} from 'express';
import {Project, ProjectModel} from "../models/project";
import {ReasonPhrases, StatusCodes,} from 'http-status-codes';
import Debug from "debug";
import {ensureAuthenticated} from "../authentication/authentication";
import {ResponseData} from "../interfaces/ResponseData";
import {Document, Types} from 'mongoose';

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

// User authentication checks before processing all project requests.
// Temporary comments for testing
// router.all("*", ensureAuthenticated);

router.get("/", async (request: Request, response: Response) => {
    let responseData = new ResponseData();
    debug(request.user);
    
    try {
        let projects = await ProjectModel
            .find({/*"owner": request.user['_id']*/}, {_id: 0})
            .populate({path: 'owner', select: 'email -_id'})
            .populate({path: 'members.user', select: 'email -_id'})
            .exec();
        
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
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        debug("############## responseData -", responseData);
        response.send(responseData);
        response.end();
    }
});

router.get("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    try {
        let project = await ProjectModel
            .findOne({name: decodeURI(request.params.name)/*, "owner": request.user['_id']*/}, {_id: 0})
            .populate({path: 'owner', select: 'email -_id'})
            .populate({path: 'members.user', select: 'email -_id'})
            .exec();
        
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
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData);
        response.end();
    }
});

router.post("/", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    let projectModel = new ProjectModel(request.body);
    debug("projectModel: ", projectModel);
    
    let validation = modelValidationError(projectModel);
    if (validation.withError) {
        return next(validation.error);
    }
    
    try {
        let project = await ProjectModel.findOne({name: request.body.name}).exec();
        
        if (!project) {
            let newProject = await ProjectModel.create(projectModel);
            
            responseData.success = true;
            responseData.code = StatusCodes.CREATED;
            responseData.message = ReasonPhrases.CREATED;
            
            await newProject.populate({path: 'owner', select: 'email -_id'});
            await newProject.populate({path: 'members.user', select: 'email -_id'});
            
            let projectData = newProject.toObject();
            delete projectData._id || delete projectData["_id"];
            responseData.data = projectData;
            
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

router.put("/:name", async (request: Request, response: Response, next: NextFunction) => {
    let responseData = new ResponseData();
    
    if (pathParamError(request.params.name)) {
        return next(new Error("Project name error."));
    }
    
    let projectModel = new ProjectModel(request.body, null, {skipId: true});
    debug("projectModel: ", projectModel);
    
    let validation = modelValidationError(projectModel);
    if (validation.withError) {
        return next(validation.error);
    }
    
    // todo: 프로젝트 이름 변경 시 기존 이름과 중복 오류를 따로 처리할 지..?
    
    try {
        let modProject = await ProjectModel
            .findOneAndUpdate({name: decodeURI(request.params.name)}, projectModel, {returnOriginal: false})
            .exec();
        
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
        let result = await ProjectModel.deleteMany({name: {$in: names}}).exec();
        
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
        let delProject = await ProjectModel.findOneAndDelete({name: decodeURI(request.params.name)}).exec();
        
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
    } catch (error) {
        responseData = makeErrorResult(error, response);
    } finally {
        response.send(responseData);
        response.end();
    }
});

interface EditMember {
    inMember: string[];
    outMember: string[];
}


export default router;