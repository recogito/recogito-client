import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from '@table-library/react-table-library/table';
import {
  HeaderCellSelect,
  CellSelect,
  Select,
} from '@table-library/react-table-library/select';
import type { Document, Translations } from 'src/Types';
import { useTheme } from '@table-library/react-table-library/theme';

interface DocumentTableProps {
  data: { nodes: Document[] };
  disabledIds: string[];
  i18n: Translations;
  select: Select<Document>;
}

export const DocumentTable = (props: DocumentTableProps) => {
  const { t } = props.i18n;
  const theme = useTheme({
    Table: `
        --data-table-library_grid-template-columns:  24px repeat(3, minmax(0, 1fr));
      `,
  });

  return (
    <Table data={props.data} theme={theme} select={props.select}>
      {(tableList: Document[]) => (
        <>
          <Header>
            <HeaderRow>
              <HeaderCellSelect />
              <HeaderCell>{t['Title']}</HeaderCell>
              <HeaderCell>{t['Document Type']}</HeaderCell>
              <HeaderCell>{t['URL']}</HeaderCell>
            </HeaderRow>
          </Header>

          <Body>
            {tableList.map((item: Document) => (
              <Row
                key={item.id}
                item={item}
                disabled={props.disabledIds.includes(item.id)}
              >
                {props.disabledIds.includes(item.id) ? (
                  <Cell></Cell>
                ) : (
                  <CellSelect item={item} />
                )}
                <Cell>{item.name}</Cell>
                <Cell>{item.content_type}</Cell>
                <Cell>{item.meta_data?.url}</Cell>
              </Row>
            ))}
          </Body>
        </>
      )}
    </Table>
  );
};
