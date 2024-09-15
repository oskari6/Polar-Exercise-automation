import xlwings as xw

def extract_and_move_values():
    wb = xw.Book.caller() 
    ws = wb.sheets.active

    source_range = ws.range("J2:J368")
    letter_range = ws.range("Q2:Q5")
    target_range = ws.range("R2:R5")

    for cell in target_range:
        cell.value = 0

    for cell in source_range:
        source_value = cell.value
        row = cell.row
        distance_value = ws.range(f"D{row}").value

        if source_value:
            parts = source_value.split(",")
            for part in parts:
                part = part.strip() 
                if '-' in part:
                    letter, num = part.split("-")
                    num = int(num) 
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
    xw.Book("diary_2024.xlsm").set_mock_caller()
    extract_and_move_values()