import { connect } from 'mongoose';
import * as URI from '../uri.json';

export async function connectDdb(): Promise<void> {
    await connect(`mongodb://${URI.id}:${URI.password}@${URI.server}/${URI.hyperaidb}`);
}