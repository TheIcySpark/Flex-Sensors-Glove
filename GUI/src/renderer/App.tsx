import {
  Center,
  ChakraProvider,
  Divider,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import ArduinoSection from './components/ArduinoSection';
import FeedbackToast from './components/FeedbackToast';
import GloveResponseSection from './components/GloveResponseSection';
import IToastProps from './components/IToastProps';
import IGloveInput from './components/IGloveInput';
import NewAlphabetSection from './components/NewAlphabetSection';
import SelectAlphabetSection from './components/SelectAlphabetSection';
import TrainingSection from './components/TrainingSection';


export default function App() {
  const [feedbackToastProps, setFeedbackToastProps] = useState<IToastProps>({
    title: 'Ready',
    description: 'Application ready',
    status: 'info',
  });
  const [modelAlphabet, setModelAlphabet] = useState('');
  const [modelPath, setModelPath] = useState('');
  const [gloveInputs, setGloveInputs] = useState<IGloveInput>({
    thumbFinger: 0,
    indexFinger: 0,
    middleFinger: 0,
    rightFinger: 0,
    littleFinger: 0,
    wrist: 0,
  });

  useEffect(() => {
    const feedbackToast = document.getElementById(
      'feedbackToast'
    ) as HTMLElement;
    feedbackToast.click();
  }, [feedbackToastProps]);

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
          <ArduinoSection gloveInputs={gloveInputs} setGloveInputs={setGloveInputs} setFeedbackToastProps={setFeedbackToastProps} />
        </GridItem>

        <GridItem rowSpan={2} colSpan={2}>
          <NewAlphabetSection
            setFeedbackToastProps={setFeedbackToastProps}
            setModelAlphabet={setModelAlphabet}
            setModelPath={setModelPath}
          />
        </GridItem>

        <GridItem rowSpan={2} colSpan={2}>
          <SelectAlphabetSection
            modelAlphabet={modelAlphabet}
            modelPath={modelPath}
            setModelAlphabet={setModelAlphabet}
            setModelPath={setModelPath}
          />
        </GridItem>

        <GridItem rowSpan={2} colSpan={3}>
          <TrainingSection gloveInputs={gloveInputs} setFeedbackToastProps={setFeedbackToastProps} modelAlphabet={modelAlphabet}></TrainingSection>
        </GridItem>

        <GridItem rowSpan={2} colSpan={3}>
          <GloveResponseSection></GloveResponseSection>
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
