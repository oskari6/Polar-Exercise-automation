# Polar API running exercise data fetching tool

- Running exercise (treadmill and outside) data from Polar Accesslink API + weather data from another API
- Data stored into Redis hashtable in memory via Docker on wsl2, for fast access with Excel.
- Data inserting to Excel .xlsm file with formatting.
- Script for handling distances with different shoes during the same exercise.
- Potential automation with Windows Task Scheduler

![image](https://github.com/user-attachments/assets/418a2d5d-e5d2-4dff-83be-60a1f8cee42f)

## Requirements:

- Polar account
- [Polar API setup with accesslink](https://github.com/polarofficial/accesslink-example-python)
- Docker setup with wsl2, Ubuntu is used here
- Apple phone for app that updates notes, shoes, rpe, distance(treadmill) through aws api gateway and lambda functions

## Access

- Training data from your Polar watch / Polar flow fetched, formatted, inserted and backed up automatically.
- Weather data for each exercise.
- App for updating notes, shoes, rpe, distance on the excel sheet without manually doing it.

## Setup

- Docker container working and running
- Redis cache list for the year eg. 2025, 2026
- environment variables eg aws credentials
- change the aws endpoints to use your own
- (app) apple developer license to get the built app (100€)
- .bat file for windows can be used to invoke bash script inside wsl:
  @echo off
  wsl -d Ubuntu bash -lc "cd /home/user1/training-diary && ./run.sh"
  pause
- excel sheet for the data and formats. example: exercise_data - Copy.xlsm
- shoe distance tracking with custom script

## Functionalities

- run.sh the main script
- excel_shoes.py formatting for multiple shoes used in same exercise. n-1,a-2 into excel cell. should be implemented through windows directory rather than docker / wsl for ease of use
- fetch_data.py gets exercise data and appends to redis list if any new exercises are detected. Inserts data to excel
- /pandas/ formatting scripts
- /deprecated/ old implementation using sqlite database and odbc connection instead for inserting data (slower)
- /backups/ excel spreadsheet backup on every run and redis backup file.
- /logs/ logging
- /lambda/ aws lambda function and libs
- /mobile-app/ ios app for manual field automation

<img width="934" height="693" alt="{7368253A-C3C5-4298-8101-B8189417C623}" src="https://github.com/user-attachments/assets/22028eac-4bc7-4ca4-99b1-0bfbd8a6ae3f" />

## AWS

- default api gateway for form data coming from app
- lambda for fetching exercises from polar side to the mobile app
- dynamodb database for storing the formData coming from the app and using exercise id:s to recognize right exercises later
- automation script fetches from DynamoDB later based on exercise id:s
- database cleared after inserting to excel

## VBA setup for excel_shoes.py

![Run the script](https://github.com/user-attachments/assets/57e2021c-49be-4bd6-bb17-227e84dafd35)
![detect change on spreadsheet](https://github.com/user-attachments/assets/4a9452f2-db56-4ef8-90c9-04aae3bedd26)

