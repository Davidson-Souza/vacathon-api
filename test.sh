# Some basic tests
# Useful variables

echo "Starting some useful tests"
baseUrl="localhost:8080"
contType="Content-Type: application/json"
authUser='{"name": "linuxize", "email": "example@example.com", "type":12, "password":"2321", "metaInfo":"something"}'
createUser='{"name": "example", "email": "example@example.com", "type":false, "password":"2321", "metaInfo":"something"}'

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
curl $baseUrl/api/v1/users/getUserInfo -H "Cookie: userId=$cookie" --silent | jq ".ok"
echo "Logout"
curl $baseUrl/api/v1/users/logout -H "Cookie: userId=$cookie" --silent | jq ".ok"
    
echo "Deleting the user"
# Authenticate again
cookie=$(curl -X POST -H "$contType" -d "$authUser" --silent  $baseUrl/api/v1/users/authenticateUser | jq ".cookie") 
# Delete the user

curl -X DELETE $baseUrl/api/v1/users/deleteUser -H "Cookie: userId=$cookie" --silent | jq ".ok"
echo "Finished!"

