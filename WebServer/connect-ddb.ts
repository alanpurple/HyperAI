import { connect } from 'mongoose';

export async function connectDdb(): Promise<void> {
    await connect('mongodb://192.168.0.2:27017/hyperai');
}