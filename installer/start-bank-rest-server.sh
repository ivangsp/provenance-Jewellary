#! /bin/bash 

#starting the artisan application
# export COMPOSER_CARD=artisanAdmin@trade-network
export COMPOSER_NAMESPACES=never
export COMPOSER_AUTHENTICATION=false
export COMPOSER_MULTIUSER=false

# connect to mongodb instance
#mongo ds129904.mlab.com:29904/composer-rest-server-authentication -u <dbuser> -p <dbpassword>
# export COMPOSER_DATASOURCES='{
#     "db": {
#         "name": "db",
        
#         "host": "ds129904.mlab.com",
#         "port": 29904,
       
#         "database": "composer-rest-server-authentication",
#         "user": "admin",
#         "password": "Password@91#",
#         "connector": "memory"  
#     }
# }'

# export COMPOSER_PROVIDERS='{
#   "github": {
#     "provider": "github",
#     "module": "passport-github",
#     "clientID": "f3aa0fd9194f53741a57",
#     "clientSecret": "51a6e363ba040b0c00919c6070a2e8ceb297ce4a",
#     "authPath": "/auth/github",
#     "callbackURL": "/auth/github/callback",
#     "successRedirect": "/",
#     "failureRedirect": "/"
#   }
# }'

composer-rest-server -c regulatorAdmin@trade-network -p 3003

# navigate to http://localhost:3001/auth/github
if which xdg-open > /dev/null
then
  xdg-open http://localhost:3001/auth/github
elif which gnome-open > /dev/null
then
  gnome-open http://localhost:3001/auth/github
fi
