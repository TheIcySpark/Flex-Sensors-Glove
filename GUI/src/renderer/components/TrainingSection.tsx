import {
  Button,
  Center,
  ChakraProvider,
  Divider,
  Heading,
  Select,
  Spinner,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import IGloveInput from './IGloveInput';
import IToastProps from './IToastProps';

interface IProps {
  setFeedbackToastProps: React.Dispatch<React.SetStateAction<IToastProps>>;
  modelAlphabet: string;
  gloveInputs: IGloveInput;
}

export default function TrainingSection(props: IProps) {
  const [trainingModel, setTrainigModel] = useState(false);

  async function LoadDataToDataSet(desiredOutput: string) {
    if (!props.modelAlphabet) {
      props.setFeedbackToastProps({
        title: 'No model',
        description: 'No model loaded',
        status: 'error',
      });
      return;
    }

    window.arduinoAPI.sendDataToDataSet(
      [
        props.gloveInputs.thumbFinger,
        props.gloveInputs.indexFinger,
        props.gloveInputs.middleFinger,
        props.gloveInputs.rightFinger,
        props.gloveInputs.littleFinger,
      ],
      desiredOutput
    );
    props.setFeedbackToastProps({
      title: 'Loaded',
      description: 'Data succesfully loaded into data set',
      status: 'success',
    });
  }

  async function trainModel(){
    if (!props.modelAlphabet) {
      props.setFeedbackToastProps({
        title: 'No model',
        description: 'No model loaded',
        status: 'error',
      });
      return;
    }
    setTrainigModel(true);
    await window.arduinoAPI.trainModel();
    setTrainigModel(false);
  }

  return (
    <ChakraProvider resetCSS>
      <Divider w="100%" mt={2} mb={2} />
      <Center>
        <VStack w="100%">
          <Tag colorScheme="orange">
            <Heading>Training</Heading>
          </Tag>
          <Tag colorScheme="teal">Current letter in glove</Tag>
          <Select id="desiredOutputSelect">
            {props.modelAlphabet.split(' ').map((letter, i) => {
              return (
                <option value={letter} key={i}>
                  {letter}
                </option>
              );
            })}
          </Select>
          <Button
            w="100%"
            colorScheme="blue"
            onClick={() => {
              LoadDataToDataSet(
                (
                  document.getElementById(
                    'desiredOutputSelect'
                  ) as HTMLInputElement
                ).value
              );
            }}
          >
            Send to dataset
          </Button>
          <Button w="100%" colorScheme="red" onClick={trainModel}>
            <Text hidden={trainingModel}>
              Train model with current data
            </Text>
          <Spinner hidden={!trainingModel}></Spinner>
          </Button>
        </VStack>
      </Center>
    </ChakraProvider>
  );
}
