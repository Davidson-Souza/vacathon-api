# Some basic tests
# Create a new user
baseUrl="https://vacathon-api.herokuapp.com"
curl -X POST -H "Content-Type: application/json" -d '{"name": "example", "email": "example@example.com", "age":12, "password":"2321", "metaInfo":"something"}'  $baseUrl/api/v1/users/createUser

# Login
cookie=$(curl -X POST -H "Content-Type: application/json"     -d '{"name": "linuxize", "email": "linuxize@example.com", "age":12, "password":"2321", "metaInfo":"something"}' $baseUrl/api/v1/users/authenticateUser | jq ".cookie")

# GetInfo
header="Cookie: userId="
uid=$(curl $baseUrl/api/v1/users/getUserInfo -H "Cookie: userId=$cookie" | jq ".data.id")

# GetPublicInfo
echo $uid
curl $baseUrl/api/v1/users/getUserById/$uid