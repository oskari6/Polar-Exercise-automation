# Polar API running exercise data fetching tool

- Running exercise (treadmill and outside) data from Polar Accesslink API + weather data from another API
- Data stored into Redis hashtable in memory via Docker on wsl2, for fast access with Excel.
- Data inserting to Excel .xlsm file with formatting.
- Script for handling distances with different shoes during the same exercise.
- Potential automation with Windows Task Scheduler

![image](https://github.com/user-attachments/assets/418a2d5d-e5d2-4dff-83be-60a1f8cee42f)

## What you need:

- Polar account
- [Polar API setup with accesslink](https://github.com/polarofficial/accesslink-example-python)
- Docker setup with wsl2
  - Ubuntu would be the distro im using
  - sudo apt install docker.io docker-compose -y
  - give access:
    - sudo visudo
    - write these at the bottom of the file:
      - user1 ALL=(ALL) NOPASSWD: /usr/sbin/service docker start
      - user1 ALL=(ALL) NOPASSWD: /usr/bin/docker

## What is offered

- Training data from your Polar watch / Polar flow fetched, formatted, inserted and backedup automatically.
- Weather data for each exercise.

## Setup

- Set virtual environment in the root of the project: `.venv`
- Install requirements.txt into .venv
- Adjust the paths to match the ones you have in `run_fetch.sh` and possibly elsewhere
- run `run_fetch.sh`. Note that polar api starts tracking exercices from the moment you register the API client.

# Functionalities

- run_fetch.sh the main script
- excel_shoes.py formatting for multiple shoes used in same exercise. n-1,a-2 into excel cell. should be implemented through windows directory rather than docker / wsl for ease of use
- fetch_data.py gets exercise data and appends to redis list if any new exercises are detected. Inserts data to excel
- /pandas/ formatting scripts
- /deprecated/ old implementation using sqlite database and odbc connection instead for inserting data (slower)
- /backups/ excel spreadsheet backup on every run and redis backup file.
- /logs/ logging

# VBA setup for excel_shoes.py

![Run the script](https://github.com/user-attachments/assets/57e2021c-49be-4bd6-bb17-227e84dafd35)
![detect change on spreadsheet](https://github.com/user-attachments/assets/4a9452f2-db56-4ef8-90c9-04aae3bedd26)
