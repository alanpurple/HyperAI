import { NextFunction, Request, Response, Router } from 'express';
import { User, UserModel } from "../models/user";
import Debug from "debug";
import { ResponseData } from "../interfaces/ResponseData";
import { WebError } from "../interfaces/Errors";
import { ProjectModel } from "../models/project";
import { removeMember } from './project';
import { ensureAdminAuthenticated } from "../authentication/authentication";
import * as bcrypt from 'bcrypt';
import { sequelize as database } from "../connect-rdb";
// import { QueryTypes, QueryInterface, QueryInterfaceDropTableOptions } from "sequelize";

const NUM_ROUNDS: number = 10;
const ADMIN_ERROR: string = "AdminError";

const debug = Debug("admin");
const router = Router();

const env = process.env.NODE_ENV || 'production';
if (env === 'production') {
    router.all("*", ensureAdminAuthenticated);
}

router.get("/user", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    try {
        let users = await UserModel.find({}, '-_id').exec();
        
        if (users.length > 0) {
            responseData.success = true;
            responseData.code = 200;
            responseData.message = 'ok';
            responseData.count = users.length;
            responseData.data = users;
        } else {
            responseData.success = false;
            responseData.code = 404;
            responseData.message = 'no users found';
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
            responseData.code = 200;
            responseData.message = 'user found and sent';
            responseData.data = user;
        } else {
            responseData.success = false;
            responseData.code = 404;
            responseData.message = 'no such user found';
        }
    } catch (error) {
        makeErrorResult(error, responseData);
    } finally {
        response.status(responseData.code).send(responseData.data);
        response.end();
    }
});

router.post("/user", async (request: Request, response: Response) => {
        const responseData = new ResponseData();
        
        try {
            const data = request.body.data;
            if (!data.email || !data.name || !request.body.password || !data.organization) {
                response.status(400).send('not all required property has been entered');
                return;
            }
            let reqUser: any = {
                email: data.email, name: data.name,
                password: request.body.password,
                organization: data.organization
            };
            if (data.nickName)
                reqUser.nickName = data.nickName;
            if (data.accountType)
                reqUser.accountType = data.accountType;
            
            let user = await UserModel.findOne({ email: reqUser.email }).exec();
            
            if (!user) {
                await UserModel.create(reqUser);
                
                responseData.success = true;
                responseData.code = 201;
                responseData.message = 'user created';
            } else {
                new WebError('User already exists.', ADMIN_ERROR).throw();
            }
        } catch (error) {
            makeErrorResult(error, responseData);
        } finally {
            response.status(responseData.code).send(responseData.message);
            response.end();
        }
    },
);

router.put("/user/:email", async (request: Request, response: Response) => {
    const responseData = new ResponseData();
    
    try {
        let user = await UserModel.findOne({ email: request.params.email }).exec();
        
        if (user) {
            const modification = request.body;
            let userObj = user.toObject();
            userObj = Object.assign({}, userObj, modification);
            
            // await user.updateOne(userObj);
            
            userObj.password = await bcrypt.hash(userObj.password, NUM_ROUNDS);
            console.log(userObj.password);
            await UserModel.findOneAndUpdate({ email: request.params.email }, userObj);
            
            responseData.success = true;
            responseData.code = 200;
            responseData.message = 'user info updated';
        } else {
            new WebError('User not found', ADMIN_ERROR).throw();
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
    responseData.code = 501;
    
    response.status(501).send('anonymous deletion not available');
    response.end();
});

router.delete("/user/:email", async (request: Request, response: Response) => {
    console.log(request.body);
    const responseData = new ResponseData();
    
    try {
        let user = await UserModel.findOne({ email: decodeURI(request.params.email) }).exec();
        
        if (user) {
            let ownerProjects = await ProjectModel
                .find({ owner: user['_id'] })
                .populate({ path: 'owner', select: 'email -_id' })
                .populate({ path: 'members.user', select: 'email -_id' })
                .exec();
            
            if (ownerProjects.length > 0) {
                // for (const project of ownerProjects) {
                await ProjectModel.deleteMany({owner: user['_id']}).exec();
                // }
            }
            
            let memberProjects = await ProjectModel
                .find({ 'members.user': user['_id'] })
                .populate({ path: 'owner', select: 'email -_id' })
                .populate({ path: 'members.user', select: 'email -_id' })
                .exec();
            
            if (memberProjects.length > 0) {
                for (const project of memberProjects) {
                    await removeMember([user.email], project);
                }
            }
            
            if (user.data.length > 0) {
                // const queryInterface = new QueryInterface(database);

                // del user's data table (DROP)
                // note: DROP TABLE causes an implicit commit, except when used with the TEMPORARY keyword.
                //       (https://dev.mysql.com/doc/refman/8.0/en/drop-table.html)
                await database.transaction(async (t) => {
                    // const dropTableOptions: QueryInterfaceDropTableOptions = {
                    //     transaction: t,
                    //     // force: true
                    // };

                    for (const data of user.data) {
                        // await queryInterface.dropTable(data.name, dropTableOptions);
                        await database.query('DROP TABLE ' + data.name);
                    }
                });
            }
            
            // todo: check mongodb environments
            // Transactions only support replica sets or sharded clusters environments. It doesn't work in standalone.
            await UserModel.findByIdAndDelete(user['_id']).exec();
            
            responseData.success = true;
            responseData.code = 200;
            responseData.message = 'user deleted';
        } else {
            new WebError('User not found.', ADMIN_ERROR).throw();
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
export const makeErrorResult = (error: any, responseData: ResponseData) => {
    console.error(error);
    
    responseData.success = false;
    if (error.name === "AdminError") {
        responseData.code = 400;
    } else if (error.name === "UnauthorizedError") {
        responseData.code = 401;
    } else {
        responseData.code = 500;
    }
    responseData.message = error.message;
};

export default router;