# Plagiarism-detector
A web app to detect plagiarism percentage in multiple uploaded PDF files.

### Setup locally
Step 1: Clone the repository
```bash
git clone https://github.com/Student-plagiarism/plagiarism.git
```
Step 2: Move into directory
```bash
cd plagiarism
```
Step 3: Create required Google Drive Credentials
    1. [Enable Google drive api in a Google Cloud Project](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
    2. [Create Authorisation credentials](https://console.cloud.google.com/apis/credentials)
        - For **Authorized JavaScript origins** - use `http://localhost:3000/`.
    3. [Create an API key](https://console.cloud.google.com/apis/credentials)

    You can follow more detailed instructions from [Set up your environment](https://developers.google.com/drive/api/quickstart/js#set_up_your_environment) section.

Step 4: 


### Resources and references
https://developers.google.com/drive/api/v3/reference/files/create
https://developers.google.com/drive/api/v3/reference/files/export

https://developers.google.com/drive/api/guides/ref-export-formats

##### First we need authentication for the user
https://developers.google.com/drive/api/quickstart/js

##### Then we need to get files uploaded
Step 1: First send file metadata(setting mimeType as Google Docs) and get fileID in response.
Step 2: Upload the file using that fileID and get that file converted to Google Docs.

##### Export the files
https://developers.google.com/drive/api/v3/reference/files/export


