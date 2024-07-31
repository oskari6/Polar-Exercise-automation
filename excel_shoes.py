import xlwings as xw

def extract_and_move_values():
    wb = xw.Book.caller()  # Connects to the calling Excel file
    source_ws = wb.sheets['2024ds']
    target_ws = wb.sheets['2024']

    # Read all necessary data in one go
    id_source_range = source_ws.range("A2:A368").value  # IDs in the source sheet
    source_range = source_ws.range("C2:C368").value     # Corresponding source values
    id_target_range = target_ws.range("B2:B368").value  # IDs in the target sheet
    distance_range = target_ws.range("D2:D368").value   # Distances in the target sheet
    letter_range = target_ws.range("Q2:Q3")             # Letters in the target sheet

    # Create a dictionary for quick lookup of target IDs and their distances
    target_dict = {str(id_target_range[i]).strip(): distance_range[i] for i in range(len(id_target_range))}

    for letter_cell in letter_range:
            letter_cell.offset(0, 1).value = 0
            
    # Process each source value
    for i in range(len(source_range)):
        source_id = str(id_source_range[i]).strip()
        source_value = source_range[i]

        if source_id in target_dict:
            distance_value = target_dict[source_id]
        else:
            continue  # If no matching ID, skip this source

        if source_value:
            parts = source_value.split(",")  # Split the cell value by comma
            for part in parts:
                part = part.strip()  # Remove any unexpected whitespace
                letter = None
                num = None

                if '-' in part:
                    letter, num = part.split("-")
                    num = float(num)
                else:
                    letter = part
                    num = distance_value

                # Update the corresponding cell in column R
                for letter_cell in letter_range:
                    if letter_cell.value.strip() == letter.strip():
                        target_cell = letter_cell.offset(0, 1)  # Move to the R column
                        target_cell.value = (target_cell.value or 0) + num
                        break

if __name__ == "__main__":
    xw.Book("shoe_test.xlsm").set_mock_caller()
    extract_and_move_values()
