import pysimilar
import keyboard
pysimilar.extensions= '.txt'
while True:
    try:
        if keyboard.is_pressed('q'):
            break
        else:
            pass
            comparison_result = pysimilar.compare_documents('uploaded_files')
            # print(e)
            print(comparison_result)
    except:
        break



# try:
# except pysimilar.SimilarError as e: