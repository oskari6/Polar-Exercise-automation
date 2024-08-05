import xlwings as xw

def extract_and_move_values():
    # workbook and sheets
    wb = xw.Book.caller()
    source_ws = wb.sheets['2024ds']
    target_ws = wb.sheets['2024']

    # all ranges
    id_source_range = source_ws.range("A2:A368").value  # shoe input ID
    source_range = source_ws.range("C2:C368").value     # shoe inputs
    id_target_range = target_ws.range("B2:B368").value  # distance ID
    distance_range = target_ws.range("D2:D368").value   # distances
    letter_range = target_ws.range("Q2:Q3")             # letters

    #traverse through ids, with dictionary
    target_dict = {str(id_target_range[i]).strip(): distance_range[i] for i in range(len(id_target_range))}

    # get letters
    for letter_cell in letter_range:
            letter_cell.offset(0, 1).value = 0
            
    #process input shoe letters (sheet 2024ds)
    for i in range(len(source_range)):
        source_id = str(id_source_range[i]).strip()
        source_value = source_range[i]
        # compare to sheet 2024
        if source_id in target_dict:
            distance_value = target_dict[source_id]
        else:
            continue
        # handle
        if source_value:
            parts = source_value.split(",") 
            for part in parts:
                part = part.strip()
                letter = None
                num = None
                # if more than 1 shoe format: n-1, s-2 (shoeletter-distance, shoeletter-distance)
                if '-' in part:
                    letter, num = part.split("-")
                    num = int(num)
                else:   # normal handle
                    letter = part
                    num = distance_value

                # append distance
                for letter_cell in letter_range:
                    if letter_cell.value.strip() == letter.strip():
                        target_cell = letter_cell.offset(0, 1)
                        target_cell.value = (target_cell.value or 0) + num
                        break

if __name__ == "__main__":
    xw.Book("shoe_test.xlsm").set_mock_caller()
    extract_and_move_values()
