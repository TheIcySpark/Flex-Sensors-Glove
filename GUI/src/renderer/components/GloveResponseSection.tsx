import { Button, Center, ChakraProvider, Divider, Heading, HStack, Tag, VStack } from "@chakra-ui/react";
import { useState } from "react";

export default function GloveResponseSection(){
    const [currentPredictionText, setCurrentPredictionText] = useState('Waiting ...');


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
        </ChakraProvider>
    )
}