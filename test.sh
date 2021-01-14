# Some basic tests
# Useful variables

echo "Starting some useful tests"
baseUrl="5ac526e53d68.ngrok.io"
contType="Content-Type: application/json"
authUser='{"email": "example@email.com", "type":12, "password":"2321", "metaInfo":"something"}'
createUser='{"name": "linux Is Life", "email": "example@email.com", "type":false, "password":"2321", "metaInfo":"something"}'

# Create a new user
echo "Trying create a new user"
status=$(curl -X POST -H "$contType" -d "$createUser" $baseUrl/api/v1/users/createUser --silent | jq ".ok")
if [ $status = "true" ]
then
    # Login
    echo "Done!"
    echo "Trying login"
    cookie=$(curl -X POST -H "$contType" -d "$authUser" --silent  $baseUrl/api/v1/users/authenticateUser | jq ".cookie") 
    echo "Cookie:" $cookie
else
    echo "Error: creating user!"
    exit
fi

# GetInfo
if [ $cookie = "null" ]
then
    echo "Login error"
    exit
fi

echo "Geting user informations"
res=$(curl $baseUrl/api/v1/users/getUserInfo -H "Cookie: uid=$cookie" --silent | jq ".ok")
if [ $res = "null" ]
then 
    echo "Error: Get user info"
    exit
fi
echo "Logout"
res=$(curl $baseUrl/api/v1/users/logout -H "Cookie: uid=$cookie" --silent | jq ".ok")
if [ $res = "null" ]
then 
    echo "Error: Logout"
    exit
fi
echo "Deleting the user"
# Authenticate again
cookie=$(curl -X POST -H "$contType" -d "$authUser" --silent  $baseUrl/api/v1/users/authenticateUser | jq ".cookie") 
# Delete the user

res=$(curl -X DELETE $baseUrl/api/v1/users/deleteUser -H "Cookie: userId=$cookie" --silent | jq ".ok")
if [ $res = "null" ]
then 
    echo "Error: delting user"
    exit
fi
echo "Finished!"
