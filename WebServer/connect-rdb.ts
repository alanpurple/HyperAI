import { Sequelize } from '@sequelize/core';
import {default as URI } from './uri.json';

export const sequelize = new Sequelize(URI.hyperaisql, URI.id, URI.password, {
    host: URI.sqlServer,
    dialect: 'mysql'
});

export const sequelizeOpen = new Sequelize(URI.hyperaiopendb, URI.id, URI.password, {
    host: URI.sqlServer,
    dialect: 'mysql'
});