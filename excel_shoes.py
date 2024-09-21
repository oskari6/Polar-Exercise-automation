import xlwings as xw

def extract_and_move_values():
    wb = xw.Book.caller() 
    ws = wb.sheets.active

    source_range = ws.range("J2:J368")
    letter_range = ws.range("Q2:Q6")
    target_range = ws.range("R2:R6")

    for cell in target_range:
        cell.value = 0

    for cell in source_range:
        if cell.value is None:
            break
        letter_value = cell.value
        row = cell.row

        if "," in letter_value:
            parts = letter_value.split(",")
            for part in parts:
                part = part.strip()
                letter_part, num = part.split("-")
                num = float(num) 
                for letter in letter_range:
                    if letter.value.strip() == letter_part.strip():
                        target_cell = letter.offset(0, 1)
                        target_cell.value += num
                        break
        else:
            distance_value = ws.range(f"D{row}").value
            for letter in letter_range:
                if letter.value.strip() == letter_value.strip():
                    target_cell = letter.offset(0, 1)
                    target_cell.value += distance_value
                    break

if __name__ == "__main__":
    xw.Book("diary_2024.xlsm").set_mock_caller()
    extract_and_move_values()