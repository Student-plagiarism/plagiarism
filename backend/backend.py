import pysimilar
import keyboard

pysimilar.extensions= '.txt'
try:
    comparison_result = pysimilar.compare_documents('uploaded_files')
except pysimilar.SimilarError as e:
    print(e)
print(comparison_result)