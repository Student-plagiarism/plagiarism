import {
  ChakraProvider,
  Button,
  Input,
  Heading,
  Box,
  HStack,
  Wrap,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Stack,
  Spacer,
  ListItem,
  OrderedList,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
}
  from '@chakra-ui/react';
import {
  CheckIcon,
  CheckCircleIcon
}
  from '@chakra-ui/icons';
import {
  Field,
  Form,
  Formik,
}
  from 'formik';
import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
// import Plotly from 'plotly.js';

const App = () => {
  const [filesNames, setFilesNames] = useState([]);
  const [sessionUri, setSessionUri] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folderName, setFolderName] = useState('');
  const [folderCreated, setFolderCreated] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);
  // const [files, setFiles] = useState([]);
  const [filesData, setFilesData] = useState([]);
  const [driveFiles, setDriveFiles] = useState(null);
  const [fileBody, setFileBody] = useState(filesData);
  const [filesReady, setFilesReady] = useState([]);
  const [comparisonResult, setComparisonResult] = useState([]);
  const [individualCompRes, setIndividualCompRes] = useState([]);
  const [filesIds, setFilesIds] = useState([]);
  const [filesConverted, setFilesConverted] = useState(false);
  const [filesConvertedIds, setFilesConvertedIds] = useState([]);
  const [filesConvertedNames, setFilesConvertedNames] = useState([]);
  const [filesConvertedLinks, setFilesConvertedLinks] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [signout, setSignout] = useState(false);
  const [authorizeText, setAuthorizeText] = useState('Authorize');
  const [token, setToken] = useState('');
  const [comparisonDone, setComparisonDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const router = useRouter();

  let tokenClient;
  let gapiInited = false;
  let gisInited = false;

  // Discovery doc URL for APIs used by the quickstart
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  const SCOPES = 'https://www.googleapis.com/auth/drive';


  //  Callback after api.js is loaded. 
  async function gapiLoaded() {
    console.log('gapi loaded')
    try {
      gapi.load('client', initializeGapiClient)

    } catch (error) {
      console.log(error)
      // router.reload();
    }
  }

  // Callback after the API client is loaded. Loads the discovery doc to initialize the API.
  function initializeGapiClient() {
    console.log('gapi client loaded')
    gapi.client.init({
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    })
    // .then(() => {
    gapiInited = true
    // setGapiInited(true);
    maybeEnableButtons();
    // })
  }

  // Callback after Google Identity Services are loaded.
  async function gisLoaded() {
    try {
      console.log('gis loaded')
      tokenClient = await google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        scope: SCOPES,
        callback: ((response) => {
          console.log("callback response", response)
          setToken(response.access_token)
        }), // defined later
      });
      gisInited = true;
      // setGisInited(true);
      maybeEnableButtons();
    } catch (err) {
      // document.getElementById('content').innerText = err.message;
      console.log(err.message)
    }
  }

  //  Enables user interaction after all libraries are loaded.
  async function maybeEnableButtons() {
    if (gapiInited && gisInited) {
      // document.getElementById('authorize_button').style.visibility = 'visible';
      setAuthorized(true);
    }
  }

  //   Sign in the user upon button click.
  async function handleAuthClick() {
    // await gapiLoaded()
    // 	.then(() => {
    // 		if (tokenClient === undefined) {
    // 			gisLoaded().then(() => {
    try {
      tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          throw (resp);
        }
        // document.getElementById('signout_button').style.visibility = 'visible';
        setSignout(true);
        // document.getElementById('authorize_button').innerText = 'Refresh';
        setAuthorizeText('ReAuthenticate');
        setAuthorized(true);
        setToken(gapi.client.getToken().access_token);
        await listFiles();
        toast({
          title: "Authenticated",
          description: "You have successfully authenticated with Google Drive",
          status: "success",
          duration: 9000,
          isClosable: true,
        })
      }
    }
    catch (err) {
      // document.getElementById('content').innerText = err.message;
      console.log(err.message)
      // return;
    }

    console.log("tokenClient", tokenClient)
    try {
      if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch (error) {
      console.log(error)
    }
    // })
  }

  //    *  Sign out the user upon button click.
  function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      //   document.getElementById('content').innerText = '';
      setDriveFiles('');
      //   document.getElementById('authorize_button').innerText = 'Authorize';
      setAuthorizeText('Authorize');
      //   document.getElementById('signout_button').style.visibility = 'hidden';
      setSignout(false);
    }
  }

  const handleUpload = async (e) => {
    // check if serverless function is working
    // fetch('/api/GAPI', {
    // 	method: 'GET',
    // 	headers: {
    // 		'Content-Type': 'application/json',
    // 	},
    // 	// body: JSON.stringify({ name: 'John Doe' }),
    // }).then((response) => {
    // 	if (response.status === 200) {
    // 		console.log(response.json());
    // 	}
    // })

    const file = e.target.files[0];
    console.log(file);

    // if folder exists in the session, get its id and upload file
    // else {
    console.log(folderId);
    await uploadFile(file, file.name, file.size);
    // }
  }

  const setUpFolder = async () => {
    // check if a folder named as 'Plagiarism Detector' exists
    // if not, create one and get its id and upload file
    if (!folderCreated) {
      console.log('Folder not created in this session, searching for it on drive...')
      await searchElseCreateFolder()
    }
  }

  const searchElseCreateFolder = async () => {
    await fetch(`https://www.googleapis.com/drive/v3/files?q=name='Plagiarism%20Detector'%20AND%20trashed%3Dfalse&key=${process.env.NEXT_PUBLIC_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          return response.json();
        }
        else {
          toast({
            title: `Error ${response.status}`,
            description: `${response.statusText}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .then((data) => {
        if (data.files.length === 0) {
          console.log('Folder not found, creating one...')
          createFolder();
        } else {
          console.log('Folder found, getting its id...')
          console.log(data)
          setFolderId(data.files[0].id);
          setFolderName(data.files[0].name);
          setFolderCreated(true);
          toast({
            title: 'Folder found',
            description: 'Folder named as "Plagiarism Detector" already exists, uploaded files will be saved in it. Start uploading files now!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          return data.files[0].id;
        }
      })
      .catch(error => {
        console.log(error);
        toast({
          title: 'Error',
          description: "Couldn't find or create folder",
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const createFolder = async () => {
    const folderName = 'Plagiarism Detector';
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };
    await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(folderMetadata)
    })
      .then((response) => {
        if (response.status === 200) {
          setFolderCreated(true);
          console.log(response);
          return response.json();
        }
        else {
          toast({
            title: `Error ${response.status}`,
            description: `${response.statusText}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .then((data) => {
        setFolderId(data.id);
        setFolderName(data.name);
        toast({
          title: 'Folder created',
          description: 'Folder named as "Plagiarism Detector" created, uploaded files will be saved in it. Start uploading files now!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        return data.id;
      })
      .catch((error) => {
        console.log(error);
        toast({
          title: 'Error',
          description: "Couldn't create folder",
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const uploadFile = async (file, fileName, size) => {
    const fileMetadata = {
      // replace spaces with underscores
      name: fileName.replace(/\s/g, '_'),
      parents: [folderId],
      mimeType: 'application/vnd.google-apps.document'
    };

    const fileData = new FormData();
    fileData.append('file', file);

    // create a metadata of the file
    await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(fileMetadata)
    })
      .then(async (response) => {
        if (response.status === 200) {
          console.log(response);
          let response_msg = await response.json();
          toast({
            title: `${response_msg.name} metadata created`,
            description: 'File metadata created successfully',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          setLoading(true);
          toast({
            title: 'Uploading file',
            description: 'File is being uploaded. Please wait...',
            status: 'loading',
            isClosable: false,
          })
          return response_msg;
        }
        else {
          toast({
            title: `Error ${response.status}`,
            description: `Error in folder Metadata creation: ${response.statusText}. Try again please.`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .then((data) => {
        console.log(data);
        // setFilesIds([...filesIds, data.id]);
        fetch(`https://www.googleapis.com/upload/drive/v3/files/${data.id}?uploadType=media`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/pdf',
            'Content-Length': size,
            'Accept': 'application/json',
          },

          body: fileData
        })
          .then((response) => {

            if (response.status === 200) {
              console.log(response);
              return response.json();
            }
            else {
              toast({
                title: `Error ${response.status}`,
                description: `Error in file upload: ${response.statusText}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
              })
            }
          })
          .then((data) => {
            console.log(data);
            setLoading(false);
            toast({
              title: `${data.name} uploaded`,
              description: 'File uploaded successfully',
              status: 'success',
              duration: 5000,
              isClosable: true,
            })
            setFilesData([...filesData, data]);
          })
          .catch((error) => {
            console.log(error);
          })
      })
      .catch((error) => {
        console.log(error);
      })
  }

  // get files from folder
  const getFiles = async () => {
    await fetch(`https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27%20in%20parents%20AND%20trashed%3Dfalse`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          return response.json();
        }
        else {
          toast({
            title: `Error ${response.status}`,
            description: `Error in getting files: ${response.statusText}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .then((data) => {
        console.log(data);
        setFilesData(data.files);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  // const convertFiles = async () => {
  // 	const fileMetadata = {
  // 		mimeType: 'application/vnd.google-apps.document'
  // 	};
  // 	await fetch(`https://www.googleapis.com/drive/v3/files/${filesIds}/copy`, {
  // 		method: 'POST',
  // 		headers: {
  // 			'Content-Type': 'application/json',
  // 			'Authorization': `Bearer ${token}`
  // 		},
  // 		body: JSON.stringify(fileMetadata)
  // 	})
  // 		.then((response) => {
  // 			if (response.status === 200) {
  // 				setFilesConverted(true);
  // 				return response.json();
  // 			}
  // 		})
  // 		.then((data) => {
  // 			setFilesConvertedIds(data.id);
  // 			setFilesConvertedNames(data.name);
  // 			setFilesConvertedLinks(data.webViewLink);
  // 		})
  // 		.catch((error) => {
  // 			console.log(error);
  // 		})
  // }

  // const uploadWithConversion = async (file, fileName) => {
  // 	const fileMetadata = {

  // 		name: fileName,
  // 		parents: [folderId],
  // 		mimeType: 'application/vnd.google-apps.document'
  // 	};
  // 	const media = {
  // 		mimeType: 'application/pdf',
  // 		body: file
  // 	};
  // 	await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
  // 		method: 'POST',
  // 		headers: {
  // 			'Authorization': `Bearer ${token}`,

  // 			'Content-Type': 'application/json; charset=UTF-8',
  // 			'Accept': 'application/json'
  // 		},
  // 		body: JSON.stringify(fileMetadata),
  // 		media: media
  // 	})
  // 		.then((response) => {
  // 			if (response.status === 200) {
  // 				setFilesUploaded(true);
  // 				console.log(response);
  // 				return response.json();
  // 			}
  // 		})
  // 		.then((data) => { console.log(data) })
  // 		// .then((data) => {
  // 		// 	setFilesIds(data.id);
  // 		// 	const fileMetadata = {
  // 		// 		mimeType: 'application/vnd.google-apps.document'
  // 		// 	};
  // 		// 	fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/copy`, {
  // 		// 		method: 'POST',
  // 		// 		headers: {
  // 		// 			'Content-Type': 'application/json',
  // 		// 			'Authorization': `Bearer ${token}`
  // 		// 		},
  // 		// 		body: JSON.stringify(fileMetadata)
  // 		// 	})
  // 		// 		.then((response) => {
  // 		// 			if (response.status === 200) {
  // 		// 				setFilesConverted(true);
  // 		// 				return response.json();
  // 		// 			}
  // 		// 		})
  // 		// 		.then((data) => {
  // 		// 			setFilesConvertedIds(data.id);
  // 		// 			setFilesConvertedNames(data.name);
  // 		// 			setFilesConvertedLinks(data.webViewLink);
  // 		// 		})
  // 		// 		.catch((error) => {
  // 		// 			console.log(error);
  // 		// 		})
  // 		// })
  // 		.catch((error) => {
  // 			console.log(error);
  // 		})
  // }


  // Print metadata for first 10 files.
  async function listFiles() {
    let response;
    try {
      response = await gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': 'files(id, name)',
      });
    } catch (err) {
      // document.getElementById('content').innerText = err.message;
      console.log(err.message)
      return;
    }
    const files = response.result.files;
    if (!files || files.length == 0) {
      setDriveFiles('No files found.');
      return;
    }
    // Flatten to string to display
    const output = files.reduce(
      (str, file) => `${str}${file.name} (${file.id})\n`,
      'Files:\n');
    setDriveFiles(output);
  }

  // export files as text/plain
  async function exportFile(fileId) {
    try {
      fetch('https://www.googleapis.com/drive/v3/files/' + fileId + `/export?mimeType=text%2Fplain`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      })
        .then(async (response) => {
          if (response.status === 200) {
            console.log(response);
            return await response.text();
          }
        })
        .then((data) => {
          console.log(data)
          console.log(filesData)

          setFileBody(
            // _prevFileBody => (
            filesData.map((file, index) => {
              if (file.id === fileId) {
                return {
                  id: fileId,
                  body: data,
                  ...file
                }
              }
              else {
                return fileBody[index]
              }
            })
            // )
          );

          console.log(fileBody)
        })
        .catch((error) => {
          console.log(error);
        })
    } catch (err) {
      // document.getElementById('content').innerText = err.message;
      console.log(err.message)
      return;
    }
  }

  async function exportAll() {
    filesData.map(async (file) => {
      await exportFile(file.id);
    })
    // console.log(body);
  }

  async function uploadToBackend() {
    await fetch('http://localhost:5000/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(fileBody.filter(x => x))
    })
      .then(async (response) => {
        console.log(response);
        if (response.status === 200) {
          toast({
            title: "Files are Ready",
            description: "Your files are ready to be checked for plagiarism.",
            status: "success",
            duration: 9000,
            isClosable: true,
          })
          let fileNames = await response.json()
          console.log(fileNames?.message)
          setFilesReady(fileNames.message);
        }
      }, (error) => {
        console.log(error);
      });
  }

  // compare files
  async function compareFiles() {
    await fetch('http://localhost:5000/compare', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
    })
      .then(async (response) => {
        console.log(response);
        if (response.status === 200) {
          toast({
            title: "Comparison Successful",
            description: "Your files are ready to be checked for plagiarism.",
            status: "success",
            duration: 9000,
            isClosable: true,
          })
          setComparisonDone(true);
          let res_ComparisonResult = await response.json()
          setComparisonResult(res_ComparisonResult.message);
          console.log(res_ComparisonResult.message)
        }
      }, (error) => {
        console.log(error);
      });
  }

  // display comparison result
  const findFileComparisonRes = (name) => {
    if (comparisonResult.length > 1) {
      let fileComparisonRes = comparisonResult.filter((file) => {
        return file[0].includes(name.replace(/.pdf/g, ''))
      });

      console.log(fileComparisonRes)
      // return fileComparisonRes;
      return new Promise((resolve, reject) => {
        resolve(fileComparisonRes)
      })
      // setIndividualCompRes(() => fileComparisonRes)
    }
    else {
      console.log(comparisonResult)
      return comparisonResult;
    }
  }

  const displayComparisonResult = (name) => {
    // let promisify = new Promise(findFileComparisonRes)  
    findFileComparisonRes(name)
      .then((res) => {
        console.log(res)
        // setIndividualCompRes(res)
      })

  }

  return (
    <ChakraProvider>
      <Wrap align='center' m='10' justify={'center'}>
        <Heading >Plagiarism detector for Class Assignments</Heading>
      </Wrap>
      <Flex w={'6xl'} justify='center' bgSize={'auto'} m='auto' boxShadow={'2xl'} borderRadius='3xl' border='sm' bgColor={'yellow'} bgGradient='linear(to-l, #7928CA, #FF0080)'>
        <Box h='xl' mr='72' w='2xs' >
          <HStack spacing={'16'} w='md'>
            <Formik
              initialValues={
                {
                  File: '',
                  size: 0,
                }}
              onSubmit={async (values, actions) => {
                // console.log(
                // 	{
                // 		fileName: values.file.name,
                // 		type: values.file.type,
                // 		size: `${values.file.size} bytes`
                // 	}
                // )
              }}
            >
              {(props) => (
                <Form>
                  <Field name='File' as={Input} placeholder='Choose Files' >
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.file && form.touched.file}>
                        <FormLabel>Choose File</FormLabel>
                        {/* TODO: spinner untile file is uploading */}
                        {folderCreated ? <Input {...field} type='file' id='file' placeholder='Choose Files' isDisabled={!authorized} onChange={(e) => {
                          handleUpload(e)
                          // do not use setStates with Files as that causes reloading of google scripts
                        }} /> : <Button onClick={setUpFolder}>drive_logo Set up Folder</Button>}
                        <FormErrorMessage>{form.errors.file}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  {/* <Input pl='0' pr={'10'} pt='10' pb='10' placeholder="Choose" size={'lg'} variant='' colorScheme='green' type="file" /> */}
                  {/* <Button pr='8' pl='8' type='submit' isLoading={props.isSubmitting} isActive={authorized} >Upload file</Button> */}
                </Form>
              )}
            </Formik>
          </HStack>
          {/* {filesUploaded? <Text mt='4' color='green'>Files uploaded successfully</Text>: null} */}
          {driveFiles}
          {/* {driveFiles && <Text mt='4' color='green'>{driveFiles}</Text>} */}
          <Button mt='4' onClick={handleAuthClick}>{authorizeText}</Button>
          <Button mt='4' onClick={compareFiles}>Compare</Button>
          <Box>{individualCompRes}</Box>
          <Button mt='4' onClick={handleSignoutClick} isDisabled={!signout}>Signout</Button>
        </Box>
        {/* Display uploaded files here */}
        <Stack direction={'column'} position='fixed' right='40' spacing={4} w='2xs' >
          <Box borderRadius={'md'} overflow={'auto'} h='md' boxShadow={'md'} bgColor={'white'}>
            <Flex w={'100%'} bgColor={'gray.100'}>
              <Box fontSize={'x-small'} pt={'2'} fontWeight={'light'}>S.No.</Box>
              <Box w={'62%'} align={'center'} p={'2'} fontSize={'small'} fontWeight={'bold'}>Files</Box>
              <Button fontSize={'xs'} size='sm' bgColor={'blue.100'} boxShadow={'base'} fontWeight={'light'} onClick={exportAll}>ExportAll</Button>
            </Flex>
            <OrderedList p={'2'}>
              {/* <TableContainer>
                <Table size={'sm'} variant={'striped'}>
                  <Thead>
                    <Tr>
                      <Th>Files</Th>
                      <Th>Export</Th>
                    </Tr>
                  </Thead>
                  <Tbody> */}
              {/* <Flex w={'100%'}> */}
              {/* </Flex> */}
              {filesData.map((file, index) => {
                return (
                  <Flex>
                    <ListItem border={'1px'} bgColor={index % 2 ? 'gray.50' : ''} key={file?.id} p={'1'} w={'75%'} textDecor={comparisonResult ? 'underline' : null} _hover={{ cursor: 'pointer', bgColor: 'gray.100' }}
                      onClick={() => displayComparisonResult(file?.name)}
                    >{file?.name}</ListItem>
                    <Spacer />
                    {
                      fileBody?.find((fileInside) => {
                        return (fileInside?.id == file.id && fileInside?.body)
                      })
                        ? (
                          filesReady?.find((singleFile) => {
                            return (file.name == singleFile)
                          })
                            ? <CheckCircleIcon color={'green'} />
                            : <CheckIcon />
                        )
                        : <Button size={'xs'} boxShadow={'md'} onClick={() => exportFile(file.id)}>Export</Button>
                    }
                  </Flex>
                );
                // return (<Tr key={index}><Td maxW={'10'}>{file.name}</Td><Td><Button size={'xs'} onClick={() => exportFile(file.id)}>Export</Button></Td></Tr>);
              })}
              {/* </Tbody>
              </Table>
              </TableContainer> */}
            </OrderedList>
          </Box>
          <Stack direction='row'>
            <Button onClick={getFiles}>Refresh</Button>
            <Button onClick={uploadToBackend} size={'xs'}>Prepare Files for comparison</Button>
            {/* TODO: Save results button will upload a .json file to drive with currently calculated data, Also Add a drive icon into it to give hint*/}
            {comparisonDone ? <Button>Save Results</Button> : null}
          </Stack>
        </Stack>
      </Flex>

      {/* Load scripts for google authentication */}
      <Script async defer beforeInteractive src="https://apis.google.com/js/api.js" onLoad={gapiLoaded()} />
      <Script async defer beforeInteractive src="https://accounts.google.com/gsi/client" onLoad={gisLoaded()} />

    </ChakraProvider>

  );
}
export default App
