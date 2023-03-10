import {
  Button,
  Center,
  ChakraProvider,
  Divider,
  Heading,
  Select,
  Tag,
  VStack,
} from '@chakra-ui/react';
import IGloveInput from './IGloveInput';
import IToastProps from './IToastProps';

interface IProps {
  setFeedbackToastProps: React.Dispatch<React.SetStateAction<IToastProps>>;
  modelAlphabet: string;
  gloveInputs: IGloveInput;
}

export default function TrainingSection(props: IProps) {
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
        props.gloveInputs.wrist,
      ],
      desiredOutput
    );
    props.setFeedbackToastProps({
      title: 'Loaded',
      description: 'Data succesfully loaded into data set',
      status: 'success',
    });
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
          <Button w="100%" colorScheme="red">
            Train model with current data
          </Button>
        </VStack>
      </Center>
    </ChakraProvider>
  );
}
