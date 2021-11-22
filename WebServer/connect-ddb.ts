import { connect } from 'mongoose';

export async function connectDdb(): Promise<void> {
    await connect('mongodb://martinie.ai:27017/hyperai');
}