import pysimilar
import keyboard
pysimilar.extensions= '.txt'
# while True:

# while True:
def compare():
    try:
    # if keyboard.is_pressed('q'):
        # print("hello world")
        # break
    # else:
            # pass
        print("hello")
        comparison_result = pysimilar.compare_documents('uploaded_files')
            # print(e)
        print(comparison_result)
    except:
        print("word")
        break



# try:
# except pysimilar.SimilarError as e: