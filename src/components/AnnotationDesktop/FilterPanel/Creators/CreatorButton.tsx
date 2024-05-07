import * as Toggle from '@radix-ui/react-toggle';

interface CreatorButtonProps {

  checked?: boolean;

  creator: string;

  onToggle(checked: boolean): void;

}

export const CreatorButton = (props: CreatorButtonProps) => {

  return (
    <Toggle.Root className="creator-button">
      {props.creator}
    </Toggle.Root>
  )

}