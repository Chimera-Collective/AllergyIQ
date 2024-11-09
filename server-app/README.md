# Server

## Running the server

To run the server, run:

```
npm start
```

## Testing the routes

```shell
curl -X 'POST' \
 'http://localhost:8080/process/text' \
 -H 'accept: application/json' \
 -H 'Content-Type: application/json' \
 -d '{
"text": "Ingredients: Water, Fish Stock, Fish (Cod, Haddock, etc.), Potatoes, Carrots, Onions, Celery, Clams, Mussels, Shrimp, Crab, Spices (Salt, Pepper, Bay Leaf, etc.), Thickening Agent (Cornstarch or Flour). Contains: Fish (including Shellfish), Peanuts"
}'
```
