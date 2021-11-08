import { NextFunction, Request, Response, Router } from 'express';
import { User, UserModel } from "../models/user";
import { ReasonPhrases, StatusCodes, } from 'http-status-codes';
import Debug from "debug";
import { ensureAdminAuthenticated } from "../authentication/authentication";
import { ResponseData } from "../interfaces/ResponseData";
import { sequelize as database } from "../connect-rdb";
import { QueryTypes, QueryInterface, QueryInterfaceDropTableOptions } from "sequelize";

const debug = Debug("admin");
const router = Router();

router.all("*", ensureAdminAuthenticated);

router.get("/user", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    try {
        let users = await UserModel.find({}, { _id: 0 }).exec();
        
        if (users.length > 0) {
            debug("users::::", users);
            responseData.success = true;
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.count = users.length;
            responseData.data = users;
            
            response.status(StatusCodes.OK);
        } else {
            responseData.success = true;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = ReasonPhrases.NOT_FOUND;
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        debug("ERROR::::", error);
        responseData.success = false;
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
        responseData.message = ReasonPhrases.INTERNAL_SERVER_ERROR;
        
        response.status(StatusCodes.INTERNAL_SERVER_ERROR);
    } finally {
        response.send(responseData);
        response.end();
    }
});

router.get("/user/:email", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    try {
        let user = await UserModel.findOne({ email: decodeURI(request.params.email) }, { _id: 0 }).exec();
        
        if (user) {
            responseData.success = true;
            responseData.code = StatusCodes.OK;
            responseData.message = ReasonPhrases.OK;
            responseData.data = user;
            
            response.status(StatusCodes.OK);
        } else {
            responseData.success = true;
            responseData.code = StatusCodes.NOT_FOUND;
            responseData.message = ReasonPhrases.NOT_FOUND;
            
            response.status(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        debug("ERROR::::", error);
        responseData.success = false;
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
        responseData.message = ReasonPhrases.INTERNAL_SERVER_ERROR;
        
        response.status(StatusCodes.INTERNAL_SERVER_ERROR);
    } finally {
        response.send(responseData);
        response.end();
    }
});

router.post("/user", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    responseData.success = false;
    responseData.code = StatusCodes.NOT_IMPLEMENTED;
    responseData.message = ReasonPhrases.NOT_IMPLEMENTED;
    
    response.status(StatusCodes.NOT_IMPLEMENTED);
    response.send(responseData);
    response.end();
});

router.put("/user/:email", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    responseData.success = false;
    responseData.code = StatusCodes.NOT_IMPLEMENTED;
    responseData.message = ReasonPhrases.NOT_IMPLEMENTED;
    
    response.status(StatusCodes.NOT_IMPLEMENTED);
    response.send(responseData);
    response.end();
});

router.delete("/user", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    responseData.success = false;
    responseData.code = StatusCodes.NOT_IMPLEMENTED;
    responseData.message = ReasonPhrases.NOT_IMPLEMENTED;
    
    response.status(StatusCodes.NOT_IMPLEMENTED);
    response.send(responseData);
    response.end();
});

router.delete("/user/:email", async (request: Request, response: Response, next: NextFunction) => {
    const responseData = new ResponseData();
    
    try {
        const queryInterface = new QueryInterface(database);
        
        // del user's data table (DROP)
        // note: DROP TABLE causes an implicit commit, except when used with the TEMPORARY keyword.
        //       (https://dev.mysql.com/doc/refman/8.0/en/drop-table.html)
        const success: boolean = await database.transaction(async (t) => {
            const dropTableOptions: QueryInterfaceDropTableOptions = {
                transaction: t,
                // force: true
            };
            await queryInterface.dropTable("table", dropTableOptions);
            
            return true;
        });
        
        // todo: check mongodb environments
        // Transactions only support replica sets or sharded clusters environments. It doesn't work in standalone.
        if (success) {
            let delUser = await UserModel.findOneAndDelete({ email: decodeURI(request.params.email) }, { _id: 0 }).exec();
    
            if (delUser) {
                responseData.success = true;
                responseData.code = StatusCodes.OK;
                responseData.message = ReasonPhrases.OK;
        
                let userData = delUser.toObject();
                delete userData._id || delete userData["_id"];
                responseData.data = userData;
        
                response.status(StatusCodes.OK);
            } else {
                responseData.success = true;
                responseData.code = StatusCodes.NOT_FOUND;
                responseData.message = ReasonPhrases.NOT_FOUND;
        
                response.status(StatusCodes.NOT_FOUND);
            }
        }
    } catch (error) {
        debug("ERROR::::", error);
        responseData.success = false;
        responseData.code = StatusCodes.INTERNAL_SERVER_ERROR;
        responseData.message = ReasonPhrases.INTERNAL_SERVER_ERROR;
        
        response.status(StatusCodes.INTERNAL_SERVER_ERROR);
    } finally {
        response.send(responseData);
        response.end();
    }
});

export default router;