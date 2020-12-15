# Routes

## User Routes

User routes is a CRUD API that controls users inside the application, the methods are available on /api/v1/users/. Some methods are called during the live of one session, for avoiding manual authentication for each action, a session cookie is created. Is a valatyle one, that will eventually be deleted, but unless the server expressly say to re-authenticate, store it and send when is required. The cookie is a pseudo-random generated, 32-bytes-long alphanumeric string.  

### Routes
GET: getUserInfo: Takes no params, and is only visible to logged ones, the authentication happens through a session cookie, that is created once per session. One user can only get information for himself since critical data are available here. There is a separated route to get public profile of someone else.  
GET: getUserById: Takes exactly one argument, the profile id of the client. This route is available for everyone that have access to the api and one or more profile's ids, then only non critical data here. It also has two variants, getUserByEmail and getUserByName, with makes the same but takes different parameters   
POST: createUser: Create a new user onto the system, plus log then. If everything go well, will return the cookie for future authentication. Only accept POSTs with the follow parameters as a strict JSON: name, age, password, email, metaInfo. Meta information is any kind of non crucial data, such as name of the farm, name, milk type, etc  
POST: authenticateUser: Takes the email and the password as a strict JSON, and returns the session cookie used for future authentication.  
//TODO: implement more routes
