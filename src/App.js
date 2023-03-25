import './App.css';
import {
  ChakraProvider,
  Button,
  Input,
  Heading,
  Box,
  HStack,
  Wrap,
  Flex,
}
  from '@chakra-ui/react';
import 'zingchart/es6'
import { useState } from 'react';
import ZingChart from 'zingchart-react';
import uploadWithConversion from '../components/uploader';

function App() {
  // const myData = {  type: 'line',  series: [    { values: [1,2,4,5,6] }  ]};

  const [config] = useState({
    /* Graphset array */
    graphset: [

      {
        type: 'pie',
        height: '100%',
        width: '100%',
        backgroundColor: 'transparent',
        // position: 'relative',
        // float: 'left',
        // left: '20px',
        plot: {
          'border-width': '1px',
          'border-color': '#000000',
          // 'overflow-y': 'auto',
        },
        series: [
          { values: [15] },
          { values: [30] },
          { values: [34] }
        ]
      }
    ]
  })

  var myTheme = { palette: { line: [['#FBFCFE', '#00BAF2', '#00BAF2', '#00a7d9'], /* light blue */['#FBFCFE', '#E80C60', '#E80C60', '#d00a56'], /* light pink */['#FBFCFE', '#9B26AF', '#9B26AF', '#8b229d'], /* light purple */['#FBFCFE', '#E2D51A', '#E2D51A', '#E2D51A'], /* med yellow */['#FBFCFE', '#FB301E', '#FB301E', '#e12b1b'], /* med red */['#FBFCFE', '#00AE4D', '#00AE4D', '#00AE4D'], /* med green */] }, graph: { title: { fontFamily: 'Lato', fontSize: 14, padding: 15, fontColor: '#1E5D9E', } } };

  return (
    <ChakraProvider>

      <Wrap align='center' m='10' justify={'center'}>
        <Heading >Plagiarism detector for Class Assignments</Heading>
      </Wrap>

      {/* <div className="App" > */}
      <Flex w={'6xl'} justify='center' bgSize={'auto'} m='auto' boxShadow={'2xl'} borderRadius='3xl' border='sm' bgColor={'yellow'} bgGradient='linear(to-l, #7928CA, #FF0080)'>
        <Box h='xl' mr='72' w='2xs' >
          <HStack spacing={'16'} w='md'>
            <Input pl='0' pr={'10'} pt='10' pb='10' placeholder="Browse files" size={'lg'} variant='' colorScheme='green' type="file" />
            <Button pr='8' pl='8' onClick={uploadWithConversion} type='submit'>Upload file</Button>
          </HStack>
          <ZingChart data={config} defaults={myTheme} />
        </Box>
        {/* TODO: Display uploaded files here */}
        <Box h='xl' position='fixed' w='2xs' right='40' bgColor={'white'}></Box>
      </Flex>


      {/* </div> */}
    </ChakraProvider>
  );
}

export default App;
