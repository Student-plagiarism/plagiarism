import os
import pysimilar
from flask import Flask
from flask import request
from flask_cors import CORS
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploaded_files'

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

pysimilar.extensions= '.txt'

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/compare")
def compare():
    try:
        print("hello")
        comparison_result = pysimilar.compare_documents('uploaded_files')
        print(comparison_result)
    except:
        print("word")

@app.route("/upload", methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        # check if the post request body is a json object
        if request.is_json:
            # parse the json object array
            data = request.get_json()
            print(data)

            # create a folder named uploaded_files if it doesn't exist
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])

            # iterate through the json object array and create a file for each json object
            for i in data:
                filename = secure_filename(i['name']).replace(".pdf", "")
                file = open(os.path.join(app.config['UPLOAD_FOLDER'], filename+'.txt'), "w")
                file.write(i['body'])
                file.close()

            # read all the filenames in the uploaded_files folder
            filenames = os.listdir(app.config['UPLOAD_FOLDER'])
            # print(filenames)
            # create json object consisting of file names inside the uploaded_files folder
            file_names = []
            for i in filenames:
                file_names.append(i)
            return {"message": file_names}

        else:
            # return a response in json format
            return {"message": "The request payload is not in JSON format"}

    else:
        return "Ping Successful"
