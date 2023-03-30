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

}
	from '@chakra-ui/react';
import {
	Field,
	Form,
	Formik,
}
	from 'formik';
import { useState } from 'react';
import Script from 'next/script';
// import Plotly from 'plotly.js';

// import uploadWithConversion from '../components/uploader';

// const fileMetadata = {
// 	name: file.name,
// 	mimeType: 'application/vnd.google-apps.docs',
// };
// const media = {
// 	mimeType: 'application/pdf',
// };
//TODO: fetch request with url for uploading with conversion
// await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
// 	method: 'POST',
// 	headers: {
// 		'X-Upload-Content-Type': 'application/pdf',
// 		'Content-Type': 'application/json',
// 	},
// 	body: JSON.stringify(fileMetadata)
// })
// 	.then((response) => {
// 		if (response.status === 200) {
// 			setSessionUri(response.headers.get('Location'));
// 			console.log(response);
// 		}
// 	}).then(() => {
// 		fetch(sessionUri, {
// 			method: 'PUT',
// 			headers: {
// 				'Content-Type': 'application/pdf',
// 				'Cotent-Length': file.size
// 			},
// 			body: file
// 		})
// 			.then((response) => {
// 				if (response.status === 200) {
// 					console.log(response);
// 				}
// 			})
// 	}).catch((error) => {
// 		console.log(error);
// 	})
// }

const App = () => {
	const [filesNames, setFilesNames] = useState([]);
	const [sessionUri, setSessionUri] = useState('');
	const [folderId, setFolderId] = useState('');
	const [folderName, setFolderName] = useState('');
	const [folderCreated, setFolderCreated] = useState(false);
	const [filesUploaded, setFilesUploaded] = useState(false);
	const [files, setFiles] = useState([]);
	const [driveFiles, setDriveFiles] = useState(null);
	const [filesIds, setFilesIds] = useState([]);
	const [filesConverted, setFilesConverted] = useState(false);
	const [filesConvertedIds, setFilesConvertedIds] = useState([]);
	const [filesConvertedNames, setFilesConvertedNames] = useState([]);
	const [filesConvertedLinks, setFilesConvertedLinks] = useState([]);
	const [authorize, setAuthorize] = useState(false);
	const [signout, setSignout] = useState(false);
	const [authorizeText, setAuthorizeText] = useState('Authorize');
	const [token, setToken] = useState('');

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
		// setFiles([...files, file]);
		console.log(file);
		// await createFolder();
		// await uploadWithConversion();
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
					return response.json();
				}
			})
			.then((data) => {
				setFolderId(data.id);
				setFolderName(data.name);
			})
			.catch((error) => {
				console.log(error);
			})
	}

	// const uploadFiles = async () => {
	// 	const fileMetadata = {
	// 		name: filesNames,
	// 		parents: [folderId]
	// 	};
	// 	const media = {
	// 		mimeType: 'application/pdf',
	// 		body: files
	// 	};
	// 	await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'Authorization': `Bearer ${token}`
	// 		},
	// 		body: JSON.stringify(fileMetadata),
	// 		media: media
	// 	})
	// 		.then((response) => {
	// 			if (response.status === 200) {
	// 				setFilesUploaded(true);
	// 				return response.json();
	// 			}
	// 		})
	// 		.then((data) => {
	// 			setFilesIds(data.id);
	// 		})
	// 		.catch((error) => {
	// 			console.log(error);
	// 		})
	// }

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

	const uploadWithConversion = async () => {
		const fileMetadata = {
			name: filesNames,
			parents: [folderId]
		};
		const media = {
			mimeType: 'application/pdf',
			body: files
		};
		await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(fileMetadata),
			media: media
		})
			.then((response) => {
				if (response.status === 200) {
					setFilesUploaded(true);
					return response.json();
				}
			})
			.then((data) => {
				setFilesIds(data.id);
				const fileMetadata = {
					mimeType: 'application/vnd.google-apps.document'
				};
				fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/copy`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify(fileMetadata)
				})
					.then((response) => {
						if (response.status === 200) {
							setFilesConverted(true);
							return response.json();
						}
					})
					.then((data) => {
						setFilesConvertedIds(data.id);
						setFilesConvertedNames(data.name);
						setFilesConvertedLinks(data.webViewLink);
					})
					.catch((error) => {
						console.log(error);
					})
			})
			.catch((error) => {
				console.log(error);
			})
	}

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
			setAuthorize(true);
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
				setAuthorizeText('Refresh');
				await listFiles();
			}
		}
		catch (err) {
			// document.getElementById('content').innerText = err.message;
			console.log(err.message)
			// return;
		}
		// })
		// }

		console.log("tokenClient", tokenClient)
		try {
			if (gapi.client.getToken() === null) {
				// Prompt the user to select a Google Account and ask for consent to share their data
				// when establishing a new session.
				console.log(typeof (tokenClient.requestAccessToken))
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
								console.log(
									{
										fileName: values.file.name,
										type: values.file.type,
										size: `${values.file.size} bytes`
									}
								)
							}}
						>
							{(props) => (
								<Form>
									<Field name='File' as={Input} placeholder='Choose Files' >
										{({ field, form }) => (
											<FormControl isInvalid={form.errors.file && form.touched.file}>
												<FormLabel>File</FormLabel>
												<Input {...field} type='file' id='file' placeholder='Choose Files' onChange={(e)=>{
													handleUpload(e)
													// do not use setStates with Files causes reloading of google scripts
												}} />
												<FormErrorMessage>{form.errors.file}</FormErrorMessage>
											</FormControl>
										)}
									</Field>
									{/* <Input pl='0' pr={'10'} pt='10' pb='10' placeholder="Choose" size={'lg'} variant='' colorScheme='green' type="file" /> */}
									<Button pr='8' pl='8' type='submit' isLoading={props.isSubmitting} >Upload file</Button>
								</Form>
							)}
						</Formik>
					</HStack>
					{filesUploaded && <Text mt='4' color='green'>Files uploaded successfully</Text>}
					{driveFiles}
					{/* {driveFiles && <Text mt='4' color='green'>{driveFiles}</Text>} */}
					<Button mt='4' onClick={handleAuthClick} disabled={!authorize}>Authorize</Button>
					{/* <Button mt='4' >Upload</Button> */}
					<Button mt='4' disabled={!signout}>Signout</Button>
				</Box>
			</Flex>

			{/* Load scripts for google authentication */}
			<Script async defer beforeInteractive src="https://accounts.google.com/gsi/client" onLoad={gisLoaded()} />
			<Script async defer beforeInteractive src="https://apis.google.com/js/api.js" onLoad={gapiLoaded()} />

		</ChakraProvider>

	);
}
export default App
