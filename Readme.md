## This is Auction management system 

## Installation
1. Clone the repository
2. Install the requirements to install the requirements run the following command
```bash
pip install -r requirements.txt
```
3. do alembic migration
```bash
alembic revision --autogenerate -m "initial migration"
alembic upgrade head
```
4. run the server
```bash
python main.py
```
5. you can also build the docker container by running the following command
```bash
docker build -t auction_management .
```
6. you can run the docker container by running the following command
```bash
docker run -d -p 8000:8000 auction_management
```
## Testing
1. now you can go to the postman the collection is provided in the repository by the name of auction management.postman_collection.json
2. you can import the collection in the postman and test the api's
3. you can also go to the swagger documentation by going to the following url
```bash
http://localhost:8000/docs
```
## Features of the auction management system
1. User can register and login
2. Admin Can create the auction
3. the user can make a bid on the auction by entering the item id
4. the user can see the list of all the Live auction