import { UserModel } from './models/user';
import { sequelizeOpen } from './connect-rdb';
import { connectDdb } from './connect-ddb';

const sampleNames = ['cluster1samples', 'cluster1woysamples', 'n1samples', 'blobdatas', 'moon1samples']

async function addData() {
    await connectDdb();
    const actualTables = await sequelizeOpen.query(`SELECT table_name,table_rows FROM information_schema.tables
                      WHERE table_schema = 'opendata';
                    `
    );
    const actualNames = actualTables[0].map(data => data['TABLE_NAME']);
    const filtered = sampleNames.filter(name => actualNames.includes(name));
    const adminUser = await UserModel.findOne({ email: 'alan@infinov.com' });
    const userid = adminUser._id;
    const results = filtered.forEach(sample => {
        let numRows = actualTables[0].find(data => data['TABLE_NAME'] == sample)['TABLE_ROWS'];
        return {
            name: sample,
            numRows: numRows,
            type: 'structural'
        }
    });
    await UserModel.findOneAndUpdate({ email: 'alan@infinov.com' }, { $push: { data: { $each: results } } });

    console.log('everything has been handled');
}

addData();