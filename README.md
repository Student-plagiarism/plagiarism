# Plagiarism-detector
A web app to detect plagiarism percentage in multiple uploaded PDF files.
> ⚠️ This web app tries to keep the process as fast as possible and hence the trade off in OCR comes with quality. It's efficiency is maximum for PDFs consisting machine readable fonts(computer typed text). However, it's just workable for handwritten PDFs. OCR efficiency also depends upon the scan quality of PDFs. So make sure to have good lighting and resolution when creating PDFs.

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
        - For **Authorized JavaScript origins** - use `http://localhost:3000`.  
        - For **Authorized redirect uri** - use `http://localhost:3000/`  
    3. [Create an API key](https://console.cloud.google.com/apis/credentials)  

    You can follow more detailed instructions from [Set up your environment](https://developers.google.com/drive/api/quickstart/js#set_up_your_environment) section.

Step 4: Start frontend from the top of folder
|npm | yarn | pnpm |
|----|------|------|
|`npm install`|`yarn install` | `pnpm install`|
|`npm build`|`yarn build`|`pnpm build`|
|`npm start`|`yarn start`|`pnpm start`|

Step 5: Open another tab of shell for turning up backend and then move into it's folder
```bash
cd backend
```

Step 6: Install all dependencies
```bash
pip install -r requirements.txt
```

Step 7: Start backend
```bash
flask run
```

### Resources and references
https://developers.google.com/oauthplayground/  
https://developers.google.com/identity/gsi/web/guides/handle-credential-responses-js-functions  
https://developers.google.com/identity/gsi/web/guides/display-button#html  

https://developers.google.com/drive/api/v3/reference/files/create  
https://developers.google.com/drive/api/v3/reference/files/export  

https://developers.google.com/drive/api/guides/ref-export-formats  

### Road Map
- [x] First we need authentication for the user
https://developers.google.com/oauthplayground/

 - [x] Then we need to get files uploaded  
    - [x] Step 1: First send file metadata(setting mimeType as Google Docs) and get fileID in response.  
    - [x] Step 2: Upload the file using that fileID and get that file converted to Google Docs.

- [x] Export the files
https://developers.google.com/drive/api/v3/reference/files/export

- [x] Send files to backend and listen for the upload request on backend
- [x] Execute comparison on receiving `/compare` request and send back results  