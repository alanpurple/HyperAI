import { connect } from 'mongoose';

export async function connectDdb(): Promise<void> {
    await connect('mongodb://localhost:27017/hyperai', { useNewUrlParser: true, useUnifiedTopology: true });
}