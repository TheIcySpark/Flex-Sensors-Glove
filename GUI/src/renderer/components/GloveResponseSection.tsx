import { Button, Center, ChakraProvider, Divider, Heading, HStack, Tag, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import IGloveInput from "./IGloveInput";

interface IProps{
  gloveInputs: IGloveInput,
  modelPath: string
}

export default function GloveResponseSection(props: IProps){
    const [currentPredictionText, setCurrentPredictionText] = useState('Waiting ...');

    async function predictResponse(){
      const response: string = await window.arduinoAPI.predictResponse([
        props.gloveInputs.thumbFinger,
        props.gloveInputs.indexFinger,
        props.gloveInputs.middleFinger,
        props.gloveInputs.rightFinger,
        props.gloveInputs.littleFinger,
      ]);
      setCurrentPredictionText(response);
    }

    useEffect(() =>{
      if(props.modelPath == '') return;
      predictResponse();
    }, [props.gloveInputs])

    return(
        <ChakraProvider>
            <Divider w="100%" mt={2} mb={2} />
          <Center>
            <VStack w="100%">
              <Tag colorScheme="orange">
                <Heading>Glove response</Heading>
              </Tag>
              <Tag colorScheme="purple">
                <Heading>{currentPredictionText}</Heading>
              </Tag>
            </VStack>
          </Center>
        </ChakraProvider>
    )
}