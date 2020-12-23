# Some basic tests
# Useful variables
baseUrl="localhost:8080"
contType="Content-Type: application/json"
authUser='{"name": "linuxize", "email": "example@example.com", "type":12, "password":"2321", "metaInfo":"something"}'
header="Cookie: userId=$cookie"
createUser='{"name": "example", "email": "example@example.com", "type":false, "password":"2321", "metaInfo":"something"}'
# Create a new user
curl -X POST -H "$contType" -d "$createUser" $baseUrl/api/v1/users/createUser

# Login
cookie=$(curl -X POST -H "$contType" -d "$authUser"  $baseUrl/api/v1/users/authenticateUser | jq ".cookie") 
echo "Cookie:" $cookie
# GetInfo

curl $baseUrl/api/v1/users/getUserInfo -H "Cookie: userId=$cookie"
curl $baseUrl/api/v1/users/logout -H "Cookie: userId=$cookie"

# Delete the user

curl -X DELETE $baseUrl/api/v1/users/deleteUser -H "$header"