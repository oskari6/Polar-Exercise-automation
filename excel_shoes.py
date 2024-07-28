import xlwings as xw

def extract_and_move_values():
    wb = xw.Book.caller()  # Connects to the calling Excel file
    source_ws = wb.sheets['2024ds']
    target_ws = wb.sheets['2024']

    # Define the ranges
    source_range = source_ws.range("C2:C368")
    letter_range = target_ws.range("P2:P3")
    target_range = target_ws.range("N2:N3")

    # Reset the target cells before starting to add new values
    for cell in target_range:
        cell.value = 0

    # Process the source values
    for cell in source_range:
        source_value = cell.value
        row = cell.row
        distance_value = target_ws.range(f"D{row}").value

        if source_value:
            parts = source_value.split(",")  # Split the cell value by comma
            for part in parts:
                part = part.strip()  # Remove any unexpected whitespace
                if '-' in part:
                    letter, num = part.split("-")
                    num = int(num)  # Convert to float to handle decimal distances if any
                    for letter_cell in letter_range:
                        if letter_cell.value.strip() == letter.strip():
                            target_cell = letter_cell.offset(0, 1)
                            target_cell.value += num
                            break
                else:
                    for letter_cell in letter_range:
                        if letter_cell.value.strip() == part.strip():
                            target_cell = letter_cell.offset(0, 1)
                            if distance_value:
                                target_cell.value += distance_value
                            break

if __name__ == "__main__":
    xw.Book("shoe_test.xlsm").set_mock_caller()
    extract_and_move_values()
