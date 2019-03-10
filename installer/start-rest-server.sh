#! /bin/bash 

cd ..
# remove old api2 fold if it exists
if [ -d "api2" ]; then
    rm -rf api2
fi

mkdir api2

cd api2

#starting the artisan application
# export COMPOSER_CARD=artisanAdmin@trade-network
export COMPOSER_NAMESPACES=never
export COMPOSER_AUTHENTICATION=false
export COMPOSER_WEBSOCKETS=true

# export COMPOSER_MULTIUSER=true
# export COMPOSER_PROVIDERS='{
#   "github": {
#     "provider": "github",
#     "module": "passport-github",
#     "clientID": "a9c850d93a1677b7e226",
#     "clientSecret": "3068a6cfe25ee9a0900d472ef729229fca36792d",
#     "authPath": "/auth/github",
#     "callbackURL": "/auth/github/callback",
#     "successRedirect": "/",
#     "failureRedirect": "/"
#   }
# }'

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


composer-rest-server -c artisanAdmin@trade-network -p 3000

# navigate to http://localhost:3000/auth/github
# if which xdg-open > /dev/null
# then
#   xdg-open http://localhost:3000/auth/github
# elif which gnome-open > /dev/null
# then
#   gnome-open http://localhost:3000/auth/github
# fi
