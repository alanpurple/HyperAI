import { connect } from 'mongoose';

export async function connectDdb(): Promise<void> {
    await connect('mongodb://hyperai:alan1234@martinie.ai:27017/hyperai');
}