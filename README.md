# 2811 Assignment 2
## Data Structures
The data structures of the program have been changed significantly since part 1. All data pertaining to a user
is stored in a user object. The groups the user are in are stored in a list of group objects. Each group object
has a name and a list of it's channels that the user is a member of. Each channel object in the list has a name and 
a list of the member's usernames. 

## REST API
### /groups
The groups post request takes a username as an argument and uses it to query the database. It then gathers all the groups
from the user found in the database and sends them back as a list of group objects, also containing the user channels.

### /channels
The channels route is very similar to the groups route. It takes a username and a group name as arguments, and finds all the 
channels within that group name that the user is a member of. 

### /group/create
The create group route accepts as parameters a username and a groupname. It packs these into an object as well as an empty list
of channels, admins and members. It sets the current username as one of the members. It then adds this group as to the list of the
current users groups in the database. 

### /channel/create
Accepts as arguments a channel name, group name and username. It finds the user object from the database, finds the group that the
channel is being added to in this object, and appends a new channel object to this list. The groups list of this user is then updated in the database. 

### /user/create
A user can be created by an admin selecting a channel and then entering the username of a new user to be added to that group and 
channel. The route accepts the arguments group name, channel name and username. It first checks to see if a user with that username
already exists in the database. If they do then it takes this user and appends the channel to the end of the channels list for that group.
It then updates this user in the database. If the user does not yet exist then the data is packed into a user object and inserted into the database. 
