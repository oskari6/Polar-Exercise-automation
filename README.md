# Application for reading exercise data (Windows)
![image](https://github.com/user-attachments/assets/59abba26-17d0-4638-a0bb-55a4b4d4d5cc)
![image](https://github.com/user-attachments/assets/eb75dae3-a8fe-4a14-8585-6b1a0bdaa387)
- you will need the following:
- polar account
- accesslink user id, token, client id, client secret
- what i used to set the polar api: [link text](https://github.com/polarofficial/accesslink-example-python)
# What you get
- training data automatically fetched everyday, to your excel spreadsheet in correct format and order
- weather data for each day
- easy to use interface with excel to input rpe, shoe model used for the exercise, notes
- data visualization possibility, and flexible long term solution for tracking training with a polar watch
# Functionality (polar api)
- gets exercise data for running/treadmill running exercises for the last 30 days
- gets weather temperature from meteostat api, with exercise startime and lat,lon coordinates
- Saves the data to sqlite database
# Functionality (excel_shoes.py)
- with the help from vba script in excel
- converts shoe km usage from days where 2 pairs were used in 1 exercise, into one cell
- script gets triggered fro mpressing enter on the cell, wether 1-2 chars or more are entered
- splits the values and adds distance into the target cell
# Further
- data from the sqlite database gets fetched by powerquery with ODBC db connection.
- data gets inserted into cells with tools like pivot table, index-match-formula, formatting
# Automation
- The excel_shoes script gets executed with a .bat script
- The data gets fetched with Windows Task scheduler, through an virtual environment with the help of .bat script
![image](https://github.com/user-attachments/assets/00a75898-cf9e-493f-964b-4b34eb458a39)
  ![image](https://github.com/user-attachments/assets/85c123ec-7204-4d78-9db7-effe0753a1cf)
