import {
  Button,
  Center,
  ChakraProvider,
  Heading,
  HStack,
  Select,
  Tag,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import IGloveInput from './IGloveInput';
import IToastProps from './IToastProps';

interface IDeviceData {
  path: string;
  friendlyName: string;
}

interface IProps {
  setFeedbackToastProps: React.Dispatch<React.SetStateAction<IToastProps>>;
  gloveInputs: IGloveInput;
  setGloveInputs: React.Dispatch<React.SetStateAction<IGloveInput>>;
}

export default function ArduinoSection(props: IProps) {
  const [deviceList, setDeviceList] = useState<Array<IDeviceData>>([]);

  async function reloadAvailableDevices() {
    setDeviceList(await window.arduinoAPI.reloadAvailableDevices());
  }

  function openPort(deviceSelectedPath: string) {
    window.arduinoAPI.openPort(deviceSelectedPath);
  }

  useEffect(() => {
    window.arduinoAPI.onSerialPortError((_event, error: Error) => {
      props.setFeedbackToastProps({
        title: error.name,
        description: error.message,
        status: 'error',
      });
    });

    window.arduinoAPI.onSerialPortOpened((_event, args) => {
      props.setFeedbackToastProps({
        title: 'Open opened',
        description: `Port ${args} opened and ready`,
        status: 'success',
      });
    });

    window.arduinoAPI.onSerialPortClosed((_event, args) => {
      props.setFeedbackToastProps({
        title: 'Closed',
        description: `Port ${args} closed`,
        status: 'warning',
      });
    });

    window.arduinoAPI.onSerialPortDataReaded((_event, data: string) => {
      const dataValues = data.split(' ').map((value, index) => {
        return parseInt(value, 10);
      });
      props.setGloveInputs({
        thumbFinger: dataValues[0],
        indexFinger: dataValues[1],
        middleFinger: dataValues[2],
        rightFinger: dataValues[3],
        littleFinger: dataValues[4],
        wrist: dataValues[5],
      });
    });

    reloadAvailableDevices();
  }, []);

  return (
    <ChakraProvider resetCSS>
      <Center>
        <VStack w="100%">
          <Tag colorScheme="orange">
            <Heading>Arduino connection</Heading>
          </Tag>
          <HStack w="100%">
            <VStack w="100%">
              <Tag colorScheme="teal">Devices</Tag>
              <Button
                w="100%"
                colorScheme="blue"
                onClick={reloadAvailableDevices}
              >
                Reload devices
              </Button>
              <Select id="deviceSelect">
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
                onClick={() => {
                  openPort(
                    (
                      document.getElementById(
                        'deviceSelect'
                      ) as HTMLInputElement
                    ).value
                  );
                }}
              >
                Open port
              </Button>
            </VStack>

            <VStack>
              <Tag colorScheme="teal">Recived inputs</Tag>
              <HStack>
                <VStack>
                  <Tag colorScheme="teal">Thumb</Tag>
                  <Tag colorScheme="purple" id="thumbReadedValue">
                    {props.gloveInputs.thumbFinger}
                  </Tag>
                </VStack>
                <VStack>
                  <Tag colorScheme="teal">Index finger</Tag>
                  <Tag colorScheme="purple" id="indexFingerReadedValue">
                    {props.gloveInputs.indexFinger}
                  </Tag>
                </VStack>
                <VStack>
                  <Tag colorScheme="teal">Middle finger</Tag>
                  <Tag colorScheme="purple" id="middleFingerReadedValue">
                    {props.gloveInputs.middleFinger}
                  </Tag>
                </VStack>
              </HStack>

              <HStack>
                <VStack>
                  <Tag colorScheme="teal">Right finger</Tag>
                  <Tag colorScheme="purple" id="rightFingerReadedValue">
                    {props.gloveInputs.rightFinger}
                  </Tag>
                </VStack>
                <VStack>
                  <Tag colorScheme="teal">Little finger</Tag>
                  <Tag colorScheme="purple" id="littleFingerReadedValue">
                    {props.gloveInputs.littleFinger}
                  </Tag>
                </VStack>
                <VStack>
                  <Tag colorScheme="teal">Wrist</Tag>
                  <Tag colorScheme="purple" id="wristReadedValue">
                    {props.gloveInputs.wrist}
                  </Tag>
                </VStack>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </Center>
    </ChakraProvider>
  );
}
