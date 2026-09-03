/**
 * Vercel Serverless Function entrypoint for root `/api` endpoint.
 * Delegates to the catch-all proxy in `[...path].js`.
 */
import handler, { config } from './[...path].js';

export { config };
export default handler;
