import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('hyperai', 'hyperai', 'alan1234', {
    host: '192.168.0.2',
    dialect: 'mysql'
});

export const sequelizeOpen = new Sequelize('opendata', 'hyperai', 'alan1234', {
    host: '192.168.0.2',
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