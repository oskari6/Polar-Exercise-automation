import os
import json
from accesslink import AccessLink

def handler(event, context):
    accesslink = AccessLink(client_id=os.environ["POLAR_CLIENT_ID"],
                        client_secret=os.environ["POLAR_CLIENT_SECRET"],
                        redirect_url="http://localhost")

    access_token = os.environ["POLAR_ACCESS_TOKEN"]
    exercises = accesslink.get_exercises(access_token)
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        "body":  json.dumps(exercises)
    }