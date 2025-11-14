import { Info } from '@phosphor-icons/react';
import * as Popover from '@radix-ui/react-popover';
import { useTranslation } from 'react-i18next';

const { Arrow, Content, Portal, Root, Trigger } = Popover;

export const AnonymousTooltip = () => {

  const { t } = useTranslation(['common'])

  return (
    <Root>
      <Trigger asChild >
        <button 
          className="unstyled icon-only"
          disabled={false}>
          <Info size={16} weight="fill" />
        </button>
      </Trigger>

      <Portal>
        <Content 
          className="popover-tooltip-content" 
          side="top">
          {t('This user has not provided a profile name.', { ns: 'common' })}

          <Arrow className="popover-tooltip-arrow" />
        </Content>
      </Portal>
    </Root>
  )

}