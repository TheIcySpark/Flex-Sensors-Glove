import { Button, useToast } from '@chakra-ui/react';
import IfeedbackToast from './IfeedbackToast';

function FeedbackToast(props: IfeedbackToast) {
  const toast = useToast();
  return (
    <Button
      hidden
      id="feedbackToast"
      onClick={() => {
          toast({
            title: props.title,
            description: props.description,
            status: props.status,
            duration: 5000,
            isClosable: true,
          });
      }}
    >
      Show Toast
    </Button>
  );
}

export default FeedbackToast;