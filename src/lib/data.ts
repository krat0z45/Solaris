
// This file is used for Server Actions, which need 'server-only' logic
// for database writes. Reads should be performed on the client using hooks.
import 'server-only';

import { 
    addProject, 
    updateProject, 
    addClient, 
    updateClient, 
    updateWeeklyReport 
} from './firebase-data';


// Re-export only the write operations needed by server actions.
// Reading operations (get*) should not be used in server components to avoid
// mixing client-side and server-side SDKs.
export {
    addProject, 
    updateProject, 
    addClient, 
    updateClient, 
    updateWeeklyReport 
};
