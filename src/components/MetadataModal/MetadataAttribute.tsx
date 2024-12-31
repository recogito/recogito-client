interface Props {
  autoFocus?:boolean;

  onChange(value: string): void;

  readOnly?: boolean;

  value?: string;
}

export const MetadataAttribute = (props: Props) => {
  if (props.readOnly) {
    return (
      <span>
        {props.value}
      </span>
    );
  }

  return (
    <input
      autoFocus={props.autoFocus}
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
    />
  );
};