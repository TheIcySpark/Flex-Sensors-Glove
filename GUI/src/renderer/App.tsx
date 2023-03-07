import {
  Button,
  Center,
  ChakraProvider,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select,
  Spacer,
  Table,
  TableCaption,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import FeedbackToast from './components/FeedbackToast';
import IfeedbackToast from './components/IfeedbackToast';

export default function App() {
  interface IGloveInput {
    thumb: number;
    indexFinger: number;
    middleFinger: number;
    rightFinger: number;
    littleFinger: number;
    wrist: number;
  }

  interface IDeviceData {
    path: string;
    friendlyName: string;
  }

  const [feedbackToastProps, setFeedbackToastProps] = useState<IfeedbackToast>({
    title: 'title',
    description: 'description',
    status: 'error',
  });
  const [modelAlphabet, setModelAlphabet] = useState('');
  const [currentPredictionText, setCurrentPredictionText] =
    useState('Waiting ...');
  const [modelPath, setModelPath] = useState('');
  const [deviceList, setDeviceList] = useState<Array<IDeviceData>>([]);
  const [gloveInpust, setGloveInputs] = useState<IGloveInput>({
    thumb: 0,
    indexFinger: 0,
    middleFinger: 0,
    rightFinger: 0,
    littleFinger: 0,
    wrist: 0,
  });

  useEffect(() => {
    window.arduinoAPI.onSerialPortError((_event, error: Error) => {
      const feedbackToast = document.getElementById(
        'feedbackToast'
      ) as HTMLElement;
      setFeedbackToastProps({
        title: error.name,
        description: error.message,
        status: 'error',
      });
      setTimeout(() => {
        feedbackToast?.click();
      }, 10);
    });

    window.arduinoAPI.onSerialPortOpened((_event, args) => {
      const feedbackToast = document.getElementById(
        'feedbackToast'
      ) as HTMLElement;
      setFeedbackToastProps({
        title: 'Open opened',
        description: `Port ${args} opened and ready`,
        status: 'success',
      });
      setTimeout(() => {
        feedbackToast?.click();
      }, 10);
    });

    window.arduinoAPI.onSerialPortClosed((_event, args) => {
      const feedbackToast = document.getElementById(
        'feedbackToast'
      ) as HTMLElement;
      setFeedbackToastProps({
        title: 'Closed',
        description: `Port ${args} closed`,
        status: 'warning',
      });
      setTimeout(() => {
        feedbackToast?.click();
      }, 10);
    });

    window.arduinoAPI.onSerialPortCodeRecived((_event, args) => {
      const feedbackToast = document.getElementById(
        'feedbackToast'
      ) as HTMLElement;
      setFeedbackToastProps({
        title: 'Code recived',
        description: 'Message showing in arduino',
        status: 'success',
      });
      setTimeout(() => {
        feedbackToast?.click();
      }, 10);
    });

    reloadAvailableDevices();
  }, []);

  async function saveModel(alphabet: string) {
    const path = await window.arduinoAPI.saveNewModel(alphabet);
    if (!path) {
      return;
    }

    setModelPath(path);
    setModelAlphabet(alphabet);

    const feedbackToast = document.getElementById(
      'feedbackToast'
    ) as HTMLElement;

    setFeedbackToastProps({
      title: 'Model saved',
      description: `File saved on: ${path}`,
      status: 'success',
    });
    setTimeout(() => {
      feedbackToast.click();
    }, 10);
  }

  async function loadModel() {
    const response = await window.arduinoAPI.loadModel();
    if (!response) {
      return;
    }
    setModelPath(response[0]);
    setModelAlphabet(response[1]);
  }

  function LoadDataToDataSet(desiredOutput: string) {}

  async function reloadAvailableDevices() {
    setDeviceList(await window.arduinoAPI.reloadAvailableDevices());
  }

  function openPort(deviceSelectedPath: string) {
    console.log(deviceSelectedPath);
    window.arduinoAPI.openPort(deviceSelectedPath);
  }

  return (
    <ChakraProvider resetCSS>
      <Grid templateColumns="repeat(6, 5fr)" gap={6} h="90vh" m={4}>
        <GridItem rowSpan={1} colSpan={6}>
          <Center>
            <VStack>
              <Heading>Flex Glove letter detector</Heading>
              <Text>
                Takes the data readed by the arduino, it can be used to create
                new alphabet using IA, or to interpret an alphabet that already
                exists.
              </Text>
            </VStack>
          </Center>
          <Divider w="100%" mt={2} mb={2} />
        </GridItem>

        <GridItem rowSpan={2} colSpan={2}>
          <Center>
            <VStack w="100%">
              <Tag colorScheme="orange">
                <Heading>Arduino connection</Heading>
              </Tag>
              <Tag colorScheme="teal">Devices</Tag>
              <Select
                id="deviceSelect"
                onChange={() =>
                  openPort(
                    (
                      document.getElementById(
                        'deviceSelect'
                      ) as HTMLInputElement
                    ).value
                  )
                }
              >
                {deviceList.map((device, i) => {
                  return (
                    <option value={device.path} key={i}>
                      {device.friendlyName}
                    </option>
                  );
                })}
              </Select>
              <Button
                w="100%"
                colorScheme="blue"
                onClick={reloadAvailableDevices}
              >
                Reload devices
              </Button>
              <Tag colorScheme="teal">Recived inputs</Tag>
              <HStack>
                <VStack>
                  <Tag colorScheme="teal">Thumb</Tag>
                  <Tag colorScheme="purple">{gloveInpust.thumb}</Tag>
                </VStack>
                <Spacer />
                <VStack>
                  <Tag colorScheme="teal">Index finger</Tag>
                  <Tag colorScheme="purple">{gloveInpust.indexFinger}</Tag>
                </VStack>
                <Spacer />
                <VStack>
                  <Tag colorScheme="teal">Middle finger</Tag>
                  <Tag colorScheme="purple">{gloveInpust.middleFinger}</Tag>
                </VStack>
              </HStack>

              <HStack>
                <VStack>
                  <Tag colorScheme="teal">Right finger</Tag>
                  <Tag colorScheme="purple">{gloveInpust.rightFinger}</Tag>
                </VStack>
                <VStack>
                  <Tag colorScheme="teal">Little finger</Tag>
                  <Tag colorScheme="purple">{gloveInpust.littleFinger}</Tag>
                </VStack>
                <VStack>
                  <Tag colorScheme="teal">Wrist</Tag>
                  <Tag colorScheme="purple">{gloveInpust.wrist}</Tag>
                </VStack>
              </HStack>
            </VStack>
          </Center>
        </GridItem>

        <GridItem rowSpan={2} colSpan={2}>
          <Center>
            <VStack w="100%">
              <Tag colorScheme="orange">
                <Heading> New Alphabet </Heading>
              </Tag>
              <Tag colorScheme="teal">Alphabet</Tag>
              <Input
                id="modelAlphabetLettersInput"
                placeholder="Alphabet (space separeted)"
              />
              <Button
                w="100%"
                onClick={() => {
                  saveModel(
                    (
                      document.getElementById(
                        'modelAlphabetLettersInput'
                      ) as HTMLInputElement
                    ).value
                  );
                }}
                colorScheme="blue"
              >
                Create
              </Button>
            </VStack>
          </Center>
        </GridItem>

        <GridItem rowSpan={2} colSpan={2}>
          <Center>
            <VStack w="100%">
              <Tag colorScheme="orange">
                <Heading>Selected alphabet</Heading>
              </Tag>
              <Tag colorScheme="teal">Current Model</Tag>
              <Tag colorScheme="purple">{modelPath}</Tag>
              <Tag colorScheme="teal">Alphabet</Tag>
              <Tag colorScheme="purple">{modelAlphabet}</Tag>
              <Button colorScheme="blue" onClick={loadModel} w="100%">
                Load (model.json)
              </Button>
            </VStack>
          </Center>
        </GridItem>

        <GridItem rowSpan={2} colSpan={3}>
          <Divider w="100%" mt={2} mb={2} />
          <Center>
            <VStack w="100%">
              <Tag colorScheme="orange">
                <Heading>Training</Heading>
              </Tag>
              <Tag colorScheme="teal">Current letter in glove</Tag>
              <Input
                id="desireOutputInput"
                placeholder="Desired prediction from model"
              />
              <Button
                w="100%"
                colorScheme="blue"
                onClick={() => {
                  LoadDataToDataSet(
                    (
                      document.getElementById(
                        'desiredOutputInput'
                      ) as HTMLInputElement
                    ).value
                  );
                }}
              >
                Send to dataset
              </Button>
              <Button w="100%" colorScheme="red">
                Train model with current data
              </Button>
            </VStack>
          </Center>
        </GridItem>

        <GridItem rowSpan={2} colSpan={3}>
          <Divider w="100%" mt={2} mb={2} />
          <Center>
            <VStack w="100%">
              <Tag colorScheme="orange">
                <Heading>Glove response</Heading>
              </Tag>
              <Tag colorScheme="purple">
                <Heading>{currentPredictionText}</Heading>
              </Tag>
              <HStack w="100%">
                <Button colorScheme="green" w="50%">
                  Start predictions
                </Button>
                <Button colorScheme="red" w="50%">
                  Stop predictions
                </Button>
              </HStack>
            </VStack>
          </Center>
        </GridItem>
      </Grid>
      <FeedbackToast
        title={feedbackToastProps.title}
        description={feedbackToastProps.description}
        status={feedbackToastProps.status}
      />
    </ChakraProvider>
  );
}
