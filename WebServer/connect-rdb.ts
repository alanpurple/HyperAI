import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('hyperai', 'hyperai', 'alan1234', {
    host: 'martinie.ai',
    dialect: 'mysql'
});

export const sequelizeOpen = new Sequelize('opendata', 'hyperai', 'alan1234', {
    host: 'martinie.ai',
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