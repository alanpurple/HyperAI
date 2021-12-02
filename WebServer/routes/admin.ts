import { NextFunction, Request, Response, Router } from 'express';
import { User, UserModel } from "../models/user";
import { ReasonPhrases, StatusCodes, } from 'http-status-codes';
import Debug from "debug";
import { ResponseData } from "../interfaces/ResponseData";
import { AdminError } from "../interfaces/Errors";
import { ProjectModel } from "../models/project";
import { removeMember } from './project';
import { ensureAdminAuthenticated } from "../authentication/authentication";

const debug = Debug("admin");
const router = Router();

router.all("*", ensureAdminAuthenticated);

router.get("/user", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    try {
        let users = await UserModel.find({}, { _id: 0 }).exec();
        
        if (users.length > 0) {
            responseData.success = true;
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.count = users.length;
            responseData.data = users;
        } else {
            responseData.success = false;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = ReasonPhrases.NOT_FOUND;
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code).send(responseData.data);
        response.end();
    }
});

router.get("/user/:email", async (request: Request, response: Response, next: NextFunction) => {
    console.log(request.body);
    const responseData = new ResponseData();
    
    try {
        let user = await UserModel.findOne({ email: decodeURI(request.params.email) }, { _id: 0 }).exec();
        
        if (user) {
            responseData.success = true;
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.data = user;
        } else {
            responseData.success = false;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = ReasonPhrases.NOT_FOUND;
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code).send(responseData.data);
        response.end();
    }
});

router.post("/user", async (request: Request, response: Response) => {
    console.log(request.body);
    const responseData = new ResponseData();
    
    try {
        const reqUser: User = request.body.data;
        reqUser.password = request.body.password;
        
        let user = await UserModel.findOne({ email: reqUser.email }).exec();
        
        if (!user) {
            let userModel = new UserModel(reqUser);
            await UserModel.create(userModel);
            
            responseData.success = true;
            responseData.code = StatusCodes.CREATED;
            responseData.message = ReasonPhrases.CREATED;
        } else {
            new AdminError('User already exists.').throw();
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code).send(responseData.message);
        response.end();
    }},
);

router.put("/user/:email", async (request: Request, response: Response) => {
    console.log(request.body);
    const responseData = new ResponseData();
    
    try {
        let user = await UserModel.findOne({ email: request.params.email }).exec();
        
        if (user) {
            const modification = request.body;
            let userObj = user.toObject();
            userObj = Object.assign({}, userObj, modification);
            
            await user.updateOne(userObj).exec();
            
            responseData.success = true;
            responseData.code = StatusCodes.CREATED;
            responseData.message = ReasonPhrases.CREATED;
        } else {
            new AdminError('User not found').throw();
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code).send(responseData.message);
        response.end();
    }
});

router.delete("/user", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    responseData.success = false;
    responseData.code = StatusCodes.NOT_IMPLEMENTED;
    responseData.message = ReasonPhrases.NOT_IMPLEMENTED;
    
    response.status(StatusCodes.NOT_IMPLEMENTED).send(responseData.message);
    response.end();
});

router.delete("/user/:email", async (request: Request, response: Response) => {
    console.log(request.body);
    const responseData = new ResponseData();
    
    try {
        let user = await UserModel.findOne({ email: decodeURI(request.params.email) }).exec();
        
        if (user) {
            let projects = await ProjectModel
                .find({ $or: [{ owner: user['_id'] }, { 'members.user': user['_id'] }] })
                .populate({ path: 'owner', select: 'email -_id' })
                .populate({ path: 'members.user', select: 'email -_id' })
                .exec();
            
            let deleteUserWithProjects: number = 0;
            if (projects.length > 0) {
                for (const project of projects) {
                    await removeMember([user.email], project);
                    deleteUserWithProjects++;
                }
            }
            if (deleteUserWithProjects > 0) {
                debug(`The user '${ user.email }' removed from ${ deleteUserWithProjects } projects.`);
            }
            
            // if (user.data.length > 0) {
            //     const queryInterface = new QueryInterface(database);
            //
            //     // del user's data table (DROP)
            //     // note: DROP TABLE causes an implicit commit, except when used with the TEMPORARY keyword.
            //     //       (https://dev.mysql.com/doc/refman/8.0/en/drop-table.html)
            //     await database.transaction(async (t) => {
            //         const dropTableOptions: QueryInterfaceDropTableOptions = {
            //             transaction: t,
            //             // force: true
            //         };
            //
            //         for (const data of user.data) {
            //             await queryInterface.dropTable(data.name, dropTableOptions);
            //         }
            //     });
            // }
            
            // todo: check mongodb environments
            // Transactions only support replica sets or sharded clusters environments. It doesn't work in standalone.
            await UserModel.findByIdAndDelete(user['_id']).exec();
            
            responseData.success = true;
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
        } else {
            new AdminError('User not found.').throw();
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code).send(responseData.message);
        response.end();
    }
});

/**
 * Generate error response messages
 * @param error
 * @param responseData
 * @return Generated data
 */
const makeErrorResult = (error: any, responseData: ResponseData) => {
    console.error(error);
    
    responseData.success = false;
    if (error.name === "AdminError") {
        responseData.code = StatusCodes.BAD_REQUEST;
    } else if (error.name === "UnauthorizedError") {
        responseData.code = StatusCodes.UNAUTHORIZED;
    } else {
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
    }
    responseData.message = error.message;
};

export default router;