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
  LinkBox,
  LinkOverlay,
  Table,
  Thead,
  Tbody,
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
import SvgGoogleDriveLogo from '../components/SvgGoogleDriveLogo';
import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const App = () => {
  const [folderId, setFolderId] = useState('');
  // const [folderName, setFolderName] = useState('');
  const [folderCreated, setFolderCreated] = useState(false);
  const [filesData, setFilesData] = useState([]);
  const [driveFiles, setDriveFiles] = useState(null);
  const [fileBody, setFileBody] = useState(filesData);
  const [filesReady, setFilesReady] = useState([]);
  const [comparisonResult, setComparisonResult] = useState([]);
  const [individualCompRes, setIndividualCompRes] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [signout, setSignout] = useState(false);
  const [authorizeText, setAuthorizeText] = useState('Authorize');
  const [token, setToken] = useState('');
  const [comparisonDone, setComparisonDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/');

  const toast = useToast();
  // const router = useRouter();

  // Discovery doc URL for APIs used by the quickstart
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  const SCOPES = 'https://www.googleapis.com/auth/drive';

  const authorization_uri = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${redirectUri}&prompt=consent&response_type=token&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=${SCOPES}&access_type=online`;

  useEffect(() => {
    // console.log('useEffect')
    // console.log('authorized', authorized)

    if (typeof window !== 'undefined') {
      console.log('window.location.href', window.location.href.substring(0, window.location.href.length - 1))
      if (window.location.href.includes('#access_token=')) {
        console.log('access_token', window.location.href.split("#access_token=")[1].split("&token_type")[0])
        const myToken = window.location.href.split("#access_token=")[1].split("&token_type")[0]
        setToken(myToken) // access token
        setAuthorized(true)
        setAuthorizeText('Reauthorize')
      }
      else {
        setRedirectUri(window.location.href.substring(0, window.location.href.length - 1))
      }
    }

    if (authorized) {
      console.log('authorized')
    }
  }, [])

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
          // setFolderName(data.files[0].name);
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
        // setFolderName(data.name);
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
      console.log(err.message)
      return;
    }
  }

  async function exportAll() {
    filesData.map(async (file) => {
      await exportFile(file.id);
    })
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
    }
    else {
      console.log(comparisonResult)
      return comparisonResult;
    }
  }

  const displayComparisonResult = (name) => {
    findFileComparisonRes(name)
      .then((res) => {
        console.log(res)
        setIndividualCompRes(res)
      })

  }

  function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
  }

  return (
    <ChakraProvider>
      <Wrap align='center' m='10' justify={'center'}>
        <Heading >Plagiarism detector for Class Assignments</Heading>
      </Wrap>

      <Flex w={'6xl'} p={'6'} bgSize={'auto'} m='auto' boxShadow={'2xl'} borderRadius='3xl' border='sm' bgColor={'yellow'} bgGradient='linear(to-l, #7928CA, #FF0080)'>
        <Box>
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
                        }} />
                          : (authorized
                            ? <Button leftIcon={<SvgGoogleDriveLogo height={"20"}/>} onClick={setUpFolder}> Set up Folder</Button>
                            : null)
                        }
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
          <LinkBox>
            <LinkOverlay href={authorization_uri}>
              <Button mt='4'>{authorizeText}</Button>
            </LinkOverlay>
          </LinkBox>
          {filesReady && filesReady.length > 0 && <Button mt='4' onClick={compareFiles}>Compare</Button>}
          {individualCompRes && individualCompRes.length > 0
            ? (
            <TableContainer p={'4'} borderColor={'gray'} borderRadius={'lg'} boxShadow={'md'}>
              <Table size={'sm'} variant={'striped'}>
                <TableCaption>Comparison Result</TableCaption>
                <Thead>
                  <Tr>
                    <Th>S.No.</Th>
                    <Th>File Names</Th>
                    <Th>Similarity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {individualCompRes.map((file, index) => {
                    return (
                      <Tr key={index}>
                        <Td>{index + 1}</Td>
                        <Td>{file[0]}</Td>
                        <Td isNumeric>{roundToTwo(file[1] * 100) + '%'}</Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </TableContainer>)
            : null
          }
          <Button mt='4' onClick={handleSignoutClick} isDisabled={!signout}>Signout</Button>
        </Box>
        {/* Display uploaded files here */}
        <Stack direction={'column'} position='fixed' right='40' p={"-6"} spacing={4} w='2xs' >
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
            {folderCreated ? (<Button onClick={getFiles}>Refresh</Button>) : null}
            {fileBody && <Button onClick={uploadToBackend} size={'xs'}>Prepare Files for comparison</Button>}
            {/* TODO: Save results button will upload a .json file to drive with currently calculated data, Also Add a drive icon into it to give hint*/}
            {comparisonDone ? <Button>Save Results</Button> : null}
          </Stack>
        </Stack>
      </Flex>
    </ChakraProvider>
  );
}
export default App
