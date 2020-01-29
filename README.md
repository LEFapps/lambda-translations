# Lambda translations

Fetch translations using a Lambda function.

E.g.
```
serverless invoke --function translate --data '{"mongoURI": "mongoconnectionstring","_id": "test_translation","args": {"language":"nl"}}'
```