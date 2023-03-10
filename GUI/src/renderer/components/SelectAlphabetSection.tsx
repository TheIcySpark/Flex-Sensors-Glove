import {
  Button,
  Center,
  ChakraProvider,
  Heading,
  Tag,
  VStack,
} from '@chakra-ui/react';

interface IProps {
  setModelPath: React.Dispatch<React.SetStateAction<string>>;
  setModelAlphabet: React.Dispatch<React.SetStateAction<string>>;
  modelPath: string;
  modelAlphabet: string;
}
export default function SelectAlphabetSection(props: IProps) {
  async function loadModel() {
    const response = await window.arduinoAPI.loadModel();
    if (!response) {
      return;
    }
    props.setModelPath(response[0]);
    props.setModelAlphabet(response[1]);
  }

  return (
    <ChakraProvider resetCSS>
      <Center>
        <VStack w="100%">
          <Tag colorScheme="orange">
            <Heading>Selected alphabet</Heading>
          </Tag>
          <Tag colorScheme="teal">Current Model</Tag>
          <Tag colorScheme="purple">{props.modelPath}</Tag>
          <Tag colorScheme="teal">Alphabet</Tag>
          <Tag colorScheme="purple">{props.modelAlphabet}</Tag>
          <Button colorScheme="blue" onClick={loadModel} w="100%">
            Load (model.json)
          </Button>
        </VStack>
      </Center>
    </ChakraProvider>
  );
}
