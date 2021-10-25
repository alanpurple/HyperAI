import {User as user} from "../models/user"

declare global {
  namespace Express {
    interface User extends user {}
  }
}