import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('hyperai', 'root', 'alan1234', {
    host: 'localhost',
    dialect: 'mysql'
});

export const sequelizeOpen = new Sequelize('opendata', 'root', 'alan1234', {
    host: 'localhost',
    dialect: 'mysql'
});

/*test();

async function test() {
    try {
        await sequelize.authenticate();
        console.log('authenticated');
    }
    catch (err) {
        console.error(err);
    }
}*/