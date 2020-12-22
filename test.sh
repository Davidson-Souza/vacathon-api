# Some basic tests
# Create a new user
baseUrl="localhost:8080"
curl -X POST -H "Content-Type: application/json" -d '{"name": "example", "email": "example@example.com", "type":12, "password":"2321", "metaInfo":"something"}'  $baseUrl/api/v1/users/createUser

# Login
cookie=$(curl -X POST -H "Content-Type: application/json"     -d '{"name": "linuxize", "email": "example@example.com", "type":12, "password":"2321", "metaInfo":"something"}' $baseUrl/api/v1/users/authenticateUser | jq ".cookie") 
echo "Cookie:" $cookie
# GetInfo
header="Cookie: userId="
curl $baseUrl/api/v1/users/getUserInfo -H "Cookie: userId=$cookie"

# GetPublicInfo
echo $uid
curl $baseUrl/api/v1/users/getUserById/$uid

curl -X POST -b "uid=$cookie" -H "Content-Type: application/json" -d '{"name": "example", "email": "eu@example.com", "type":13, "metaInfo":"something"}'  $baseUrl/api/v1/users/updateUser
curl -X POST -b "uid=$cookie" -H "Content-Type: application/json" -d '{"oldPassword": "2321", "newPassword": "3212"}'  $baseUrl/api/v1/users/changeUserPassword