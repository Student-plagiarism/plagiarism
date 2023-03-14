import pysimilar
pysimilar.extensions= '.txt'
comparison_result = pysimilar.compare_documents('uploaded_files')
print(comparison_result)