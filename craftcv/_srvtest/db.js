import { Pool, neonConfig } from 'file:///C:/Users/Gabriel/AppData/Local/Temp/claude/c--Users-Gabriel-Desktop-projects-perfectcv/134057c4-5e98-4ff9-9a58-a87a522b86ff/scratchpad/neondrv/node_modules/@neondatabase/serverless/index.mjs'
import ws from 'ws'
neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export async function query(sql, params) { return pool.query(sql, params) }
export default pool
