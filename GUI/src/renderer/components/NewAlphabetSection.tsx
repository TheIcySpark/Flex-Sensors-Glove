import {
  Button,
  Center,
  ChakraBaseProvider,
  ChakraProvider,
  Heading,
  Input,
  Tag,
  VStack,
} from '@chakra-ui/react';
import IToastProps from './IToastProps';

interface IProps {
  setFeedbackToastProps: React.Dispatch<React.SetStateAction<IToastProps>>;
  setModelPath: React.Dispatch<React.SetStateAction<string>>;
  setModelAlphabet: React.Dispatch<React.SetStateAction<string>>;
}

export default function NewAlphabetSection(props: IProps) {
  async function saveModel(alphabet: string) {
    const path = await window.arduinoAPI.saveNewModel(alphabet);
    if (!path) {
      return;
    }
    props.setModelPath(path);
    props.setModelAlphabet(alphabet);
    props.setFeedbackToastProps({
      title: 'Model saved',
      description: `File saved on: ${path}`,
      status: 'success',
    });
  }

  return (
    <ChakraProvider resetCSS>
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
    </ChakraProvider>
  );
}
