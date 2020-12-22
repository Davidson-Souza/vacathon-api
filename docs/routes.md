# Routes

## User Routes

User routes is a CRUD API that controls users inside the application, the methods are available on /api/v1/users/. Some methods are called during the live of one session, for avoiding manual authentication for each action, a session cookie is created. Is a ephemeral one, that will eventually be deleted, but unless the server expressly say to re-authenticate, store it and send when is required. The cookie is a pseudo-random generated, 32-bytes-long alphanumeric string. The return json looks like this: {ok:true/false, data/err:anything}. The ok field is a short answers if everything goes ok, or any error happened, and then the complementary error info or data response if any.  
An user can be a producer and a dairy, true means producer and false means dairy. Specific data come into metadata field, like age, milk type, daily production, etc. I decided to do this, for two reasons. Fist, gave more flexibility to frontend, allowing manage data less strictly and change the model without reflecting in the backend, second security and performance. Creating a new set of routes for each one, plus a database since it's basic structure looks like the same (id, password, email, name) is a waste of resource and adds more complexity. Hence, dairy and producer are the same thing at the server side.  

### Routes
GET: getUserInfo: Takes no params, and is only visible to logged ones, the authentication happens through a session cookie, that is created once per session. One user can only get information for himself since critical data are available here. There is a separated route to get public profile of someone else. Return a json with the info, or an error if any.  
GET: getUserById: Takes exactly one argument, the profile id of the client. This route is available for everyone that have access to the api and one or more profile's ids, then only non critical data here. It also has two variants, getUserByEmail and getUserByName, with makes the same but takes different parameters. Return a json with the data, or an error if any   
POST: createUser: Create a new user onto the system, plus log then. If everything go well, will return the cookie for future authentication. Only accept POSTs with the follow parameters as a strict JSON: name, type, password, email, metaInfo. Meta information is any kind of non crucial data, such as name of the farm, name, milk type, etc. Return an json with the confirmation or an error if any  
POST: authenticateUser: Takes the email and the password as a strict JSON, and returns the session cookie used for future authentication.  
GET: logout: Destroys the current session. Require the cookie of the session, if the process end with no
error, the cookie will be revoked, hence, a new authentication shall be taken  
POST: updateUser: Update the user info, no password here. Need one json with the new info, unchanged data
shall be repeated. Ex {"name": "example", "email": "example@example.com", "type":false, "metaInfo":"something"}. Return true if everything went well.
POST: changeUserPassword. Change the user password. Need a json with: oldPassword and newPassword, as well 
the cookie. Return true if no errors happens.  
