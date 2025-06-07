import xlwings as xw

def extract_and_move_values():
    wb = xw.Book.caller() 
    ws = wb.sheets.active

    source_range = ws.range("L2:L368")
    target_range = ws.range("AA2:AA7") # shoe format result column

    for cell in target_range:
        cell.value = 0

    letter_to_target = {letter.value.strip() : letter.offset(0,2) for letter in ws.range("Y2:Y7")}
    
    for cell in source_range:
        cell_value = cell.value
        if cell_value is None:
            break
        elif "-" not in cell_value:
            continue
        
        parts = cell_value.split(",")
        for part in parts:
            try:
                letter_part, num = part.strip().split("-")
                num = float(num) 
 
                target_cell = letter_to_target.get(letter_part.strip())
                if target_cell:
                    target_cell.value += num
            except ValueError:
                print(f"Skipping invalid format in cell {cell.address}:{cell.value}")

if __name__ == "__main__":
    xw.Book("C:\Users\Oskari\OneDrive - Intragen\excel\exercise_data.xlsm").set_mock_caller()
    extract_and_move_values()