# Routes

## User Routes

User routes is a CRUD API that controls users inside the aplication, the methods are availyble on /api/v1/users/  
getUserInfo: Takes no params, and is only visible to logged ones, the authentication happens through a session cookie, that is created once per session. One user can only get informations for thenself since critical informations are avalible here. There is a separeted route to get public profile of someone else.  
getUserMetaInfo: Takes exactly one paramiter, the profile id of the client. This route is avaliable for everyone that have access to the api and one or more profile's ids, then only non critical data here.  
